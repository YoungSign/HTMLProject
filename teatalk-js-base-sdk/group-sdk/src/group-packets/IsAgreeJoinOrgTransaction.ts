import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE, PACKET_TYPE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const ORGANIZE_EVENT_CODE = 0x20;

let encodeSendStatus = function (object) {
    let isMass = Array.isArray(object.to) ? 0x04 : 0x00;
    let isReSend = object.messageId ? 0x20 : 0x00;
    return isMass | isReSend;
};

class CinIsAgreeJoinOrgPacket extends PublishPacket {
    method: string = METHOD_NAME.organize;
    event: number = ORGANIZE_EVENT_CODE;
    from: number; // 发送方
    groupId: number; // 接收方
    myName: string; // 自己的名称
    inviteUserId: number; // 邀请方userId
    inviteName: string; // 邀请方名称
    isAgree: number; // 是否同意加入群

    constructor(object: {
        from: number;
        groupId: number;
        myName: string;
        inviteUserId: number; // 创建者name
        inviteName: string;
        isAgree: number;
    }) {
        super();
        this.from = object.from;
        this.groupId = object.groupId;
        this.myName = object.myName;
        this.inviteUserId = object.inviteUserId;
        this.inviteName = object.inviteName;
        this.isAgree = object.isAgree;
    }
}

class CinOrgAgreeJoinAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;
    groupId: number;
    key: number;
    toObject(): {
        from: number;
        groupId: number;
        key: number;
    } {
        let object = super.toObject();
        return object;
    }
}

let IsAgreeJoinOrgReqId = METHOD_NAME.organize + "_request_" + ORGANIZE_EVENT_CODE + "_up";
let AgreeJoinAckPacketRespId = METHOD_NAME.organize + "_response_" + ORGANIZE_EVENT_CODE + "_down";

TemplateManager.registerTemplate(IsAgreeJoinOrgReqId, "IsAgreeJoinOrgRequest");
TemplateManager.registerTemplate(AgreeJoinAckPacketRespId, "IsAgreeJoinOrgRespone");

PacketManager.setDefine(IsAgreeJoinOrgReqId, CinIsAgreeJoinOrgPacket);
PacketManager.setDefine(AgreeJoinAckPacketRespId, CinOrgAgreeJoinAckPacket);

export {
    CinIsAgreeJoinOrgPacket,
    CinOrgAgreeJoinAckPacket
};