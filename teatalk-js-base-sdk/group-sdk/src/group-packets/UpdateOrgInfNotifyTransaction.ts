import { PublishPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const ORGANIZE_EVENT_CODE = 17;

class CinUpdateOrgInfNotifyPacket extends PublishPacket {
    method: string = METHOD_NAME.organize;
    event: number = ORGANIZE_EVENT_CODE;
    from: number; // 发送方
    to: number; // 接收方
    sourceUserId: number;
    modifierName: string; // 修改者名字
    orgName: string; //群组名称
    version: number; //群最新版本号
    type: number; // 加入方式 1:邀请加入；2:搜索加入
    orgMaxMembers: number; // 群组成员上限

    toObject(): {
        from: number;
        to: number;
        sourceUserId: number;
        modifierName: string;
        orgName: string;
        version: number;
        type: number;
        orgMaxMembers: number;
    } {
        let object = super.toObject();
        return object;
    }
}

let UpdateOrgInfNotifyReqId = METHOD_NAME.organize + "_request_" + ORGANIZE_EVENT_CODE + "_down";
TemplateManager.registerTemplate(UpdateOrgInfNotifyReqId, "UpdateOrgInfNotifyReq");
PacketManager.setDefine(UpdateOrgInfNotifyReqId, CinUpdateOrgInfNotifyPacket);

export {
    CinUpdateOrgInfNotifyPacket
};