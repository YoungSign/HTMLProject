import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE, PACKET_TYPE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const SOCIAL_EVENT_CODE = 0x03;

let encodeSendStatus = function (object) {
    let isMass = Array.isArray(object.to) ? 0x04 : 0x00;
    let isReSend = object.messageId ? 0x20 : 0x00;
    return isMass | isReSend;
};

class CinSocialNotifyAckPacket extends PublishPacket {
    method: string = METHOD_NAME.socialNotify;
    event: number = SOCIAL_EVENT_CODE;
    from: number; // 系统通知
    nickname: string; // 申请人昵称
    friendUserId: number; // 申请人id
    mobileNo: string; //电话号码
    portraitId: string; // 头像id
    dateTime: number; // 时间

    toObject(): {
        from: number,
        nickname: string,
        friendUserId: number,
        mobileNo: string,
        portraitId: string,
        dateTime: number,
    } {
        let object = super.toObject();
        return object;
    }
}

let SocialNotifyReqId = METHOD_NAME.socialNotify + "_request_" + SOCIAL_EVENT_CODE + "_down";
TemplateManager.registerTemplate(SocialNotifyReqId, "SocialNotifyResponse");
PacketManager.setDefine(SocialNotifyReqId, CinSocialNotifyAckPacket);

export {
    CinSocialNotifyAckPacket
};