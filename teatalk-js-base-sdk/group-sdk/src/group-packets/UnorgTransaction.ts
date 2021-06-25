import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const ORGANIZE_EVENT_CODE = 0x26;

/**
 * @class CinUnorgPacket
 * @extends {PublishPacket}
 * @param method
 * @param event
 * @param from  发送方UserId
 * @param to    接收方Groupid
 */
class CinUnorgPacket extends PublishPacket {
    method: string = METHOD_NAME.organize;
    event: number = ORGANIZE_EVENT_CODE;
    from: number;
    to: number;
    constructor(object: {
        from: number,
        to: number
    }) {
        super();
        this.from = object.from;
        this.to = object.to;
    }
}


/**
 * @class CinUnorgAckPacket
 * @extends {PubAckPacket}
 * @param from  发送方UserId
 * @param to    接收方Groupid
 */
class CinUnorgAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;
    to: number;
}

let unorgReqId = METHOD_NAME.organize + "_request_" + ORGANIZE_EVENT_CODE + "_up";
let unorgRespId = METHOD_NAME.organize + "_response_" + ORGANIZE_EVENT_CODE + "_down";

TemplateManager.registerTemplate(unorgReqId, "UnorgReq");
TemplateManager.registerTemplate(unorgRespId, "UnorgRes");

PacketManager.setDefine(unorgReqId, CinUnorgPacket);
PacketManager.setDefine(unorgRespId, CinUnorgAckPacket);

export {
    CinUnorgPacket,
    CinUnorgAckPacket
};