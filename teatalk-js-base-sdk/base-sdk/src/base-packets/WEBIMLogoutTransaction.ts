/**
 * Created by H5 on 2020/3/3.
 */
import { METHOD_NAME, PACKET_TYPE, CONNACK_RETURN_CODE } from "../Constant";
import { CinSubPacket } from "./../cin/CinSubPacket";
import { CinRequestPacket } from "./../cin/CinRequestPacket";
import { CinResponsePacket } from "./../cin/CinResponsePacket";
import { TemplateManager } from "./../TemplateManager";
import { PacketManager } from "./../PacketManager";

const LOGON_EVENT_CODE = 0x05;

class CinWEBIMLogoutPacket extends CinRequestPacket {
    method: string = METHOD_NAME.logon;
    event: number = LOGON_EVENT_CODE;
    from: number;

    constructor(options: any) {
        super();
        this.from = options.from;
    }
    getType(): PACKET_TYPE {
        return PACKET_TYPE.CONNECT;
    }
}

class CinWEBIMLogoutAckPacket extends CinResponsePacket implements ConnAckPacket {
    response: CONNACK_RETURN_CODE;
    userId: number;
    transferToken: string;

    getType(): PACKET_TYPE {
        return PACKET_TYPE.CONNACK;
    }
}

interface ConnectPacket {
    name: string;
    password: string;
    channel: number;
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
TemplateManager.registerTemplate(respId, "WEBIMLogonRequestInfo");
PacketManager.setDefine(reqId, CinWEBIMLogoutPacket);
PacketManager.setDefine(respId, CinWEBIMLogoutAckPacket);

export {
    CinWEBIMLogoutPacket,
    CinWEBIMLogoutAckPacket,
};
