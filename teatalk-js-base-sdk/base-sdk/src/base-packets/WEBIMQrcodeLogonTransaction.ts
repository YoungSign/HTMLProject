/**
 * Created by H5 on 2020/3/3.
 */
import { METHOD_NAME, PACKET_TYPE, CONNACK_RETURN_CODE } from "../Constant";
import { CinSubPacket } from "../cin/CinSubPacket";
import { CinRequestPacket } from "../cin/CinRequestPacket";
import { CinResponsePacket } from "../cin/CinResponsePacket";
import { TemplateManager } from "../TemplateManager";
import { PacketManager } from "../PacketManager";

const LOGON_EVENT_CODE = 0x04;

class CinWEBIMQrcodeConnectPacket extends CinRequestPacket {
    method: string = METHOD_NAME.qrcode;
    event: number = LOGON_EVENT_CODE;
    // from: number;
    // channel: number;
    // type: number;
    // status: number;
    // credential: number;
    qrcode: string;


    constructor(options: any) {
        super();
        this.qrcode = options.qrcode;
        // this.from = options.from;
        // this.channel = options.channel;
        // this.type = options.type;
        // this.status = options.status;
        // this.credential = options.credential
        // this.password = options.password; // token登录

    }

    getType(): PACKET_TYPE {
        return PACKET_TYPE.CONNECT;
    }
}

// class CinWEBIMQrcodeConnectInfoSubPacket extends CinSubPacket {
//     method: string = METHOD_NAME.service;
//     fpid: string;
//     userAgent: string; // 浏览器类型
//     clientIp: string; // 客户端IP

//     constructor(options: any = {}) {
//         super();
//         this.fpid = options.fpid || "";
//         this.userAgent = options.userAgent || "";
//         this.clientIp = options.clientIp || "";
//     }
// }

class CinWEBIMQrcodeConnectAckPacket extends CinResponsePacket implements QrcodeConnAckPacket {
    response: CONNACK_RETURN_CODE;
    userId: number;
    transferToken: string;
    dtcurl: string;
    eutinterfaceurl: string;
    videourl: string;
    status: number;
    channel_id: number;

    getType(): PACKET_TYPE {
        return PACKET_TYPE.CONNACK;
    }
}

interface QrcodeConnAckPacket {
    response: CONNACK_RETURN_CODE;
}

let reqId = METHOD_NAME.qrcode + "_request_" + LOGON_EVENT_CODE;
let respId = METHOD_NAME.qrcode + "_response_" + LOGON_EVENT_CODE;

TemplateManager.registerTemplate(reqId, "WEBIMQrcodeLogonRequest");
TemplateManager.registerTemplate(respId, "WEBIMQrcodeLogonResponse");
PacketManager.setDefine(reqId, CinWEBIMQrcodeConnectPacket);
PacketManager.setDefine(respId, CinWEBIMQrcodeConnectAckPacket);

export {
    CinWEBIMQrcodeConnectPacket,
    CinWEBIMQrcodeConnectAckPacket,
};
