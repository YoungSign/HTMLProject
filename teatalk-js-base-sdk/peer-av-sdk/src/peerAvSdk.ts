import { applyProperties } from "./../../base-sdk/src/util/utils";
import { generateCallId } from "./util/utils";

// +++++++ 给上层发送的枚举 +++++++
enum UiEvent {
    RECV_INVITE = "recv_invite", // 收到邀请通知
    SHOW_AV_WIN = "show_av_win", // 显示音视频窗口通知
    LOCAL_MEDIA = "local_media", // 播放本地媒体流通知
    USER_JOIN = "user_join", // 用户加入通知
    MEDIA_ADD = "media_add", // 媒体流新增通知
    SWITCH_TO_AUDIO = "switch_to_audio", // 切换到音频界面通知
    USER_LEAVE = "user_leave", // 用户离开通知
    CLOSE_AV_WIN = "close_av_win" // 关闭音视频窗口（包括邀请窗口）通知
};

enum UiResult {
    OK = "ok", // 成功
    OWNER_BUSY = "owner_busy", // 自己忙，已经有进行中的通话
    SEND_INVITE_FAIL = "send_invite_fail", // 发送邀请失败
    INVITE_OVERTIME = "invite_overtime", // 邀请超时
    HUNGUP = "hungup", // 正常挂断(包含主被动)
    CANCEL_INVITE = "cancel_invite", // 邀请方主动取消邀请
    OTHER_ACCEPT_INVITE = "other_handle_invite", // 其他端接受了邀请
    OTHER_REFUSE_INVITE = "other_refuse_invite", // 其他端拒绝了邀请
    OPPOSITE_BUSY = "opposite_busy", // 对方忙
    REFUSE = "refuse", // 对方拒绝邀请
    ACCEPT_FAIL = "accept_fail", // 被邀请方接受邀请失败
    JOIN_FAIL = "join_fail", // 加入房间失败
    ARGUMENTS_ERROR = "arguments_error", // 参数错误
    CALL_STATE_ERROR = "call_state_error", // 通话状态错误
    NO_CALLING = "no_calling", // 没有正在进行中的通话（包括邀请中和通话中两个状态）
    ERROR = "error" // 其他错误
};
// ------- 给上层发送的枚举 -------

// +++++++ copy rtcsdk定义的枚举 +++++++
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
};

enum DisconnectedReason {
    CANCEL = "1", // 己方取消已发出的通话请求（挂断）
    REJECT = "2", // 己方拒绝收到的通话请求（拒绝）
    HANGUP = "3", // 己方挂断（挂断）
    BUSY_LINE = "4", // 己方忙碌（拒绝）
    NO_RESPONSE = "5", // 己方未接听（挂断）
    ENGINE_UNSUPPORTED = "6", // 当前引擎不支持（拒绝）
    NETWORK_ERROR = "7", // *己方网络出错（sdk error时发出算挂断）
    INIT_VIDEO_ERROR = "8", // *己方摄像头初始化错误，可能是没有打开使用摄像头权限（挂断）
    // REMOTE_CANCEL = "11", // 对方取消已发出的通话请求
    // REMOTE_REJECT = "12", // 对方拒绝收到的通话请求
    // REMOTE_HANGUP = "13", // 通话过程对方挂断
    // REMOTE_BUSY_LINE = "14", // 对方忙碌
    // REMOTE_NO_RESPONSE = "15", // 对方未接听
    // REMOTE_ENGINE_UNSUPPORTED = "16", // 对方引擎不支持
    // REMOTE_NETWORK_ERROR = "17", // 对方网络错误
    KICKED_OFF = "18", // 被踢出
    ACCEPT_ON_OTHER_TERM = "19", // 其他端已经接听
    REJECT_ON_OTHER_TERM = "20" // 其他端已经拒绝
};

enum RoomStatus {
    init = 0,
    aborted = -1
};
// ------- copy rtcsdk定义的枚举 -------

enum AvState {
    IDLE, // 空闲
    CALL_IN, // 呼入
    CALL_OUT, // 呼出
    CALL_IN_ACCEPT, // 呼入接听
    CALL_OUT_ACCEPT, // 呼出接听
    JOIN_SUC // 加房间成功
};

