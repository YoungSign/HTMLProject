import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE, PACKET_TYPE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";
import { App } from "../../../base-sdk/src/App";
import { Client } from "../../../base-sdk/src/Client";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";

const ORGANIZE_EVENT_CODE = 0x02;

let encodeSendStatus = function (object) {
    let isMass = Array.isArray(object.to) ? 0x04 : 0x00;
    let isReSend = object.messageId ? 0x20 : 0x00;
    return isMass | isReSend;
};

class CinOrgInviteBuddyPacket extends PublishPacket {
    method: string = METHOD_NAME.organize;
    event: number = ORGANIZE_EVENT_CODE;
    from: number; // 发送方
    orgId: number; // 接收方
    inviteName: string; // 邀请方名称
    orgName: string; // 群名称
    info: CinFriListPacket[]

    constructor(object: {
        from: number;
        orgId: number;
        inviteName: string; // 邀请方名称
        orgName: string;
        info: any
    }) {
        super();
        this.from = object.from;
        this.orgId = object.orgId;
        this.inviteName = object.inviteName;
        this.orgName = object.orgName;
        this.info = [];
        for(var i = 0; i < object.info.length; i++){
            this.info.push(new CinFriListPacket(object.info[i]));
        }
    }
}

class CinFriListPacket extends CinSubPacket {
    friUserId: number;
    friUserName: string;
    constructor(options: any) {
        super();
        this.friUserId = options.friUserId;
        this.friUserName = options.friUserName;
    }
}

class CinOrgInviteBuddyAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;   // 发送者
    to: number; // Groupid
    version: number;

    toObject(): {
        from: number;
        to: number;
        version: number;
    } {
        let object = super.toObject();
        return object;
    }
}

let OrgInviteBuddyReqId = METHOD_NAME.organize + "_request_" + ORGANIZE_EVENT_CODE + "_up";
let OrgInviteBuddyRespId = METHOD_NAME.organize + "_response_" + ORGANIZE_EVENT_CODE + "_down";
TemplateManager.registerTemplate(OrgInviteBuddyReqId, "OrgInviteBuddyRequest");
TemplateManager.registerTemplate(OrgInviteBuddyRespId, "OrgInviteBuddyResponse");
PacketManager.setDefine(OrgInviteBuddyReqId, CinOrgInviteBuddyPacket);
PacketManager.setDefine("FriList", CinFriListPacket);
PacketManager.setDefine(OrgInviteBuddyRespId, CinOrgInviteBuddyAckPacket);

export {
    CinOrgInviteBuddyPacket,
    CinOrgInviteBuddyAckPacket
};