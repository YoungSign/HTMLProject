import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE, PACKET_TYPE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const SOCIAL_EVENT_CODE = 0x04;

let encodeSendStatus = function (object) {
    let isMass = Array.isArray(object.to) ? 0x04 : 0x00;
    let isReSend = object.messageId ? 0x20 : 0x00;
    return isMass | isReSend;
};

class CinApproveAddFriNotifyAckPacket extends PublishPacket {
    method: string = METHOD_NAME.socialNotify;
    event: number = SOCIAL_EVENT_CODE;
    from: number; // 系统通知
    userId: number; // userId
    friendUserId: number; // 同意方id
    friendUserName: string; // 同意方昵称
    DateTime: number; // 时间戳

    toObject(): {
        from: number,
        friendUserId: number,
        userId: number,
        friendUserName: string,
        DateTime: number,
    } {
        let object = super.toObject();
        return object;
    }
}

let ApproveAddFriNotifyReqId = METHOD_NAME.socialNotify + "_request_" + SOCIAL_EVENT_CODE + "_down";
TemplateManager.registerTemplate(ApproveAddFriNotifyReqId, "ApproveAddFriNotifyRequest");
PacketManager.setDefine(ApproveAddFriNotifyReqId, CinApproveAddFriNotifyAckPacket);

export {
    CinApproveAddFriNotifyAckPacket
};