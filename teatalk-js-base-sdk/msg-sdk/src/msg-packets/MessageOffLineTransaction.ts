import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE, PACKET_TYPE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";
import { App } from "../../../base-sdk/src/App";
import { Client } from "../../../base-sdk/src/Client";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";

const MESSAGE_EVENT_CODE = 0x03;

let decodeReceiveStatus = function (object) {
    object.isMuted = object.status & 0x01;
    object.isCopied = object.status & 0x02;
    object.isArrived = object.status & 0x08;
    object.isRemoved = object.status & 0x10;
    object.isRevoked = object.status & 0x20;
    delete object.status;
};

class CinMsgOffLinePacket extends PublishPacket {
    method: string = METHOD_NAME.message;
    event: number = MESSAGE_EVENT_CODE;
    from: number; // 发送方
    msgListType: number;

    /**
     * data object transfer to packet entity
     * @param object
     * object.from
     * object.type
     * object.conversation
     */
    constructor(object: {
        from: number,
        msgListType: number,
    }) {
        super();
        this.from = object.from;
        this.msgListType = object.msgListType;
    }
}

class CinMsgOffLineAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;
    conversation: any; // :body

    toObject(): {
        from: number;
        conversation: any;
    } {
        let object = super.toObject();
        let msgList = [];
        for (let i = 0; i < this.conversation.length; i++) {
            msgList.push({
                sessionId: this.conversation[i]["Headers"]["0x01"],
                messageCount: this.conversation[i]["Headers"]["0x02"],
                pageSize: this.conversation[i]["Headers"]["0x03"]
            });
        }
        // decodeReceiveStatus(object);
        object.conversation = msgList;
        return object;
    }
}
let msgOffLineReqId = METHOD_NAME.message + "_request_" + MESSAGE_EVENT_CODE + "_up";
let msgOffLineRespId = METHOD_NAME.message + "_response_" + MESSAGE_EVENT_CODE + "_down";
TemplateManager.registerTemplate(msgOffLineReqId, "MessageOffLineRequest");
TemplateManager.registerTemplate(msgOffLineRespId, "MessageOffLineResponse");
PacketManager.setDefine(msgOffLineReqId, CinMsgOffLinePacket);
PacketManager.setDefine(msgOffLineRespId, CinMsgOffLineAckPacket);

export {
    CinMsgOffLinePacket,
    CinMsgOffLineAckPacket
};