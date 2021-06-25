import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE, PACKET_TYPE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";
import { App } from "../../../base-sdk/src/App";
import { Client } from "../../../base-sdk/src/Client";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";

const SERVICE_EVENT_CODE = 0x21;

let decodeReceiveStatus = function (object) {
    object.isMuted = object.status & 0x01;
    object.isCopied = object.status & 0x02;
    object.isArrived = object.status & 0x08;
    object.isRemoved = object.status & 0x10;
    object.isRevoked = object.status & 0x20;
    delete object.status;
};

class CinMsgImmunityPacket extends PublishPacket {
    method: string = METHOD_NAME.service;
    event: number = SERVICE_EVENT_CODE;
    from: number; // 发送方
    type: number;
    dateTime: number;
    expire: number;

    constructor(object: {
        from: number,
        type: number,
        dateTime: number,
        expire: number
    }) {
        super();
        this.from = object.from;
        this.type = object.type;
        this.dateTime = object.dateTime;
        this.expire = object.expire;
    }
}

class CinMsgImmunityAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;

    toObject(): {
        from: number;
    } {
        let object = super.toObject();
        decodeReceiveStatus(object);
        return object;
    }
}
let msgImmunityReqId = METHOD_NAME.service + "_request_" + SERVICE_EVENT_CODE + "_up";
let msgImmunityRespId = METHOD_NAME.service + "_response_" + SERVICE_EVENT_CODE + "_down";

TemplateManager.registerTemplate(msgImmunityReqId, "MessageImmunityRequest");
TemplateManager.registerTemplate(msgImmunityRespId, "MessageImmunityResponse");

PacketManager.setDefine(msgImmunityReqId, CinMsgImmunityPacket);
PacketManager.setDefine(msgImmunityRespId, CinMsgImmunityAckPacket);

export {
    CinMsgImmunityPacket,
    CinMsgImmunityAckPacket
};