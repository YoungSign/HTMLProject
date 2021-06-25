import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const TAKE_USER_INFO_EVENT_CODE = 0x09;

/**
 * 根据userId获取token
 * @class CinTakeUserInfoByPhoneNumPacket
 * @extends {PublishPacket}
  * @param to
 */
class GetTokenByUserIdPacket extends PublishPacket {
    method: string = METHOD_NAME.take;
    event: number = TAKE_USER_INFO_EVENT_CODE;
    to: number;

    constructor(object: {
        to: number
    }) {
        super();
        this.to = object.to;
    }
}

/**
 * 根据userId获取token
 * @class CinTakeUserInfoByPhoneNumAckPacket
 * @extends {PubAckPacket}
 * @param token
 */
class GetTokenByUserIdAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    token: string;

    toObject(): {
        token: string;
    } {
        let object = super.toObject();
        return object;
    }
}

let GetTokenByUserIdReqId = METHOD_NAME.take + "_request_" + TAKE_USER_INFO_EVENT_CODE + "_up";
let GetTokenByUserIdRespId = METHOD_NAME.take + "_response_" + TAKE_USER_INFO_EVENT_CODE + "_down";

TemplateManager.registerTemplate(GetTokenByUserIdReqId, "GetTokenByUserIdReq");
TemplateManager.registerTemplate(GetTokenByUserIdRespId, "GetTokenByUserIdResp");
PacketManager.setDefine(GetTokenByUserIdReqId, GetTokenByUserIdPacket);
PacketManager.setDefine(GetTokenByUserIdRespId, GetTokenByUserIdAckPacket);

export {
    GetTokenByUserIdPacket,
    GetTokenByUserIdAckPacket
};