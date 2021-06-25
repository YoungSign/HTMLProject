import { PublishPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME } from "../../../base-sdk/src/Constant";
import { decode as decodeContent } from "./body/ppBodyParser";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";
import { App } from "../../../base-sdk/src/App";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";

const EVENT_CODE = 0x01;

let decodeReceiveStatus = function (object) {
    object.isMuted = object.status & 0x01;
    object.isCopied = object.status & 0x02;
    object.isArrived = object.status & 0x08;
    object.isRemoved = object.status & 0x10;
    object.isRevoked = object.status & 0x20;
    delete object.status;
};

/**
 * @class CinPPMsgReceivePacket
 * @extends {PublishPacket}
 * @param from 发送方
 * @param to 接收方
 * @param index  Index[图文消息，即Type头值为12时含此头], Byte 0：文本消息 1：富文本消息6：云盘
 * @param messageId 消息ID
 * @param type 如果没有就是普通文本消息, 0：图片, 1：语音, 2：文件, 3：视频, 4：动态表情, 5：涂鸦, 6：名片, 7：位置, 12：公众账号发的图文消息
 * @param status 此头为掩码作为消息各种开关的一个汇总
 * @param msgSequence Int64消息在会话中的索引
 * @param serverTime Int64消息发送的时间
 * @param 
 */
class CinPPMsgReceivePacket extends PublishPacket {
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
    channel: number;

    toObject(): {
        from: number,
        to: number,
        channel: number,
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
        if (this.method === "PPMessage") {
            if (object.status == 2) { // 同步消息
                object.sender = this.to;
                object.to = this.from;
            } else {
                object.sender = this.from;
            }
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

let ppMsgReqId = METHOD_NAME.ppmessage + "_request_" + EVENT_CODE + "_down";
TemplateManager.registerTemplate(ppMsgReqId, "PPMessageReceiveRequest");

PacketManager.setDefine(ppMsgReqId, CinPPMsgReceivePacket);

export {
    CinPPMsgReceivePacket
};