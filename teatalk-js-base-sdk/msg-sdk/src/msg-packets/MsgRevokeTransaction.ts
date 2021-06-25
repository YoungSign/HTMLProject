import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE, PACKET_TYPE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";
import { App } from "../../../base-sdk/src/App";
import { Client } from "../../../base-sdk/src/Client";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";

const MESSAGE_EVENT_CODE = 0x6A;

let decodeReceiveStatus = function (object) {
    object.isMuted = object.status & 0x01;
    object.isCopied = object.status & 0x02;
    object.isArrived = object.status & 0x08;
    object.isRemoved = object.status & 0x10;
    object.isRevoked = object.status & 0x20;
    delete object.status;
};

class CinMsgRevokePacket extends PublishPacket {
    method: string = METHOD_NAME.message;
    event: number = MESSAGE_EVENT_CODE;
    from: number; // 发送方
    friUserId: number;
    msgType: number;
    version: number;

    /**
     * data object transfer to packet entity
     * @param object
     * object.from
     * object.type
     * object.conversation
     */
    constructor(object: {
        from: number,
        friUserId: number,
        msgType: number,
        version: number
    }) {
        super();
        this.from = object.from;
        this.friUserId = object.friUserId;
        this.msgType = object.msgType;
        this.version = object.version;
    }
}

class CinMsgRevokeAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;
    friUserId: number;

    toObject(): {
        from: number;
        friUserId: any;
    } {
        let object = super.toObject();
        decodeReceiveStatus(object);
        return object;
    }
}
let msgRecokeReqId = METHOD_NAME.message + "_request_" + MESSAGE_EVENT_CODE + "_up";
let msgRevokeRespId = METHOD_NAME.message + "_response_" + MESSAGE_EVENT_CODE + "_down";
TemplateManager.registerTemplate(msgRecokeReqId, "MessageRevokeRequest");
TemplateManager.registerTemplate(msgRevokeRespId, "MessageRevokeResponse");
PacketManager.setDefine(msgRecokeReqId, CinMsgRevokePacket);
PacketManager.setDefine(msgRevokeRespId, CinMsgRevokeAckPacket);

export {
    CinMsgRevokePacket,
    CinMsgRevokeAckPacket
};