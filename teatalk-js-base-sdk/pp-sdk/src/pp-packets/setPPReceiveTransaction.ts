import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const SET_PP_RECEIVE_EVENT_CODE = 0x06;

/**
 * 公众账号接收消息开关请求
 * @class CinSetPPReceivePacket
 * @extends {PublishPacket}
 * @param method
 * @param event
 * @param from  查询者id
 * @param to 公众号id
 * @param switcher   开关类型 0：接收消息 1：不接收消息
 */
class CinSetPPReceivePacket extends PublishPacket {
    method: string = METHOD_NAME.ppService;
    event: number = SET_PP_RECEIVE_EVENT_CODE;
    from: number;
    to: number;
    switcher: number;
    constructor(object: {
        from: number,
        to: number,
        switcher: number,
    }) {
        super();
        this.from = object.from;
        this.to = object.to;
        this.switcher = object.switcher;
    }
}


/**
 * 公众账号接收消息开关响应
 * @class CinSetPPReceiveAckPacket
 * @extends {PubAckPacket}
 * @param from 查询者id
 * @param status 错误信息(依据请求头的Language来判断返回的错误内容语言)
 */
class CinSetPPReceiveAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;
    status: string;
    toObject(): {
        from: number;
        status: string;
    } {
        let object = super.toObject();
        return object;
    }
}

let SetPPReceiveReqId = METHOD_NAME.ppService + "_request_" + SET_PP_RECEIVE_EVENT_CODE + "_up";
let SetPPReceiveRespId = METHOD_NAME.ppService + "_response_" + SET_PP_RECEIVE_EVENT_CODE + "_down";

TemplateManager.registerTemplate(SetPPReceiveReqId, "SetPPReceiveReq");
TemplateManager.registerTemplate(SetPPReceiveRespId, "SetPPReceiveResp");

PacketManager.setDefine(SetPPReceiveReqId, CinSetPPReceivePacket);
PacketManager.setDefine(SetPPReceiveRespId, CinSetPPReceiveAckPacket);

export {
    CinSetPPReceivePacket,
    CinSetPPReceiveAckPacket
};