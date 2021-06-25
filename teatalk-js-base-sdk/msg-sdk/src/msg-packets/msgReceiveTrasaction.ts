import { PublishPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME } from "../../../base-sdk/src/Constant";
import { hextoString } from "../../../base-sdk/src/util/utils";
import { decode as decodeContent } from "./body/msgBodyParser";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";
import { App } from "../../../base-sdk/src/App";
import { CinAtPacket } from "./MsgSendTransaction";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";

const MESSAGE_EVENT_CODE = 0x01;
const GROUPMESSAGE_EVENT_CODE = 0;

let decodeReceiveStatus = function (object) {
    object.isMuted = object.status & 0x01;
    object.isCopied = object.status & 0x02;
    object.isArrived = object.status & 0x08;
    object.isRemoved = object.status & 0x10;
    object.isRevoked = object.status & 0x20;
    delete object.status;
};

class CinMsgReceivePacket extends PublishPacket {
    method: string;
    event: number;
    from: number; // 发送方
    to: number; // 接收方
    index: number[];
    messageId: string;
    type: number;
    status: number;
    msgSequence: number;
    serverTime: number;
    name: string;
    content: any;
    at: CinAtPacket;

    toObject(): {
        from: number,
        to: number,
        sender: number,
        messageId: string,
        isMuted: boolean,
        isCopied: boolean,
        isArrived: boolean,
        isRemoved: boolean,
        isRevoked: boolean,
        content: any,
        at?: string
    } {
        let object = super.toObject();
        // if (this.method === "Message") { // 兼容wcmp messageId处理上下行不一致问题
        //     object.messageId = hextoString(object.messageId);
        // }
        if (this.method === "Message") {
            object.sender = this.from;
        } else if(this.method === "GroupMessage" && object.Type === 55) {
            object.sender = this.index[0]['2'];
        } else if (this.method === "GroupMessage") {
            object.sender = this.index;
        }
        decodeReceiveStatus(object);
        delete object.index;
        let content = decodeContent(this.type, this.content, App.binary);
        if (content instanceof CinSubPacket) {
            content = content.toObject();
        }
        if (object.type !== 55) {
            object.content = content;
        }
        return object;
    }
}

let msgReqId = METHOD_NAME.message + "_request_" + MESSAGE_EVENT_CODE + "_down";
let groupMsgReqId = METHOD_NAME.groupMessage + "_request_" + GROUPMESSAGE_EVENT_CODE + "_down";
TemplateManager.registerTemplate(msgReqId, "MessageReceiveRequest");
TemplateManager.registerTemplate(groupMsgReqId, "MessageReceiveRequest");

PacketManager.setDefine(msgReqId, CinMsgReceivePacket);
PacketManager.setDefine(groupMsgReqId, CinMsgReceivePacket);

export {
    CinMsgReceivePacket
};