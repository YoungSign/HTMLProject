import { UploadOption } from "./UploadOption";
import { applyProperties, arrayRemove, each, async } from "../../../base-sdk/src/util/utils";
import { UploadFile } from "./UploadFile";
import { UPLOAD_EVENT, EventCallback, CHUNK_STATUS } from "./UploadDeclare";
import { UploadFileChunk } from "./UploadFileChunk";

/**
 * 文件上传
 */
export class Upload {

    public static support: boolean = (typeof File !== "undefined" && typeof Blob !== "undefined" && typeof FileList !== "undefined" && (!!Blob.prototype.slice || !!Blob.prototype.webkitSlice || !!Blob.prototype.mozSlice || false));
    public static supportDirectory: boolean = (/Chrome/.test(window.navigator.userAgent) || /Firefox/.test(window.navigator.userAgent) || /Edge/.test(window.navigator.userAgent));
    public option: UploadOption;
    public uploadFileQueue: Array<UploadFile>;
    private eventMap: { UPLOAD_EVENT?: Array<EventCallback[UPLOAD_EVENT]> };

    /**
     * 覆盖用户自定义配置参数
     * @param option 配置参数
     */
    constructor(option?: UploadOption) {
        let defaultOption = new UploadOption();
        this.option = applyProperties(defaultOption, option || {});
        this.uploadFileQueue = [];
        this.eventMap = {};
    };

    /**
     * 更新配置
     * @param option
     */
    updateOption(option: UploadOption) {
        this.option = applyProperties(this.option, option);
    };

    /**
     * 注册监听
     * @param eventName 事件名称
     * @param callback 监听回调函数
     */
    public addEventListener(eventName: UPLOAD_EVENT, callback: EventCallback[UPLOAD_EVENT]): void {
        let self = this;
        if (!self.eventMap.hasOwnProperty(eventName)) {
            self.eventMap[eventName] = [];
        }
        self.eventMap[eventName].push(callback);
    };

    /**
     * 注销监听
     * @param eventName 事件名称
     * @param callback 监听回调函数
     */
    public removeEventListener(eventName: UPLOAD_EVENT, callback: EventCallback[UPLOAD_EVENT]): void {
        let self = this;
        if (!eventName) { // 全部事件监听注销
            self.eventMap = {};
            return;
        }
        if (!callback) { // 单一事件监听队列注销
            delete self.eventMap[eventName];
            return;
        }
        if (self.eventMap.hasOwnProperty(eventName)) { // 单一事件监听注销
            arrayRemove(self.eventMap[eventName], callback);
        }
    };

    /**
     * 添加单个Web文件到上传队列
     * @param rawFile 原始浏览器文件
     * @param isPrioritized 是否队列内优先
     */
    public addFile(rawFile: File, isPrioritized?: boolean): UploadFile {
        let self = this;
        let addUploadFileQueue: UploadFile[] = self.addFiles([rawFile], isPrioritized || false);
        if (!addUploadFileQueue.length) {
            return null;
        }
        return addUploadFileQueue[addUploadFileQueue.length - 1];
    };

