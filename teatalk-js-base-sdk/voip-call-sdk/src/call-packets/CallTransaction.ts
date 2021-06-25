import { METHOD_NAME } from "../../../base-sdk/src/Constant";
import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const CALL_EVENT_CODE = 0x10;

class CinCallPacket extends PublishPacket {
    method: string = METHOD_NAME.message;
    event: number = CALL_EVENT_CODE;
    from: number;
    to: number;
    receiver: number[];
    content: CinCallContentPacket;

    constructor(object: {
        from: number,
        to: number | number[],
        content: any
    }) {
        super();
        if (!object) {
            return;
        }
        this.from = object.from;
        this.to = object.from;
        this.receiver = object.to ? Array.isArray(object.to) ? object.to : [object.to] : null;
        this.content = new CinCallContentPacket(object.content);
    }
}

class CinCallContentPacket extends CinSubPacket {
    method: string = METHOD_NAME.service;
    event: number = CALL_EVENT_CODE;
    operateCode: number;
    mediaType: number;
    channelID: string;
    invitee: number[];
    modifyMemberType: number;
    sessionType: number;
    sessionId: number;
    extension1: string;
    domain: number;
    createId: number;

    constructor(object: {
        operateCode: number,
        mediaType: number,
        channelID: string,
        invitee: number[],
        modifyMemberType: number,
        sessionType: number,
        sessionId: number,
        extension1: string,
        createId: number
    }) {
        super();
        if (!object) {
            return;
        }
        this.operateCode = object.operateCode;
        this.mediaType = object.mediaType;
        this.channelID = object.channelID;
        this.invitee = object.invitee ? Array.isArray(object.invitee) ? object.invitee : [object.invitee] : null;
        this.modifyMemberType = object.modifyMemberType;
        this.sessionType = object.sessionType;
        this.sessionId = object.sessionId;
        this.extension1 = object.extension1;
        this.domain = 1;
        this.createId = object.createId;
    }
}

class CinCallAckPacket extends PubAckPacket {
    method: string = METHOD_NAME.message;
    event: number = CALL_EVENT_CODE;
}

let msgUpReqId = METHOD_NAME.message + "_request_" + CALL_EVENT_CODE + "_up";
let msgUpRespId = METHOD_NAME.message + "_response_" + CALL_EVENT_CODE + "_up";
let msgDownReqId = METHOD_NAME.message + "_request_" + CALL_EVENT_CODE + "_down";
let msgDownRespId = METHOD_NAME.message + "_response_" + CALL_EVENT_CODE + "_down";

TemplateManager.registerTemplate(msgUpReqId, "CallRequest");
TemplateManager.registerTemplate(msgDownReqId, "CallRequest");
TemplateManager.registerTemplate(msgUpRespId, "CallResponse");
TemplateManager.registerTemplate(msgDownRespId, "CallResponse");

PacketManager.setDefine(msgUpReqId, CinCallPacket);
PacketManager.setDefine(msgDownReqId, CinCallPacket);
PacketManager.setDefine(msgUpRespId, CinCallAckPacket);
PacketManager.setDefine(msgDownRespId, CinCallAckPacket);
PacketManager.setDefine("CallRequestContent", CinCallContentPacket);

export {
    CinCallPacket,
    CinCallAckPacket
};