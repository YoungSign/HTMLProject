import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const TAKE_USER_INFO_EVENT_CODE = 0x78;

/**
 * 根据userId获取token
 * @class CinTakeUserInfoByPhoneNumPacket
 * @extends {PublishPacket}
 * @param to
 */
class GetGWAddressPacket extends PublishPacket {
    method: string = METHOD_NAME.take;
    event: number = TAKE_USER_INFO_EVENT_CODE;
    channel: string;
    to: number;

    constructor(object: {
        channel: string,
        to: number
    }) {
        super();
        this.channel = object.channel;
        this.to = object.to;
    }
}

/**
 * 根据userId获取token
 * @class CinTakeUserInfoByPhoneNumAckPacket
 * @extends {PubAckPacket}
 * @param token
 */
class GetGWAddressAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    address: string;

    toObject(): {
        address: string;
    } {
        let object = super.toObject();
        return object;
    }
}

let GetGWAddressReqId = METHOD_NAME.take + "_request_" + TAKE_USER_INFO_EVENT_CODE + "_up";
let GetGWAddressRespId = METHOD_NAME.take + "_response_" + TAKE_USER_INFO_EVENT_CODE + "_down";

TemplateManager.registerTemplate(GetGWAddressReqId, "GetGWAddressReq");
TemplateManager.registerTemplate(GetGWAddressRespId, "GetGWAddressResp");
PacketManager.setDefine(GetGWAddressReqId, GetGWAddressPacket);
PacketManager.setDefine(GetGWAddressRespId, GetGWAddressAckPacket);

export {
    GetGWAddressPacket,
    GetGWAddressAckPacket
};