    /**
     * 添加多个Web文件到上传队列
     * @param rawFileList 原始浏览器文件列表或原始浏览器文件的数组
     * @param isPrioritized 是否队列内优先
     */
    public addFiles(rawFileList: FileList | File[], isPrioritized?: boolean): UploadFile[] {
        let self = this;
        let addUploadFileQueue = [];
        let ie10plus = window.navigator.msPointerEnabled;
        each(rawFileList, function (rawFile: File) {
            if ((!ie10plus || ie10plus && rawFile.size > 0) && !(rawFile.size % 4096 === 0 && (rawFile.name === "." || rawFile.fileName === "."))) {
                let uniqueIdentifier = self.generateUniqueIdentifier(rawFile);
                if (self.option.allowDuplicateUploads || !self.getUploadFile(uniqueIdentifier)) {
                    let newUploadFile = new UploadFile(self, rawFile, uniqueIdentifier);
                    self.fireEvent(UPLOAD_EVENT.FILE_ADDED, newUploadFile);
                    addUploadFileQueue.push(newUploadFile);
                }
            }
        }, self);
        self.fireEvent(UPLOAD_EVENT.FILES_ADDED, addUploadFileQueue);
        let treatedPriorityAddUploadFileQueue = [];
        if (isPrioritized && addUploadFileQueue.length > 1) {
            treatedPriorityAddUploadFileQueue = [].concat(addUploadFileQueue);
            treatedPriorityAddUploadFileQueue = treatedPriorityAddUploadFileQueue.reverse();
        } else {
            treatedPriorityAddUploadFileQueue = addUploadFileQueue;
        }
        each(treatedPriorityAddUploadFileQueue, function (uploadFile: UploadFile) {
            if (self.option.singleFile && self.uploadFileQueue.length > 0) {
                self.removeFile(self.uploadFileQueue[0]);
            }
            if (isPrioritized) {
                self.uploadFileQueue.unshift(uploadFile);
            } else {
                self.uploadFileQueue.push(uploadFile);
            }
        }, self);
        self.fireEvent(UPLOAD_EVENT.FILES_SUBMITTED, self.uploadFileQueue);
        return addUploadFileQueue;
    };

    /**
     * 清除上传队列中单个文件
     * @param removefile 待清理文件的上传文件或原始浏览器文件
     */
    public removeFile(removefile: UploadFile | File): void {
        let self = this;
        for (let i = self.uploadFileQueue.length - 1; i >= 0; i--) {
            let uploadFile = self.uploadFileQueue[i];
            if (uploadFile === removefile || uploadFile.rawFile === removefile) {
                self.uploadFileQueue.splice(i, 1);
                uploadFile.abort();
                self.fireEvent(UPLOAD_EVENT.FILE_REMOVED, removefile);
            }
        }
    };

    /**
     * 开始上传
     */
    public upload(): void {
        console.log("开始上传");
        let self = this;
        let started = false;
        let uploadableFile;
        while (uploadableFile = self._getUploadableFile()) {
            if (!started) {
                // 触发开始上传事件
                self.fireEvent(UPLOAD_EVENT.UPLOAD_START);
            }
            started = self.uploadNextChunk(true, uploadableFile) || started;
        }
        if (!started) {
            async(function () {
                // 触发上传完成事件
                self.fireEvent(UPLOAD_EVENT.COMPLETE);
            }, self);
        }
    };

    /**
     * 暂停上传
     */
    public pause(): void {
        let self = this;
        each(self.uploadFileQueue, function (uploadFile: UploadFile) {
            uploadFile.pause();
        });
    };

    /**
     * 恢复上传
     */
    public resume(): void {
        let self = this;
        each(self.uploadFileQueue, function (uploadFile: UploadFile) {
            if (!uploadFile.isComplete()) {
                uploadFile.resume();
            }
        });
    };

    /**
     * 取消上传
     */
    public cancel(): void {
        let self = this;
        for (let i = self.uploadFileQueue.length - 1; i >= 0; i--) {
            self.uploadFileQueue[i].cancel();
        }
    };

    /**
     * 获取上传进度
     */
    public progress(): number {
        let self = this;
        let totalDone = 0;
        let totalSize = 0;
        // Resume all chunks currently being uploaded
        each(self.uploadFileQueue, function (uploadFile: UploadFile) {
            totalDone += uploadFile.progress() * uploadFile.size;
            totalSize += uploadFile.size;
        });
        return totalSize > 0 ? totalDone / totalSize : 0;
    };


    /**
     * 是否在上传中
     */
    public isUploading(): boolean {
        let self = this;
        let uploading = false;
        each(self.uploadFileQueue, function (uploadFile: UploadFile) {
            if (uploadFile.isUploading()) {
                uploading = true;
                return false;
            }
        });
        return uploading;
    };

