import { UploadFile } from "./UploadFile";
import { Upload } from "./Upload";
import { PREPROCESS_STATE, READ_STATE, CHUNK_UPLOAD_EVENT, CHUNK_STATUS } from "./UploadDeclare";
import { evalOpts, each } from "../../../base-sdk/src/util/utils";


export class UploadFileChunk {
    preprocessState: number;
    readState: number;
    private upload: Upload;
    private uploadFile: UploadFile;
    private bytes: Blob | string;
    private offset: number;
    private tested: boolean;
    private retries: number;
    private pendingRetry: boolean;
    private loaded: number;
    private total: number;
    private chunkSize: number;
    private startByte: number;
    private endByte: number;
    private xhr: XMLHttpRequest;
    private xhrStatus: number;
    private xhrReadyState: number;


    constructor(upload: Upload, uploadFile: UploadFile, offset: number) {
        let self = this;
        self.upload = upload;
        self.uploadFile = uploadFile;
        self.bytes = null;
        self.offset = offset;
        self.tested = false;
        self.retries = 0;
        self.pendingRetry = false;
        self.preprocessState = PREPROCESS_STATE["unprocessed"];
        self.readState = READ_STATE["notread"];
        self.loaded = 0;
        self.total = 0;
        self.chunkSize = uploadFile.chunkSize;
        self.startByte = offset * self.chunkSize;
        self.endByte = self.computeEndByte();
        self.xhr = null;
        self.xhrStatus = null;
        self.xhrReadyState = null;
    };

    /**
     * preprocess钩子函数执行完毕后需要调用该函数
     */
    public preprocessFinished(): void {
        let self = this;
        self.endByte = self.computeEndByte();
        self.preprocessState = 2;
        self.send();
    };

    /**
     * readFileFn钩子函数执行完毕后需要调用该函数:读取文件当前分块内容完毕
     * @param bytes Blob
     */
    public readFinished(bytes: Blob): void {
        let self = this;
        self.readState = READ_STATE["finished"];
        self.bytes = bytes;
        self.send();
    };

    // 发送当前分块上传请求
    send(): void {
        let self = this;
        let preprocess = self.upload.option.preprocess;
        let read = self.upload.option.readFileFn;
        if (typeof preprocess === "function") {
            switch (self.preprocessState) {
                case PREPROCESS_STATE["unprocessed"]:
                    self.preprocessState = PREPROCESS_STATE["processing"];
                    preprocess(self);
                    return;
                case PREPROCESS_STATE["processing"]:
                    return;
            }
        }
        switch (self.readState) {
            case READ_STATE["notread"]:
                self.readState = READ_STATE["reading"];
                read(self.uploadFile, self.startByte, self.endByte, self.uploadFile.rawFile.type, self);
                return;
            case READ_STATE["reading"]:
                return;
        }
        if (self.upload.option.isCheckChunk && !self.tested) {
            self.doChunkCheck();
            return;
        }

        self.loaded = 0;
        self.total = 0;
        self.pendingRetry = false;

        self.xhr = new XMLHttpRequest();
        self.xhr.upload.addEventListener("progress", function (event: Event) {
            self.progressHandler(event);
        }, false);
        self.xhr.addEventListener("load", function () {
            if (!self.xhr) {
                return;
            }
            let status = self.xhr.status;
            let readyState = self.xhr.readyState;
            self.xhrStatus = status;
            self.xhrReadyState = readyState;
            self.doneHandler();
        }, false);
        self.xhr.addEventListener("error", function () {
            console.log("分块发送错误");
            if (!self.xhr) {
                return;
            }
            let status = self.xhr.status;
            let readyState = self.xhr.readyState;
            // 测试代码 setTimeout(() => {
            self.xhrStatus = status;
            self.xhrReadyState = readyState;
            if (readyState > 3) {
                self.doneHandler();
            }
            // 测试代码 }, Math.floor(Math.random() * 2000));
        }, false);

        let uploadMethod = evalOpts(self.upload.option.uploadMethod, self.uploadFile, self);
        let data = self.prepareXhrRequest(uploadMethod, false, self.upload.option.method, self.bytes);
        let changeRawDataBeforeSend = self.upload.option.changeRawDataBeforeSend;
        if (typeof changeRawDataBeforeSend === "function") {
            data = changeRawDataBeforeSend(self, data);
        }

        self.xhr.onreadystatechange = function () {
            if (!self.xhr) {
                return;
            }
            let status = self.xhr.status;
            let readyState = self.xhr.readyState;
            // 测试代码 setTimeout(() => {
            self.xhrStatus = status;
            self.xhrReadyState = readyState;
            if (readyState > 3) {
                self.doneHandler();
            }
            // 测试代码 }, Math.floor(Math.random() * 2000));
        };
        console.log("==========发出请求=============")
        self.xhr.send(data);
    };

