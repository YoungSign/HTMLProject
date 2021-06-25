import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE, PACKET_TYPE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const SOCIAL_EVENT_CODE = 0x6A;

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

class CinMsgRevokeNotifyAckPacket extends PublishPacket {
    method: string = METHOD_NAME.msgNotify;
    event: number = SOCIAL_EVENT_CODE;
    from: number; // 发送方
    friUserId: number; // 接收方
    version: number

    toObject(): {
        from: number,
        friUserId: number,
        version: number
    } {
        let object = super.toObject();
        return object;
    }
}

let MsgRevokeNotifyReqId = METHOD_NAME.msgNotify + "_request_" + SOCIAL_EVENT_CODE + "_down";
TemplateManager.registerTemplate(MsgRevokeNotifyReqId, "MsgRevokeNotifyResponse");
PacketManager.setDefine(MsgRevokeNotifyReqId, CinMsgRevokeNotifyAckPacket);

export {
    CinMsgRevokeNotifyAckPacket
};