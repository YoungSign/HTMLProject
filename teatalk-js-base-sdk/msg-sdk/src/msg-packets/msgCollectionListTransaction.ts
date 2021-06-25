import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE, PACKET_TYPE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";
import { App } from "../../../base-sdk/src/App";
import { Client } from "../../../base-sdk/src/Client";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";

const SERVICE_EVENT_CODE = 0x61;
class CinMsgCOllectionListPacket extends PublishPacket {
    method: string = METHOD_NAME.service;
    event: number = SERVICE_EVENT_CODE;
    from: number; // 发送方
    converInfo: any;

    constructor(object: {
        from: number,
        converInfo: any,
    }) {
        super();
        this.from = object.from;
        this.converInfo = object.converInfo;
    }
}

class CinMsgCOllectionListAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;
    version: number;
    bodyInfoIds: any; // :body

    toObject(): {
        from: number;
        version: number;
        bodyInfoIds: any;
    
    } {
        let object = super.toObject();
        return object;
    }
}


let msgCOllectionListReqId = METHOD_NAME.service + "_request_" + SERVICE_EVENT_CODE + "_up";
let msgCOllectionListRespId = METHOD_NAME.service + "_response_" + SERVICE_EVENT_CODE + "_down";

TemplateManager.registerTemplate(msgCOllectionListReqId, "MessageCollectListRequest");
TemplateManager.registerTemplate(msgCOllectionListRespId, "MessageCollectListResponse");

PacketManager.setDefine(msgCOllectionListReqId, CinMsgCOllectionListPacket);
PacketManager.setDefine(msgCOllectionListRespId, CinMsgCOllectionListAckPacket);

export {
    CinMsgCOllectionListPacket,
    CinMsgCOllectionListAckPacket
};