    // 终止当前分块上传请求
    abort(): void {
        let self = this;
        let xhr = self.xhr;
        self.xhr = null;
        self.xhrStatus = null;
        self.xhrReadyState = null;
        if (xhr) {
            xhr.abort();
        }
    };

    // 获取当前分块状态
    status(isTest?: boolean): CHUNK_STATUS {
        let self = this;
        if (self.readState === READ_STATE["reading"]) {
            return CHUNK_STATUS.READING;
        } else if (self.pendingRetry || self.preprocessState === PREPROCESS_STATE["processing"]) {
            return CHUNK_STATUS.UPLOADING;
        } else if (!self.xhr) {
            return CHUNK_STATUS.PENDING;
        } else if (self.xhrReadyState < 4) { // 'OPENED' | 'HEADERS_RECEIVED' | 'LOADING'
            return CHUNK_STATUS.UPLOADING;
        } else {
            if (self.upload.option.successStatuses.indexOf(self.xhrStatus) > -1) {
                // HTTP 200, perfect
                // HTTP 202 Accepted - The request has been accepted for processing, but the processing has not been completed.
                return CHUNK_STATUS.SUCCESS;
            } else if (self.upload.option.permanentErrors.indexOf(self.xhrStatus) > -1 ||
                !isTest && self.retries >= self.upload.option.maxChunkRetries) {
                // HTTP 413/415/500/501, permanent error
                return CHUNK_STATUS.ERROR;
            } else {
                // this should never happen, but we'll reset and queue a retry
                // a likely case for this would be 503 service unavailable
                self.abort();
                return CHUNK_STATUS.PENDING;
            }
        }
    };

    // 获取当前分块进度数据
    progress(): number {
        let self = this;
        if (self.pendingRetry) {
            return 0;
        }
        let status = self.status();
        if (status === CHUNK_STATUS.SUCCESS || status === CHUNK_STATUS.ERROR) {
            return 1;
        } else if (status === CHUNK_STATUS.PENDING) {
            return 0;
        } else {
            return self.total > 0 ? self.loaded / self.total : 0;
        }
    };

    // 获取当前分块已上传数据量
    sizeUploaded(): number {
        let self = this;
        let size = self.endByte - self.startByte;
        if (self.status() !== CHUNK_STATUS.SUCCESS) {
            size = self.progress() * size;
        }
        return size;
    };

    // 触发当前分块上传事件
    private fireChunkEvent(event, args) {
        let self = this;
        args = Array.prototype.slice.call(arguments);
        args.unshift(self);
        self.uploadFile.onChunkEvent.apply(self.uploadFile, args);
    };

    // 计算当前分块在文件中的结束位置
    private computeEndByte(): number {
        let self = this;
        let endByte = Math.min(self.uploadFile.size, (self.offset + 1) * self.chunkSize);
        if (self.uploadFile.size - endByte < self.chunkSize && !self.upload.option.forceChunkSize) {
            endByte = self.uploadFile.size;
        }
        return endByte;
    };

