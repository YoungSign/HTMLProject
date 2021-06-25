import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";

const PP_FOCUS_LIST_EVENT_CODE = 0x02;

/**
 * 获取已关注公众号列表请求
 * @class CinPPFocusListPacket
 * @extends {PublishPacket}
 * @param method
 * @param event
 * @param from  查询者id
 * @param accountType   账号类别
 */
class CinPPFocusListPacket extends PublishPacket {
    method: string = METHOD_NAME.ppService;
    event: number = PP_FOCUS_LIST_EVENT_CODE;
    from: number;
    accountType: number;
    constructor(object: {
        from: number,
        accountType: number
    }) {
        super();
        this.from = object.from;
        this.accountType = object.accountType;
    }
}


/**
 * 获取已关注公众号列表响应
 * @class CinPPFocusListAckPacket
 * @extends {PubAckPacket}
 * @param from 查询者id
 * @param status 错误信息(依据请求头的Language来判断返回的错误内容语言)
 * @param focusNum 关注的公众账号总数量
 * @param focusPPListInfo 公众号信息
 */
class CinPPFocusListAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;
    status: string;
    focusNum: number;
    focusPPListInfo: any; // :body
    toObject(): {
        from: number;
        status: string;
        focusNum: number;
        // focusPPListInfo: CinPPAccountInfoPacket;
        focusPPListInfo: any;
    } {
        let object = super.toObject();
        // console.log('obj___________________--------------------------' ,object)
        let ppFocusList = [];
        if (!object.focusPPListInfo["Headers"].length) {
            return;
        }
        for (let i = 0; i < object.focusPPListInfo["Headers"].length; i++) {
            ppFocusList.push({
                PPAccountId: object.focusPPListInfo["Headers"][i]["0x01"], // 公众账号ID
                PPAccountName: object.focusPPListInfo["Headers"][i]["0x02"], // 公众账号名字
                PPAccountPortraitId: object.focusPPListInfo["Headers"][i]["0x03"], // 公众账号头像ID
                PPAccountDescribeInfo: object.focusPPListInfo["Headers"][i]["0x04"], // 公众账号描述信息
                isReceiveMsg: object.focusPPListInfo["Headers"][i]["0x05"], // 接收消息开关 0 开 1 关
                isFoucs: object.focusPPListInfo["Headers"][i]["0x06"], // 是否关注[0否 1是]
                isOfficial: object.focusPPListInfo["Headers"][i]["0x07"] // 是否官方认证[0否 1是]
            });
        }
        object.focusPPListInfo = ppFocusList;
        return object;
    }
}

/**
 * @class CinPPAccountInfoPacket
 * @extends {CinSubPacket}
 * @param PPAccountId 公众账号ID
 * @param PPAccountName 公众账号名字
 * @param PPAccountPortraitId 公众账号头像ID
 * @param PPAccountDescribeInfo 公众账号描述信息
 * @param isReceiveMsg  接收消息开关 0 开 1 关
 * @param isFoucs   是否关注[0否 1是]
 * @param isOfficial    是否官方认证[0否 1是]
 */
class CinPPAccountInfoPacket extends CinSubPacket {
    PPAccountId: number;
    PPAccountName: string;
    PPAccountPortraitId: string;
    PPAccountDescribeInfo: string;
    isReceiveMsg: number;
    isFoucs: number;
    isOfficial: number;

    constructor(options: any) {
        super();
        // this.PPAccountId = options && options.PPAccountId;
        // this.PPAccountName = options && options.PPAccountName;
        // this.PPAccountPortraitId = options && options.PPAccountPortraitId;
        // this.PPAccountDescribeInfo = options && options.PPAccountDescribeInfo;
        // this.isReceiveMsg = options && options.isReceiveMsg;
        // this.isFoucs = options && options.isFoucs;
        // this.isOfficial = options && options.isOfficial;
    }
}

let PPFocusListReqId = METHOD_NAME.ppService + "_request_" + PP_FOCUS_LIST_EVENT_CODE + "_up";
let PPFocusListRespId = METHOD_NAME.ppService + "_response_" + PP_FOCUS_LIST_EVENT_CODE + "_down";

TemplateManager.registerTemplate(PPFocusListReqId, "GetPPFocusListReq");
TemplateManager.registerTemplate(PPFocusListRespId, "GetPPFocusListResp");

PacketManager.setDefine(PPFocusListReqId, CinPPFocusListPacket);
PacketManager.setDefine(PPFocusListRespId, CinPPFocusListAckPacket);
PacketManager.setDefine('FocusPPListInfo', CinPPAccountInfoPacket);

export {
    CinPPFocusListPacket,
    CinPPFocusListAckPacket
};