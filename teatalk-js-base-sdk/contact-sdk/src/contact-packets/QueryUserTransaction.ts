import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";
import { METHOD_NAME, CONNACK_RETURN_CODE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const QUERY_USER__EVENT_CODE = 150;

/**
 * 根据账号查询userid
 * @class CinQueryUserPacket
 * @extends {PublishPacket}
 * @param method
 * @param event
 * @param from
 * @param to
 * @param channelId
 * @param key
 */
class CinQueryUserPacket extends PublishPacket {
    method: string = METHOD_NAME.service;
    event: number = QUERY_USER__EVENT_CODE;
    from: number;
    to: number | number[];
    channelId: string;
    key: string;
    constructor(object: {
        from: number,
        to: number,
        channelId: string,
        key: string,
    }) {
        super();
        this.from = object.from;
        this.to = object.to;
        this.channelId = object.channelId;
        this.key = object.key;
    }
}

/**
 * 根据账号查询userid响应
 * @class CinTakeUserInfoAckPacket
 * @extends {PubAckPacket}
 * @param from
 * @param channelId
 * @param key
 */
class CinQueryUserAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;
    userInfo: any;
    toObject(): {
        from: number;
        userInfo: CinUserInfoPacket
    } {
        let object = super.toObject();
        return object;
    }
}

class CinUserInfoPacket extends CinSubPacket {
    userId: number;
    channelId: string;
    constructor(options: any) {
        super();
    }
}

let queryUserReqId = METHOD_NAME.service + "_request_" + QUERY_USER__EVENT_CODE + "_up";
let queryUserRespId = METHOD_NAME.service + "_response_" + QUERY_USER__EVENT_CODE + "_down";

TemplateManager.registerTemplate(queryUserReqId, "QueryUserReq");
TemplateManager.registerTemplate(queryUserRespId, "QueryUserRes");

PacketManager.setDefine(queryUserReqId, CinQueryUserPacket);
PacketManager.setDefine(queryUserRespId, CinQueryUserAckPacket);
PacketManager.setDefine('UserInfo', CinUserInfoPacket);

export {
    CinQueryUserPacket,
    CinQueryUserAckPacket
};