import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const PP_FOCUS_EVENT_CODE = 0x05;

/**
 * 取消/关注公众账号请求
 * @class CinSetPPFocusPacket
 * @extends {PublishPacket}
 * @param method
 * @param event
 * @param from  查询者id
 * @param to 公众号id
 * @param eventType   事件类型，0(取消订阅)、1(订阅)
 * @param channelId 渠道Id
 */
class CinSetPPFocusPacket extends PublishPacket {
    method: string = METHOD_NAME.ppService;
    event: number = PP_FOCUS_EVENT_CODE;
    from: number;
    to: number;
    eventType: number;
    channelId: number;
    constructor(object: {
        from: number,
        to: number,
        eventType: number,
        channelId: number
    }) {
        super();
        this.from = object.from;
        this.to = object.to;
        this.eventType = object.eventType;
        this.channelId = object.channelId;
    }
}


/**
 * 取消/关注公众账号响应
 * @class CinSetPPFocusAckPacket
 * @extends {PubAckPacket}
 * @param from 查询者id
 * @param status 错误信息(依据请求头的Language来判断返回的错误内容语言)
 */
class CinSetPPFocusAckPacket extends PubAckPacket {
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

let SetPPFocusReqId = METHOD_NAME.ppService + "_request_" + PP_FOCUS_EVENT_CODE + "_up";
let SetPPFocusRespId = METHOD_NAME.ppService + "_response_" + PP_FOCUS_EVENT_CODE + "_down";

TemplateManager.registerTemplate(SetPPFocusReqId, "SetPPFocusReq");
TemplateManager.registerTemplate(SetPPFocusRespId, "SetPPFocusResp");

PacketManager.setDefine(SetPPFocusReqId, CinSetPPFocusPacket);
PacketManager.setDefine(SetPPFocusRespId, CinSetPPFocusAckPacket);

export {
    CinSetPPFocusPacket,
    CinSetPPFocusAckPacket
};