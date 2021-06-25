/**
 * Created by H5 on 2020/3/3.
 */
import { METHOD_NAME, PACKET_TYPE, CONNACK_RETURN_CODE } from "../Constant";
import { CinSubPacket } from "./../cin/CinSubPacket";
import { CinRequestPacket } from "./../cin/CinRequestPacket";
import { CinResponsePacket } from "./../cin/CinResponsePacket";
import { TemplateManager } from "./../TemplateManager";
import { PacketManager } from "./../PacketManager";
// import md5 = require("md5");

const LOGON_EVENT_CODE = 145;

class CinWEBIMTokenConnectPacket extends CinRequestPacket implements TokenConnectPacket {
    method: string = METHOD_NAME.service;
    event: number = LOGON_EVENT_CODE;
    from: number;
    name: string; // 用户名
    wcmpInfo: number;
    password: string; // 密码
    channel: number;
    type: number;
    status: number;
    credential: number;
    info: CinWEBIMTokenConnectInfoSubPacket;

    constructor(options: any) {
        super();
        this.from = options.from;
        this.name = options.name;
        this.channel = options.channel;
        this.type = options.type;
        this.status = options.status;
        // this.password = md5(options.password); // 账号密码登陆md5加密
        this.password = options.password; // token登录
        this.wcmpInfo =  1;
        this.info = new CinWEBIMTokenConnectInfoSubPacket(options.info);
    }

    getType(): PACKET_TYPE {
        return PACKET_TYPE.CONNECT;
    }
}

class CinWEBIMTokenConnectInfoSubPacket extends CinSubPacket {
    method: string = METHOD_NAME.service;
    fpid: string;
    userAgent: string; // 浏览器类型
    clientIp: string; // 客户端IP

    constructor(options: any = {}) {
        super();
        this.fpid = options.fpid || "";
        this.userAgent = options.userAgent || "";
        this.clientIp = options.clientIp || "";
    }
}

class CinWEBIMTokenConnectAckPacket extends CinResponsePacket implements TokenConnAckPacket {
    response: CONNACK_RETURN_CODE;
    userId: number;
    transferToken: string;
    dtcurl: string;
    eutinterfaceurl: string
    videourl: string

    getType(): PACKET_TYPE {
        return PACKET_TYPE.CONNACK;
    }
}

interface TokenConnectPacket {
    name: string;
    password: string;
    channel: number;
    wcmpInfo: number;
    type: number;
    status: number,
    credential: number,
    keepAlive?: number;
    info: ConnectInfoPacket;
}

interface ConnectInfoPacket {
    fpid: string;
    userAgent: string;
    clientIp: string;

}

interface TokenConnAckPacket {
    response: CONNACK_RETURN_CODE;
}

let reqId = METHOD_NAME.service + "_request_" + LOGON_EVENT_CODE;
let respId = METHOD_NAME.service + "_response_" + LOGON_EVENT_CODE;

TemplateManager.registerTemplate(reqId, "WEBIMTokenLogonRequest");
TemplateManager.registerTemplate(respId, "WEBIMTokenLogonResponse");
PacketManager.setDefine(reqId, CinWEBIMTokenConnectPacket);
PacketManager.setDefine(respId, CinWEBIMTokenConnectAckPacket);
PacketManager.setDefine("WEBIMTokenLogonRequestInfo", CinWEBIMTokenConnectInfoSubPacket);

export {
    CinWEBIMTokenConnectPacket,
    CinWEBIMTokenConnectAckPacket,
    TokenConnectPacket,
    TokenConnAckPacket
};
