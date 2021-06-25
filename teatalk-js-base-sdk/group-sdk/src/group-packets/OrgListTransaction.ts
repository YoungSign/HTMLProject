import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const ORG_LIST_EVENT_CODE = 0x05;

/**
 * @class CinOrgListPacket
 * @extends {PublishPacket}
 * @param method
 * @param event
 * @param from  发送者
 * @param to To和From保持一致
 */
class CinOrgListPacket extends PublishPacket {
    method: string = METHOD_NAME.organize;
    event: number = ORG_LIST_EVENT_CODE;
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
 * @class CinOrgListAckPacket
 * @extends {PubAckPacket}
 * @param from 发送者
 * @param to 接收者
 * @param groupList 群列表信息
 */
class CinOrgListAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;
    to: number;
    groupList: number | number[];
}

let orgListReqId = METHOD_NAME.organize + "_request_" + ORG_LIST_EVENT_CODE + "_up";
let orgListRespId = METHOD_NAME.organize + "_response_" + ORG_LIST_EVENT_CODE + "_down";

TemplateManager.registerTemplate(orgListReqId, "ListOrgReq");
TemplateManager.registerTemplate(orgListRespId, "ListOrgRes");

PacketManager.setDefine(orgListReqId, CinOrgListPacket);
PacketManager.setDefine(orgListRespId, CinOrgListAckPacket);

export {
    CinOrgListPacket,
    CinOrgListAckPacket
};