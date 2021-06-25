import { CinMsgSendPacket } from "./msg-packets/MsgSendTransaction";
import "./msg-packets/msgReceiveTrasaction";
import { applyProperties, generateUUID, encodeQueryString, MediaUtil, doMultiTasks, async } from "./../../base-sdk/src/util/utils";
import { templates as msgTemplates } from "./msg-packets/msg-templates";
import { templates as msgBodyTemplates } from "./msg-packets/body/msg-body-template";
import { TemplateManager } from "../../base-sdk/src/TemplateManager";
import { CinMsgHistoryPacket } from "./msg-packets/msgHistoryTransaction";
import { CinMsgRevokePacket } from "./msg-packets/MsgRevokeTransaction";
import { CinMsgCollectPacket } from "./msg-packets/msgCollectionTransaction";
import { CinMsgCollectIdPacket } from "./msg-packets/msgCollectionIdTransaction";
import { CinMsgCOllectionListPacket } from "./msg-packets/msgCollectionListTransaction";
import { CinMsgCollectionDeletePacket } from "./msg-packets/deleteMsgCollectionTransaction";
import { CinMsgReadReplyPacket } from "./msg-packets/MsgReadReplyTransaction";
import { CinMsgImmunityPacket } from "./msg-packets/msgImmunityTransaction";
import { CinMsgOffLinePacket } from "./msg-packets/MessageOffLineTransaction";
import { CinMsgReadReplyClearPacket } from "./msg-packets/MsgReadReplyClearTransaction";

import { CinSessionMsgPacket } from "./msg-packets/getSessionMsgTransaction";
import { CinMsgSocialOffLineNtfPacket } from "./msg-packets/MsgSocialOffLineNtfTransaction";
// import { CinMsgDeletePacket } from "./msg-packets/deleteMessageTransaction";
// import { CinMessageMergeQueryPacket } from "./msg-packets/messageMergeQueryTransaction";

import "./msg-packets/MsgRevokeNotifyTransaction";
import "./msg-packets/MsgReplyTransaction";

const MODULE_ID = "MSG";
TemplateManager.loadTemplates(MODULE_ID, msgTemplates);
TemplateManager.loadTemplates(MODULE_ID, msgBodyTemplates);

enum FileNotifyHandleName {
    STATE = "state",
    PROGRESS = "progress"
}

