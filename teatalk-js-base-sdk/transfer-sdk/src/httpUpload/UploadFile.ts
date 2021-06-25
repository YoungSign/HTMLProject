import { UploadFileChunk } from "./UploadFileChunk";
import { Upload } from "./Upload";
import { evalOpts, each } from "../../../base-sdk/src/util/utils";
import { UPLOAD_EVENT, CHUNK_UPLOAD_EVENT, CHUNK_STATUS, PREPROCESS_STATE, READ_STATE } from "./UploadDeclare";


export class UploadFile {

    public upload: Upload;
    public rawFile: File;
    public uniqueIdentifier: string;
    public uploadFileChunkQuene: Array<UploadFileChunk>;
    public paused: boolean;
    public error: boolean;
    public size: number;
    public relativePath: string;
    public averageSpeed: number;
    public currentSpeed: number;
    public name: string;
    chunkSize: number;
    private _lastProgressTimeStamp: number;
    private _prevProgress: number;
    private _prevUploadedSize: number;

    /**
     * 覆盖用户自定义配置参数
     * @param option 配置参数
     */
    constructor(upload: Upload, rawFile: File, uniqueIdentifier: string) {
        let self = this;
        self.upload = upload;
        self.rawFile = rawFile;
        self.uniqueIdentifier = uniqueIdentifier || upload.generateUniqueIdentifier(rawFile);
        self.size = rawFile.size;
        self.name = rawFile.fileName || rawFile.name;
        self.relativePath = rawFile.relativePath || rawFile.webkitRelativePath || self.name;
        self.currentSpeed = 0;
        self.averageSpeed = 0;
        self._lastProgressTimeStamp = Date.now();
        self._prevUploadedSize = 0;
        self.bootstrap();
    };

    /**
     * 重新初始化上传文件并重新分配分块任务
     */
    public bootstrap(): void {
        let self = this;
        if (typeof self.upload.option.initFileFn === "function") {
            self.upload.option.initFileFn(self);
        }
        self.uploadFileChunkQuene = [];
        // self.abort(true);
        self.abort();
        self.error = false;
        self.paused = false;
        self._prevProgress = 0;
        let round = self.upload.option.forceChunkSize ? Math.ceil : Math.floor;
        self.chunkSize = evalOpts(self.upload.option.chunkSize, self);
        let chunksNum = Math.max(round(self.size / self.chunkSize), 1);
        for (let offset = 0; offset < chunksNum; offset++) {
            self.uploadFileChunkQuene.push(new UploadFileChunk(self.upload, self, offset));
        }
    };

    /**
     * 暂停当前文件上传
     */
    public pause(): void {
        let self = this;
        self.paused = true;
        self.abort();
    };

    /**
     * 恢复当前文件上传
     */
    public resume(): void {
        let self = this;
        self.paused = false;
        self.upload.upload();
    };

    /**
     * 取消当前文件上传
     */
    public cancel(): void {
        let self = this;
        self.upload.removeFile(self);
    };

    /**
     * 重试当前文件上传
     */
    public retry(): void {
        let self = this;
        self.bootstrap();
        self.upload.upload();
    };

    /**
     * 获取当前文件相对上传进度数据
     */
    public progress(): number {
        let self = this;
        if (self.error) {
            return 1;
        }
        if (self.uploadFileChunkQuene.length === 1) {
            self._prevProgress = Math.max(self._prevProgress, self.uploadFileChunkQuene[0].progress());
            return self._prevProgress;
        }
        // Sum up progress across everything
        let bytesLoaded = 0;
        each(self.uploadFileChunkQuene, function (c) {
            // get chunk progress relative to entire file
            bytesLoaded += c.progress() * (c.endByte - c.startByte);
        });
        let percent = bytesLoaded / self.size;
        // We don't want to lose percentages when an upload is paused
        self._prevProgress = Math.max(self._prevProgress, percent > 0.9999 ? 1 : percent);
        return self._prevProgress;
    };

    /**
     * 是否当前文件在上传中
     */
    public isUploading(): boolean {
        let self = this;
        let uploading = false;
        each(self.uploadFileChunkQuene, function (chunk: UploadFileChunk) {
            if (chunk.status() === CHUNK_STATUS.UPLOADING) {
                uploading = true;
                return false;
            }
        });
        return uploading;
    };

