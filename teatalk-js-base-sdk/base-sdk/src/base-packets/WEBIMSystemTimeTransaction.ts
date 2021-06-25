/**
 * Created by H5 on 2020/3/3.
 */
import { METHOD_NAME, PACKET_TYPE, CONNACK_RETURN_CODE } from "../Constant";
import { PublishPacket, PubAckPacket } from "./PublishTransaction";
import { TemplateManager } from "../TemplateManager";
import { PacketManager } from "../PacketManager";

const LOGON_EVENT_CODE = 0;

class CinWEBIMSystemTimePacket extends PublishPacket {
    method: string = METHOD_NAME.service;
    event: number = LOGON_EVENT_CODE;
    from: number;

    constructor(object: {
        from: number;
    }) {
        super();
        this.from = object.from;
    }
}

class CinWEBIMSystemTimeAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    systemTime: number;
    
    toObject(): {
        systemTime: number;
    } {
        let object = super.toObject();
        return object;
    }
}

let reqId = METHOD_NAME.service + "_request_" + LOGON_EVENT_CODE;
let respId = METHOD_NAME.service + "_response_" + LOGON_EVENT_CODE;

TemplateManager.registerTemplate(reqId, "SystemTimeRequest");
TemplateManager.registerTemplate(respId, "SystemTimeResponse");
PacketManager.setDefine(reqId, CinWEBIMSystemTimePacket);
PacketManager.setDefine(respId, CinWEBIMSystemTimeAckPacket);

export {
    CinWEBIMSystemTimePacket,
    CinWEBIMSystemTimeAckPacket,
};
