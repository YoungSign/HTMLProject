import { applyProperties } from "./../../base-sdk/src/util/utils";
import { CinRtcPacket } from "./rtc-packets/RtcTransaction";
import { templates as rtcTemplates } from "./rtc-packets/rtc-templates";
import { TemplateManager } from "../../base-sdk/src/TemplateManager";
// import xmRtcSdk = require("./lib/srtc-channel-v1.5.1-20200428171751");
// import xmRtcSdk = require("./lib/srtc-web-v1.6.0");
import xmRtcSdk = require("./lib/srtc-web-v1.6.0-20200624154406");
import { CONNACK_RETURN_CODE } from "../../base-sdk/src/Constant";
import sha1 = require("crypto-js/sha1");

const cryptojsSHA1 = sha1;
const xmRtcBase = xmRtcSdk.WebSDK;
const xmRtcChannel = xmRtcSdk.Channel;

const MODULE_ID = "RTC";
TemplateManager.loadTemplates(MODULE_ID, rtcTemplates);

enum MessageType {
    INVITE_NOTIFY = 0,
    RING_NOTIFY = 1,
    REJECT_NOTIFY = 2,
    ACCEPT_NOTIFY = 3,
    MEDIATYPE_CHANGE_NOTIFY = 4,
    USER_CHANGE_NOTIFY = 5,
    LOCAL_STREAM_NOTIFY = 6,
    STREAM_CHANGE_NOTIFY = 7,
    HUNGUP_NOTIFY = 8,
    DISCONNECT_NOTIFY = 9,
    NO_RESPONSE_NOTIFY = 10,
    ERROR_NOTIFY = 99
}

enum SignalingOperateType {
    INVITE = 1,
    ACCEPT = 2,
    HUNGUP_REJECT = 3,
    MEDIATYPE_CHANGE = 4,
    USER_CHANGE = 5,
    RINGING = 6
}

enum DisconnectedReason {
    CANCEL = "1", // 己方取消已发出的通话请求（挂断）
    REJECT = "2", // 己方拒绝收到的通话请求（拒绝）
    HANGUP = "3", // 己方挂断（挂断）
    BUSY_LINE = "4", // 己方忙碌（拒绝）
    NO_RESPONSE = "5", // 己方未接听（挂断）
    ENGINE_UNSUPPORTED = "6", // 当前引擎不支持（拒绝）
    NETWORK_ERROR = "7", // *己方网络出错（sdk error时发出算挂断）
    INIT_VIDEO_ERROR = "8", // *己方摄像头初始化错误，可能是没有打开使用摄像头权限（挂断）
    // REMOTE_CANCEL = '11', // 对方取消已发出的通话请求
    // REMOTE_REJECT = '12', // 对方拒绝收到的通话请求
    // REMOTE_HANGUP = '13', // 通话过程对方挂断
    // REMOTE_BUSY_LINE = '14', // 对方忙碌
    // REMOTE_NO_RESPONSE = '15', // 对方未接听
    // REMOTE_ENGINE_UNSUPPORTED = '16', // 对方引擎不支持
    // REMOTE_NETWORK_ERROR = '17', // 对方网络错误
    KICKED_OFF = "18", // 被踢出
    ACCEPT_ON_OTHER_TERM = "19", // 其他端已经接听
    REJECT_ON_OTHER_TERM = "20", // 其他端已经拒绝
}

enum RoomStatus {
    init = 0,
    aborted = -1
}

enum UserAgentStatus {
    invited = 0,
    responsed = 1,
    accepted = 2,
    rejected = 3,
    joined = 4,
    left = 5
}

enum UserAgentRole {
    creator = 1,
    attendant = 2,
    // spectator = 3
}

class UserAgent {
    id: number;
    role: UserAgentRole;
    status: UserAgentStatus;

    constructor (id: number, role: number, status: number) {
        this.id = id;
        this.role = role;
        this.status = status;
    }

    public setStatus(status): UserAgent {
        this.status = status;
        return this;
    }
}

class Room {
    id: string;
    status: RoomStatus;
    users: UserAgent[];
    createTime: number;
    beginTime: number; // 己方join成功时间
    endTime: number; // 己方leave时间
    mediaType: number;
    sessionType: number;
    sessionId: number;
    _inviteExpireCheckTimers: any = {}; // key:userId, value: timerHandler

