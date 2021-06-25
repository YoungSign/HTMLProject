import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE, PACKET_TYPE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";
import { App } from "../../../base-sdk/src/App";
import { Client } from "../../../base-sdk/src/Client";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";

const SERVICE_EVENT_CODE = 0x15;

let decodeReceiveStatus = function (object) {
    object.isMuted = object.status & 0x01;
    object.isCopied = object.status & 0x02;
    object.isArrived = object.status & 0x08;
    object.isRemoved = object.status & 0x10;
    object.isRevoked = object.status & 0x20;
    delete object.status;
};

class CinSessionMsgPacket extends PublishPacket {
    method: string = METHOD_NAME.message;
    event: number = SERVICE_EVENT_CODE;
    from: number; // 发送方
    to: number;

    constructor(object: {
        from: number,
        to: number,
    }) {
        super();
        this.from = object.from;
        this.to = object.to;
    }
}

class CinSessionMsgAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;
    sessMsgInfo: any;

    toObject(): {
        from: number;
        sessMsgInfo: any;
    } {
        let object = super.toObject();
        let msgList = [];
        const client = new Client();
        App.needDecodeBase64 = false; // 临时关闭 wcmp拉历史消息竟然又是明文了
        for (let i = 0; i < this.sessMsgInfo.length; i++) {
            let msgBuffer = this.sessMsgInfo[i]["Headers"]["requestMessage"];
            const packet = (<PubAckPacket>client.parseData(msgBuffer)).toObject();
            msgList.push(packet);
        }
        App.needDecodeBase64 = true; // 恢复 wcmp拉历史消息竟然又是明文了
        object.sessMsgInfo = msgList;
        return object;
    }
}
let SessionMsgReqId = METHOD_NAME.message + "_request_" + SERVICE_EVENT_CODE + "_up";
let SessionMsgRespId = METHOD_NAME.message + "_response_" + SERVICE_EVENT_CODE + "_down";

TemplateManager.registerTemplate(SessionMsgReqId, "sessionMessageRequest");
TemplateManager.registerTemplate(SessionMsgRespId, "sessionMessageResponse");

PacketManager.setDefine(SessionMsgReqId, CinSessionMsgPacket);
PacketManager.setDefine(SessionMsgRespId, CinSessionMsgAckPacket);

export {
    CinSessionMsgPacket,
    CinSessionMsgAckPacket
};