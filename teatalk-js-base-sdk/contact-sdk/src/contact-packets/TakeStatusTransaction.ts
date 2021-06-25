/**
 * Created by H5 on 2021/3/16.
 */
import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";
import { METHOD_NAME, CONNACK_RETURN_CODE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const LOGON_EVENT_CODE = 0x04;

class CinTakeStatusPacket extends PublishPacket {
    method: string = METHOD_NAME.take;
    event: number = LOGON_EVENT_CODE;
    from: number;
    to: number;
    status: number; // 用户在线状态

    constructor(object: {
        from: number;
        to: number;
        status: number;
    }) {
        super();
        this.from = object.from;
        this.to = object.to;
        this.status = object.status;
    }
}
class CinTakeStatusAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;
    cardInfo: any;

    toObject(): {
        from: number;
        cardInfo: any;
    } {
        let object = super.toObject();
        return object;
    }
}

let reqId = METHOD_NAME.take + "_request_" + LOGON_EVENT_CODE+ "_up";
let respId = METHOD_NAME.take + "_response_" + LOGON_EVENT_CODE + "_down";

TemplateManager.registerTemplate(reqId, "TakeStatusReq");
TemplateManager.registerTemplate(respId, "TakeStatusRes");
PacketManager.setDefine(reqId, CinTakeStatusPacket);
PacketManager.setDefine(respId, CinTakeStatusAckPacket);

export {
    CinTakeStatusPacket,
    CinTakeStatusAckPacket,
};
