import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME } from "../../../base-sdk/src/Constant";
import { generateUUID, hextoString } from "../../../base-sdk/src/util/utils";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";
import { encode as encodeContent } from "./body/msgBodyParser";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";
import { App } from "../../../base-sdk/src/App";

const MESSAGE_EVENT_CODE = 0x01;
const GROUPMESSAGE_EVENT_CODE = 0;
const ORGANIZEMESSAGE_EVENT_CODE = 0;

let encodeSendStatus = function (object) {
    let isMass = Array.isArray(object.to) ? 0x04 : 0x00;
    // let isReSend = object.messageId ? 0x20 : 0x00;
    // return isMass | isReSend;
    return isMass;
};

class CinMsgSendPacket extends PublishPacket {
    method: string;
    event: number;
    from: number; // 发送方
    to: number; // 接收方
    mass: number[]; // 群发消息的时候指定的接收方userid会有多个
    messageId: string; // 客户端生成UUID
    type: number; // 消息类型
    status: number; // 掩码：消息开关汇总
    mobileNo: string; // 发送免费短信时使用此头,值为短信接收方的手机号，群发免费短信时该头有多个
    name: string; // @文本类型，发送者昵称
    content: any; // :body buffer
    at: CinAtPacket;
    // version: number = 0;
    // Token: number = 0

    /**
     * data object transfer to packet entity
     * @param object
     * object.from
     * object.to
     * object.version
     * object.messageId
     * object.type
     * object.mobileNo
     * object.name
     * object.content
     * object.at
     */
    constructor(object: {
        from: number,
        to: number | number[],
        messageId?: string,
        type: number,
        mobileNo?: string,
        name?: string,
        content: any,
        at?: string
    }) {
        super();
        this.from = object.from;
        this.to = Array.isArray(object.to) ? object.to[0] : object.to;
        if (this.method === "Message") {
            this.mass = Array.isArray(object.to) ? object.to : [object.to];
        }
        this.messageId = object.messageId || generateUUID(32, 16);
        this.status = encodeSendStatus(object);
        this.mobileNo = object.mobileNo;
        this.name = object.name;
        this.content = encodeContent(object.content, App.binary, object.type);
        this.at = object.at ? new CinAtPacket(object) : null;
        if (object.at) {
            this.type = 55
        } else {
            this.type = object.type
        }
    }

    setSendType(sendType: number) {
        if (sendType === 0) {
            this.method = METHOD_NAME.message;
            this.event = MESSAGE_EVENT_CODE;
        } else if (sendType === 1) {
            this.method = METHOD_NAME.groupMessage;
            this.event = GROUPMESSAGE_EVENT_CODE;
        } else if (sendType === 2) {
            this.method = METHOD_NAME.organizeMessage;
            this.event = ORGANIZEMESSAGE_EVENT_CODE;
        }
    }
}

class CinAtPacket extends CinSubPacket {
    atUserIds: string; // :body

    constructor(options: any) {
        super();
        options && (this.atUserIds = options.at);
    }
}

class CinMsgSendAckPacket extends PubAckPacket {
    method: string;
    messageId: string;
    from: number;
    to: number;
    status: number;
    mass: number[];
    msgSequence: number;
    serverTime: number;
    capacity: string;
    tip: string; // :body

    format(): any {
        // if (this.method === "Message") { // 兼容wcmp messageId处理上下行不一致问题
        //     this.packetId = hextoString(this.packetId.toString());
        // }
    }
}

let msgReqId = METHOD_NAME.message + "_request_" + MESSAGE_EVENT_CODE + "_up";
let groupMsgReqId = METHOD_NAME.groupMessage + "_request_" + GROUPMESSAGE_EVENT_CODE + "_up";
let orgMsgReqId = METHOD_NAME.organizeMessage + "_request_" + ORGANIZEMESSAGE_EVENT_CODE + "_up";
let msgRespId = METHOD_NAME.message + "_response_" + MESSAGE_EVENT_CODE + "_down";
let groupMsgRespId = METHOD_NAME.groupMessage + "_response_" + GROUPMESSAGE_EVENT_CODE + "_down";
let orgMsgRespId = METHOD_NAME.organizeMessage + "_response_" + ORGANIZEMESSAGE_EVENT_CODE + "_down";

TemplateManager.registerTemplate(msgReqId, "MessageSendRequest");
TemplateManager.registerTemplate(groupMsgReqId, "MessageSendRequest");
TemplateManager.registerTemplate(orgMsgReqId, "MessageSendRequest");
TemplateManager.registerTemplate(msgRespId, "MessageSendResponse");
TemplateManager.registerTemplate(groupMsgRespId, "MessageSendResponse");
TemplateManager.registerTemplate(orgMsgRespId, "MessageSendResponse");

PacketManager.setDefine(msgReqId, CinMsgSendPacket);
PacketManager.setDefine(groupMsgReqId, CinMsgSendPacket);
PacketManager.setDefine(orgMsgReqId, CinMsgSendPacket);
PacketManager.setDefine(msgRespId, CinMsgSendAckPacket);
PacketManager.setDefine(groupMsgRespId, CinMsgSendAckPacket);
PacketManager.setDefine(orgMsgRespId, CinMsgSendAckPacket);
PacketManager.setDefine("AtExtension", CinAtPacket);

export {
    CinMsgSendPacket,
    CinMsgSendAckPacket,
    CinAtPacket
};