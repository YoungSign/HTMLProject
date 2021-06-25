import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE, PACKET_TYPE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const SOCIAL_EVENT_CODE = 0x05;

let encodeSendStatus = function (object) {
    let isMass = Array.isArray(object.to) ? 0x04 : 0x00;
    let isReSend = object.messageId ? 0x20 : 0x00;
    return isMass | isReSend;
};

class CinDeleteFriendNotifyAckPacket extends PublishPacket {
    method: string = METHOD_NAME.socialNotify;
    event: number = SOCIAL_EVENT_CODE;
    from: number; // 系统通知
    to: number; // userId
    friendUserId: number; // 删除方

    toObject(): {
        from: number,
        to: number,
        friendUserId: number
    } {
        let object = super.toObject();
        return object;
    }
}

let DeleteFriendNotifyReqId = METHOD_NAME.socialNotify + "_request_" + SOCIAL_EVENT_CODE + "_down";
TemplateManager.registerTemplate(DeleteFriendNotifyReqId, "DeleteFriendNotifyRequest");
PacketManager.setDefine(DeleteFriendNotifyReqId, CinDeleteFriendNotifyAckPacket);

export {
    CinDeleteFriendNotifyAckPacket
};