    /**
     * 当前文件是否上传完成
     */
    public isComplete(): boolean {
        let self = this;
        let outstanding = false;
        each(self.uploadFileChunkQuene, function (chunk: UploadFileChunk) {
            let status = chunk.status();
            if (status === CHUNK_STATUS.PENDING
                || status === CHUNK_STATUS.UPLOADING
                || status === CHUNK_STATUS.READING
                || chunk.preprocessState === PREPROCESS_STATE["processing"]
                || chunk.readState === READ_STATE["reading"]) {
                outstanding = true;
                return false;
            }
        });
        return !outstanding;
    };

    /**
     * 获取当前文件已上传数据量
     */
    public sizeUploaded(): number {
        let self = this;
        let size = 0;
        each(self.uploadFileChunkQuene, function (chunk: UploadFileChunk) {
            size += chunk.sizeUploaded();
        });
        return size;
    };

    /**
     * 获取当前文件剩余上传时间
     */
    public timeRemaining(): number {
        let self = this;
        if (self.paused || self.error) {
            return 0;
        }
        let delta = self.size - self.sizeUploaded();
        if (delta && !self.averageSpeed) {
            return Number.POSITIVE_INFINITY;
        }
        if (!delta && !self.averageSpeed) {
            return 0;
        }
        return Math.floor(delta / self.averageSpeed);
    };

    /**
     * 获取当前文件MIME类型
     */
    public getType(): string {
        let self = this;
        return self.rawFile.type && self.rawFile.type.split("/")[1];
    };

    /**
     * 获取当前文件后缀名
     */
    public getExtension(): string {
        let self = this;
        return self.name.substr((~-self.name.lastIndexOf(".") >>> 0) + 2).toLowerCase();
    };

    // 终止当前文件上传
    abort(reset?: boolean): void {
        let self = this;
        self.currentSpeed = 0;
        self.averageSpeed = 0;
        let chunks = self.uploadFileChunkQuene;
        // if (reset) {
        //     self.uploadFileChunkQuene = [];
        // }
        each(chunks, function (chunk: UploadFileChunk) {
            if (chunk.status() === CHUNK_STATUS.UPLOADING) {
                chunk.abort();
                self.upload.uploadNextChunk();
            }
        }, self);
    };

    // 处理分块上传事件
    onChunkEvent(chunk: UploadFileChunk, event: CHUNK_UPLOAD_EVENT, response: string): void {
        let self = this;
        switch (event) {
            case CHUNK_UPLOAD_EVENT.PROGRESS:
                if (Date.now() - self._lastProgressTimeStamp < self.upload.option.progressCallbacksInterval) {
                    break;
                }
                self.measureSpeed();
                self.upload.fireEvent(UPLOAD_EVENT.FILE_PROGRESS, self, chunk);
                self.upload.fireEvent(UPLOAD_EVENT.PROGRESS);
                self._lastProgressTimeStamp = Date.now();
                break;
            case CHUNK_UPLOAD_EVENT.ERROR:
                self.error = true;
                // self.abort(true);
                self.paused = true;
                self.abort();
                self.upload.fireEvent(UPLOAD_EVENT.FILE_ERROR, self, response, chunk);
                self.upload.fireEvent(UPLOAD_EVENT.ERROR, response, self, chunk);
                break;
            case CHUNK_UPLOAD_EVENT.SUCCESS:
                if (self.error) {
                    return;
                }
                self.measureSpeed();
                self.upload.fireEvent(UPLOAD_EVENT.FILE_PROGRESS, self, chunk);
                self.upload.fireEvent(UPLOAD_EVENT.PROGRESS);
                self._lastProgressTimeStamp = Date.now();
                if (self.isComplete()) {
                    self.currentSpeed = 0;
                    self.averageSpeed = 0;
                    self.upload.fireEvent(UPLOAD_EVENT.FILE_SUCCESS, self, response, chunk);
                }
                break;
            case CHUNK_UPLOAD_EVENT.RETRY:
                self.upload.fireEvent(UPLOAD_EVENT.FILE_RETRY, self, chunk);
                break;
        }
    };

    // 计算上传相关速度数据
    private measureSpeed(): void {
        let self = this;
        let timeSpan = Date.now() - self._lastProgressTimeStamp;
        if (!timeSpan) {
            return;
        }
        let smoothingFactor = self.upload.option.speedSmoothingFactor;
        let uploaded = self.sizeUploaded();
        self.currentSpeed = Math.max((uploaded - self._prevUploadedSize) / timeSpan * 1000, 0);
        self.averageSpeed = smoothingFactor * self.currentSpeed + (1 - smoothingFactor) * self.averageSpeed;
        self._prevUploadedSize = uploaded;
    };
}