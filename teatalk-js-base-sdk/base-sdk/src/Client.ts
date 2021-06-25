import Config from "./config";
import { CLIENT_STATE, PACKET_TYPE, CONNACK_RETURN_CODE } from "./Constant";
import { BaseSocket } from "./net/BaseSocket";
import { WsSocket } from "./net/WsSocket";
// import { CompatibleWsSocket } from "./net/CompatibleWsSocket";
// import { NodeSocket } from "./net/NodeSocket";
import { SessionOption } from "./SessionOption";
import { Future } from "./task/Future";
import { FutureManager } from "./task/FutureManager";
import { CinPacket as Packet, CinPacket } from "./cin/CinPacket";
import { ConnectPacket, CinWEBIMConnectPacket, CinWEBIMConnectAckPacket } from "./base-packets/WEBIMLogonTransaction";
import { TokenConnectPacket, CinWEBIMTokenConnectPacket, CinWEBIMTokenConnectAckPacket } from "./base-packets/WEBIMTokenLogonTransaction";
import logger from "./util/Logger";

import { CinRequestPacket } from "./cin/CinRequestPacket";
import { CinResponsePacket } from "./cin/CinResponsePacket";
import { CinRequestMessage } from "./cin/CinRequestMessage";
import { CinResponseMessage } from "./cin/CinResponseMessage";
import { PubAckPacket, PublishPacket } from "./base-packets/PublishTransaction";
import { TemplateManager } from "./TemplateManager";
import { PingReqPacket, PingRespPacket } from "./base-packets/KeepAliveTransaction";
import { App } from "./App";
import { CinWEBIMQrcodeAckPacket, CinWEBIMQrcodePacket } from "./base-packets/WEBIMQrcodeTransaction";

enum SOCKET_CLOSE_CODE {
    /* 正常关闭; 无论为何目的而创建, 该链接都已成功完成任务. */
    CLOSE_NORMAL = 1000,
    /* 终端离开, 可能因为服务端错误, 也可能因为浏览器正从打开连接的页面跳转离开. */
    CLOSE_GOING_AWAY = 1001,
    /* 由于协议错误而中断连接. */
    CLOSE_PROTOCOL_ERROR = 1002,
    /* 由于接收到不允许的数据类型而断开连接 (如仅接收文本数据的终端接收到了二进制数据). */
    CLOSE_UNSUPPORTED = 1003,
    /* 保留.  表示没有收到预期的状态码. */
    CLOSE_NO_STATUS = 1005,
    /* 保留. 用于期望收到状态码时连接非正常关闭 (也就是说, 没有发送关闭帧). */
    CLOSE_ABNORMAL = 1006,
    /* 由于收到了格式不符的数据而断开连接 (如文本消息中包含了非 UTF-8 数据). */
    UNSUPPORTED_DATA = 1007,
    /* 由于收到不符合约定的数据而断开连接. 这是一个通用状态码, 用于不适合使用 1003 和 1009 状态码的场景. */
    POLICY_VIOLATION = 1008,
    /* 由于收到过大的数据帧而断开连接. */
    CLOSE_TOO_LARGE = 1009,
    /* 客户端期望服务器商定一个或多个拓展, 但服务器没有处理, 因此客户端断开连接. */
    MISSING_EXTENSION = 1010,
    /* 客户端由于遇到没有预料的情况阻止其完成请求, 因此服务端断开连接. */
    INTERNAL_ERROR = 1011,
    /* 服务器由于重启而断开连接. [Ref] */
    SERVICE_RESTART = 1012,
    /* 服务器由于临时原因断开连接, 如服务器过载因此断开一部分客户端连接. [Ref] */
    TRY_AGAIN_LATER = 1013,
    /* 保留. 表示连接由于无法完成 TLS 握手而关闭 (例如无法验证服务器证书). */
    TLS_HANDSHAKE = 1015
}

export class Client {

    private state: CLIENT_STATE = CLIENT_STATE.NEW;

    private ws: BaseSocket;

    private waittingPingResp: boolean;

    private deadLine: number;

    private pingLine: number;

    private option: SessionOption;

    private futures: FutureManager = new FutureManager();

    onPacket: (packet: Packet) => void;

