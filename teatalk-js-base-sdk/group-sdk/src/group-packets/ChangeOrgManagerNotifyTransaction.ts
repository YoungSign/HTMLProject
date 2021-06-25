import { PublishPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const ORGANIZE_EVENT_CODE = 0x2a;

class CinChangeOrgManagerNotifyPacket extends PublishPacket {
    method: string = METHOD_NAME.organize;
    event: number = ORGANIZE_EVENT_CODE;
    from: number; // 发送方
    to: number; // 接收方
    modifiedUserId: number; // 要变更的人员的userid
    type: number; //操作类型 0:新增 1:取消

    toObject(): {
        from: number;
        to: number;
        modifiedUserId: number;
        type: number;
    } {
        let object = super.toObject();
        return object;
    }
}

let ChangeOrgManagerNotifyReqId = METHOD_NAME.organize + "_request_" + ORGANIZE_EVENT_CODE + "_down";
TemplateManager.registerTemplate(ChangeOrgManagerNotifyReqId, "ChangeManagerNotifyReq");
PacketManager.setDefine(ChangeOrgManagerNotifyReqId, CinChangeOrgManagerNotifyPacket);

export {
    CinChangeOrgManagerNotifyPacket
};