    constructor (object: any) {
        this.id = object.id;
        this.status = RoomStatus.init;
        this.users = object.users;
        this.createTime = Date.now();
        this.mediaType = object.mediaType;
        this.sessionType = object.sessionType;
        this.sessionId = object.sessionId;
    }

    public setBeginTime(): Room {
        this.beginTime = Date.now();
        return this;
    }

    public clearTimer(id): Room {
        let timer = this._inviteExpireCheckTimers[id];
        clearTimeout(timer);
        delete this._inviteExpireCheckTimers[id];
        return this;
    }

    public abort(): Room {
        this.status = RoomStatus.aborted;
        this.endTime = Date.now();
        for (let key in this._inviteExpireCheckTimers) {
            this.clearTimer(key);
        }
        console.log("房间:" + this.id + "已终止");
        return this;
    }

    public setCreator(id): Room {
        this.addUser(new UserAgent(id, UserAgentRole.creator, UserAgentStatus.accepted));
        return this;
    }

    public inviteAttendant(id): Room {
        this.addUser(new UserAgent(id, UserAgentRole.attendant, UserAgentStatus.invited));
        return this;
    }

    public findUser(id) {
        for (let i = 0; i < this.users.length; i++) {
            let user = this.users[i];
            if (user.id === id) {
                return user;
            }
        }
        return null;
    }

    addUser(user: UserAgent): Room {
        this.users.push(user);
        return this;
    }

    removeUser(id: number): Room {
        for (let i = 0; i < this.users.length; i++) {
            let user = this.users[i];
            if (user.id === id) {
                this.users.splice(i, 1);
                return this;
            }
        }
        return this;
    }

    clearUsers(): Room {
        this.users = [];
        return this;
    }
}

declare global {
    interface Window {
        roomList: any;
    }
}

