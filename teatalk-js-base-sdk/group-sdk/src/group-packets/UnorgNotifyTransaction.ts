import { PublishPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const ORGANIZE_EVENT_CODE = 0x27;

class CinUnorgNotifyPacket extends PublishPacket {
    method: string = METHOD_NAME.organize;
    event: number = ORGANIZE_EVENT_CODE;
    from: number; // 发送方
    to: number; // 接收方groupid

    toObject(): {
        from: number;
        to: number;
    } {
        let object = super.toObject();
        return object;
    }
}

let unorgNotifyReqId = METHOD_NAME.organize + "_request_" + ORGANIZE_EVENT_CODE + "_down";
TemplateManager.registerTemplate(unorgNotifyReqId, "UnorgReq");
PacketManager.setDefine(unorgNotifyReqId, CinUnorgNotifyPacket);

export {
    CinUnorgNotifyPacket
};