    onStateChange: (newState: CLIENT_STATE, oldState: CLIENT_STATE, reason?: string, packet?: Packet, logonType?: number) => void;

    connect(option: SessionOption, logonType: number, callback?: (success: boolean, ack: CinResponsePacket, reason: string) => void): void {
        if (!this.matchState(CLIENT_STATE.CLOSED, CLIENT_STATE.NEW, CLIENT_STATE.DISCONNECTED, CLIENT_STATE.CONNECT_FAILED)) {
            if (callback) {
                callback(false, null, `not allow connect with state=${CLIENT_STATE[this.state]}`);
            }
        }
        if (this.ws && !this.ws.isClosed()) {
            this.ws.close();
        }
        let callbackInvoked = false;
        this.option = option;
        this.waittingPingResp = false;
        this.changeState(null, CLIENT_STATE.CONNECTING);
        let ws;
        try {
            logger.logDebug(`connect to ${option.url}`);
            if (window) {
                if ("WebSocket" in window) {
                    ws = new WsSocket();
                    let res = ws.open(option.url, option.binary);
                    if (res.error) {
                        console.warn(res.error);
                    }
                } else {
                    // ws = new CompatibleWsSocket();
                    // ws.open(option.url, false);
                }
            } else {
                // ws = new NodeSocket();
                // ws.open(option.url, false);
            }
        } catch (e) {
            this.changeState(null, CLIENT_STATE.CONNECT_FAILED, e.message);
            if (callback) {
                callbackInvoked = true;
                callback(false, null, e.message);
            }
            return;
        }
        // 如果用户在创建连接的过程中取消了连接操作，则关闭ws连接并且放弃后续的行为
        if (!this.matchState(CLIENT_STATE.CONNECTING)) {
            ws.close();
            return;
        }
        this.ws = ws;
        ws.onClose = (ev) => {
            let reason = ev.reason || SOCKET_CLOSE_CODE[ev.code] || `UNKNOWN_CLOSE_CODE(${ev.code})`;
            logger.logTrace(`Socket close for "${reason}"`, ws);
            if (this.matchState(CLIENT_STATE.CONNECTING)) {
                this.changeState(ws, CLIENT_STATE.CONNECT_FAILED, reason);
                if (callback && !callbackInvoked) {
                    callbackInvoked = true;
                    callback(false, null, reason);
                }
            } else if (this.matchState(CLIENT_STATE.CLOSING)) {
                this.changeState(ws, CLIENT_STATE.CLOSED, reason);
            } else if (this.matchState(CLIENT_STATE.CONNECTED)) {
                this.changeState(ws, CLIENT_STATE.DISCONNECTED, reason);
            } else {
                logger.logWarn(`Socket close event with state "${this.getState()}", event ignored.`);
            }
            // 失败所有本次连接未完成的Future
            this.futures.each((packetId: string, future: Future<any>) => {
                if (future.ws === ws) {
                    try {
                        future.fault("Channel closed");
                    } catch (e) {
                        logger.logError("invoke Future.fault error. " + e.message);
                    }
                    this.futures.remove(packetId);
                }
            });
        };
        ws.onOpen = () => {
            logger.logTrace("Socket open", ws);
            // let logonType = 1;
            if (this.ws === ws) {
                let interval = 1000;
                this.updateDeadLine();
                this.updatePingLine();
                let pollingChecker = () => {
                    if (this.ws !== ws) {
                        return;
                    }
                    try {
                        // console.log('start to keep alive...');
                        this.pollingChecker();
                    } catch (e) {
                        logger.logError("invoke polling checker error. " + e.message);
                    }
                    if (!this.ws.isClosed()) {
                        setTimeout(pollingChecker, interval);
                    }
                };
                setTimeout(pollingChecker, interval);
                this.sendConnect(option, (success, ackPacket, reason) => {
                    if (ackPacket.response === CONNACK_RETURN_CODE.CONNECTION_ACCEPTED) {
                        // console.log("ackPacket~~~~~~~~~~~", ackPacket)
                        if (ackPacket.userId) {
                            App.loginUserId = ackPacket.userId;
                        }
                        if (ackPacket.transferToken) {
                            App.transferToken = ackPacket.transferToken;
                        }
                        if (ackPacket.dtcurl) {
                            App.dtcurl = ackPacket.dtcurl;
                        }
                        if (ackPacket.eutinterfaceurl) {
                            App.eutinterfaceurl = ackPacket.eutinterfaceurl;
                        }
                        this.changeState(null, CLIENT_STATE.CONNECTED, null, ackPacket);
                    } else {
                        this.changeState(null,
                            CLIENT_STATE.CONNECT_FAILED,
                            CONNACK_RETURN_CODE[ackPacket.response] || `UNKNOWN_CODE(${ackPacket.response})`,
                            ackPacket);
                    }
                    callback(success, ackPacket, reason);
                }, logonType);
            } else {
                ws.close();
            }
        };
        ws.onError = (ev) => {
            console.warn(ev);
        };
        ws.onMessage = (ev) => {
            logger.logTrace("Socket message", ws);
            if (this.ws === ws) {
                this.receivePacket(ev.data);
            }
        };
    }

