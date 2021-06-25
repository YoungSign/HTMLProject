import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const ORG_MANAGER_CHANGE_EVENT_CODE = 0x25;

let encodeSendStatus = function (object) {
    let isMass = Array.isArray(object.to) ? 0x04 : 0x00;
    let isReSend = object.messageId ? 0x20 : 0x00;
    return isMass | isReSend;
};


/**
 * @class CinOrgManagerPacket
 * @extends {PublishPacket}
 * @param method
 * @param event
 * @param from  发起方
 * @param to    群组id
 * @param userId    要变更人员id
 * @param status 状态 0：新增 1：取消
 */
class CinOrgManagerPacket extends PublishPacket {
    method: string = METHOD_NAME.organize;
    event: number = ORG_MANAGER_CHANGE_EVENT_CODE;
    from: number;
    to: number;
    userId: number;
    status: number;
    constructor(object: {
        from: number,
        to: number,
        userId: number,
        status: number
    }) {
        super();
        this.from = object.from;
        this.to = object.to;
        this.userId = object.userId;
        this.status = object.status;
    }
}

class CinOrgManagerAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;   // 发送者ID
    to: number; // 接收者
}

let orgManagerChangeReqId = METHOD_NAME.organize + "_request_" + ORG_MANAGER_CHANGE_EVENT_CODE + "_up";
let orgManagerChangeRespId = METHOD_NAME.organize + "_response_" + ORG_MANAGER_CHANGE_EVENT_CODE + "_down";

TemplateManager.registerTemplate(orgManagerChangeReqId, "ChangeManagerReq");
TemplateManager.registerTemplate(orgManagerChangeRespId, "ChangeManagerRes");

PacketManager.setDefine(orgManagerChangeReqId, CinOrgManagerPacket);
PacketManager.setDefine(orgManagerChangeRespId, CinOrgManagerAckPacket);

export {
    CinOrgManagerPacket,
    CinOrgManagerAckPacket
};