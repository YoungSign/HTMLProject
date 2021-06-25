import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const ORGANIZE_EVENT_CODE = 67;

/**
 * @class CinOrgChangeCreaterPacket
 * @extends {PublishPacket}
 * @param method
 * @param event
 * @param orgId  群id
 * @param originCreater    原群主id
 * @param curCreater    新群主id
 */
class CinOrgChangeCreaterPacket extends PublishPacket {
    method: string = METHOD_NAME.organize;
    event: number = ORGANIZE_EVENT_CODE;
    orgId: number;
    originCreater: number;
    curCreater: number;
    constructor(object: {
        orgId: number,
        originCreater: number,
        curCreater: number,
    }) {
        super();
        this.orgId = object.orgId;
        this.originCreater = object.originCreater;
        this.curCreater = object.curCreater;
    }
}

/**
 * @class CinOrgChangeCreaterAckPacket
 * @extends {PubAckPacket}
 * @param from  发送者 群id
 * @param version 群版本号
 */
class CinOrgChangeCreaterAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;
    version: number;
    toObject(): {
        from: number;
        version: number;
    } {
        let object = super.toObject();
        return object;
    }
}

let orgChangeCreaterReqId = METHOD_NAME.organize + "_request_" + ORGANIZE_EVENT_CODE + "_up";
let orgChangeCreaterRespId = METHOD_NAME.organize + "_response_" + ORGANIZE_EVENT_CODE + "_down";

TemplateManager.registerTemplate(orgChangeCreaterReqId, "OrgChangeCreaterRequest");
TemplateManager.registerTemplate(orgChangeCreaterRespId, "OrgChangeCreaterResponse");

PacketManager.setDefine(orgChangeCreaterReqId, CinOrgChangeCreaterPacket);
PacketManager.setDefine(orgChangeCreaterRespId, CinOrgChangeCreaterAckPacket);

export {
    CinOrgChangeCreaterPacket,
    CinOrgChangeCreaterAckPacket
};