    close(reason?: string): void {
        if (this.matchState(CLIENT_STATE.CONNECTED, CLIENT_STATE.CONNECTING)) {
            let ws = this.ws;
            this.changeState(ws, CLIENT_STATE.CLOSING, reason);
            if (ws) {
                ws.close();
            } else {
                this.changeState(null, CLIENT_STATE.CLOSED);
            }
        }
    }

    getState(): string {
        return CLIENT_STATE[this.state];
    }

    matchState(...states: CLIENT_STATE[]): boolean {
        for (let state of states) {
            if (this.state === state as CLIENT_STATE) {
                return true;
            }
        }
        return false;
    }

    private changeState(ws: BaseSocket, newState: CLIENT_STATE, reason?: string, packet?: CinPacket): void {
        if (!ws || this.ws === ws && newState !== this.state) {
            let oldState = this.state;
            this.state = newState;
            if (reason) {
                logger.logInfo(`client state change ${CLIENT_STATE[oldState]} to ${CLIENT_STATE[newState]} reason="${reason}"`, packet);
            } else {
                logger.logInfo(`client state change ${CLIENT_STATE[oldState]} to ${CLIENT_STATE[newState]}`, packet);
            }
            if (this.onStateChange) {
                try {
                    this.onStateChange(newState, oldState, reason, packet);
                } catch (e) {
                    logger.logError("invoke onStateChange error. " + e.message);
                }
            }
        }
    }

    private pollingChecker() {
        if (!this.checkAlive() && this.matchState(CLIENT_STATE.CONNECTED, CLIENT_STATE.CONNECTING)) {
            logger.logWarn("keep-alive timeout.");
            this.ws.close();
        } else if (this.matchState(CLIENT_STATE.CONNECTED) && this.needPing()) {
            this.sendPingReq();
            console.log('keeping alive...')
        }
        this.faultTimeoutFuture();
    }

    private faultTimeoutFuture(): void {
        this.futures.each((packetId, future) => {
            if (future.isTimeout()) {
                this.futures.remove(packetId);
                future.fault("timeout");
            }
        });
    }

    private checkAlive(): boolean {
        return Date.now() <= this.deadLine;
    }

    private updateDeadLine(keepAlive?: number): void {
        this.deadLine = Date.now() + ((keepAlive || this.option.keepAlive || Config.DEFAULT_KEEP_ALIVE) * 1500);
    }

    private needPing(): boolean {
        return !this.waittingPingResp && Date.now() > this.pingLine;
    }

    private updatePingLine(keepAlive?: number): void {
        this.pingLine = Date.now() + ((keepAlive || this.option.keepAlive || Config.DEFAULT_KEEP_ALIVE) * 1000);
    }

    sendConnect(option: ConnectPacket, callback: (success, ackPacket, reason) => void, logonType) {
        let xx = null
        if (logonType == 0) { // 0: 密码登录 1:token登录
            xx = new CinWEBIMConnectPacket(option)
            this.send<CinWEBIMConnectAckPacket>(xx, callback);
        }else if (logonType == 1) { // 0: 密码登录 1:token登录
            this.send<CinWEBIMTokenConnectAckPacket>(new CinWEBIMTokenConnectPacket(option), callback);
        }
        else if (logonType == 2) { //2: 扫码登陆
            xx = new CinWEBIMQrcodePacket(option);
            this.send<CinWEBIMQrcodeAckPacket>(xx, callback);
        }
    }

