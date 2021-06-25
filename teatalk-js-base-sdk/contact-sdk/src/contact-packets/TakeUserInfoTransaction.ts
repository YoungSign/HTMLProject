import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";
import { METHOD_NAME, CONNACK_RETURN_CODE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const TAKE_USER_INFO_EVENT_CODE = 0x01;

/**
 * 获取用户信息请求
 * @class CinTakeUserInfoPacket
 * @extends {PublishPacket}
 * @param method
 * @param event
 * @param from
 * @param to
 * @param version
 */
class CinTakeUserInfoPacket extends PublishPacket {
    method: string = METHOD_NAME.take;
    event: number = TAKE_USER_INFO_EVENT_CODE;
    from: number;
    to: number | number[];
    version: number;
    constructor(object: {
        from: number,
        to: number,
        version: number
    }) {
        super();
        this.from = object.from;
        this.to = object.to;
        this.version = object.version;
    }
}

/**
 * 获取用户信息响应
 * @class CinTakeUserInfoAckPacket
 * @extends {PubAckPacket}
 * @param from
 * @param mobileNo
 * @param status
 * @param version
 * @param visitingCardInfo
 */
class CinTakeUserInfoAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;
    mobileNo: string;
    status: number;
    version: number;
    visitingCardInfo: CinVisitingCardInfoPacket;
    toObject(): {
        from: number;
        mobileNo: number;
        status: number;
        version: number;
        visitingCardInfo: CinVisitingCardInfoPacket;
    } {
        let object = super.toObject();
        return object;
    }
}

class CinVisitingCardInfoPacket extends CinSubPacket {
    mobileNo: string;   // 手机号
    name: string;   // 用户名
    mood: string;
    expression: number; // 心情
    gender: number; // 性别
    portraitId: string; // 头像id
    portraitUrl: string;    // 头像路径
    constructor(options: any) {
        super();
    }
}

let takeUserInfoReqId = METHOD_NAME.take + "_request_" + TAKE_USER_INFO_EVENT_CODE + "_up";
let takeUserInfoRespId = METHOD_NAME.take + "_response_" + TAKE_USER_INFO_EVENT_CODE + "_down";

TemplateManager.registerTemplate(takeUserInfoReqId, "TakeUserInfoReq");
TemplateManager.registerTemplate(takeUserInfoRespId, "TakeUserInfoRes");

PacketManager.setDefine(takeUserInfoReqId, CinTakeUserInfoPacket);
PacketManager.setDefine(takeUserInfoRespId, CinTakeUserInfoAckPacket);
PacketManager.setDefine('VisitingCardInfo', CinVisitingCardInfoPacket);

export {
    CinTakeUserInfoPacket,
    CinTakeUserInfoAckPacket
};