    // 进度事件处理
    private progressHandler(event: Event): void {
        let self = this;
        if (event.lengthComputable) {
            self.loaded = event.loaded;
            self.total = event.total;
        }
        self.fireChunkEvent(CHUNK_UPLOAD_EVENT.PROGRESS, event);
    };

    // 当前分块验证请求回调处理
    private testHandler(): void {
        let self = this;
        let status = self.status(true);
        if (status === CHUNK_STATUS.ERROR) {
            self.fireChunkEvent(CHUNK_UPLOAD_EVENT.ERROR, self.message());
            self.upload.uploadNextChunk();
        } else if (status === CHUNK_STATUS.SUCCESS) {
            self.tested = true;
            self.fireChunkEvent(CHUNK_UPLOAD_EVENT.SUCCESS, self.message());
            self.upload.uploadNextChunk();
        } else if (!self.uploadFile.paused) {
            self.tested = true;
            self.send();
        }
    };

    // 当前分块发送请求回调处理
    private doneHandler(): void {
        let self = this;
        let status = self.status();
        if (status === CHUNK_STATUS.ERROR) {
            // delete self.data;
            self.fireChunkEvent(CHUNK_UPLOAD_EVENT.ERROR, self.message());
            self.upload.uploadNextChunk();
        } else if (status === CHUNK_STATUS.SUCCESS) {
            // delete self.data;
            self.fireChunkEvent(CHUNK_UPLOAD_EVENT.SUCCESS, self.message());
            self.upload.uploadNextChunk();
        } else {
            self.fireChunkEvent(CHUNK_UPLOAD_EVENT.RETRY, self.message());
            self.pendingRetry = true;
            self.abort();
            self.retries++;
            let retryInterval = self.upload.option.chunkRetryInterval;
            if (retryInterval !== null) {
                setTimeout(function () {
                    self.send();
                }, retryInterval);
            } else {
                self.send();
            }
        }
    };

    // 组合URL
    private getTarget(target: string, params: string[]): string {
        if (params.length == 0) {
            return target;
        }
        if (target.indexOf("?") < 0) {
            target += "?";
        } else {
            target += "&";
        }
        return target + params.join("&");
    };

    // 分块验证请求
    private doChunkCheck(): void {
        let self = this;
        self.xhr = new XMLHttpRequest();
        self.xhr.addEventListener("load", function () {
            self.testHandler();
        }, false);
        self.xhr.addEventListener("error", function () {
            self.testHandler();
        }, false);
        let checkChunkMethod = evalOpts(self.upload.option.checkChunkMethod, self.uploadFile, self);
        let data = self.prepareXhrRequest(checkChunkMethod, true);
        self.xhr.send(data);
    };

    // 获取response
    private message(): string {
        return this.xhr ? this.xhr.responseText : "";
    };

    // 整理xhr参数
    private prepareXhrRequest(method: string, isTest: boolean, paramsMethod?: string, blob?: Blob | string): FormData | Blob | string {
        let self = this;
        let query = evalOpts(self.upload.option.query, self.uploadFile, self, isTest);
        // query = extend(query || {}, self.getParams());

        let target = evalOpts(self.upload.option.target, self.uploadFile, self, isTest);
        let data = null;
        if (method === "GET" || paramsMethod === "octet") {
            let params = [];
            each(query, function (v, k) {
                params.push([encodeURIComponent(k), encodeURIComponent(v)].join("="));
            });
            target = self.getTarget(target, params);
            data = blob || null;
        } else {
            data = new FormData();
            each(query, function (v, k) {
                data.append(k, v);
            });
            if (typeof blob !== "undefined") {
                data.append(self.upload.option.fileParameterName, blob, self.uploadFile.rawFile.name);
            }
        }

        self.xhr.open(method, target, true);
        self.xhr.withCredentials = self.upload.option.withCredentials;

        // Add data from header options
        each(evalOpts(self.upload.option.headers, self.uploadFile, self, isTest), function (v, k) {
            self.xhr.setRequestHeader(k, v);
        }, self);

        return data;
    };
}