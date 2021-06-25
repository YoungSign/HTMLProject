import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE, PACKET_TYPE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";
import { App } from "../../../base-sdk/src/App";
import { Client } from "../../../base-sdk/src/Client";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";

const SERVICE_EVENT_CODE = 0x63;

let decodeReceiveStatus = function (object) {
    object.isMuted = object.status & 0x01;
    object.isCopied = object.status & 0x02;
    object.isArrived = object.status & 0x08;
    object.isRemoved = object.status & 0x10;
    object.isRevoked = object.status & 0x20;
    delete object.status;
};

class CinMsgCollectionDeletePacket extends PublishPacket {
    method: string = METHOD_NAME.service;
    event: number = SERVICE_EVENT_CODE;
    from: number; // 发送方
    keyId: number;

    constructor(object: {
        from: number,
        keyId: number,
    }) {
        super();
        this.from = object.from;
        this.keyId = object.keyId;
    }
}

class CinMsgCollectionDeleteAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;
    version: number;

    toObject(): {
        from: number;
        version: number;
    } {
        let object = super.toObject();
        decodeReceiveStatus(object);
        return object;
    }
}
let msgCollectionDeleteReqId = METHOD_NAME.service + "_request_" + SERVICE_EVENT_CODE + "_up";
let msgCollectionDeleteRespId = METHOD_NAME.service + "_response_" + SERVICE_EVENT_CODE + "_down";

TemplateManager.registerTemplate(msgCollectionDeleteReqId, "MessageCollectionDeleteRequest");
TemplateManager.registerTemplate(msgCollectionDeleteRespId, "MessageCollectionDeleteResponse");

PacketManager.setDefine(msgCollectionDeleteReqId, CinMsgCollectionDeletePacket);
PacketManager.setDefine(msgCollectionDeleteRespId, CinMsgCollectionDeleteAckPacket);

export {
    CinMsgCollectionDeletePacket,
    CinMsgCollectionDeleteAckPacket
};