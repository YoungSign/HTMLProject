import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE, PACKET_TYPE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";
import { App } from "../../../base-sdk/src/App";
import { Client } from "../../../base-sdk/src/Client";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";

const SOCIAL_EVENT_CODE = 0x22;

let encodeSendStatus = function (object) {
    let isMass = Array.isArray(object.to) ? 0x04 : 0x00;
    let isReSend = object.messageId ? 0x20 : 0x00;
    return isMass | isReSend;
};

class CinAddFriendPacket extends PublishPacket {
    method: string = METHOD_NAME.social;
    event: number = SOCIAL_EVENT_CODE;
    from: number; // 发送方
    friendUserId: number; // 好友id
    nickname: string; // 昵称
    mobileNo: string; // 电话号码

    constructor(object: {
        from: number;
        friendUserId: number;
        nickname: string;
        mobileNo: string; // 创建者name
    }) {
        super();
        this.from = object.from;
        this.friendUserId = object.friendUserId;
        this.nickname = object.nickname;
        this.mobileNo = object.mobileNo;
    }
}

class CinAddFriendAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;
    toObject(): {
        from: number;
        dateTime: number;
    } {
        let object = super.toObject();
        return object;
    }
}

let addFriendReqId = METHOD_NAME.social + "_request_" + SOCIAL_EVENT_CODE + "_up";
let addFriendRespId = METHOD_NAME.social + "_response_" + SOCIAL_EVENT_CODE + "_down";
TemplateManager.registerTemplate(addFriendReqId, "AddFriendRequest");
TemplateManager.registerTemplate(addFriendRespId, "AddFriendResponse");
PacketManager.setDefine(addFriendReqId, CinAddFriendPacket);
PacketManager.setDefine(addFriendRespId, CinAddFriendAckPacket);

export {
    CinAddFriendPacket,
    CinAddFriendAckPacket
};