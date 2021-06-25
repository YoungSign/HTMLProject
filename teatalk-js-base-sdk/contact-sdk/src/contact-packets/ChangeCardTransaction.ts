import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";
import { METHOD_NAME, CONNACK_RETURN_CODE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const TAKE_USER_INFO_EVENT_CODE = 8;

/**
 * 修改用户信息请求
 * @class CinChangeCardPPacket
 * @extends {PublishPacket}
 * @param method
 * @param event
 * @param from
 * @param version
 */
class CinChangeCardPacket extends PublishPacket {
    method: string = METHOD_NAME.service;
    event: number = TAKE_USER_INFO_EVENT_CODE;
    from: number;
    changeCardInfo: CinChangeCardInfoPacket;
    constructor(object: {
        from: number,
        changeCardInfo: any,
    }) {
        super();
        this.from = object.from;
        this.changeCardInfo = new CinChangeCardInfoPacket(object);
    }
}

class CinChangeCardInfoPacket extends CinSubPacket {
    name: string;   // 用户名
    mood: string; // 个性签名
    expression: number; // 心情
    gender: number; // 性别
    portraitId: number; // 头像id
    constructor(options: any) {
        super();
        this.name = options.changeCardInfo.name;
        this.mood = options.changeCardInfo.mood;
        this.expression = options.changeCardInfo.expression;
        this.gender = options.changeCardInfo.gender;
        this.portraitId = options.changeCardInfo.portraitId;
    }
}

/**
 * 修改用户信息响应
 * @class CinChangeCardAckPacket
 * @extends {PubAckPacket}
 * @param from
 * @param version
 */
class CinChangeCardAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;
    version: number;
    toObject(): {
        from: number;
        version: number;
    } {
        let object = super.toObject();
        return object;
    }
}



let ReqId = METHOD_NAME.service + "_request_" + TAKE_USER_INFO_EVENT_CODE + "_up";
let RespId = METHOD_NAME.service + "_response_" + TAKE_USER_INFO_EVENT_CODE + "_down";

TemplateManager.registerTemplate(ReqId, "changeCardReq");
TemplateManager.registerTemplate(RespId, "changeCardRes");

PacketManager.setDefine(ReqId, CinChangeCardPacket);
PacketManager.setDefine(RespId, CinChangeCardAckPacket);
PacketManager.setDefine('ChangeCardInfo', CinChangeCardInfoPacket);

export {
    CinChangeCardPacket,
    CinChangeCardAckPacket
};