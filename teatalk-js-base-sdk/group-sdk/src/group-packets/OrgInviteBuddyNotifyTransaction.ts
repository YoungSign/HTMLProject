import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE, PACKET_TYPE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";
import { App } from "../../../base-sdk/src/App";
import { Client } from "../../../base-sdk/src/Client";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";

const ORGANIZE_EVENT_CODE = 0x10;

let encodeSendStatus = function (object) {
    let isMass = Array.isArray(object.to) ? 0x04 : 0x00;
    let isReSend = object.messageId ? 0x20 : 0x00;
    return isMass | isReSend;
};
class CinOrgInviteBuddyNotifyPacket extends PublishPacket {
    method: string = METHOD_NAME.organize;
    event: number = ORGANIZE_EVENT_CODE;
    from: number; // 发送方
    to: number; // 接收方
    inviteUserId: number | number[]; // 发起邀请好友userid
    inviteName: string; // 发起邀请好友用户名
    orgName: string; //群组名称
    maxNum: number; // 群组max

    toObject(): {
        from: number,
        to: number,
        inviteUserId: number | number[],
        inviteName: string,
        orgName: string,
        maxNum: number
    } {
        let object = super.toObject();
        return object;
    }
}

let OrgInviteBuddyNotifyReqId = METHOD_NAME.organize + "_request_" + ORGANIZE_EVENT_CODE + "_down";
TemplateManager.registerTemplate(OrgInviteBuddyNotifyReqId, "OrgInviteBuddyNotifyRequest");
PacketManager.setDefine(OrgInviteBuddyNotifyReqId, CinOrgInviteBuddyNotifyPacket);

export {
    CinOrgInviteBuddyNotifyPacket,
};