import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE, PACKET_TYPE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";
import { App } from "../../../base-sdk/src/App";
import { Client } from "../../../base-sdk/src/Client";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";

const MESSAGE_EVENT_CODE = 7;

class CinMsgSocialOffLineNtfPacket extends PublishPacket {
    method: string = METHOD_NAME.message;
    event: number = MESSAGE_EVENT_CODE;
    from: number; // 发送方
    to: number; // 与from保持一致

    /**
     * data object transfer to packet entity
     * @param object
     * object.from
     * object.to
     */
    constructor(object: {
        from: number,
        to: number,
    }) {
        super();
        this.from = object.from;
        this.to = object.to;
    }
}

class CinMsgSocialOffLineNtfAckPacket extends PubAckPacket {
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
let msgSocialOffLineNtfReqId = METHOD_NAME.message + "_request_" + MESSAGE_EVENT_CODE + "_up";
let msgSocialOffLineNtfRespId = METHOD_NAME.message + "_response_" + MESSAGE_EVENT_CODE + "_down";
TemplateManager.registerTemplate(msgSocialOffLineNtfReqId, "MsgSocialOffLineNtfRequest");
TemplateManager.registerTemplate(msgSocialOffLineNtfRespId, "MsgSocialOffLineNtfResponse");
PacketManager.setDefine(msgSocialOffLineNtfReqId, CinMsgSocialOffLineNtfPacket);
PacketManager.setDefine(msgSocialOffLineNtfRespId, CinMsgSocialOffLineNtfAckPacket);

export {
    CinMsgSocialOffLineNtfPacket,
    CinMsgSocialOffLineNtfAckPacket
};