let TeatalkMsgSdk: any = {
    sdkParams: {},
    baseSdk: null,
    transferSdk: null,
    listener: null,
    msgFileUpload: null,
    init: function (sdkParams: { baseSdk: any, transferSdk?: any }) {
        let self = this;
        self.sdkParams = applyProperties(self.sdkParams, sdkParams);
        self.baseSdk = sdkParams.baseSdk;
        self.transferSdk = sdkParams.transferSdk || null;
        if (!self.baseSdk) {
            console.error("未找到基础sdk");
            return;
        }
        if (self.transferSdk) {
            self.baseSdk.invoke("createUpload", {
                callback: instance => {
                    self.msgFileUpload = instance;
                    self.msgFileUpload.updateOption({
                        isCheckChunk: false,
                        method: "octet",
                        uploadMethod: "POST",
                        chunkSize: 1024 * 1024,
                        forceChunkSize: true,
                        maxChunkRetries: 0,
                        chunkRetryInterval: 1000,
                        totalSimultaneousChunksLimit: 6,
                        fileSimultaneousChunksLimit: 1,
                        totalSimultaneousFilesLimit: 6,
                        generateUniqueIdentifier: function (file: File) {
                            return file.uid;
                        },
                        query: function (uploadFile, uploadFileChunk) {
                            return {
                                file_size: uploadFile.size,
                                range: uploadFileChunk.startByte + "-" + uploadFileChunk.endByte,
                                // status: "",
                                is_temp: "true"
                            };
                        },
                        target: function (uploadFile, uploadFileChunk) {
                            console.log('-----------uploadFile', uploadFile);
                            const query = {
                                file_id: uploadFile.uniqueIdentifier,
                                file_size: uploadFile.rawFile.fileSize
                            };
                            // const baseUrl = self.transferSdk.sdkParams.uploadBaseUrl || "//124.42.103.164:8083";
                            // 优先使用服务器返回的文件地址，其次为初始化传入的地址
                            const baseUrl = self.baseSdk.app.dtcurl || self.transferSdk.sdkParams.uploadBaseUrl || "//124.42.103.164:8083";
                            return `${baseUrl}/upload?${encodeQueryString(query)}`;
                        },
                        headers: function (uploadFile, uploadFileChunk) {
                            return {
                                token: self.baseSdk.app.transferToken
                            };
                        }
                    });
                }
            });
        }

        // 接口1--发送文本消息
        self.baseSdk.register("sendTextMsg", function (params: {
            options: {
                from: number,
                to: number | number[],
                messageId?: string,
                mobileNo?: string,
                name?: string,
                content: string,
                at?: string
            },
            sendType: number,
            callback: (success: boolean, result: {
                respons: string,
                data: {
                    messageId: string,
                    from: number,
                    to: number,
                    msgSequence: number,
                    serverTime: number,
                    capacity: string,
                    tip: string
                }
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let sendType = params.sendType;
            console.log(sendType , 'sendType')
            let object: any = applyProperties(options, {});
            let packet = new CinMsgSendPacket(object);
            packet.setSendType(sendType);
            self.baseSdk.ses.sendRequest(packet, callback);
            return packet.messageId;
        });

        // 计算上传文件组进度
        let computeQueueProgress = function (fileQueue) {
            if (!fileQueue.length) {
                return 0;
            }
            let upload = 0;
            let total = 0;
            for (let i = 0; i < fileQueue.length; i++) {
                let prepareFileInfo = fileQueue[i];
                let uploadFile = prepareFileInfo.uploadFile;
                let file = prepareFileInfo.file;
                let existedSize = prepareFileInfo.existedSize;
                let uploadSize = uploadFile ? uploadFile.sizeUploaded() : 0;
                let size = file.size;
                upload += existedSize + uploadSize;
                total += size;
            }
            return (upload / total).toFixed(1);
        };

        // 检查上传文件组完成状态
        let checkQueueSuccess = function (fileQueue) {
            if (!fileQueue.length) {
                return !0;
            }
            let successFlag = true;
            for (let i = 0; i < fileQueue.length; i++) {
                let prepareFileInfo = fileQueue[i];
                let uploadFile = prepareFileInfo.uploadFile;
                let isCompleted = uploadFile ? uploadFile.isComplete() : true;
                successFlag = successFlag && isCompleted;
            }
            return successFlag;
        };

        // 处理文件组上传
        let doQueueUpload = function (messageId, indexByUid, indexByFileType, queue, onNotify, uploadInstance) {
            return new Promise(async function (resolve, reject) {
                // 1 生成文件UID、检查文件在服务器状态
                const treatFilePrepareResults: any = await doMultiTasks(queue, function (prepareFileInfo) {
                    const type = prepareFileInfo.file.type ? prepareFileInfo.file.type.split("/")[0] : '';
                    const fileType = prepareFileInfo.file.name ? prepareFileInfo.file.name.substr(prepareFileInfo.file.name.lastIndexOf('.')): '';
                    const subTreatTask = [];
                    // 生成文件UID
                    subTreatTask.push(MediaUtil.getUid(prepareFileInfo.file).then(function (uid: string) {
                        prepareFileInfo.file.uid = uid;
                        indexByUid[uid] = prepareFileInfo;
                        indexByFileType[prepareFileInfo.type] = prepareFileInfo;
                        // 检查文件在服务器状态
                        return MediaUtil.fileExist(self.baseSdk.app.dtcurl || self.transferSdk.sdkParams.uploadBaseUrl,
                            { fileId: uid, fileSize: prepareFileInfo.file.size, fileType: fileType },
                            self.baseSdk.app.transferToken);
                    }));
                    return subTreatTask;
                });

                // 2 根据状态分别处理
                let checkErrorPrepareFileInfo = null;
                for (let i = 0; i < treatFilePrepareResults.length; i++) {
                    const prepareFileInfo = treatFilePrepareResults[i].target;
                    const existResult = treatFilePrepareResults[i].result[0];
                    switch (existResult.status) {
                        case 200:
                        case 202:
                        case 201:
                            break;
                        default:
                            checkErrorPrepareFileInfo = prepareFileInfo;
                    }
                    if (checkErrorPrepareFileInfo) {
                        break;
                    }
                }
                if (checkErrorPrepareFileInfo) {
                    reject(`${checkErrorPrepareFileInfo.type} exist checking error`);
                    return;
                }

                for (let i = 0; i < treatFilePrepareResults.length; i++) {
                    const prepareFileInfo = treatFilePrepareResults[i].target;
                    const existResult = treatFilePrepareResults[i].result[0];
                    switch (existResult.status) {
                        case 200: { // 已存在
                            prepareFileInfo.uploadFile = null;
                            prepareFileInfo.existedSize = prepareFileInfo.file.size;
                            break;
                        }
                        case 202: { // 部分存在
                            const range = JSON.parse(existResult.data).range;
                            const currByteOffset = range.split("-")[1];
                            const newFileBlob = MediaUtil.createSlicedFileBlock(prepareFileInfo.file, currByteOffset, null);
                            prepareFileInfo.uploadFile = self.msgFileUpload.addFile(newFileBlob);
                            prepareFileInfo.existedSize = currByteOffset;
                            break;
                        }
                        case 201: { // 不存在
                            prepareFileInfo.uploadFile = self.msgFileUpload.addFile(prepareFileInfo.file);
                            prepareFileInfo.existedSize = 0;
                            break;
                        }
                    }
                }

                // progress
                let progress = computeQueueProgress(queue);
                onNotify && onNotify(FileNotifyHandleName.PROGRESS, messageId, progress);

                // check all success
                if (checkQueueSuccess(queue)) {
                    onNotify && onNotify(FileNotifyHandleName.STATE, messageId, {
                        state: "complete"
                    });
                    resolve(messageId);
                    return;
                }

                // 3 绑定监听
                let _fileProgressListener = function (uploadFile, uploadFileChunk) {
                    let uid = uploadFile.uniqueIdentifier;
                    if (indexByUid[uid]) {
                        // progress
                        let progress = computeQueueProgress(queue);
                        onNotify && onNotify(FileNotifyHandleName.PROGRESS, messageId, progress);
                    }
                };
                self.msgFileUpload.addEventListener("fileProgress", _fileProgressListener);

                let _fileSuccessListener = function (uploadFile, response, uploadFileChunk) {
                    let uid = uploadFile.uniqueIdentifier;
                    if (indexByUid[uid]) {
                        let prepareFileInfo = indexByUid[uid];
                        // progress
                        let progress = computeQueueProgress(queue);
                        onNotify && onNotify(FileNotifyHandleName.PROGRESS, messageId, progress);
                        // success
                        onNotify && onNotify(FileNotifyHandleName.STATE, messageId, {
                            type: prepareFileInfo.type,
                            state: "success"
                        });
                        // cancel upload file
                        uploadFile.cancel();
                        prepareFileInfo.uploadFile = null;
                        prepareFileInfo.existedSize = prepareFileInfo.file.size;
                        // check all success
                        if (checkQueueSuccess(queue)) {
                            onNotify && onNotify(FileNotifyHandleName.STATE, messageId, {
                                state: "complete"
                            });
                            // clear Listeners
                            uploadInstance.removeEventListener("fileProgress", _fileProgressListener);
                            uploadInstance.removeEventListener("fileSuccess", _fileSuccessListener);
                            uploadInstance.removeEventListener("fileError", _fileErrorListener);
                            resolve(messageId);
                        }
                    }
                };
                self.msgFileUpload.addEventListener("fileSuccess", _fileSuccessListener);

                let _fileErrorListener = function (uploadFile, response, uploadFileChunk) {
                    let uid = uploadFile.uniqueIdentifier;
                    if (indexByUid[uid]) {
                        let prepareFileInfo = indexByUid[uid];
                        // error
                        onNotify && onNotify(FileNotifyHandleName.STATE, messageId, {
                            type: prepareFileInfo.type,
                            state: "error",
                            response: response
                        });
                        // cancel upload file
                        uploadFile.cancel();
                        prepareFileInfo.uploadFile = null;
                        prepareFileInfo.existedSize = 0;
                        // clear Listeners
                        uploadInstance.removeEventListener("fileProgress", _fileProgressListener);
                        uploadInstance.removeEventListener("fileSuccess", _fileSuccessListener);
                        uploadInstance.removeEventListener("fileError", _fileErrorListener);
                        reject(response);
                    }
                };
                self.msgFileUpload.addEventListener("fileError", _fileErrorListener);

                uploadInstance.upload();
            });
        };

        // 接口2--发送文件消息
        self.transferSdk && self.baseSdk.register("sendFileMsg", function (params: {
            options: {
                from: number,
                to: number | number[],
                messageId?: string,
                mobileNo?: string,
                name?: string,
                content?: {
                    fileName?: string
                }
            },
            sendType: number,
            blobs: {
                file: File,
                thumb?: File,
                origin?: File
            },
            onNotify: (
                handleName: FileNotifyHandleName,
                msgId: string,
                result?: number | string | any
            ) => void,
            callback: (success: boolean, result: {
                respons: string,
                data: {
                    messageId: string,
                    from: number,
                    to: number,
                    msgSequence: number,
                    serverTime: number,
                    capacity: string,
                    tip: string
                }
            }, reason?: string) => void
        }) {
            let blobs = params.blobs;
            let onNotify = params.onNotify;
            let callback = params.callback;
            if (!params.options.messageId) {
                params.options.messageId = generateUUID(32, 16);
            }

            // 准备数据:构建待上传文件队列和索引结构
            let indexByUid = {};
            let indexByFileType = {};
            let queue = [];
            if (blobs.thumb) {
                queue.push({
                    file: blobs.thumb,
                    type: "thumb"
                });
            }
            queue.push({
                file: blobs.file,
                type: "file"
            });
            if (blobs.origin) {
                queue.push({
                    file: blobs.origin,
                    type: "origin"
                });
            }

            // 一、先上传文件
            doQueueUpload(params.options.messageId, indexByUid, indexByFileType, queue, onNotify, self.msgFileUpload)
            // 二、再发文件消息
            .then(
                function (res) {
                    let options = params.options;
                    let sendType = params.sendType;
                    let object: any = applyProperties(options, { type: 2 });
                    if (!object.content) {
                        object.content = {};
                    }
                    if (indexByFileType["file"]) {
                        object.content.fileId = indexByFileType["file"].file.uid;
                        object.content.fileSize = indexByFileType["file"].file.size;
                        if (!object.content.fileName) {
                            object.content.fileName = indexByFileType["file"].file.fileName;
                        }
                    }
                    if (indexByFileType["thumb"]) {
                        object.content.thumbId = indexByFileType["thumb"].file.uid;
                        object.content.thumbSize = indexByFileType["thumb"].file.size;
                    }
                    if (indexByFileType["origin"]) {
                        object.content.originImageId = indexByFileType["origin"].file.uid;
                        object.content.originImageSize = indexByFileType["origin"].file.size;
                    }
                    let packet = new CinMsgSendPacket(object);
                    packet.setSendType(sendType);
                    self.baseSdk.ses.sendRequest(packet, (success: boolean, result: {
                        respons: string,
                        data: {
                            messageId: string,
                            from: number,
                            to: number,
                            msgSequence: number,
                            serverTime: number,
                            capacity: string,
                            tip: string
                        }
                    }, reason?: string) => {
                        if (result) {
                            result.data = applyProperties(result.data || {}, {content: object.content});
                        }
                        callback(success, result, reason);
                    });
                },
                function (err) {
                    console.log(err);
                    callback && callback(false, null, "上传文件失败");
                }
            ).finally(function () {
                indexByUid = null;
                indexByFileType = null;
                queue = null;
            });

            return params.options.messageId;
        });

        // 接口3--发送图片消息
        self.transferSdk && self.baseSdk.register("sendImageMsg", function (params: {
            options: {
                from: number,
                to: number | number[],
                messageId?: string,
                mobileNo?: string,
                name?: string,
                content?: {
                    fileName?: string
                }
            },
            sendType: number,
            blobs: {
                file: File,
                thumb?: File,
                origin?: File
            },
            onNotify: (
                handleName: FileNotifyHandleName,
                msgId: string,
                result?: number | string | any
            ) => void,
            callback: (success: boolean, result: {
                respons: string,
                data: {
                    messageId: string,
                    from: number,
                    to: number,
                    msgSequence: number,
                    serverTime: number,
                    capacity: string,
                    tip: string
                }
            }, reason?: string) => void
        }) {
            let blobs = params.blobs;
            let onNotify = params.onNotify;
            let callback = params.callback;
            if (!params.options.messageId) {
                params.options.messageId = generateUUID(32, 16);
            }

            // 准备数据:构建待上传文件队列和索引结构
            let indexByUid = {};
            let indexByFileType = {};
            let queue = [];
            if (blobs.thumb) {
                queue.push({
                    file: blobs.thumb,
                    type: "thumb"
                });
            }
            queue.push({
                file: blobs.file,
                type: "file"
            });
            if (blobs.origin) {
                queue.push({
                    file: blobs.origin,
                    type: "origin"
                });
            }

            // 一、先上传文件
            doQueueUpload(params.options.messageId, indexByUid, indexByFileType, queue, onNotify, self.msgFileUpload)
            // 二、再发文件消息
            .then(
                function (res) {
                    let options = params.options;
                    let sendType = params.sendType;
                    let object: any = applyProperties(options, { type: 0 });
                    if (!object.content) {
                        object.content = {};
                    }
                    if (indexByFileType["file"]) {
                        object.content.fileId = indexByFileType["file"].file.uid;
                        object.content.fileSize = indexByFileType["file"].file.size;
                        if (!object.content.fileName) {
                            object.content.fileName = indexByFileType["file"].file.fileName;
                        }
                    }
                    if (indexByFileType["thumb"]) {
                        object.content.thumbId = indexByFileType["thumb"].file.uid;
                        object.content.thumbSize = indexByFileType["thumb"].file.size;
                    }
                    if (indexByFileType["origin"]) {
                        object.content.originImageId = indexByFileType["origin"].file.uid;
                        object.content.originImageSize = indexByFileType["origin"].file.size;
                    }
                    let packet = new CinMsgSendPacket(object);
                    packet.setSendType(sendType);
                    self.baseSdk.ses.sendRequest(packet, (success: boolean, result: {
                        respons: string,
                        data: {
                            messageId: string,
                            from: number,
                            to: number,
                            msgSequence: number,
                            serverTime: number,
                            capacity: string,
                            tip: string
                        }
                    }, reason?: string) => {
                        if (result) {
                            result.data = applyProperties(result.data || {}, {content: object.content});
                        }
                        callback(success, result, reason);
                    });
                },
                function (err) {
                    console.log(err);
                    callback && callback(false, null, "上传图片失败");
                }
            ).finally(function () {
                indexByUid = null;
                indexByFileType = null;
                queue = null;
            });

            return params.options.messageId;
        });

        // 接口4--接收各种消息
        self.baseSdk.register("msgBind", function (params: { callback: any; }) {
            let callback = params.callback;
            self.listener = callback;
        });

        // 接口5--拉取历史消息
        self.baseSdk.register("receiveHisMsg", function (params: {
            options: {
                from: number,
                sessionId: number, // 会话id
                index: number,
                pageSize: number,
                msgType: string,
                msgListType: number
            },
            callback: (success: boolean, result: {
                from: number,
                messages: any[],
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            // let object: any = applyProperties(options, { type: 0, conversation: {
            let object: any = applyProperties(options, { conversation: {    
                sessionId: options.sessionId,
                index: options.index,
                pageSize: options.pageSize
            }});
            let packet = new CinMsgHistoryPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 接口6--消息撤回
        self.baseSdk.register("msgRevoke", function (params: {
            options: {
                from: number,
                friUserId: number, // 会话id
                msgType: number,
                version: number,
            },
            callback: (success: boolean, result: {
                from: number,
                friUserId: number,
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, { type: null });
            let packet = new CinMsgRevokePacket(object);
            console.log(packet)
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        //接口7--收藏消息
        self.baseSdk.register("msgCollect", function (params: {
            options: {
                from: number; // 发送方
                byte: number;
                to: number | number[],
                messageId?: string,
                message: any
            },
            callback: (success: boolean, result: {
                from: number;
                version: number;
                msgId: number;
                dateTime: number;
                msgnum: number;
                status: number;
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, { });
            let packet = new CinMsgCollectPacket(object);
            console.log(packet)
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 接口8--获取收藏消息的所有id
        self.baseSdk.register("msgCollectId", function (params: {
            options: {
                from: number
            },
            callback: (success: boolean, result: {
                from: number;
                bodyInfo: number;
                // msgcollectId: number;
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinMsgCollectIdPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

         // 接口9--获取收藏消息列表
         self.baseSdk.register("msgCollectList", function (params: {
            options: {
                from: number;
                converInfo: any;
            },
            callback: (success: boolean, result: {
                from: number;
                version: number;             
                bodyInfoIds: any;
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinMsgCOllectionListPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 接口10--删除消息收藏
        self.baseSdk.register("msgCollectionDelete", function (params: {
            options: {
                from: number,
                keyId: number
            },
            callback: (success: boolean, result: {
                from: number,
                version: number
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinMsgCollectionDeletePacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

         // 接口11--消息已读
         self.baseSdk.register("msgReadReply", function (params: {
            options: {
                from: number,
                friUserId: number, // 会话id
                userId: number,
            },
            callback: (success: boolean, result: {
                from: number,
                friUserId: number,
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, { type: null });
            let packet = new CinMsgReadReplyPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 接口12--拉取离线消息信息
        self.baseSdk.register("msgOffLine", function (params: {
            options: {
                from: number,
                msgListType: number
            },
            callback: (success: boolean, result: {
                from: number,
                conversation: any[],
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, { });
            let packet = new CinMsgOffLinePacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 接口13--清除离线消息
        self.baseSdk.register("msgReadReplyClear", function (params: {
            options: {
                from: number,
                friUserId: number, // 会话id
                userId: number,
                version: number | number[],
            },
            callback: (success: boolean, result: {
                from: number,
                friUserId: number,
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, { type: null });
            let packet = new CinMsgReadReplyClearPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });
        
        // 接口12--消息免打扰
        self.baseSdk.register("msgImmunity", function (params: {
            options: {
                from: number,
                type: number,
                dateTime: number,
                expire: number
            },
            callback: (success: boolean, result: {
                from: number
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinMsgImmunityPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 接口13--发送名片消息
        self.baseSdk.register("msgSendcard", function (params: {
            options: {
                from: number,
                to: number | number[],
                messageId?: string,
                mobileNo?: string,
                name?: string,
                content?: {
                    name?: string,
                    userId: string,
                    mobileNo?: string,
                    department?: string
                }
            },
            sendType: number,
            callback: (success: boolean, result: {
                respons: string,
                data: {
                    messageId: string,
                    from: number,
                    to: number,
                    msgSequence: number,
                    serverTime: number,
                    capacity: string,
                    tip: string
                }
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let sendType = params.sendType;
            let object: any = applyProperties(options, { type: 6 });
            let packet = new CinMsgSendPacket(object);
            packet.setSendType(sendType);
            self.baseSdk.ses.sendRequest(packet, callback);
            return packet.messageId;
        });

        // 接口14--获取最近会话列表
        self.baseSdk.register("getSessionMsg", function (params: {
            options: {
                from: number,
                to: number
            },
            callback: (success: boolean, result: {
                respons: string,
                data: {
                    from: number,
                    sessMsgInfo: any,
                }
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinSessionMsgPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 接口15--拉取好友离线通知
        self.baseSdk.register("msgSocialOffLineNtf", function (params: {
            options: {
                from: number,
                to: number
            },
            callback: (success: boolean, result: {
                from: number,
                to: number,
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, { });
            let packet = new CinMsgSocialOffLineNtfPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 接口16--发送视频消息
        self.transferSdk && self.baseSdk.register("sendVideoMsg", function (params: {
            options: {
                from: number,
                to: number | number[],
                messageId?: string,
                mobileNo?: string,
                name?: string,
                content?: {
                    fileName?: string
                }
            },
            sendType: number,
            blobs: {
                file: File,
                thumb?: File,
                origin?: File
            },
            onNotify: (
                handleName: FileNotifyHandleName,
                msgId: string,
                result?: number | string | any
            ) => void,
            callback: (success: boolean, result: {
                respons: string,
                data: {
                    messageId: string,
                    from: number,
                    to: number,
                    msgSequence: number,
                    serverTime: number,
                    capacity: string,
                    tip: string
                }
            }, reason?: string) => void
        }) {
            let blobs = params.blobs;
            let onNotify = params.onNotify;
            let callback = params.callback;
            if (!params.options.messageId) {
                params.options.messageId = generateUUID(32, 16);
            }

            // 准备数据:构建待上传文件队列和索引结构
            let indexByUid = {};
            let indexByFileType = {};
            let queue = [];
            if (blobs.thumb) {
                queue.push({
                    file: blobs.thumb,
                    type: "thumb"
                });
            }
            queue.push({
                file: blobs.file,
                type: "file"
            });
            if (blobs.origin) {
                queue.push({
                    file: blobs.origin,
                    type: "origin"
                });
            }

            // 一、先上传文件
            doQueueUpload(params.options.messageId, indexByUid, indexByFileType, queue, onNotify, self.msgFileUpload)
            // 二、再发文件消息
            .then(
                function (res) {
                    let options = params.options;
                    let sendType = params.sendType;
                    let object: any = applyProperties(options, { type: 3 });
                    if (!object.content) {
                        object.content = {};
                    }
                    if (indexByFileType["file"]) {
                        object.content.fileId = indexByFileType["file"].file.uid;
                        object.content.fileSize = indexByFileType["file"].file.size;
                        if (!object.content.fileName) {
                            object.content.fileName = indexByFileType["file"].file.name;
                        }
                    }
                    if (indexByFileType["thumb"]) {
                        object.content.thumbId = indexByFileType["thumb"].file.uid;
                        object.content.thumbSize = indexByFileType["thumb"].file.size;
                    }
                    if (indexByFileType["origin"]) {
                        object.content.originImageId = indexByFileType["origin"].file.uid;
                        object.content.originImageSize = indexByFileType["origin"].file.size;
                    }
                    let packet = new CinMsgSendPacket(object);
                    packet.setSendType(sendType);
                    self.baseSdk.ses.sendRequest(packet, (success: boolean, result: {
                        respons: string,
                        data: {
                            messageId: string,
                            from: number,
                            to: number,
                            msgSequence: number,
                            serverTime: number,
                            capacity: string,
                            tip: string
                        }
                    }, reason?: string) => {
                        if (result) {
                            result.data = applyProperties(result.data || {}, {content: object.content});
                        }
                        callback(success, result, reason);
                    });
                },
                function (err) {
                    console.log(err);
                    callback && callback(false, null, "上传视频失败");
                }
            ).finally(function () {
                indexByUid = null;
                indexByFileType = null;
                queue = null;
            });

            return params.options.messageId;
        });

        // 接口17--发送语音消息
        self.transferSdk && self.baseSdk.register("sendAudioMsg", function (params: {
            options: {
                from: number,
                to: number | number[],
                messageId?: string,
                mobileNo?: string,
                name?: string,
                content?: {
                    type?: number,
                    bitrate?: number,
                    totalTime?: number
                }
            },
            sendType: number,
            blobs: {
                file: File
            },
            onNotify: (
                handleName: FileNotifyHandleName,
                msgId: string,
                result?: number | string | any
            ) => void,
            callback: (success: boolean, result: {
                respons: string,
                data: {
                    messageId: string,
                    from: number,
                    to: number,
                    msgSequence: number,
                    serverTime: number,
                    capacity: string,
                    tip: string
                }
            }, reason?: string) => void
        }) {
            let blobs = params.blobs;
            let onNotify = params.onNotify;
            let callback = params.callback;
            if (!params.options.messageId) {
                params.options.messageId = generateUUID(32, 16);
            }

            // 准备数据:构建待上传文件队列和索引结构
            let indexByUid = {};
            let indexByFileType = {};
            let queue = [];
            queue.push({
                file: blobs.file,
                type: "file"
            });

            // 一、先上传文件
            doQueueUpload(params.options.messageId, indexByUid, indexByFileType, queue, onNotify, self.msgFileUpload)
            // 二、再发文件消息
            .then(
                function (res) {
                    let options = params.options;
                    let sendType = params.sendType;
                    let object: any = applyProperties(options, { type: 1 });
                    if (!object.content) {
                        object.content = {};
                    }
                    if (indexByFileType["file"]) {
                        object.content.fileId = indexByFileType["file"].file.uid;
                        object.content.fileSize = indexByFileType["file"].file.size;
                        if (!object.content.fileName) {
                            object.content.fileName = indexByFileType["file"].file.name;
                        }
                    }
                    if (indexByFileType["thumb"]) {
                        object.content.thumbId = indexByFileType["thumb"].file.uid;
                        object.content.thumbSize = indexByFileType["thumb"].file.size;
                    }
                    if (indexByFileType["origin"]) {
                        object.content.originImageId = indexByFileType["origin"].file.uid;
                        object.content.originImageSize = indexByFileType["origin"].file.size;
                    }
                    let packet = new CinMsgSendPacket(object);
                    packet.setSendType(sendType);
                    self.baseSdk.ses.sendRequest(packet, (success: boolean, result: {
                        respons: string,
                        data: {
                            messageId: string,
                            from: number,
                            to: number,
                            msgSequence: number,
                            serverTime: number,
                            capacity: string,
                            tip: string
                        }
                    }, reason?: string) => {
                        if (result) {
                            result.data = applyProperties(result.data || {}, {content: object.content});
                        }
                        callback(success, result, reason);
                    });
                },
                function (err) {
                    console.log(err);
                    callback && callback(false, null, "上传语音失败");
                }
            ).finally(function () {
                indexByUid = null;
                indexByFileType = null;
                queue = null;
            });

            return params.options.messageId;
        });

        // 接口18--发送位置消息        
        self.baseSdk.register("sendLocationMsg", function (params: {
            options: {
                from: number,
                to: number | number[],
                messageId?: string,
                mobileNo?: string,
                name?: string,
                content?: {
                    latitude?: number,
                    longitude: number,
                    descFileId?: string  
                }
            },
            sendType: number,
            blobs: {
                thumb?: File
            },
            onNotify: (
                handleName: FileNotifyHandleName,
                msgId: string,
                result?: number | string | any
            ) => void,
            callback: (success: boolean, result: {
                respons: string,
                data: {
                    messageId: string,
                    from: number,
                    to: number,
                    msgSequence: number,
                    serverTime: number,
                    capacity: string,
                    tip: string
                }
            }, reason?: string) => void
        }) {
            let blobs = params.blobs;
            let onNotify = params.onNotify;
            let callback = params.callback;
            if (!params.options.messageId) {
                params.options.messageId = generateUUID(32, 16);
            }

            // 准备数据:构建待上传文件队列和索引结构
            let indexByUid = {};
            let indexByFileType = {};
            let queue = [];
            if (blobs.thumb) {
                queue.push({
                    file: blobs.thumb,
                    type: "thumb"
                });
            }
            // 一、先上传文件
            doQueueUpload(params.options.messageId, indexByUid, indexByFileType, queue, onNotify, self.msgFileUpload)
            // 二、再发文件消息
            .then(
                function (res) {
                    let options = params.options;
                    let sendType = params.sendType;
                    let object: any = applyProperties(options, { type: 7 });
                    if (!object.content) {
                        object.content = {};
                    }
                    if (indexByFileType["file"]) {
                        object.content.fileId = indexByFileType["file"].file.uid;
                        object.content.fileSize = indexByFileType["file"].file.size;
                        if (!object.content.fileName) {
                            object.content.fileName = indexByFileType["file"].file.name;
                        }
                    }
                    if (indexByFileType["thumb"]) {
                        object.content.thumbId = indexByFileType["thumb"].file.uid;
                        object.content.thumbSize = indexByFileType["thumb"].file.size;
                    }
                    if (indexByFileType["origin"]) {
                        object.content.originImageId = indexByFileType["origin"].file.uid;
                        object.content.originImageSize = indexByFileType["origin"].file.size;
                    }
                    let packet = new CinMsgSendPacket(object);
                    packet.setSendType(sendType);
                    self.baseSdk.ses.sendRequest(packet, (success: boolean, result: {
                        respons: string,
                        data: {
                            messageId: string,
                            from: number,
                            to: number,
                            msgSequence: number,
                            serverTime: number,
                            capacity: string,
                            tip: string
                        }
                    }, reason?: string) => {
                        if (result) {
                            result.data = applyProperties(result.data || {}, {content: object.content});
                        }
                        callback(success, result, reason);
                    });
                },
                function (err) {
                    console.log(err);
                    callback && callback(false, null, "上传图片失败");
                }
            ).finally(function () {
                indexByUid = null;
                indexByFileType = null;
                queue = null;
            });

            return params.options.messageId;
        });
        
        // 内部1--绑定监听
        self.baseSdk.addBinder({
            moduleId: MODULE_ID,
            binder: function (session: any, moduleType: string, serverPublish: any) {
                console.log("收到消息", serverPublish);
                if (moduleType !== MODULE_ID) {
                    return;
                }
                if(serverPublish.event == 0 && serverPublish.name) { // 收群普通消息
                    serverPublish.event = 'receiveOrgMsg'
                }else if(serverPublish.event == 0 && serverPublish.type == 55) { // 收群@消息
                    serverPublish.event = 'receiveOrgAtMsg'
                }else if(serverPublish.event == 1) { // 收消息
                    serverPublish.event = 'receiveMsg'
                }else if(serverPublish.event == 106) { // 消息撤回
                    serverPublish.event = 'msgRevoke'
                }else if(serverPublish.event == 0) { // 消息已读
                    serverPublish.event = 'msgReadReply'
                }
                self.listener && self.listener(session, moduleType, serverPublish);
            }
        });
    }
};

declare global {

    interface File {
        relativePath: string;
        webkitRelativePath: string;
        fileName: string;
        uid: string;
    }
}

export {
    TeatalkMsgSdk
};