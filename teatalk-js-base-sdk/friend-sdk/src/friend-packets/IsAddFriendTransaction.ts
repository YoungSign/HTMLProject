import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE, PACKET_TYPE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";
import { App } from "../../../base-sdk/src/App";
import { Client } from "../../../base-sdk/src/Client";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";

const SOCIAL_EVENT_CODE = 0x24;

let encodeSendStatus = function (object) {
    let isMass = Array.isArray(object.to) ? 0x04 : 0x00;
    let isReSend = object.messageId ? 0x20 : 0x00;
    return isMass | isReSend;
};

class CinIsAddFriendPacket extends PublishPacket {
    method: string = METHOD_NAME.social;
    event: number = SOCIAL_EVENT_CODE;
    from: number; // 发送方
    type: number; // 是否同意加好友
    friendUserId: number; // 好友id
    nickname: string; // 昵称

    constructor(object: {
        from: number;
        type: number;
        friendUserId: number;
        nickname: string;
    }) {
        super();
        this.from = object.from;
        this.type = object.type;
        this.friendUserId = object.friendUserId;
        this.nickname = object.nickname;
    }
}

class CinIsAddFriendAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;
    toObject(): {
        from: number;
    } {
        let object = super.toObject();
        return object;
    }
}

let isAddFriendReqId = METHOD_NAME.social + "_request_" + SOCIAL_EVENT_CODE + "_up";
let isAddFriendRespId = METHOD_NAME.social + "_response_" + SOCIAL_EVENT_CODE + "_down";
TemplateManager.registerTemplate(isAddFriendReqId, "IsAddFriendRequest");
TemplateManager.registerTemplate(isAddFriendRespId, "IsAddFriendResponse");
PacketManager.setDefine(isAddFriendReqId, CinIsAddFriendPacket);
PacketManager.setDefine(isAddFriendRespId, CinIsAddFriendAckPacket);

export {
    CinIsAddFriendPacket,
    CinIsAddFriendAckPacket
};