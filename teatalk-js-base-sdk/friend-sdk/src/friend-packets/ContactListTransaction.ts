import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";
import { METHOD_NAME, CONNACK_RETURN_CODE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const SOCIAL_EVENT_CODE = 0x21;

/**
 * 获取朋友圈好友列表信息请求
 * @class CinContactListPacket
 * @extends {PublishPacket}
 * @param method
 * @param event
 * @param userid
 * @param version
 */
class CinContactListPacket extends PublishPacket {
    method: string = METHOD_NAME.social;
    event: number = SOCIAL_EVENT_CODE;
    userid: number;
    version: number;
    constructor(object: {
        userid: number,
        version: number
    }) {
        super();
        this.userid = object.userid;
        this.version = object.version;
    }
}

/**
 * 获取朋友圈好友列表信息响应
 * @class CinContactListAckPacket
 * @extends {PubAckPacket}
 * @param from
 * @param contactUserid
 * @param version
 * @param friendInfo
 */
class CinContactListAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;
    contactUserid: number;
    version: number;
    friendInfo: CinFriendInfoPacket;
    toObject(): {
        from: number;
        contactUserid: number;
        version: number;
        friendInfo: CinFriendInfoPacket;
    } {
        let object = super.toObject();
        return object;
    }
}

class CinFriendInfoPacket extends CinSubPacket {
    friendUserid: number;   // 好友id
    remark: string;         // 标记
    description: string;    // 描述
    sparefield1: string;    // 
    sparefield2: string;    // 
    sparefield3: string;    // 
    sparefield4: string;    // 
    sparefield5: string;    // 
    settings: string;       // 
    userName: string;       // 好友名
    phoneNum: string;       // 手机号
    userAvatar: string;     // 头像id
    constructor(options: any) {
        super();
    }
}

let friendInfoReqId = METHOD_NAME.social + "_request_" + SOCIAL_EVENT_CODE + "_up";
let friendInfoRespId = METHOD_NAME.social + "_response_" + SOCIAL_EVENT_CODE + "_down";

TemplateManager.registerTemplate(friendInfoReqId, "GetSocialContactListReq");
TemplateManager.registerTemplate(friendInfoRespId, "GetSocialContactListRes");

PacketManager.setDefine(friendInfoReqId, CinContactListPacket);
PacketManager.setDefine(friendInfoRespId, CinContactListAckPacket);
PacketManager.setDefine('FriendInfo', CinFriendInfoPacket);

export {
    CinContactListPacket,
    CinContactListAckPacket
};