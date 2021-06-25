import { UploadFile } from "./UploadFile";
import { UploadFileChunk } from "./UploadFileChunk";

/**
 *  上传默认配置参数
 */
export class UploadOption {
    public target: string | ((uploadFile: UploadFile, uploadFileChunk: UploadFileChunk, isTest: boolean) => string) = "/"; // 上传目标服务URL或构造器
    public singleFile: boolean = false; // 单文件上传开关，一旦开启后面会覆盖前面文件，前面文件会被取消
    public chunkSize: number | ((uploadFile: UploadFile) => number) = 1024 * 1024; // 每个分块字节大小或构造器，默认最后一个分块大于chunkSize，这样有利于某些文件利用头分块和尾分块判断有效性
    public forceChunkSize: boolean = false; // 强制所有分块都小于等于chunkSize，默认最后一个分块大于chunkSize，这样有利于某些文件利用头分块和尾分块判断有效性
    public prioritizeFirstAndLastChunk: boolean = false; // 是否优先上传首尾分块
    public totalSimultaneousChunksLimit: number = 3; // 总体并行上传分块数
    public fileSimultaneousChunksLimit: number = 1; // 文件级并行上传分块数
    public totalSimultaneousFilesLimit: number = 1; // 总体并行上传文件数
    public fileParameterName: string = "file"; // 模拟form表单方式时的文件参数名
    public query: Object | ((uploadFile: UploadFile, uploadFileChunk: UploadFileChunk, isTest: boolean) => Object) = {}; // POST方法时url的query参数或构造器
    public headers: Object | ((uploadFile: UploadFile, uploadFileChunk: UploadFileChunk, isTest: boolean) => Object) = {}; // POST方法时的header或构造器
    public withCredentials: boolean = false; // CORS时是否包含cookies
    public method: string = "multipart"; // 两种支持的http xhr上传流方式: multipart or octet
    public isCheckChunk: boolean = true; // 如果服务器已实现，是否在每个分块发送前向服务器探查一下是否已存在该分块，一般在应用崩溃后的断点续传时有意义
    public checkChunkMethod: string | ((uploadFile: UploadFile, uploadFileChunk: UploadFileChunk) => string) = "GET"; // 探查方法或构造器
    public uploadMethod: string | ((uploadFile: UploadFile, uploadFileChunk: UploadFileChunk) => string) = "POST"; // 上传方法或构造器
    public allowDuplicateUploads: boolean = false; // 是否允许未清除出上传队列前重复上传同一文件
    public preprocess: ((uploadFileChunk: UploadFileChunk) => void) = null; // 发包前的预处理钩子
    public changeRawDataBeforeSend: ((uploadFileChunk: UploadFileChunk, data: FormData | Blob | string) => FormData | Blob | string) = null; // 发送每个分块前改变原始数据
    public initFileFn: ((uploadFile: UploadFile) => void) = null; // 文件初始化钩子，可以自定义文件信息甚至blob
    public readFileFn: ((uploadFile: UploadFile, startByte: number, endByte: number, type: File["type"], uploadFileChunk: UploadFileChunk) => void)
        = (uploadFile: UploadFile, startByte: number, endByte: number, fileType: File["type"], uploadFileChunk: UploadFileChunk) => {
            let function_name = "slice";
            if (uploadFile.rawFile.slice) {
                function_name = "slice";
            } else if (uploadFile.rawFile.mozSlice) {
                function_name = "mozSlice";
            } else if (uploadFile.rawFile.webkitSlice) {
                function_name = "webkitSlice";
            }
            uploadFileChunk.readFinished(uploadFile.rawFile[function_name](startByte, endByte, fileType));
        }; // 自定义读取文件字节方式
    public generateUniqueIdentifier: ((rawFile: File) => string) = null; // 自定义文件唯一号码生成器
    public maxChunkRetries: number = 0; // 最大分块重试次数
    public chunkRetryInterval: number = null; // 重试间隔
    public progressCallbacksInterval: number = 500; // 进度回调间隔
    public speedSmoothingFactor: number = 0.1; // 平均速度计算光滑因子
    public successStatuses: Array<number> = [200]; // 成功响应范围
    public permanentErrors: Array<number> = [401, 403, 404, 413, 415, 500, 501]; // 失败响应范围
}