/**
 * Created by H5 on 2021/3/16.
 */
import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";
import { METHOD_NAME, CONNACK_RETURN_CODE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const LOGON_EVENT_CODE = 0x05;

class CinTakeCardBatchPacket extends PublishPacket {
    method: string = METHOD_NAME.take;
    event: number = LOGON_EVENT_CODE;
    from: number;
    to: number;
    index: number | number[]; // userId

    constructor(object: {
        from: number;
        to: number;
        index: number | number[]
    }) {
        super();
        this.from = object.from;
        this.to = object.to;
        this.index = object.index;
    }
}
class CinTakeCardBatchAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;
    cardInfo: any;

    toObject(): {
        from: number;
        cardInfo: any;
    } {
        let object = super.toObject();
        let cardList = [];
        for (let i = 0; i < this.cardInfo.length; i++) {
            cardList.push({
                userId: this.cardInfo[i]["Headers"]["0x01"],
                status: this.cardInfo[i]["Headers"]["0x02"],
            });
        }
        object.cardInfo = cardList;
        return object;
    }
}

let reqId = METHOD_NAME.take + "_request_" + LOGON_EVENT_CODE+ "_up";
let respId = METHOD_NAME.take + "_response_" + LOGON_EVENT_CODE + "_down";

TemplateManager.registerTemplate(reqId, "TakeCardBatchReq");
TemplateManager.registerTemplate(respId, "TakeCardBatchRes");
PacketManager.setDefine(reqId, CinTakeCardBatchPacket);
PacketManager.setDefine(respId, CinTakeCardBatchAckPacket);

export {
    CinTakeCardBatchPacket,
    CinTakeCardBatchAckPacket,
};
