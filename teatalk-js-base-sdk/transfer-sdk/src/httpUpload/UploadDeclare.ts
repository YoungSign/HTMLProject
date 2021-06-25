import { UploadFile } from "./UploadFile";
import { UploadFileChunk } from "./UploadFileChunk";

export enum UPLOAD_EVENT {
    FILE_ADDED = "fileAdded",
    FILES_ADDED = "filesAdded",
    FILES_SUBMITTED = "filesSubmitted",
    FILE_REMOVED = "fileRemoved",
    UPLOAD_START = "uploadStart",
    FILE_PROGRESS = "fileProgress",
    FILE_SUCCESS = "fileSuccess",
    FILE_ERROR = "fileError",
    FILE_RETRY = "fileRetry",
    PROGRESS = "progress",
    COMPLETE = "complete",
    ERROR = "error",
    CATCH_ALL = "catchAll"
};

export interface EventCallback {
    [UPLOAD_EVENT.FILE_ADDED]: (uploadFile: UploadFile) => void;
    [UPLOAD_EVENT.FILES_ADDED]: (uploadFileArray: UploadFile[]) => void;
    [UPLOAD_EVENT.FILES_SUBMITTED]: (uploadFileArray: UploadFile[]) => boolean;
    [UPLOAD_EVENT.FILE_REMOVED]: (uploadFile: UploadFile) => void;
    [UPLOAD_EVENT.UPLOAD_START]: () => void;
    [UPLOAD_EVENT.FILE_PROGRESS]: (uploadFile: UploadFile, uploadFileChunk: UploadFileChunk) => void;
    [UPLOAD_EVENT.FILE_SUCCESS]: (uploadFile: UploadFile, response: string, uploadFileChunk: UploadFileChunk) => void;
    [UPLOAD_EVENT.FILE_ERROR]: (uploadFile: UploadFile, response: string, uploadFileChunk: UploadFileChunk) => void;
    [UPLOAD_EVENT.FILE_RETRY]: (uploadFile: UploadFile, uploadFileChunk: UploadFileChunk) => void;
    [UPLOAD_EVENT.PROGRESS]: () => void;
    [UPLOAD_EVENT.COMPLETE]: () => void;
    [UPLOAD_EVENT.ERROR]: (uploadFile: UploadFile, response: string, uploadFileChunk: UploadFileChunk) => void;
    [UPLOAD_EVENT.CATCH_ALL]: () => void;
};

export enum CHUNK_UPLOAD_EVENT {
    PROGRESS = "progress",
    SUCCESS = "success",
    ERROR = "error",
    RETRY = "retry"
};

export enum CHUNK_STATUS {
    PENDING = "pending",
    READING = "reading",
    UPLOADING = "uploading",
    SUCCESS = "success",
    ERROR = "error"
};

export enum PREPROCESS_STATE {
    unprocessed = 0,
    processing = 1,
    finished = 2
};

export enum READ_STATE {
    notread = 0,
    reading = 1,
    finished = 2
};

declare global {
    interface Blob {
        webkitSlice: any;
        mozSlice: any;
    }

    interface File {
        relativePath: string,
        webkitRelativePath: string,
        fileName: string,
        uid: string,
    }

    interface Event {
        lengthComputable: boolean,
        loaded: number,
        total: number,
    }
};