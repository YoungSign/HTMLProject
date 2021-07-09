/**
 * Created by H5 on 2020/3/3.
 */
import { METHOD_NAME, PACKET_TYPE, CONNACK_RETURN_CODE } from "../Constant";
import { CinSubPacket } from "./../cin/CinSubPacket";
import { CinRequestPacket } from "./../cin/CinRequestPacket";
import { CinResponsePacket } from "./../cin/CinResponsePacket";
import { TemplateManager } from "./../TemplateManager";
import { PacketManager } from "./../PacketManager";

const LOGON_EVENT_CODE = 0x01;

class CinWEBIMQrcodePacket extends CinRequestPacket implements QrcodeConnectPacket {
    method: string = METHOD_NAME.qrcode;
    event: number = LOGON_EVENT_CODE;
    from: number;
    wcmpInfo: number;
    channel: number;
    type: number;
    status: number;
    credential: number;
    info: CinWEBIMQrcodeConnectInfoSubPacket;

    constructor(options: any) {
        super();
        this.from = options.from;
        this.channel = options.channel;
        this.type = options.type;
        this.status = options.status;
        this.wcmpInfo = 1;
        this.info = new CinWEBIMQrcodeConnectInfoSubPacket(options.info);
    }

    getType(): PACKET_TYPE {
        return PACKET_TYPE.CONNECT;
    }
}

class CinWEBIMQrcodeConnectInfoSubPacket extends CinSubPacket {
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

class CinWEBIMQrcodeAckPacket extends CinResponsePacket implements QrcodeConnAckPacket {
    response: CONNACK_RETURN_CODE;
    //  userId: number;
    transferToken: string;
    codeUrl: string;
    message: string

    getType(): PACKET_TYPE {
        return PACKET_TYPE.CONNACK;
    }
}

interface QrcodeConnectPacket {
    //  name: string;
    //  password: string;
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

interface QrcodeConnAckPacket {
    response: CONNACK_RETURN_CODE;
}

let reqId = METHOD_NAME.qrcode + "_request_" + LOGON_EVENT_CODE;
let respId = METHOD_NAME.qrcode + "_response_" + LOGON_EVENT_CODE;

TemplateManager.registerTemplate(reqId, "WEBIMQrcodeRequest");
TemplateManager.registerTemplate(respId, "WEBIMQrcodeResponse");
PacketManager.setDefine(reqId, CinWEBIMQrcodePacket);
PacketManager.setDefine(respId, CinWEBIMQrcodeAckPacket);
PacketManager.setDefine("WEBIMQrcodeRequestInfo", CinWEBIMQrcodeConnectInfoSubPacket);

export {
    CinWEBIMQrcodePacket,
    CinWEBIMQrcodeAckPacket,
    QrcodeConnectPacket,
    QrcodeConnAckPacket
};
