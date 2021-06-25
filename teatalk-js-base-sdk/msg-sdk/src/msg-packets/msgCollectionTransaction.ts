import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";
import { generateUUID, hextoString } from "../../../base-sdk/src/util/utils";
import { encode as encodeContent } from "./body/msgBodyParser";
import { App } from "../../../base-sdk/src/App";

const SERVICE_EVENT_CODE = 0x62;
let encodeSendStatus = function (object) {
    let isMass = Array.isArray(object.to) ? 0x04 : 0x00;
    let isReSend = object.messageId ? 0x20 : 0x00;
    return isMass | isReSend;
};

let decodeReceiveStatus = function (object) {
    object.isMuted = object.status & 0x01;
    object.isCopied = object.status & 0x02;
    object.isArrived = object.status & 0x08;
    object.isRemoved = object.status & 0x10;
    object.isRevoked = object.status & 0x20;
    delete object.status;
};

class CinMsgCollectPacket extends PublishPacket {
    method: string = METHOD_NAME.service;
    event: number = SERVICE_EVENT_CODE;
    from: number; 
    byte: number;
    message: any;

    constructor(object: {
        from: number;
        byte: number;
        message: any;
    }) {
        super();
        this.from = object.from;
        this.byte = object.byte;
        this.message = object.message;
    }
}

class CinMsgCollectAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;
    version: number;
    msgId: number;
    dateTime: number;
    msgnum: number;
    status: number;
    toObject(): {
        from: number;
        version: number;
        msgId: number;
        dateTime: number;
        msgnum: number;
        status: number;
    } {
        let object = super.toObject();
        decodeReceiveStatus(object);
        return object;
    }
} 

let msgCollectReqId = METHOD_NAME.service + "_request_" + SERVICE_EVENT_CODE + "_up";
let msgCollectRespId = METHOD_NAME.service + "_response_" + SERVICE_EVENT_CODE + "_down";

TemplateManager.registerTemplate(msgCollectReqId, "MessageCollectRequest");
TemplateManager.registerTemplate(msgCollectRespId, "MessageCollectResponse");

PacketManager.setDefine(msgCollectReqId, CinMsgCollectPacket);
PacketManager.setDefine(msgCollectRespId, CinMsgCollectAckPacket);

export {
    CinMsgCollectPacket,
    CinMsgCollectAckPacket
};