    sendPingReq() {
        this.waittingPingResp = true;
        let options = {
            from: App.loginUserId
        };
        this.send<PingRespPacket>(new PingReqPacket(options), (success, ackPacket, reason) => {
            if (!success) {
                this.close(reason);
                this.waittingPingResp = false;
            } else {
                this.waittingPingResp = false;
                if (ackPacket.transferToken) {
                    App.transferToken = ackPacket.transferToken;
                }
                if (ackPacket.dtcurl) {
                    App.dtcurl = ackPacket.dtcurl;
                }
            }
        });
    }

    /**
     * 发送一个指定内容类型的Publish报文
     * @param messageType 消息类型
     * @param content 报文内容
     * @param callback 发送完成后的回调
     */
    publish(packet: PublishPacket | PubAckPacket, callback?: (success: boolean, ack: PubAckPacket, reason: string) => void): void {

        logger.logDebug("SEND MESSAGE", packet);
        this.send<PubAckPacket>(packet, callback && ((success, ack, reason) => {
            if (success) {
                callback(success, <any>ack as PubAckPacket, reason);
            } else {
                callback(false, null, reason);
            }
        }));
    }

    send<T>(packet: CinPacket, callback?: (success: boolean, ack: T, reason: string) => void): void {
        if (!this.matchState(CLIENT_STATE.CONNECTED)
            && !(this.matchState(CLIENT_STATE.CONNECTING) && packet.is(PACKET_TYPE.CONNECT))
            && !(this.matchState(CLIENT_STATE.CLOSING) && packet.is(PACKET_TYPE.DISCONNECT))) {
            if (callback) {
                callback(false, null, "client is not connected. send packet canceled.");
            }
            return;
        }
        if (packet.isAck()) { // send response
            let respPacket = (<CinResponsePacket>packet);
            let method = respPacket.method;
            let event = respPacket.event;
            let respId = method + "_response_" + event;
            let respTemplate = TemplateManager.getTemplate(respId, "up").define;
            if (respPacket.isHighQos() && respTemplate["Headers"]["CallId"]) {
                let index = respTemplate["Headers"]["CallId"]["index"];
                let alias = respTemplate["Headers"]["CallId"]["Alias"];
                let indexTmpl;
                let indexAlias;
                if (index && (indexTmpl = respTemplate["Headers"][index]) && (indexAlias = respTemplate["Headers"][index]["Alias"]) && respPacket[indexAlias]) {
                    respPacket.packetId = respPacket[indexAlias];
                } else if (alias && respPacket[alias]) {
                    respPacket.packetId = respPacket[alias];
                }
            }
            logger.logDebug(`SEND "${PACKET_TYPE[packet.getType()]}" PACKET`, packet);
            let sendMsg: CinResponseMessage = respPacket.toCinMessage();
            if (this.option.binary) {
                let contents = sendMsg.toBytes();
                this.ws.send(contents);
            } else {
                let contents = sendMsg.toJson();
                this.ws.send(JSON.stringify(contents));
            }
        } else { // send request
            let reqPacket = (<CinRequestPacket>packet);
            let method = reqPacket.method;
            let event = reqPacket.event;
            let respId = method + "_response_" + event;
            let respTemplate = TemplateManager.getTemplate(respId, "down").define;
            let reqId = method + "_request_" + event;
            let reqTemplate = TemplateManager.getTemplate(reqId, "up").define;
            let timeout = this.option.keepAlive || Config.DEFAULT_PACKET_TIMEOUT;
            if (reqPacket.isHighQos() && respTemplate) {
                let pId;
                if (this.option.binary
                    && reqTemplate["Headers"]["CallId"]
                    && respTemplate["Headers"]["CallId"]) { // cmp
                    pId = null;
                } else { // wcmp
                    // if (reqTemplate["Headers"]["CallId"]) { // 后端设计了
                    //     pId = null; // 默认采用WcmpInfo方式
                    //     let index = reqTemplate["Headers"]["CallId"]["index"];
                    //     if (index) {
                    //         let indexTmpl = reqTemplate["Headers"][index];
                    //         if (indexTmpl) {
                    //             let indexAlias = indexTmpl["Alias"];
                    //             if (reqPacket[indexAlias]) { // 采用业务字段兼职
                    //                 pId = reqPacket[indexAlias];
                    //             }
                    //         }
                    //     }
                    // } else { // 功能设计有缺失，只能使用reqId（针对wcmp设计问题，cmp应该无此问题）
                    //     pId = reqId;
                    // }
                }
                this.futures.createFuture<T>(this.ws, reqPacket, timeout, callback, pId, respId);
            }
            logger.logDebug(`SEND "${PACKET_TYPE[packet.getType()]}" PACKET`, packet);
            let sendMsg: CinRequestMessage = reqPacket.toCinMessage();
            if (this.option.binary) {
                let contents = sendMsg.toBytes();
                this.ws.send(contents);
            } else {
                let contents = sendMsg.toJson();
                this.ws.send(JSON.stringify(contents));
            }
        }
    }