let TeatalkPeerAvSdk: any = {
    sdkParams: {},
    baseSdk: null,
    listener: null,
    callInfo: {
        status: AvState.IDLE,
        id: "",
        owner: 0,
        opposite: 0,
        mediaType: 0,
        sessionType: 1,
        ownerDomId: '',
        userDomId: ''
    },
    option: {
        weburl: ""
    },
    init: function (sdkParams: { baseSdk: any }) {
        let self = this;
        self.sdkParams = applyProperties(self.sdkParams, sdkParams);
        self.baseSdk = sdkParams.baseSdk;
        if (!self.baseSdk) {
            console.error("未找到基础sdk");
            return;
        }

        // 通过baseSdk向rtcsdk注册监听回调
        self.baseSdk.invoke("rtcBind", {
            callback: function (event: MessageType, room: any, message: any) {
                self.rtcListener(event, room, message);
            }
        });

        /**
         * 接口1--配置音视频功能，初始化后需要立即调用此接口
         * @param {Function} callback UI层注册的监听回调，接收各种通知
         */
        self.baseSdk.register("peerAvOption", function(params: {
            options: {
            },
            callback: (event: UiEvent, data: any) => void
        }) {
            console.log("peerAvSdk配置 params", params);
            self.listener = params.callback;
        });
        /**
         * 接口2--发送音视频邀请
         * @param {number} from 发送方userId
         * @param {number} to 接收方userId
         * @param {number} mediaType 媒体类型 1：音频；2：视频
         * @return {string} result.callId 房间号，用于之后的接口及通知
         * @return {string} result.result 邀请调用结果，成功 or 失败原因
         */ 
        self.baseSdk.register("sendPeerAvInvite", function(params: {
            from: number,
            to: number,
            mediaType: number,
            ownerDomId: string,
            userDomId: string
        }) {
            console.log("peerAvSdk发邀请 params", params);
            let result = {
                result: UiResult.OK,
                callId: ""
            }
            if (typeof params.from !== 'number' ||
            typeof params.to !== 'number' ||
            typeof params.mediaType !== 'number') {
                result.result = UiResult.ARGUMENTS_ERROR;
                return result;
            }
            // 当前有进行中的通话
            if (self.hasCalling()) {
                result.result = UiResult.OWNER_BUSY;
                return result;
            }
            // 没有通话，发起邀请
            let callId = generateCallId(params.from);
            // callId = "1588059319307";
            self.updateCallInfo(false, {
                status: AvState.CALL_OUT,
                id: callId,
                owner: params.from,
                opposite: params.to,
                mediaType: params.mediaType,
                ownerDomId: params.ownerDomId,
                userDomId: params.userDomId
            });
            let rtcParams = {
                options: {
                    from: self.callInfo.owner,
                    to: self.callInfo.opposite,
                    mediaType: self.callInfo.mediaType,
                    channelID: self.callInfo.id,
                    sessionType: self.callInfo.sessionType
                },
                callback: function (success: boolean, result: { response: string }, reason?: string) {
                    console.log("peerAvSdk调rtc发邀请cb success", success, "result", result, "reason", reason);
                    if (!success || result.response !== "OK") {
                        self.emitEventToUi(self, UiEvent.CLOSE_AV_WIN, {
                            callId: self.callInfo.id,
                            reason: UiResult.SEND_INVITE_FAIL
                        });
                        self.updateCallInfo(true);
                    }
                }
            };
            console.log("peerAvSdk调rtc发邀请 rtcParams", rtcParams);
            self.baseSdk.invoke("sendRtcInvite", rtcParams);
            result.callId = callId;
            return result;
        });
        /**
         * 接口3--同意音视频邀请（接听）
         * @param {string} callId 通话唯一id（或叫房间号、频道号）
         * @return {boolean} 接口调用 成功 or 失败
         */
        self.baseSdk.register("acceptPeerAvInvite", function(params: {
             callId: string,
             ownerDomId: string,
             userDomId: string
         }) {
            console.log("peerAvSdk接受邀请 params", params);
            if (typeof params.callId !== 'string' || params.callId === "") {
                return UiResult.ARGUMENTS_ERROR;
            }
            if (self.callInfo.id === "") {
                return UiResult.NO_CALLING;
            }
            if (self.callInfo.id !== params.callId) {
                return UiResult.OWNER_BUSY;
            }
            if (self.callInfo.status !== AvState.CALL_IN) {
                return UiResult.CALL_STATE_ERROR;
            }
            // 发送同意呼入邀请
            self.updateCallInfo(false, { 
                status: AvState.CALL_IN_ACCEPT,
                ownerDomId: params.ownerDomId,
                userDomId: params.userDomId 
            });
            let rtcParams = {
                options: {
                    from: self.callInfo.owner,
                    to: self.callInfo.opposite,
                    mediaType: self.callInfo.mediaType,
                    channelID: self.callInfo.id,
                    sessionType: self.callInfo.sessionType
                },
                callback: function (success: boolean, result: { response: string }, reason?: string) {
                    console.log("peerAvSdk调rtc接受邀请cb success", success, "result", result, "reason", reason);
                    if (success && result.response === "OK") {
                        // setTimeout(function () {
                            self.joinChannel(2);
                        // }, 2000);
                    } else {
                        self.emitEventToUi(self, UiEvent.CLOSE_AV_WIN, {
                            callId: self.callInfo.id,
                            reason: UiResult.ACCEPT_FAIL
                        });
                        self.updateCallInfo(true);
                    }
                }
            };
            console.log("peerAvSdk调rtc接受邀请 rtcParams", rtcParams);
            self.baseSdk.invoke("sendRtcInviteAccept", rtcParams);
            return UiResult.OK;
        });
        /**
         * 接口4--拒绝音视频邀请
         * @param {string} callId 通话唯一id（或叫房间号、频道号）
         * @return {boolean} 接口调用 成功 or 失败
         */
        self.baseSdk.register("refusePeerAvInvite", function(params: { callId: string }) {
            console.log("peerAvSdk拒绝 params", params);
            if (typeof params.callId !== 'string' || params.callId === "") {
                return UiResult.ARGUMENTS_ERROR;
            }
            if (self.callInfo.id === "") {
                return UiResult.NO_CALLING;
            }
            if (self.callInfo.id !== params.callId) {
                return UiResult.OWNER_BUSY;
            }
            if (self.callInfo.status !== AvState.CALL_IN) {
                return UiResult.CALL_STATE_ERROR;
            }
            // 发送拒绝呼入邀请
            self.refuseAvInvite(self.callInfo, DisconnectedReason.REJECT);
            self.updateCallInfo(true);
            return UiResult.OK;
        });
        /**
         * 接口5--视频降级音频
         * @param {string} callId 通话唯一id（或叫房间号、频道号）
         * @return {boolean} 接口调用 成功 or 失败
         */
        self.baseSdk.register("degradePeerAv", function(params: { callId: string }) {
            console.log("peerAvSdk降级 params", params);
            if (typeof params.callId !== 'string' || params.callId === "") {
                return UiResult.ARGUMENTS_ERROR;
            }
            if (self.callInfo.id === "") {
                return UiResult.NO_CALLING;
            }
            if (self.callInfo.id !== params.callId) {
                return UiResult.OWNER_BUSY;
            }
            if (self.callInfo.status !== AvState.JOIN_SUC) {
                return UiResult.CALL_STATE_ERROR;
            }
            // 发送视频降级音频
            let rtcParams = {
                options: {
                    from: self.callInfo.owner,
                    to: self.callInfo.opposite,
                    channelID: self.callInfo.id,
                    mediaType: 1,
                    sessionType: self.callInfo.sessionType
                },
                callback: null
            };
            console.log("peerAvSdk调rtc媒体变更 rtcParams", rtcParams);
            self.baseSdk.invoke("changeRtcMedia", rtcParams);
            return UiResult.OK;
        });
        /**
         * 接口6--主动取消音视频邀请/挂断音视频通话
         * @param {string} callId 通话唯一id（或叫房间号、频道号）
         * @return {boolean} 接口调用 成功 or 失败
         */
        self.baseSdk.register("hungupPeerAv", function(params: { callId: string }) {
            console.log("peerAvSdk挂断/取消 params", params);
            if (typeof params.callId !== 'string' || params.callId === "") {
                return UiResult.ARGUMENTS_ERROR;
            }
            if (self.callInfo.id === "") {
                return UiResult.NO_CALLING;
            }
            if (self.callInfo.id !== params.callId) {
                return UiResult.OWNER_BUSY;
            }
            if (self.callInfo.status > AvState.JOIN_SUC && self.callInfo.status < AvState.CALL_OUT) {
                return UiResult.CALL_STATE_ERROR;
            }
            // 发送挂断音视频
            if (self.callInfo.status === AvState.CALL_OUT) {
                self.hungupAv(self.callInfo, DisconnectedReason.CANCEL);
                self.updateCallInfo(true);
            } else {
                self.hungupAv(self.callInfo, DisconnectedReason.HANGUP);
            }
            return UiResult.OK;
        });
        /**
         * 接口7--开关静音
         * @param {string} callId 通话唯一id（或叫房间号、频道号）
         * @return {boolean} 接口调用 成功 or 失败
         */
        self.baseSdk.register("changePeerAvMute", function(params: {
            callId: string,
            isMute: boolean 
        }) {
            console.log("peerAvSdk开关静音 params", params);
            if (typeof params.callId !== 'string' || params.callId === "" || typeof params.isMute !== "boolean") {
                return UiResult.ARGUMENTS_ERROR;
            }
            if (self.callInfo.id === "") {
                return UiResult.NO_CALLING;
            }
            if (self.callInfo.id !== params.callId) {
                return UiResult.OWNER_BUSY;
            }
            if (self.callInfo.status !== AvState.JOIN_SUC) {
                return UiResult.CALL_STATE_ERROR;
            }
            // 开关静音
            let rtcParams = {
                options: {
                    isMute: params.isMute
                },
                callback: null
            };
            console.log("peerAvSdk调rtc开关静音 rtcParams", rtcParams);
            self.baseSdk.invoke("oepnOrCloseRtcVoice", rtcParams);
            return UiResult.OK;
        });
    },
    /**
     * rtcsdk监听回调
     */
    rtcListener: function (event: MessageType, room: any, message: any) {
        console.log("peerAvSdk rtcsdk通知 event", event, "room", room, "message", message);
        // 只处理一对一通知
        if (room.sessionType !== 1) {
            return;
        }
        let self = this;
        // 空闲状态
        if (!self.hasCalling()) {
            // 空闲状态只处理rtc一对一邀请通知
            if (MessageType.INVITE_NOTIFY === event) {
                // 更新通话信息
                self.updateCallInfo(false, {
                    status: AvState.CALL_IN,
                    id: room.id,
                    owner: message.to[0],
                    opposite: message.from,
                    mediaType: room.mediaType
                });
                // 收到邀请发送响铃
                let rtcParams = {
                    options: {
                        from: self.callInfo.owner,
                        to: self.callInfo.opposite,
                        channelID: self.callInfo.id,
                        sessionType: self.callInfo.sessionType
                    },
                    callback: null
                };
                console.log("peerAvSdk调rtc响铃 rtcParams", rtcParams);
                self.baseSdk.invoke("sendRtcInviteRinging", rtcParams);
                // 通知UI收到邀请通知
                self.emitEventToUi(self, UiEvent.RECV_INVITE, {
                    from: self.callInfo.opposite,
                    to: self.callInfo.owner,
                    callId: self.callInfo.id,
                    mediaType: self.callInfo.mediaType,
                    sessionType: self.callInfo.sessionType
                });
            }
            return;
        }
        // 非空闲状态
        if (self.callInfo.id !== room.id) {
            // 当前有通话，又收到其他人发来的音视频通知
            if (MessageType.INVITE_NOTIFY === event) {
                // 返回忙线挂断
                self.refuseAvInvite(message, DisconnectedReason.BUSY_LINE);
            }
            return;
        }
        switch (event) {
            case MessageType.RING_NOTIFY:
                // 收到响铃通知
            break;
            case MessageType.NO_RESPONSE_NOTIFY:
                // 收到邀请超时通知
                if (self.callInfo.status === AvState.CALL_IN || self.callInfo.status === AvState.CALL_OUT) {
                    // 只处理 呼入/呼出 中的超时通知
                    // 被邀请时发送挂断
                    self.hungupAv(self.callInfo, DisconnectedReason.NO_RESPONSE)
                    self.emitEventToUi(self, UiEvent.CLOSE_AV_WIN, {
                        callId: self.callInfo.id,
                        reason: UiResult.INVITE_OVERTIME
                    });
                    self.updateCallInfo(true);
                }
            break;
            case MessageType.REJECT_NOTIFY:
                {
                    let reason = UiResult.REFUSE;
                    if (message.reason === DisconnectedReason.BUSY_LINE) {
                        reason = UiResult.OPPOSITE_BUSY;
                    }
                    self.emitEventToUi(self, UiEvent.CLOSE_AV_WIN, {
                        callId: self.callInfo.id,
                        reason
                    });
                    self.updateCallInfo(true);
                }
            break;
            case MessageType.ACCEPT_NOTIFY:
                if (self.callInfo.status === AvState.CALL_OUT) {
                    self.updateCallInfo(false, { status: AvState.CALL_OUT_ACCEPT });
                    self.joinChannel(1);
                }
            break;
            case MessageType.LOCAL_STREAM_NOTIFY:
                if (self.callInfo.status === AvState.JOIN_SUC) {
                    self.emitEventToUi(self, UiEvent.LOCAL_MEDIA, {
                        callId: self.callInfo.id,
                        stream: message.stream
                    });
                }
            break;
            case MessageType.MEDIATYPE_CHANGE_NOTIFY:
                if (self.callInfo.status === AvState.JOIN_SUC) {
                    if (self.callInfo.mediaType === 2 && message.mediaType === 1) {
                        self.closeWebcam();
                        self.emitEventToUi(self, UiEvent.SWITCH_TO_AUDIO, { callId: self.callInfo });
                    }
                }
            break;
            case MessageType.USER_CHANGE_NOTIFY:
                if (self.callInfo.status === AvState.JOIN_SUC) {
                    self.emitEventToUi(self, message.type === "join" ? UiEvent.USER_JOIN: UiEvent.USER_LEAVE, {
                        callId: self.callInfo.id,
                        userId: message.uccId
                    });
                }
            break;
            case MessageType.STREAM_CHANGE_NOTIFY:
                if (self.callInfo.status === AvState.JOIN_SUC) {
                    if (message.type === "add") {
                        self.playMedia(message.uccId);
                        // self.emitEventToUi(self, UiEvent.MEDIA_ADD, {
                        //     callId: self.callInfo.id,
                        //     userId: message.uccId,
                        //     stream: message.stream,
                        //     mediaType: message.mediaType
                        // });
                    }
                }
            break;
            case MessageType.HUNGUP_NOTIFY:
                {
                    let reason = UiResult.HUNGUP;
                    if (message.reason === DisconnectedReason.ACCEPT_ON_OTHER_TERM) {
                        reason = UiResult.OTHER_ACCEPT_INVITE;
                    } else if (message.reason === DisconnectedReason.REJECT_ON_OTHER_TERM) {
                        reason = UiResult.OTHER_REFUSE_INVITE;
                    } else if (message.reason === DisconnectedReason.CANCEL) {
                        reason = UiResult.CANCEL_INVITE;
                    } else if (message.reason === DisconnectedReason.NO_RESPONSE) {
                        reason = UiResult.INVITE_OVERTIME;
                    }
                    self.emitEventToUi(self, UiEvent.CLOSE_AV_WIN, {
                        callId: self.callInfo.id,
                        reason
                    });
                    if (reason === UiResult.HUNGUP) {
                        self.leaveChannel(self);
                    }
                    self.updateCallInfo(true);
                }
            break;
            default:
                // 异常通知
                self.emitEventToUi(self, UiEvent.CLOSE_AV_WIN, {
                    callId: self.callInfo.id,
                    reason: UiResult.ERROR
                });
                self.updateCallInfo(true);
                // todo 是否需要发挂断
            break;
        }
    },
    /**
     * 向UI层发通知
     * @param {any} data 通知数据
     */
    emitEventToUi: function (self: any, event: UiEvent, data: any) {
        console.log("peerAvSdk上层回调 event", event, "data", data);
        self.listener && self.listener(event, data);
    },
    /**
     * 是否有通话正在进行中
     */
    hasCalling: function () {
        let self = this;
        if (self.callInfo.status !== AvState.IDLE) {
            return true;
        }
        // 获取当前通话列表
        let roomList = self.baseSdk.invoke("getRtcRoomList");
        let len = roomList.length;
        for (let i = 0; i < len; ++i) {
            let room = roomList[i];
            if (room.status === RoomStatus.init) {
                let me = room.findUser(self.baseSdk.app.loginUserId);
                if (me.status >= 2) {
                    return true;
                }
            }
        }
        return false;
    },
    /**
     * 更新通话信息
     */
    updateCallInfo: function (clear: boolean, info?: {
        status?: AvState,
        id?: string,
        owner?: number,
        opposite?: number,
        mediaType?: number,
        ownerDomId?: string,
        userDomId?: string
    }) {
        let self = this;
        if (clear) {
            self.callInfo.status = AvState.IDLE;
            self.callInfo.id = "";
            self.callInfo.owner = 0;
            self.callInfo.opposite = 0;
            self.callInfo.mediaType = 0;
            self.callInfo.ownerDomId = "";
            self.callInfo.userDomId = "";
        } else {
            info.status && (self.callInfo.status = info.status);
            info.id && (self.callInfo.id = info.id);
            info.owner && (self.callInfo.owner = info.owner);
            info.opposite && (self.callInfo.opposite = info.opposite);
            info.mediaType && (self.callInfo.mediaType = info.mediaType);
            info.ownerDomId && (self.callInfo.ownerDomId = info.ownerDomId);
            info.userDomId && (self.callInfo.userDomId = info.userDomId);
        }
        console.log("更新通话信息", self.callInfo);
    },
    /**
     * 拒绝邀请
     */
    refuseAvInvite: function (info: any, reason?: DisconnectedReason) {
        let self = this;
        let rtcParams = {
            options: {
                from: self.callInfo.owner,
                to: info.opposite || info.from,
                mediaType: info.mediaType,
                channelID: info.id || info.channelID,
                sessionType: info.sessionType,
            },
            callback: null
        };
        if (reason) {
            rtcParams.options["reason"] = reason;
        }
        console.log("peerAvSdk调rtc拒绝 rtcParams", rtcParams);
        self.baseSdk.invoke("sendRtcInviteReject", rtcParams);
    },
    /**
     * 加入房间
     */
    joinChannel: function (role: number) {
        let self = this;
        self.emitEventToUi(self, UiEvent.SHOW_AV_WIN, {
            callId: self.callInfo
        });
        let rtcParams = {
            options: {
                from: self.callInfo.owner,
                channelName: self.callInfo.id,
                channelID: self.callInfo.id,
                role: role,
                mediaType: self.callInfo.mediaType
            },
            callback: function (success: boolean, result: { response: string }, reason?: string) {
                console.log("peerAvSdk调rtc加入房间cb success", success, "result", result, "reason", reason);
                if (success && result.response === "OK") {
                    self.updateCallInfo(false, { status: AvState.JOIN_SUC });
                    self.playMedia(self.callInfo.owner);
                } else {
                    self.emitEventToUi(self, UiEvent.CLOSE_AV_WIN, {
                        callId: self.callInfo.id,
                        reason: UiResult.JOIN_FAIL
                    });
                    self.updateCallInfo(true);
                }
            }
        };
        console.log("peerAvSdk调rtc加入房间 rtcParams", rtcParams);
        self.baseSdk.invoke("joinRtcChannel", rtcParams);
    },
    /**
     * 发送播放并推送本地媒体流
     */
    playMedia: function (userId) {
        let self = this;
        let rtcParams = {
            options: {
                from: userId,
                channelID: self.callInfo.id
            },
            callback: null
        };
        if(userId != self.callInfo.owner){
            rtcParams.options['elementId'] = self.callInfo.userDomId;
        }
        console.log("peerAvSdk调rtc播流 rtcParams", rtcParams);
        self.baseSdk.invoke("playRtcMedia", rtcParams);
    },
    /**
     * 挂断
     */
    hungupAv: function (info: any, reason?: DisconnectedReason) {
        let self = this;
        let rtcParams = {
            options: {
                from: self.callInfo.owner,
                to: info.opposite || info.from,
                mediaType: info.mediaType,
                channelID: info.id || info.channelID,
                sessionType: info.sessionType
            },
            callback: function (success: boolean, result: { response: string }, reason?: string) {
                console.log("peerAvSdk调rtc取消/挂断cb success", success, "result", result, "reason", reason);
                if (success && result.response === "OK") {
                    if (self.callInfo.status === AvState.IDLE) {
                        return
                    }
                    self.emitEventToUi(self, UiEvent.CLOSE_AV_WIN, {
                        callId: self.callInfo.id,
                        reason: UiResult.HUNGUP
                    });
                    if (self.callInfo.status === AvState.JOIN_SUC) {
                        self.leaveChannel(self);
                    }
                    self.updateCallInfo(true);
                }
            }
        };
        if (reason) {
            rtcParams.options["reason"] = reason;
        }
        console.log("peerAvSdk调rtc取消/挂断 rtcParams", rtcParams);
        self.baseSdk.invoke("sendRtcChannelHungup", rtcParams);
    },
    /**
     * 关闭摄像头
     */
    closeWebcam: function () {
        let rtcParams = {
            options: {
                isOpen: false
            },
            callback: null
        };
        this.baseSdk.invoke("oepnOrCloseRtcCamera", rtcParams);
    },
    /**
     * 离开房间
     */
    leaveChannel: function (self: any) {
        let rtcParams = {
            options: {
                channelID: self.callInfo.id
            },
            callback: null
        };
        self.baseSdk.invoke("leaveRtcChannel", rtcParams);
    }
};

export {
    TeatalkPeerAvSdk
};