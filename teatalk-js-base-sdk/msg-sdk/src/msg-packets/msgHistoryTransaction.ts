import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE, PACKET_TYPE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";
import { App } from "../../../base-sdk/src/App";
import { Client } from "../../../base-sdk/src/Client";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";

const MESSAGE_EVENT_CODE = 0x04;

class CinMsgHistoryPacket extends PublishPacket {
    method: string = METHOD_NAME.message;
    event: number = MESSAGE_EVENT_CODE;
    from: number; // 发送方
    // index: number[];
    msgType: string; // WEBIM
    conversation: CinConversationPacket;
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
        msgType: string,
        conversation: any,
    }) {
        super();
        this.from = object.from;
        this.msgListType = object.msgListType;
        this.msgType = object.msgType;
        this.conversation = new CinConversationPacket(object.conversation);
    }
}
class CinConversationPacket extends CinSubPacket {
    sessionId: number;
    index: number;
    pageSize: number;
    constructor(options: any) {
        super();
        this.sessionId = options.sessionId;
        this.pageSize = options.pageSize;
        this.index = options.index;
    }
}

class CinMsgHistoryAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;
    msgListType: number;
    content: any; // :body

    toObject(): {
        from: number;
        content: any;
    } {
        let object = super.toObject();
        let msgList = [];
        const client = new Client();
        App.needDecodeBase64 = false; // 临时关闭 wcmp拉历史消息竟然又是明文了
        for (let i = 0; i < this.content.length; i++) {
            let msgBuffer = this.content[i]["Headers"]["requestMessage"];
            console.log(msgBuffer)
            const packet = (<PubAckPacket>client.parseData(msgBuffer)).toObject();
            msgList.push(packet);
        }
        App.needDecodeBase64 = true; // 恢复 wcmp拉历史消息竟然又是明文了
        object.content = msgList;
        return object;
    }
}
let msgHisReqId = METHOD_NAME.message + "_request_" + MESSAGE_EVENT_CODE + "_up";
let msgHisRespId = METHOD_NAME.message + "_response_" + MESSAGE_EVENT_CODE + "_down";
TemplateManager.registerTemplate(msgHisReqId, "MessageHistoryRequest");
TemplateManager.registerTemplate(msgHisRespId, "MessageHistoryResponse");
PacketManager.setDefine(msgHisReqId, CinMsgHistoryPacket);
PacketManager.setDefine("Session", CinConversationPacket);
PacketManager.setDefine(msgHisRespId, CinMsgHistoryAckPacket);

export {
    CinMsgHistoryPacket,
    CinMsgHistoryAckPacket
};