    /**
     * 根据唯一ID获取上传文件
     * @param id 唯一ID
     */
    public getUploadFile(id: string): UploadFile {
        let self = this;
        let ret = null;
        each(self.uploadFileQueue, function (uploadFile: UploadFile) {
            if (uploadFile.uniqueIdentifier === id) {
                ret = uploadFile;
            }
        });
        return ret;
    };

    /**
     * 获取总上传数据量
     */
    public getSize(): number {
        let self = this;
        let totalSize = 0;
        each(self.uploadFileQueue, function (uploadFile: UploadFile) {
            totalSize += uploadFile.size;
        });
        return totalSize;
    };

    /**
     * 获取总的已上传数据量
     */
    public getUploadedSize(): number {
        let self = this;
        let size = 0;
        each(self.uploadFileQueue, function (uploadFile: UploadFile) {
            size += uploadFile.sizeUploaded();
        });
        return size;
    };

    /**
     * 获取剩余上传时间
     */
    public timeRemaining(): number {
        let self = this;
        let sizeDelta = 0;
        let averageSpeed = 0;
        each(self.uploadFileQueue, function (uploadFile: UploadFile) {
            if (!uploadFile.paused && !uploadFile.error) {
                sizeDelta += uploadFile.size - uploadFile.sizeUploaded();
                averageSpeed += uploadFile.averageSpeed;
            }
        });
        if (sizeDelta && !averageSpeed) {
            return Number.POSITIVE_INFINITY;
        }
        if (!sizeDelta && !averageSpeed) {
            return 0;
        }
        return Math.floor(sizeDelta / averageSpeed);
    };

    // 触发事件
    fireEvent(eventName: UPLOAD_EVENT, ...args: any): boolean {
        let self = this;
        args = Array.prototype.slice.call(arguments);
        let preventDefault = false;
        if (self.eventMap.hasOwnProperty(eventName)) {
            each(self.eventMap[eventName], function (callback) {
                preventDefault = callback.apply(self, args.slice(1)) === false || preventDefault;
            }, self);
        }
        if (eventName != UPLOAD_EVENT.CATCH_ALL) {
            args.unshift(UPLOAD_EVENT.CATCH_ALL);
            preventDefault = self.fireEvent.apply(self, args) === false || preventDefault;
        }
        return !preventDefault;
    };

    // 生成唯一ID
    generateUniqueIdentifier(rawFile: File): string {
        let self = this;
        let custom = self.option.generateUniqueIdentifier;
        if (typeof custom === "function") {
            return custom(rawFile);
        }

        let relativePath = rawFile.relativePath || rawFile.webkitRelativePath || rawFile.fileName || rawFile.name;
        return rawFile.size + "-" + relativePath.replace(/[^0-9a-zA-Z_-]/img, "");
    };

    // 上传下一个分块
    uploadNextChunk(preventEvents?: boolean, uploadableFile?: UploadFile): boolean {
        console.log("uploadNextChunk")
        let self = this;
        let found = false;
        uploadableFile = uploadableFile || self._getUploadableFile();
        if (!uploadableFile) {
            return found;
        }
        found = self._doUploadableChunk(uploadableFile);
        console.log("_doUploadableChunk", found)
        if (found) {
            return found;
        }
        let outstanding = false;
        each(self.uploadFileQueue, function (uploadFile: UploadFile) { // 上传收尾工作
            if (!uploadFile.isComplete()) {
                outstanding = true;
                return false;
            }
        });
        if (!outstanding && !preventEvents) {
            async(function () {
                // 触发上传完成事件
                self.fireEvent(UPLOAD_EVENT.COMPLETE);
            }, self);
        }
        return found;
    };