    parseData(data: string | ArrayBuffer, direction: string = "down"): CinPacket {
        if (typeof data === "string") { // wcmp
            let input = JSON.parse(data);
            let method = input["Method"];
            let event = input["Event"];
            let packetId = input["UUID"];
            if (input["Response"]) {
                let respId = method + "_response_" + event;
                if (!TemplateManager.getTemplate(respId, direction)) {
                    console.warn("无法解析接收到的未定义数据包：" + respId);
                    return null;
                }
                let cinRespMsg: CinResponseMessage = new CinResponseMessage();
                cinRespMsg.fromJson(input, direction);
                return cinRespMsg.toPacket(direction);
            } else {
                let reqId = method + "_request_" + event;
                if (!TemplateManager.getTemplate(reqId, direction)) {
                    console.warn("无法解析接收到的未定义数据包：" + reqId);
                    return null;
                }
                let cinReqMsg: CinRequestMessage = new CinRequestMessage();
                cinReqMsg.fromJson(input, direction);
                return cinReqMsg.toPacket(direction);
            }
        } else { // cmp
            let input = new Uint8Array((<ArrayBuffer>data));
            if (CinResponseMessage.isResponse(input)) {
                let cinRespMsg: CinResponseMessage = new CinResponseMessage();
                cinRespMsg.fromBytesByResonse(input, this.futures);
                return cinRespMsg.toPacket(direction);
            } else {
                let cinReqMsg: CinRequestMessage = new CinRequestMessage();
                cinReqMsg.fromBytes(input);
                return cinReqMsg.toPacket(direction);
            }
        }
    }

    private receivePacket(data: string | ArrayBuffer): CinPacket {
        let packet: CinPacket = this.parseData(data);
        if (!packet) {
            return null;
        }

        logger.logDebug(`RECEIVE "${PACKET_TYPE[packet.getType()]}" PACKET`, packet);
        this.updateDeadLine();
        this.updatePingLine();
        // try {
            this.processPacket(packet);
        // } catch (e) {
        //     logger.logError(`process packet error. ${e.message}`, packet);
        // }
        return packet;
    }

    private processPacket(packet: CinPacket): void {
        switch (packet.getType()) {
            case PACKET_TYPE.DISCONNECT:
                logger.logWarn("receive disconnect!", packet);
                this.ws.close();
                this.changeState(null,
                    CLIENT_STATE.DISCONNECTED,
                    `DISCONNECT`,
                    packet);
                //
                break;
            default:
                if (packet.isAck()) { // response
                    let future;
                    let packetId = (<CinResponsePacket>packet).packetId;
                    if (future = this.futures.popup(packetId)) {
                        let result;
                        if (packet.getType() === PACKET_TYPE.PUBACK) {
                            result = {
                                response: (<CinResponsePacket>packet).response,
                                data: (<CinResponsePacket>packet).toObject()
                            };
                        } else {
                            result = packet;
                        }
                        future.success(result);
                    }
                } else {
                    if (packet.isHighQos()) {
                        // try {
                        //     this.send(packet.buildAckPacket());
                        // } catch (e) {
                        //     logger.logError("send ack packet error. " + e.message, packet);
                        // }
                    }
                    if (this.onPacket) { // request
                        // try {
                            this.onPacket(packet);
                        // } catch (e) {
                        //     logger.logError("process packet error. " + e.message, packet);
                        // }
                    }
                }
                break;
        }
    }
}