let TeatalkRtcSdk: any = {
    sdkParams: {
        appKey: "JRT",
        appSecret: "d23a0f7b04c05f78e26125c6b9648e37",
        xmRtcUrl: "srtcp.fetiononline.com:443",
        inviteExpire: 30000
    },
    baseSdk: null,
    listener: [],
    roomList: [],
    _xmRtcInit: false,
    init: function (sdkParams: { baseSdk: any }) {
        let self = this;
        self.sdkParams = applyProperties(self.sdkParams, sdkParams);
        self.baseSdk = sdkParams.baseSdk;
        if (!self.baseSdk) {
            console.error("未找到基础sdk");
            return;
        }
        window.roomList = self.roomList;

        // // 接口1--setting
        // self.baseSdk.register("configRtcSetting", function(params: {
        //     options: {
        //         inviteExpire: number
        //     }
        // }) {
        //     self.defaultSetting = applyProperties(self.defaultSetting, params.options);
        // });

        // 接口2--获取RTC房间列表
        self.baseSdk.register("getRtcRoomList", function() {
            return self.roomList;
        });

        // 接口3--获取RTC房间信息
        self.baseSdk.register("getRtcRoomInfo", function(params: {
            options: {
                roomId: string
            }
        }) {
            return self.getRoom(params.options.roomId);
        });

        // 接口4--发送RTC邀请
        self.baseSdk.register("sendRtcInvite", function(params: {
            options: {
                from: number,
                to: number | number[],
                mediaType: number,
                channelID: string,
                sessionType: number,
                sessionId?: number
            },
            callback: (success: boolean, result: {
                response?: string
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            options.to = Array.isArray(options.to) ? options.to : [options.to];
            let object: any = {
                from: options.from,
                to: options.to,
                content: {
                    operateCode: SignalingOperateType.INVITE,
                    mediaType: options.mediaType,
                    channelID: options.channelID,
                    invitee: options.to,
                    sessionType: options.sessionType,
                    sessionId: options.sessionId
                }
            };
            if (self.getRoom(options.channelID)) {
                callback && callback(false, {}, "房间已存在，请使用加人接口邀请");
                return;
            }
            // 1、添加状态
            let newRoom = new Room({
                id: options.channelID,
                users: [],
                mediaType: options.mediaType,
                sessionType: options.sessionType,
                sessionId: options.sessionId
            });
            newRoom.setCreator(options.from);
            for (let key in options.to) {
                let id = options.to[key];
                newRoom.inviteAttendant(id);
                // 设定超时检查
                self.setInviteCheckTimer(id, newRoom);
            }
            self.roomList.push(newRoom);
            // 2、发cmp
            let packet = new CinRtcPacket(object);
            self.baseSdk.ses.sendRequest(packet, function (success: boolean, result: {
                response: string
            }, reason?: string) {
                // 异常状态
                if (!success || result.response !== CONNACK_RETURN_CODE.CONNECTION_ACCEPTED) {
                    newRoom.abort();
                }
                // 回调
                callback && callback(success, result, reason);
            });
        });

        // 接口5--发送RTC响铃
        self.baseSdk.register("sendRtcInviteRinging", function(params: {
            options: {
                from: number,
                to: number | number[],
                channelID: string,
                sessionType: number,
                sessionId?: number
            },
            callback: (success: boolean, result: {
                response?: string
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let room = self.getRoom(options.channelID);
            if (!room) {
                callback && callback(false, {}, "未找到房间");
                return;
            }
            let me: UserAgent = room.findUser(options.from);
            if (!me) {
                callback && callback(false, {}, "未找到自己");
                return;
            }
            options.to = Array.isArray(options.to) ? options.to : [options.to];
            let object: any = {
                from: options.from,
                to: options.to,
                content: {
                    operateCode: SignalingOperateType.RINGING,
                    channelID: options.channelID,
                    sessionType: options.sessionType,
                    sessionId: options.sessionId
                }
            };
            // 1、修改状态
            me.setStatus(UserAgentStatus.responsed);
            // 2、发cmp
            let packet = new CinRtcPacket(object);
            self.baseSdk.ses.sendRequest(packet, function (success: boolean, result: {
                response: string
            }, reason?: string) {
                // 异常状态
                if (!success || result.response !== CONNACK_RETURN_CODE.CONNECTION_ACCEPTED) {
                    me.setStatus(UserAgentStatus.invited);
                }
                // 回调
                callback && callback(success, result, reason);
            });
        });

        // 接口6--发送RTC接收邀请
        self.baseSdk.register("sendRtcInviteAccept", function(params: {
            options: {
                from: number,
                to: number | number[],
                mediaType: number,
                channelID: string,
                sessionType: number,
                sessionId?: number
            },
            callback: (success: boolean, result: {
                response?: string
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let room = self.getRoom(options.channelID);
            if (!room) {
                callback && callback(false, {}, "未找到房间");
                return;
            }
            let me: UserAgent = room.findUser(options.from);
            if (!me) {
                callback && callback(false, {}, "未找到自己");
                return;
            }
            options.to = Array.isArray(options.to) ? options.to : [options.to];
            let object: any = {
                from: options.from,
                to: options.to,
                content: {
                    operateCode: SignalingOperateType.ACCEPT,
                    mediaType: options.mediaType,
                    channelID: options.channelID,
                    sessionType: options.sessionType,
                    sessionId: options.sessionId
                }
            };
            // 1、修改状态
            me.setStatus(UserAgentStatus.accepted);
            room.clearTimer(me.id);
            // 2、发cmp
            let packet = new CinRtcPacket(object);
            self.baseSdk.ses.sendRequest(packet, function (success: boolean, result: {
                response: string
            }, reason?: string) {
                // 异常状态
                if (!success || result.response !== CONNACK_RETURN_CODE.CONNECTION_ACCEPTED) {
                    me.setStatus(UserAgentStatus.responsed);
                }
                // 回调
                callback && callback(success, result, reason);
            });
        });

        // 接口7--发送RTC加入房间
        self.baseSdk.register("joinRtcChannel", function(params: {
            options: {
                from: number,
                channelName: string,
                channelID: string,
                role: number,
                mediaType: number
            },
            callback: (success: boolean, result: {
                response?: string
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let room = self.getRoom(options.channelID);
            if (!room) {
                callback && callback(false, {}, "未找到房间");
                return;
            }
            let me: UserAgent = room.findUser(options.from);
            if (!me) {
                callback && callback(false, {}, "未找到自己");
                return;
            }
            if (me.role !== options.role) {
                callback && callback(false, {}, "角色不能更改");
                return;
            }
            // 1、检查sdk init status,调sdk do init
            self._initXmRtcSdk(self.baseSdk.app.loginUserId, function(res) {
                if (!res) {
                    callback && callback(false, {}, "xmSdk初始化失败");
                    return;
                }
                // 2、调sdk do join
                xmRtcChannel.join({
                    channelKey: options.channelID,
                    role: options.role,
                    channelName: options.channelName,
                    profile: options.mediaType,
                    onSuccess: (res) => {
                        // 记录开始通信时间
                        room.setBeginTime();
                        me.setStatus(UserAgentStatus.joined);
                        // 3、registry on
                        self.doRoomBind({room, xmRtcChannel});
                        callback && callback(true, {response: CONNACK_RETURN_CODE.CONNECTION_ACCEPTED});
                    },
                    onFailure: (errMsg) => {
                        callback && callback(false, {}, errMsg);
                    }
                });
            });
        });

        // 接口8--播放RTC本地流并推流
        self.baseSdk.register("playRtcMedia", function(params: {
            options: {
                from: number,
                channelID: string,
                elementId?: string
            },
            callback: (success: boolean, result: {
                response?: string
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            // 1、调sdk
            let playParams = {
                uccId: options.from,
                onSuccess: (res) => {
                    callback && callback(true, {}, res);
                },
                onFailure: (errMsg) => {
                    callback && callback(false, {}, errMsg);
                }
            };
            if (options.elementId) {
                playParams["elementId"] = options.elementId;
            }
            xmRtcChannel.playMedia(playParams);
        });

        // 接口8--变更RTC流类型
        self.baseSdk.register("changeRtcMedia", function(params: {
            options: {
                from: number,
                to: number | number[],
                mediaType: number,
                channelID: string,
                sessionType: number,
                sessionId?: number
            },
            callback: (success: boolean, result: {
                response?: string
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let room = self.getRoom(options.channelID);
            if (!room) {
                callback && callback(false, {}, "未找到房间");
                return;
            }
            let me: UserAgent = room.findUser(options.from);
            if (!me) {
                callback && callback(false, {}, "未找到自己");
                return;
            }
            if (options.mediaType === room.mediaType) {
                callback && callback(false, {}, "无效的流类型变更");
                return;
            }
            options.to = Array.isArray(options.to) ? options.to : [options.to];
            let object: any = {
                from: options.from,
                to: options.to,
                content: {
                    operateCode: SignalingOperateType.MEDIATYPE_CHANGE,
                    mediaType: options.mediaType,
                    channelID: options.channelID,
                    sessionType: options.sessionType,
                    sessionId: options.sessionId
                }
            };
            if (options.mediaType === 1) { // 降成音频
                // 1、发cmp
                let packet = new CinRtcPacket(object);
                self.baseSdk.ses.sendRequest(packet, function (success: boolean, result: {
                    response: string
                }, reason?: string) {
                    // 2、调sdk
                    if (success && result.response === CONNACK_RETURN_CODE.CONNECTION_ACCEPTED) {
                        room.mediaType = 1;
                        xmRtcChannel.closeWebcam();
                    }
                    // 回调
                    callback && callback(success, result, reason);
                });
            } else {
                callback && callback(false, {}, "暂时不支持升级");
            }
        });

        // 接口9--开关摄像头
        self.baseSdk.register("oepnOrCloseRtcCamera", function(params: {
            options: {
                isOpen: boolean
            },
            callback: (success: boolean, result: {
                response?: string
            }, reason?: string) => void
        }) {
            if (params.options.isOpen) {
                xmRtcChannel.openWebcam();
            } else {
                xmRtcChannel.closeWebcam();
            }
        });

        // 接口10--开关静音
        self.baseSdk.register("oepnOrCloseRtcVoice", function(params: {
            options: {
                isMute: boolean
            },
            callback: (success: boolean, result: {
                response?: string
            }, reason?: string) => void
        }) {
            if (params.options.isMute) {
                xmRtcChannel.mute();
            } else {
                xmRtcChannel.muteCancel();
            }
        });

        // 接口11--发送RTC邀请拒绝
        self.baseSdk.register("sendRtcInviteReject", function(params: {
            options: {
                from: number,
                to: number | number[],
                mediaType: number,
                channelID: string,
                reason: string,
                sessionType: number,
                sessionId?: number
            },
            callback: (success: boolean, result: {
                response?: string
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let room = self.getRoom(options.channelID);
            if (!room) {
                callback && callback(false, {}, "未找到房间");
                return;
            }
            let me: UserAgent = room.findUser(options.from);
            if (!me) {
                callback && callback(false, {}, "未找到自己");
                return;
            }
            options.to = Array.isArray(options.to) ? options.to : [options.to];
            // 1、修改状态
            me.setStatus(UserAgentStatus.rejected);
            room.abort();
            // 2、发cmp
            self.sendHungup(options, function (success: boolean, result: {
                response: string
            }, reason?: string) {
                // 异常状态
                if (!success || result.response !== CONNACK_RETURN_CODE.CONNECTION_ACCEPTED) {
                    me.setStatus(UserAgentStatus.responsed);
                }
                // 回调
                callback && callback(success, result, reason);
            });
        });

        // 接口12--发送RTC邀请挂断
        self.baseSdk.register("sendRtcChannelHungup", function(params: {
            options: {
                from: number,
                to: number | number[],
                mediaType: number,
                channelID: string,
                reason: string,
                sessionType: number,
                sessionId?: number
            },
            callback: (success: boolean, result: {
                response?: string
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let room = self.getRoom(options.channelID);
            if (!room) {
                callback && callback(false, {}, "未找到房间");
                return;
            }
            let me: UserAgent = room.findUser(options.from);
            if (!me) {
                callback && callback(false, {}, "未找到自己");
                return;
            }
            options.to = Array.isArray(options.to) ? options.to : [options.to];
            // 1、修改状态
            me.setStatus(UserAgentStatus.left);
            room.abort();
            // 2、发cmp
            self.sendHungup(options, function (success: boolean, result: {
                response: string
            }, reason?: string) {
                // 回调
                callback && callback(success, result, reason);
            });
        });

        // 接口13--离开RTC房间
        self.baseSdk.register("leaveRtcChannel", function(params: {
            options: {
                channelID: string,
            },
            callback: (success: boolean, result: {
                response?: string
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let room = self.getRoom(options.channelID);
            if (!room) {
                callback && callback(false, {}, "未找到房间");
                return;
            }
            // 1、修改状态
            room.abort();
            // 2、调sdk
            xmRtcChannel.leave({
                onSuccess: () => {
                    callback && callback(true, {});
                },
                onFailure: (errMsg) => {
                    callback && callback(false, {}, errMsg);
                }
            });
        });

        // 接口14--接收各种消息
        self.baseSdk.register("rtcBind", function(params: { callback: any; }) {
            let callback = params.callback;
            self.listener.push(callback);
        });

        // 内部1--绑定监听
        self.baseSdk.addBinder({
            moduleId: MODULE_ID, // 致脑残的平台协议设计者非要叫rtc的cmp的method也用Message
            binder: function(session: any, moduleType: string, serverPublish: any) {
                console.log("收到RTC消息", serverPublish);
                if (moduleType !== MODULE_ID) {
                    return;
                }
                if (self.listener.length) {
                    let signalingOperateType = serverPublish.content.operateCode;
                    let outMessage = null;
                    let messageType = null;
                    switch (signalingOperateType) {
                        case SignalingOperateType.INVITE: {
                            //
                            let newRoom = new Room({
                                id: serverPublish.content.channelID,
                                users: [],
                                mediaType: serverPublish.content.mediaType,
                                sessionType: serverPublish.content.sessionType,
                                sessionId: serverPublish.content.sessionId
                            });
                            newRoom.setCreator(serverPublish.from);
                            for (let key in serverPublish.receiver) {
                                let id = serverPublish.receiver[key];
                                newRoom.inviteAttendant(id);
                            }
                            self.roomList.push(newRoom);
                            // 设定超时检查
                            self.setInviteCheckTimer(self.baseSdk.app.loginUserId, newRoom);
                            outMessage = {
                                from: serverPublish.from,
                                to: serverPublish.receiver,
                                mediaType: serverPublish.content.mediaType,
                                channelID: serverPublish.content.channelID,
                                sessionType: serverPublish.content.sessionType,
                                sessionId: serverPublish.content.sessionId || null
                            };
                            messageType = MessageType.INVITE_NOTIFY;
                            break;
                        }
                        case SignalingOperateType.RINGING: {
                            //
                            let room = self.getRoom(serverPublish.content.channelID);
                            let responser: UserAgent = room.findUser(serverPublish.from);
                            responser && responser.setStatus(UserAgentStatus.responsed);
                            outMessage = {
                                from: serverPublish.from,
                                to: serverPublish.receiver,
                                channelID: serverPublish.content.channelID,
                                sessionType: serverPublish.content.sessionType,
                                sessionId: serverPublish.content.sessionId || null
                            };
                            messageType = MessageType.RING_NOTIFY;
                            break;
                        }
                        case SignalingOperateType.ACCEPT: {
                            //
                            let room = self.getRoom(serverPublish.content.channelID);
                            let acceptor: UserAgent = room.findUser(serverPublish.from);
                            acceptor && acceptor.setStatus(UserAgentStatus.accepted);
                            //
                            room.clearTimer(acceptor.id);
                            outMessage = {
                                from: serverPublish.from,
                                to: serverPublish.receiver,
                                mediaType: serverPublish.content.mediaType,
                                channelID: serverPublish.content.channelID,
                                sessionType: serverPublish.content.sessionType,
                                sessionId: serverPublish.content.sessionId || null,
                                domain: serverPublish.content.domain
                            };
                            messageType = MessageType.ACCEPT_NOTIFY;
                            break;
                        }
                        case SignalingOperateType.MEDIATYPE_CHANGE: {
                            //
                            let room = self.getRoom(serverPublish.content.channelID);
                            room.mediaType = serverPublish.content.mediaType;
                            outMessage = {
                                from: serverPublish.from,
                                to: serverPublish.receiver,
                                mediaType: serverPublish.content.mediaType,
                                channelID: serverPublish.content.channelID,
                                sessionType: serverPublish.content.sessionType,
                                sessionId: serverPublish.content.sessionId || null
                            };
                            messageType = MessageType.MEDIATYPE_CHANGE_NOTIFY;
                            break;
                        }
                        case SignalingOperateType.HUNGUP_REJECT: {
                            let reasonCode = serverPublish.content.extension1;
                            outMessage = {
                                from: serverPublish.from,
                                to: serverPublish.receiver,
                                mediaType: serverPublish.content.mediaType,
                                channelID: serverPublish.content.channelID,
                                sessionType: serverPublish.content.sessionType,
                                sessionId: serverPublish.content.sessionId || null,
                                reason: serverPublish.content.extension1,
                            };
                            if (reasonCode === DisconnectedReason.REJECT ||
                                reasonCode === DisconnectedReason.BUSY_LINE ||
                                reasonCode === DisconnectedReason.ENGINE_UNSUPPORTED) {
                                messageType = MessageType.REJECT_NOTIFY;
                            } else {
                                messageType = MessageType.HUNGUP_NOTIFY;
                            }
                            // Todo
                            if (messageType === MessageType.REJECT_NOTIFY) {

                            }
                            let room = self.getRoom(serverPublish.content.channelID);
                            let rejector: UserAgent = room.findUser(serverPublish.from);
                            if (rejector) {
                                rejector.setStatus(UserAgentStatus.rejected);
                            }
                            room.abort();
                            break;
                        }
                    }
                    //
                    self.onMessage(outMessage.channelID, messageType, outMessage);
                }
            }
        });
    },
    onMessage: function (roomId, messageType, message?) {
        const self = this;
        // 遍历listener
        const room = self.getRoom(roomId);
        for (let i = 0; i < self.listener.length; i++) {
            let listener = self.listener[i];
            if (typeof listener !== "function") {
                continue;
            }
            listener(messageType, room, message);
        }
    },
    doRoomBind: function ({room, xmRtcChannel}) {
        const self = this;
        const roomId = room.id;
        xmRtcChannel.on("stream-publish", (stream: any) => {
            // document.getElementById("test-av-self") && stream.play("test-av-self");
            self.onMessage(roomId, MessageType.LOCAL_STREAM_NOTIFY, {
                stream: stream.streamObj
            });
        });
        xmRtcChannel.on("user-join", (uccId: string) => {
            // Todo
            self.onMessage(roomId, MessageType.USER_CHANGE_NOTIFY, {
                uccId,
                type: "join"
            });
        });
        xmRtcChannel.on("user-leave", (uccId: string) => {
            // Todo
            self.onMessage(roomId, MessageType.USER_CHANGE_NOTIFY, {
                uccId,
                type: "leave"
            });
        });
        xmRtcChannel.on("stream-add", (stream: any, mediaType: string) => {
            console.log("rtsSdk", stream, mediaType);
            // document.getElementById("test-av-peer") && stream.play("test-av-peer");
            self.onMessage(roomId, MessageType.STREAM_CHANGE_NOTIFY, {
                // uccId: stream.getId().split(":")[0],
                uccId: stream.uccId,
                type: "add",
                stream: stream,
                mediaType
            });
        });
        xmRtcChannel.on("error", function (desc: string) {
            self.onMessage(roomId, MessageType.ERROR_NOTIFY, {
                reason: desc
            });
        });
        xmRtcChannel.on("disconnect", function () {
            // Todo
            self.onMessage(roomId, MessageType.DISCONNECT_NOTIFY, null);
        });
    },
    getRoom: function (roomId) {
        const self = this;
        for (let i = 0; i < self.roomList.length; i++) {
            let room = self.roomList[i];
            if (room.id === roomId) {
                return room;
            }
        }
        return null;
    },
    sendHungup: function (options, callback) {
        let object: any = {
            from: options.from,
            to: options.to,
            content: {
                operateCode: SignalingOperateType.HUNGUP_REJECT,
                mediaType: options.mediaType,
                channelID: options.channelID,
                sessionType: options.sessionType,
                sessionId: options.sessionId,
                extension1: options.reason
            }
        };
        let packet = new CinRtcPacket(object);
        this.baseSdk.ses.sendRequest(packet, callback);
    },
    setInviteCheckTimer: function (userId, room) {
        let self = this;
        let expireTimer = setTimeout(function () {
            if (room.status !== RoomStatus.init) {
                return;
            }
            let user = room.findUser(userId);
            if (user.status >= UserAgentStatus.accepted) {
                return;
            }
            // 发出超时提醒
            self.onMessage(room.id, MessageType.NO_RESPONSE_NOTIFY, userId);
        }, self.sdkParams.inviteExpire);
        room._inviteExpireCheckTimers[userId] = expireTimer;
    },
    _initXmRtcSdk: function (uccId, callback) {
        let self = this;
        if (xmRtcBase.loginStatus()) {
            callback(true);
            return;
        }
        if (!this._xmRtcInit) {
            xmRtcBase.init({
                onSuccess: function (code, desc) {
                    xmRtcBase.setRootServerUrl(self.sdkParams.xmRtcUrl);
                    self._xmRtcInit = true;
                    self._loginXmRtcSdk(uccId, function (loginRes) {
                        callback(loginRes);
                    });
                },
                onFailure: function (code, desc) {
                    callback(false);
                }
            });
            return;
        }
        self._loginXmRtcSdk(uccId, function (loginRes) {
            callback(loginRes);
        });
    },
    _loginXmRtcSdk: function (uccId, callback) {
        if (xmRtcBase.loginStatus()) {
            callback(true);
        }
        let appSecret = this.sdkParams.appSecret;
        let nonce = uccId;
        let curTime = Date.now();
        let params = {
            appKey: this.sdkParams.appKey,
            uccId: uccId,
            type: 1,
            nonce: nonce,
            curTime: curTime,
            checkSum: cryptojsSHA1(appSecret + nonce + curTime),
            onSuccess: function (code, result) {
                callback(true)
            },
            onFailure: function (code, result) {
                callback(false)
            }
        };
        xmRtcBase.login(params);
    }
};

export {
    TeatalkRtcSdk
};