    private _getUploadableFile(): UploadFile {
        let self = this;
        let totalUploadingChunkNum = 0;
        let totalUploadingFileNum = 0;
        let totalSimultaneousFilesLimit = self.option.totalSimultaneousFilesLimit;
        let totalSimultaneousChunksLimit = self.option.totalSimultaneousChunksLimit;
        let fileSimultaneousChunksLimit = self.option.fileSimultaneousChunksLimit;
        let uploadableFile = null;
        console.log("开始_getUploadableFile")
        each(self.uploadFileQueue, function (uploadFile: UploadFile) {
            if (uploadFile.isComplete()) { // 该文件已上传完
                return true;
            }
            if (uploadFile.paused) {// 该文件暂停中
                return true;
            }
            let fileUploadingChunkNum = 0;
            let isUploading = false;
            each(uploadFile.uploadFileChunkQuene, function (chunk: UploadFileChunk) {
                if (totalUploadingChunkNum >= totalSimultaneousChunksLimit) { // 已达到或超过总分块并发数限制，暂时无可上传块
                    console.log("totalUploadingChunkNum >= totalSimultaneousChunksLimit");
                    return false;
                }
                if (fileUploadingChunkNum >= fileSimultaneousChunksLimit) {
                    console.log("fileUploadingChunkNum >= fileSimultaneousChunksLimit");
                    return false;
                }
                if (chunk.status() === CHUNK_STATUS.UPLOADING) {
                    totalUploadingChunkNum++;
                    fileUploadingChunkNum++;
                    isUploading = true;
                    console.log("isUploading");
                    return true;
                }
                if (!uploadableFile) { // 找到最优先的待上传chunk
                    if (chunk.status() === CHUNK_STATUS.PENDING) {
                        if (fileUploadingChunkNum < fileSimultaneousChunksLimit) {
                            uploadableFile = uploadFile;
                            console.log("找到优先的待上传chunk");
                            return false;
                        }
                    }
                }
            });
            if (uploadableFile) {
                return false;
            }
            if (totalUploadingChunkNum >= totalSimultaneousChunksLimit) { // 已达到或超过总分块并发数限制，暂时无可上传块
                console.log("已达到或超过总分块并发数限制，暂时无可上传块");
                return false;
            }
            if (isUploading) {
                totalUploadingFileNum++;
                console.log("totalUploadingFileNum:" + totalUploadingFileNum);
            }
            if (totalUploadingFileNum >= totalSimultaneousFilesLimit) {
                console.log("totalUploadingFileNum over0");
                return false;
            }
            // if (fileUploadingChunkNum >= fileSimultaneousChunksLimit) {
            //     console.log("fileUploadingChunkNum over");
            //     return true;
            // }
            // if (!uploadableFile) {
            //     if (totalUploadingFileNum >= totalSimultaneousFilesLimit) {
            //         console.log("totalUploadingFileNum over1");
            //         return false;
            //     } else {
            //         return true;
            //     }
            // } else {
            //     if (totalUploadingFileNum >= totalSimultaneousFilesLimit) {
            //         console.log("找到...最优先的待上传chunk");
            //         uploadableFile = uploadFile;
            //         console.log("totalUploadingFileNum over2");
            //         return false;
            //     } else {
            //         return true;
            //     }
            // }
        });
        console.log("待上传uploadableFile:" + uploadableFile);
        return uploadableFile;
    };

    private _doUploadableChunk(uploadableFile: UploadFile): boolean {
        let self = this;
        let found = false;
        let chunkQuene = uploadableFile.uploadFileChunkQuene;
        if (self.option.prioritizeFirstAndLastChunk) { // 优先上传首尾分块
            let fisrtChunk: UploadFileChunk = chunkQuene[0];
            if (chunkQuene.length &&
                fisrtChunk.status() === CHUNK_STATUS.PENDING) {
                fisrtChunk.send();
                found = true;
                return found;
            }
            let lastChunk: UploadFileChunk = chunkQuene[chunkQuene.length - 1];
            if (chunkQuene.length > 1 &&
                lastChunk.status() === CHUNK_STATUS.PENDING) {
                lastChunk.send();
                found = true;
                return found;
            }
        }
        // 正常按顺序处理
        each(chunkQuene, function (chunk: UploadFileChunk) {
            if (chunk.status() === CHUNK_STATUS.PENDING) {
                chunk.send();
                found = true;
                return false;
            }
        });
        if (!found) {
            console.log("未找到待上传分块")
        }
        return found;
    }

};