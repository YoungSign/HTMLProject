import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE, PACKET_TYPE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const EVENT_CODE = 109;

class CinOrgOfflinePacket extends PublishPacket {
    method: string = METHOD_NAME.message;
    event: number = EVENT_CODE;
    from: number; // 用户id
    to: number; // 用户id

    constructor(object: {
        from: number;
        to: number;
    }) {
        super();
        this.from = object.from;
        this.to = object.to;
    }
}

class CinOrgOfflineAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;
    to: number;

    toObject(): {
        from: number;
        to: number;
    } {
        let object = super.toObject();
        return object;
    }
}

let OrgOfflineReqId = METHOD_NAME.message + "_request_" + EVENT_CODE + "_up";
let OrgOfflineRespId = METHOD_NAME.message + "_response_" + EVENT_CODE + "_down";

TemplateManager.registerTemplate(OrgOfflineReqId, "OrgOfflineRequest");
TemplateManager.registerTemplate(OrgOfflineRespId, "OrgOfflineResponse");

PacketManager.setDefine(OrgOfflineReqId, CinOrgOfflinePacket);
PacketManager.setDefine(OrgOfflineRespId, CinOrgOfflineAckPacket);

export {
    CinOrgOfflinePacket,
    CinOrgOfflineAckPacket
};