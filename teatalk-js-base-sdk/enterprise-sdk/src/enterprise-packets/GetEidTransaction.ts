import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";
import { METHOD_NAME, CONNACK_RETURN_CODE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const TAKE_EVENT_CODE = 0x06;

/**
 * 获取Eid
 * @class CinGetEidPacket
 * @extends {PublishPacket}
 * @param method
 * @param event
 * @param userid
 * @param to
 */
class CinGetEidPacket extends PublishPacket {
    method: string = METHOD_NAME.take;
    event: number = TAKE_EVENT_CODE;
    from: number;
    to: number;
    constructor(object: {
        from: number,
        to: number
    }) {
        super();
        this.from = object.from;
        this.to = object.to;
    }
}

/**
 * 获取eid信息响应
 * @class CinGetEidAckPacket
 * @extends {PubAckPacket}
 * @param from
 * @param to
 * @param eidInfo
 */
class CinGetEidAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;
    to: number;
    eidInfo: any; // :body
    toObject(): {
        from: number;
        to: number;
        eidInfo: any;
    } {
        let object = super.toObject();
        let eidList = [];
        for (let i = 0; i < this.eidInfo.length; i++) {
            eidList['eid'] = this.eidInfo[i]["Headers"]["0x01"];
            eidList['userId'] = this.eidInfo[i]["Headers"]["0x02"];
        }
        object.eidInfo = eidList;
        return object;
    }
}

// class CinEidInfoPacket extends CinSubPacket {
//     eid: number;
//     userId: number;
//     constructor(options: any) {
//         super();
//     }
// }

let eidInfoReqId = METHOD_NAME.take + "_request_" + TAKE_EVENT_CODE + "_up";
let eidInfoRespId = METHOD_NAME.take + "_response_" + TAKE_EVENT_CODE + "_down";

TemplateManager.registerTemplate(eidInfoReqId, "GetEidRequest");
TemplateManager.registerTemplate(eidInfoRespId, "GetEidResponse");

PacketManager.setDefine(eidInfoReqId, CinGetEidPacket);
PacketManager.setDefine(eidInfoRespId, CinGetEidAckPacket);
// PacketManager.setDefine('eidInfo', CinEidInfoPacket);

export {
    CinGetEidPacket,
    CinGetEidAckPacket
};