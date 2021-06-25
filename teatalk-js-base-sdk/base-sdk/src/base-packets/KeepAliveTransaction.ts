/**
 * Created by H5 on 2020/3/3.
 */
import { METHOD_NAME, PACKET_TYPE } from "./../Constant";
import { CinRequestPacket } from "./../cin/CinRequestPacket";
import { CinResponsePacket } from "./../cin/CinResponsePacket";
import { TemplateManager } from "../TemplateManager";
import { PacketManager } from "../PacketManager";

const KEEPALIVE_EVENT_CODE = 0x04;

class PingReqPacket extends CinRequestPacket {
    method: string = METHOD_NAME.logon;
    event: number = KEEPALIVE_EVENT_CODE;
    from: number;
    status: number;

    constructor(options: any = {}) {
        super();
        this.from = options.from;
        this.status = options.status || 1;
    }

    getType(): PACKET_TYPE {
        return PACKET_TYPE.PINGREQ;
    }
}

class PingRespPacket extends CinResponsePacket {
    from: number;
    expire: number;
    transferToken: string;
    dtcurl: string;

    getType(): PACKET_TYPE {
        return PACKET_TYPE.PINGRESP;
    }
}

let reqId = METHOD_NAME.logon + "_request_" + KEEPALIVE_EVENT_CODE;
let respId = METHOD_NAME.logon + "_response_" + KEEPALIVE_EVENT_CODE;

TemplateManager.registerTemplate(reqId, "KeepAliveRequest");
TemplateManager.registerTemplate(respId, "KeepAliveResponse");
PacketManager.setDefine(reqId, PingReqPacket);
PacketManager.setDefine(respId, PingRespPacket);

export {
    PingReqPacket,
    PingRespPacket
};