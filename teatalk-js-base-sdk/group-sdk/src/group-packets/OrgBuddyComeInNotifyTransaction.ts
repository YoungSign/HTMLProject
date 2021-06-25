import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE, PACKET_TYPE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const ORGANIZE_EVENT_CODE = 0x12;

class CinOrgBuddyComeInNotifyPacket extends PublishPacket {
    method: string = METHOD_NAME.organize;
    event: number = ORGANIZE_EVENT_CODE;
    from: number; // 群id
    to: number; // 接收方userid
    inviteUserId: number; // 发起邀请好友userid
    version: number; // 群最新版本号
    inviteName: string; // 发起邀请好友name
    type: number; // 加群方式：1为邀请加入群 2 通过搜索加入
    addedUserIds: number | number[]; // 新增的userid

    toObject(): {
        from: number,
        to: number,
        inviteUserId: number,
        version: number,
        inviteName: string,
        type: number,
        addedUserIds: number | number[]
    } {
        let object = super.toObject();
        return object;
    }
}

let OrgBuddyComeInNotifyReqId = METHOD_NAME.organize + "_request_" + ORGANIZE_EVENT_CODE + "_down";
TemplateManager.registerTemplate(OrgBuddyComeInNotifyReqId, "OrgBuddyComeInNotifyRequest");
PacketManager.setDefine(OrgBuddyComeInNotifyReqId, CinOrgBuddyComeInNotifyPacket);

export {
    CinOrgBuddyComeInNotifyPacket,
};