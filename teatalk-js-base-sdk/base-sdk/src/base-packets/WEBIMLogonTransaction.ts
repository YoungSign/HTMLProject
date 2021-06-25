/**
 * Created by H5 on 2020/3/3.
 */
import { METHOD_NAME, PACKET_TYPE, CONNACK_RETURN_CODE } from "../Constant";
import { CinSubPacket } from "./../cin/CinSubPacket";
import { CinRequestPacket } from "./../cin/CinRequestPacket";
import { CinResponsePacket } from "./../cin/CinResponsePacket";
import { TemplateManager } from "./../TemplateManager";
import { PacketManager } from "./../PacketManager";
import md5 = require("md5");

const LOGON_EVENT_CODE = 0x10;

class CinWEBIMConnectPacket extends CinRequestPacket implements ConnectPacket {
    method: string = METHOD_NAME.logon;
    event: number = LOGON_EVENT_CODE;
    from: number;
    name: string; // 用户名
    password: string; // 密码
    channel: number;
    type: number;
    status: number;
    credential: number;
    info: CinWEBIMConnectInfoSubPacket;

    constructor(options: any) {
        super();
        this.from = options.from;
        this.name = options.name;
        this.password = md5(options.password); // 账号密码登陆md5加密
        this.channel = options.channel;
        this.type = options.type;
        this.status = options.status;
        this.credential = options.credential
        // this.password = options.password; // token登录
        this.info = new CinWEBIMConnectInfoSubPacket(options.info);
    }

    getType(): PACKET_TYPE {
        return PACKET_TYPE.CONNECT;
    }
}

class CinWEBIMConnectInfoSubPacket extends CinSubPacket {
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

class CinWEBIMConnectAckPacket extends CinResponsePacket implements ConnAckPacket {
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

interface ConnectPacket {
    name: string;
    password: string;
    channel: number;
    type: number;
    status: number
    credential: number;
    keepAlive?: number;
    info: ConnectInfoPacket;
}

interface ConnectInfoPacket {
    fpid: string;
    userAgent: string;
    clientIp: string;

}

interface ConnAckPacket {
    response: CONNACK_RETURN_CODE;
}

let reqId = METHOD_NAME.logon + "_request_" + LOGON_EVENT_CODE;
let respId = METHOD_NAME.logon + "_response_" + LOGON_EVENT_CODE;

TemplateManager.registerTemplate(reqId, "WEBIMLogonRequest");
TemplateManager.registerTemplate(respId, "WEBIMLogonResponse");
PacketManager.setDefine(reqId, CinWEBIMConnectPacket);
PacketManager.setDefine(respId, CinWEBIMConnectAckPacket);
PacketManager.setDefine("WEBIMLogonRequestInfo", CinWEBIMConnectInfoSubPacket);

export {
    CinWEBIMConnectPacket,
    CinWEBIMConnectAckPacket,
    ConnectPacket,
    ConnAckPacket
};
