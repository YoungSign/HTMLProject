import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";
import { METHOD_NAME, CONNACK_RETURN_CODE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const SET_PP_MESSAGE_EVENT_CODE = 0x02;

/**
 * 公众号离线推送
 * @class CinSetPPReceivePacket
 * @extends {PublishPacket}
 * @param method
 * @param event
 * @param from  查询者id
 */
class CinSetPullOfflineMsgPacket extends PublishPacket {
    method: string = METHOD_NAME.ppmessage;
    event: number = SET_PP_MESSAGE_EVENT_CODE;
    from: number;
    offLineMsg: offLineMsgPacket[];
    constructor(object: {
        from: number,
        offLineMsg: any
    }) {
        super();
        this.from = object.from;
        this.offLineMsg = [];
        if (object.offLineMsg && object.offLineMsg.length) {
            for (var i = 0; i < object.offLineMsg.length; i++) {
                this.offLineMsg.push(new offLineMsgPacket(object.offLineMsg[i]));
            }
        }
    }
}

class offLineMsgPacket extends CinSubPacket {
    accountId: number;
    versionId: number;
    constructor(options: any) {
        super();
        this.accountId = (options && options.accountId) || 0;
        this.versionId = (options && options.versionId) || 0;
    }
}

/**
 * 公众账号接收消息开关响应
 * @class CinSetPPReceiveAckPacket
 * @extends {PubAckPacket}
 * @param from 查询者id
 * @param status 错误信息(依据请求头的Language来判断返回的错误内容语言)
 */
class CinSetPullOfflineMsgAckPacket extends PubAckPacket {
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

let SetPullMsgReqId = METHOD_NAME.ppmessage + "_request_" + SET_PP_MESSAGE_EVENT_CODE + "_up";
let SetPullMsgRespId = METHOD_NAME.ppmessage + "_response_" + SET_PP_MESSAGE_EVENT_CODE + "_down";

TemplateManager.registerTemplate(SetPullMsgReqId, "PullOfflineMsgRequest");
TemplateManager.registerTemplate(SetPullMsgRespId, "PullOfflineMsgResponse");

PacketManager.setDefine(SetPullMsgReqId, CinSetPullOfflineMsgPacket);
PacketManager.setDefine(SetPullMsgRespId, CinSetPullOfflineMsgAckPacket);
PacketManager.setDefine('offLineMsg', offLineMsgPacket);

export {
    CinSetPullOfflineMsgPacket,
    CinSetPullOfflineMsgAckPacket
};