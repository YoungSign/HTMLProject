import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE, PACKET_TYPE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";

const SERVICE_EVENT_CODE = 0x64;

class CinMsgCollectIdPacket extends PublishPacket {
    method: string = METHOD_NAME.service;
    event: number = SERVICE_EVENT_CODE;
    from: number;

    constructor(object: {
        from: number
    }) {
        super();
        this.from = object.from;
    }
}

class CinMsgCollectIdAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;
    bodyInfo: number;
    toObject(): {
        from: number;
        bodyInfo: number;
    } {
        let object = super.toObject();
        return object;
    }
}

let msgCollectIdReqId = METHOD_NAME.service + "_request_" + SERVICE_EVENT_CODE + "_up";
let msgCollectIdRespId = METHOD_NAME.service + "_response_" + SERVICE_EVENT_CODE + "_down";

TemplateManager.registerTemplate(msgCollectIdReqId, "MessageCollectIdRequest");
TemplateManager.registerTemplate(msgCollectIdRespId, "MessageCollectIdResponse");

PacketManager.setDefine(msgCollectIdReqId, CinMsgCollectIdPacket);
PacketManager.setDefine(msgCollectIdRespId, CinMsgCollectIdAckPacket);

export {
    CinMsgCollectIdPacket,
    CinMsgCollectIdAckPacket
};