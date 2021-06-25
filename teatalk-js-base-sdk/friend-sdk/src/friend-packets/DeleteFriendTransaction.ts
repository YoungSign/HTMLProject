import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE, PACKET_TYPE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const SOCIAL_EVENT_CODE = 0x26;

let encodeSendStatus = function (object) {
    let isMass = Array.isArray(object.to) ? 0x04 : 0x00;
    let isReSend = object.messageId ? 0x20 : 0x00;
    return isMass | isReSend;
};
class CinDeleteFriendPacket extends PublishPacket {
    method: string = METHOD_NAME.social;
    event: number = SOCIAL_EVENT_CODE;
    from: number; // 发送方
    friendUserId: number; // 删除好友id

    constructor(object: {
        from: number;
        friendUserId: number;
    }) {
        super();
        this.from = object.from;
        this.friendUserId = object.friendUserId;
    }
}

class CinODeleteFriendAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;

    toObject(): {
        from: number;
    } {
        let object = super.toObject();
        return object;
    }
}

let deleteFriendReqId = METHOD_NAME.social + "_request_" + SOCIAL_EVENT_CODE + "_up";
let deleteFriendRespId = METHOD_NAME.social + "_response_" + SOCIAL_EVENT_CODE + "_down";
TemplateManager.registerTemplate(deleteFriendReqId, "DeleteFriendRequest");
TemplateManager.registerTemplate(deleteFriendRespId, "DeleteFriendResponse");
PacketManager.setDefine(deleteFriendReqId, CinDeleteFriendPacket);
PacketManager.setDefine(deleteFriendRespId, CinODeleteFriendAckPacket);
export {
    CinDeleteFriendPacket,
    CinODeleteFriendAckPacket
};