import { PublishPacket, PubAckPacket } from "./PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE, PACKET_TYPE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const SOCIAL_EVENT_CODE = 0x08;

class CinWEBIMLogonOfflineAckPacket extends PublishPacket {
    method: string = METHOD_NAME.logon;
    event: number = SOCIAL_EVENT_CODE;
    from: number; // 系统通知

    toObject(): {
        from: number,
    } {
        let object = super.toObject();
        return object;
    }
}

let WEBIMLogonOfflineReqId = METHOD_NAME.logon + "_request_" + SOCIAL_EVENT_CODE + "_down";
TemplateManager.registerTemplate(WEBIMLogonOfflineReqId, "WEBIMLogonOfflineRequest");
PacketManager.setDefine(WEBIMLogonOfflineReqId, CinWEBIMLogonOfflineAckPacket);

export {
    CinWEBIMLogonOfflineAckPacket
};