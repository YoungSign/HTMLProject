import { PublishPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const ORGANIZE_EVENT_CODE = 22;

class CinOrgChangeCreaterNotifyPacket extends PublishPacket {
    method: string = METHOD_NAME.organize;
    event: number = ORGANIZE_EVENT_CODE;
    from: number; // groupid
    to: number; // 接收者的id
    key: number; // 新群主id
    status: number;

    toObject(): {
        from: number;
        to: number;
        key: number;
        status: number;
    } {
        let object = super.toObject();
        return object;
    }
}

let OrgChangeCreaterNotifyReqId = METHOD_NAME.organize + "_request_" + ORGANIZE_EVENT_CODE + "_down";
TemplateManager.registerTemplate(OrgChangeCreaterNotifyReqId, "OrgChangeCreaterNotifyReq");
PacketManager.setDefine(OrgChangeCreaterNotifyReqId, CinOrgChangeCreaterNotifyPacket);

export {
    CinOrgChangeCreaterNotifyPacket
};