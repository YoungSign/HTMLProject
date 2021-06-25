import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE, PACKET_TYPE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const ORGANIZE_EVENT_CODE = 0x21;

class CinRefuseJoinOrgNotifyPacket extends PublishPacket {
    method: string = METHOD_NAME.organize;
    event: number = ORGANIZE_EVENT_CODE;
    groupId: number;
    userId: number; // 自己的名称
    refuseUserId: number; // 拒绝方userId
    inviteName: string; // 邀请方名称
    toObject(): {
        groupId: number;
        userId: number;
        refuseUserId: number;
        inviteName: string;
    } {
        let object = super.toObject();
        return object;
    }
}

let RefuseJoinOrgNotifyReqId = METHOD_NAME.organize + "_request_" + ORGANIZE_EVENT_CODE + "_down";
TemplateManager.registerTemplate(RefuseJoinOrgNotifyReqId, "RefuseJoinOrgNotifyRequest");
PacketManager.setDefine(RefuseJoinOrgNotifyReqId, CinRefuseJoinOrgNotifyPacket);

export {
    CinRefuseJoinOrgNotifyPacket
};