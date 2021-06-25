import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const TAKE_USER_INFO_EVENT_CODE = 0x97;

/**
 * 获取用户信息请求
 * @class CinTakeUserInfoByPhoneNumPacket
 * @extends {PublishPacket}
 * @param mobileNo
 * @param channel
  * @param from
 */
class CinTakeUserInfoByPhoneNumPacket extends PublishPacket {
    method: string = METHOD_NAME.service;
    event: number = TAKE_USER_INFO_EVENT_CODE;
    key: string;
    channel: number;
    from: number;

    constructor(object: {
        key: string,
        channel: number,
        from: number
    }) {
        super();
        this.key = object.key;
        this.channel = object.channel;
        this.from = object.from;
    }
}

/**
 * 获取用户信息响应
 * @class CinTakeUserInfoByPhoneNumAckPacket
 * @extends {PubAckPacket}
 * @param from
 */
class CinTakeUserInfoByPhoneNumAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    froms: any;
    
    toObject(): {
        froms: any;
    } {
        let object = super.toObject();
        let msgList = [];
        for (let i = 0; i < this.froms.length; i++) {
            msgList.push({
                key: this.froms[i]["Headers"]["Key"],
                from: this.froms[i]["Headers"]["From"]
            });
        }
        object.froms = msgList;
        return object;
    }
}

let takeUserInfoByPhoneNumReqId = METHOD_NAME.service + "_request_" + TAKE_USER_INFO_EVENT_CODE + "_up";
let takeUserInfoByPhoneNumRespId = METHOD_NAME.service + "_response_" + TAKE_USER_INFO_EVENT_CODE + "_down";

TemplateManager.registerTemplate(takeUserInfoByPhoneNumReqId, "TakeUserInfoByPhoneNumReq");
TemplateManager.registerTemplate(takeUserInfoByPhoneNumRespId, "TakeUserInfoByPhoneNumRes");
PacketManager.setDefine(takeUserInfoByPhoneNumReqId, CinTakeUserInfoByPhoneNumPacket);
PacketManager.setDefine(takeUserInfoByPhoneNumRespId, CinTakeUserInfoByPhoneNumAckPacket);

export {
    CinTakeUserInfoByPhoneNumPacket,
    CinTakeUserInfoByPhoneNumAckPacket
};