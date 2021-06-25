import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE, PACKET_TYPE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";
import { App } from "../../../base-sdk/src/App";
import { Client } from "../../../base-sdk/src/Client";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";

const ORGANIZE_EVENT_CODE = 0;

let encodeSendStatus = function (object) {
    let isMass = Array.isArray(object.to) ? 0x04 : 0x00;
    let isReSend = object.messageId ? 0x20 : 0x00;
    return isMass | isReSend;
};

class CinOrgCreatePacket extends PublishPacket {
    method: string = METHOD_NAME.organize;
    event: number = ORGANIZE_EVENT_CODE;
    from: number; // 发送方
    to: number; // 接收方
    index: number | number[]; // 创建群组时被邀请人userid会有多个
    createName: string; // 创建者name
    info: CincontentPacket

    constructor(object: {
        from: number;
        to: number;
        index: number | number[];
        createName: string; // 创建者name
        info: any
    }) {
        super();
        this.from = object.from;
        this.to = object.to;
        this.index = object.index;
        this.createName = object.createName;
        this.info = object.info ? new CincontentPacket(object) : null;
    }
}

class CincontentPacket extends CinSubPacket {
    groupName: string;
    groupPortraitid: string;
    groupProclamation: string;
    groupIntroduction: string;
    constructor(options: any) {
        super();
        this.groupName = options.info.groupName;
        this.groupPortraitid = options.info.groupPortraitid;
        this.groupProclamation = options.info.groupProclamation;
        this.groupIntroduction = options.info.groupIntroduction;
    }
}

class CinOrgCreateAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;
    type: number;
    key: number;
    status: number;
    version: number;

    toObject(): {
        from: number;
        type: number;
        groupId: number;
        status: number;
        version: number;
    } {
        let object = super.toObject();
        return object;
    }
}

let orgCreateReqId = METHOD_NAME.organize + "_request_" + ORGANIZE_EVENT_CODE + "_up";
let orgCreateRespId = METHOD_NAME.organize + "_response_" + ORGANIZE_EVENT_CODE + "_down";
TemplateManager.registerTemplate(orgCreateReqId, "OrganizeSendRequest");
TemplateManager.registerTemplate(orgCreateRespId, "OrganizeSendResponse");
PacketManager.setDefine(orgCreateReqId, CinOrgCreatePacket);
PacketManager.setDefine("Content", CincontentPacket);
PacketManager.setDefine(orgCreateRespId, CinOrgCreateAckPacket);

export {
    CinOrgCreatePacket,
    CinOrgCreateAckPacket
};