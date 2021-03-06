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
            console.error("???????????????sdk");
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
                                is_temp: "false"
                            };
                        },
                        target: function (uploadFile, uploadFileChunk) {
                            console.log('-----------uploadFile', uploadFile);
                            const type = uploadFile.rawFile.type ? uploadFile.rawFile.type.split("/")[0] : '';
                            const query = {
                                file_id: uploadFile.uniqueIdentifier + '_' + type.toUpperCase(),
                                file_size: uploadFile.rawFile.fileSize
                            };
                            // const baseUrl = self.transferSdk.sdkParams.uploadBaseUrl || "//124.42.103.164:8083";
                            // ??????????????????????????????????????????????????????????????????????????????
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

        // ??????1--??????????????????
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
            console.log(sendType, 'sendType')
            let object: any = applyProperties(options, {});
            let packet = new CinMsgSendPacket(object);
            packet.setSendType(sendType);
            self.baseSdk.ses.sendRequest(packet, callback);
            return packet.messageId;
        });

        // ???????????????????????????
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

        // ?????????????????????????????????
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

        // ?????????????????????
        let doQueueUpload = function (messageId, indexByUid, indexByFileType, queue, onNotify, uploadInstance) {
            return new Promise(async function (resolve, reject) {
                // 1 ????????????UID?????????????????????????????????
                const treatFilePrepareResults: any = await doMultiTasks(queue, function (prepareFileInfo) {
                    const type = prepareFileInfo.file.type ? prepareFileInfo.file.type.split("/")[0] : '';
                    const fileType = prepareFileInfo.file.name ? prepareFileInfo.file.name.substr(prepareFileInfo.file.name.lastIndexOf('.')) : '';
                    const subTreatTask = [];
                    // ????????????UID
                    subTreatTask.push(MediaUtil.getUid(prepareFileInfo.file).then(function (uid: string) {
                        prepareFileInfo.file.uid = uid;
                        indexByUid[uid] = prepareFileInfo;
                        indexByFileType[prepareFileInfo.type] = prepareFileInfo;
                        // ??????????????????????????????
                        return MediaUtil.fileExist(self.baseSdk.app.dtcurl || self.transferSdk.sdkParams.uploadBaseUrl,
                            { fileId: uid, fileSize: prepareFileInfo.file.size, fileType: type },
                            self.baseSdk.app.transferToken);
                    }));
                    return subTreatTask;
                });

                // 2 ????????????????????????
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
                        case 200: { // ?????????
                            prepareFileInfo.uploadFile = null;
                            prepareFileInfo.existedSize = prepareFileInfo.file.size;
                            break;
                        }
                        case 202: { // ????????????
                            const range = JSON.parse(existResult.data).range;
                            const currByteOffset = range.split("-")[1];
                            const newFileBlob = MediaUtil.createSlicedFileBlock(prepareFileInfo.file, currByteOffset, null);
                            prepareFileInfo.uploadFile = self.msgFileUpload.addFile(newFileBlob);
                            prepareFileInfo.existedSize = currByteOffset;
                            break;
                        }
                        case 201: { // ?????????
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

                // 3 ????????????
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

        // ??????2--??????????????????
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

            // ????????????:??????????????????????????????????????????
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

            // ?????????????????????
            doQueueUpload(params.options.messageId, indexByUid, indexByFileType, queue, onNotify, self.msgFileUpload)
                // ????????????????????????
                .then(
                    function (res) {
                        let options = params.options;
                        let sendType = params.sendType;
                        let object: any = applyProperties(options, { type: 2 });
                        if (!object.content) {
                            object.content = {};
                        }
                        if (indexByFileType["file"]) {
                            let type = indexByFileType["file"].file.type.split("/")[0];
                            object.content.fileId = indexByFileType["file"].file.uid + '_' + type.toUpperCase();
                            object.content.fileSize = indexByFileType["file"].file.size;
                            object.content.fileName = indexByFileType["file"].file.name;
                        }
                        if (indexByFileType["thumb"]) {
                            let type = indexByFileType["thumb"].file.type.split("/")[0];
                            object.content.thumbId = indexByFileType["thumb"].file.uid + '_' + type.toUpperCase();
                            object.content.thumbSize = indexByFileType["thumb"].file.size;
                        }
                        if (indexByFileType["origin"]) {
                            let type = indexByFileType["origin"].file.type.split("/")[0];
                            object.content.originImageId = indexByFileType["origin"].file.uid + '_' + type.toUpperCase();
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
                                result.data = applyProperties(result.data || {}, { content: object.content });
                            }
                            callback(success, result, reason);
                        });
                    },
                    function (err) {
                        console.log(err);
                        callback && callback(false, null, "??????????????????");
                    }
                ).finally(function () {
                    indexByUid = null;
                    indexByFileType = null;
                    queue = null;
                });

            return params.options.messageId;
        });

        // ??????3--??????????????????
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

            // ????????????:??????????????????????????????????????????
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

            // ?????????????????????
            doQueueUpload(params.options.messageId, indexByUid, indexByFileType, queue, onNotify, self.msgFileUpload)
                // ????????????????????????
                .then(
                    function (res) {
                        let options = params.options;
                        let sendType = params.sendType;
                        let object: any = applyProperties(options, { type: 0 });
                        if (!object.content) {
                            object.content = {};
                        }
                        if (indexByFileType["file"]) {
                            let type = indexByFileType["file"].file.type.split("/")[0];
                            object.content.fileId = indexByFileType["file"].file.uid + '_' + type.toUpperCase();
                            object.content.fileSize = indexByFileType["file"].file.size;
                            object.content.fileName = indexByFileType["file"].file.name;
                        }
                        if (indexByFileType["thumb"]) {
                            let type = indexByFileType["thumb"].file.type.split("/")[0];
                            object.content.thumbId = indexByFileType["thumb"].file.uid + '_' + type.toUpperCase();
                            object.content.thumbSize = indexByFileType["thumb"].file.size;
                        }
                        if (indexByFileType["origin"]) {
                            let type = indexByFileType["origin"].file.type.split("/")[0];
                            object.content.originImageId = indexByFileType["origin"].file.uid + '_' + type.toUpperCase();
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
                                result.data = applyProperties(result.data || {}, { content: object.content });
                            }
                            callback(success, result, reason);
                        });
                    },
                    function (err) {
                        console.log(err);
                        callback && callback(false, null, "??????????????????");
                    }
                ).finally(function () {
                    indexByUid = null;
                    indexByFileType = null;
                    queue = null;
                });

            return params.options.messageId;
        });

        // ??????4--??????????????????
        self.baseSdk.register("msgBind", function (params: { callback: any; }) {
            let callback = params.callback;
            self.listener = callback;
        });

        // ??????5--??????????????????
        self.baseSdk.register("receiveHisMsg", function (params: {
            options: {
                from: number,
                sessionId: number, // ??????id
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
            let object: any = applyProperties(options, {
                conversation: {
                    sessionId: options.sessionId,
                    index: options.index,
                    pageSize: options.pageSize
                }
            });
            let packet = new CinMsgHistoryPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // ??????6--????????????
        self.baseSdk.register("msgRevoke", function (params: {
            options: {
                from: number,
                friUserId: number, // ??????id
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

        //??????7--????????????
        self.baseSdk.register("msgCollect", function (params: {
            options: {
                from: number; // ?????????
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
            let object: any = applyProperties(options, {});
            let packet = new CinMsgCollectPacket(object);
            console.log(packet)
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // ??????8--???????????????????????????id
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

        // ??????9--????????????????????????
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

        // ??????10--??????????????????
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

        // ??????11--????????????
        self.baseSdk.register("msgReadReply", function (params: {
            options: {
                from: number,
                friUserId: number, // ??????id
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

        // ??????12--????????????????????????
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
            let object: any = applyProperties(options, {});
            let packet = new CinMsgOffLinePacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // ??????13--??????????????????
        self.baseSdk.register("msgReadReplyClear", function (params: {
            options: {
                from: number,
                friUserId: number, // ??????id
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

        // ??????12--???????????????
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

        // ??????13--??????????????????
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

        // ??????14--????????????????????????
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

        // ??????15--????????????????????????
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
            let object: any = applyProperties(options, {});
            let packet = new CinMsgSocialOffLineNtfPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // ??????16--??????????????????
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

            // ????????????:??????????????????????????????????????????
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

            // ?????????????????????
            doQueueUpload(params.options.messageId, indexByUid, indexByFileType, queue, onNotify, self.msgFileUpload)
                // ????????????????????????
                .then(
                    function (res) {
                        let options = params.options;
                        let sendType = params.sendType;
                        let object: any = applyProperties(options, { type: 3 });
                        if (!object.content) {
                            object.content = {};
                        }
                        if (indexByFileType["file"]) {
                            let type = indexByFileType["file"].file.type.split("/")[0];
                            object.content.fileId = indexByFileType["file"].file.uid + '_' + type.toUpperCase();
                            object.content.fileSize = indexByFileType["file"].file.size;
                            object.content.fileName = indexByFileType["file"].file.name;
                        }
                        if (indexByFileType["thumb"]) {
                            let type = indexByFileType["thumb"].file.type.split("/")[0];
                            object.content.thumbId = indexByFileType["thumb"].file.uid + '_' + type.toUpperCase();
                            object.content.thumbSize = indexByFileType["thumb"].file.size;
                        }
                        if (indexByFileType["origin"]) {
                            let type = indexByFileType["origin"].file.type.split("/")[0];
                            object.content.originImageId = indexByFileType["origin"].file.uid + '_' + type.toUpperCase();
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
                                result.data = applyProperties(result.data || {}, { content: object.content });
                            }
                            callback(success, result, reason);
                        });
                    },
                    function (err) {
                        console.log(err);
                        callback && callback(false, null, "??????????????????");
                    }
                ).finally(function () {
                    indexByUid = null;
                    indexByFileType = null;
                    queue = null;
                });

            return params.options.messageId;
        });

        // ??????17--??????????????????
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

            // ????????????:??????????????????????????????????????????
            let indexByUid = {};
            let indexByFileType = {};
            let queue = [];
            queue.push({
                file: blobs.file,
                type: "file"
            });

            // ?????????????????????
            doQueueUpload(params.options.messageId, indexByUid, indexByFileType, queue, onNotify, self.msgFileUpload)
                // ????????????????????????
                .then(
                    function (res) {
                        let options = params.options;
                        let sendType = params.sendType;
                        let object: any = applyProperties(options, { type: 1 });
                        if (!object.content) {
                            object.content = {};
                        }
                        if (indexByFileType["file"]) {
                            let type = indexByFileType["file"].file.type.split("/")[0];
                            object.content.fileId = indexByFileType["file"].file.uid + '_' + type.toUpperCase();
                            object.content.fileSize = indexByFileType["file"].file.size;
                            object.content.fileName = indexByFileType["file"].file.name;
                        }
                        if (indexByFileType["thumb"]) {
                            let type = indexByFileType["thumb"].file.type.split("/")[0];
                            object.content.thumbId = indexByFileType["thumb"].file.uid + '_' + type.toUpperCase();
                            object.content.thumbSize = indexByFileType["thumb"].file.size;
                        }
                        if (indexByFileType["origin"]) {
                            let type = indexByFileType["origin"].file.type.split("/")[0];
                            object.content.originImageId = indexByFileType["origin"].file.uid + '_' + type.toUpperCase();
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
                                result.data = applyProperties(result.data || {}, { content: object.content });
                            }
                            callback(success, result, reason);
                        });
                    },
                    function (err) {
                        console.log(err);
                        callback && callback(false, null, "??????????????????");
                    }
                ).finally(function () {
                    indexByUid = null;
                    indexByFileType = null;
                    queue = null;
                });

            return params.options.messageId;
        });

        // ??????18--??????????????????        
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

            // ????????????:??????????????????????????????????????????
            let indexByUid = {};
            let indexByFileType = {};
            let queue = [];
            if (blobs.thumb) {
                queue.push({
                    file: blobs.thumb,
                    type: "thumb"
                });
            }
            // ?????????????????????
            doQueueUpload(params.options.messageId, indexByUid, indexByFileType, queue, onNotify, self.msgFileUpload)
                // ????????????????????????
                .then(
                    function (res) {
                        let options = params.options;
                        let sendType = params.sendType;
                        let object: any = applyProperties(options, { type: 7 });
                        if (!object.content) {
                            object.content = {};
                        }
                        if (indexByFileType["file"]) {
                            let type = indexByFileType["file"].file.type.split("/")[0];
                            object.content.fileId = indexByFileType["file"].file.uid + '_' + type.toUpperCase();
                            object.content.fileSize = indexByFileType["file"].file.size;
                            object.content.fileName = indexByFileType["file"].file.name;
                        }
                        if (indexByFileType["thumb"]) {
                            let type = indexByFileType["thumb"].file.type.split("/")[0];
                            object.content.thumbId = indexByFileType["thumb"].file.uid + '_' + type.toUpperCase();
                            object.content.thumbSize = indexByFileType["thumb"].file.size;
                        }
                        if (indexByFileType["origin"]) {
                            let type = indexByFileType["origin"].file.type.split("/")[0];
                            object.content.originImageId = indexByFileType["origin"].file.uid + '_' + type.toUpperCase();
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
                                result.data = applyProperties(result.data || {}, { content: object.content });
                            }
                            callback(success, result, reason);
                        });
                    },
                    function (err) {
                        console.log(err);
                        callback && callback(false, null, "??????????????????");
                    }
                ).finally(function () {
                    indexByUid = null;
                    indexByFileType = null;
                    queue = null;
                });

            return params.options.messageId;
        });

        // ??????1--????????????
        self.baseSdk.addBinder({
            moduleId: MODULE_ID,
            binder: function (session: any, moduleType: string, serverPublish: any) {
                console.log("????????????", serverPublish);
                if (moduleType !== MODULE_ID) {
                    return;
                }
                if (serverPublish.event == 0 && serverPublish.name) { // ??????????????????
                    serverPublish.event = 'receiveOrgMsg'
                } else if (serverPublish.event == 0 && serverPublish.type == 55) { // ??????@??????
                    serverPublish.event = 'receiveOrgAtMsg'
                } else if (serverPublish.event == 1) { // ?????????
                    serverPublish.event = 'receiveMsg'
                } else if (serverPublish.event == 106) { // ????????????
                    serverPublish.event = 'msgRevoke'
                } else if (serverPublish.event == 0) { // ????????????
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