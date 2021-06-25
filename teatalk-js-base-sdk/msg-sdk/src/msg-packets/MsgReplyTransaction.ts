import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE, PACKET_TYPE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const MESSAGE_EVENT_CODE = 0;

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

class CinMsgReplyAckPacket extends PublishPacket {
    method: string = METHOD_NAME.reply;
    event: number = MESSAGE_EVENT_CODE;
    from: number; // 发送方
    userId: number;
    serverData: number;
    friUserId: number;
    dateTime: number

    toObject(): {
        from: number,
        userId: number,
        serverData: number,
        friUserId: number,
        dateTime: number
    } {
        let object = super.toObject();
        return object;
    }
}

let MsgReplyReqId = METHOD_NAME.reply + "_request_" + MESSAGE_EVENT_CODE + "_down";
TemplateManager.registerTemplate(MsgReplyReqId, "MessageReplyRequest");
PacketManager.setDefine(MsgReplyReqId, CinMsgReplyAckPacket);

export {
    CinMsgReplyAckPacket
};