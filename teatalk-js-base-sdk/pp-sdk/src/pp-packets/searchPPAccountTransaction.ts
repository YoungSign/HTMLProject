import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { METHOD_NAME, CONNACK_RETURN_CODE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";
// import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";

const SEARCH_PP_ACCOUNT_EVENT_CODE = 0x04;

/**
 * 搜索公众账号请求
 * @class CinSearchPPAccountPacket
 * @extends {PublishPacket}
 * @param method
 * @param event
 * @param from  查询者id
 * @param reqNum 请求的数量
 * @param startPos 起始位置
 * @param type  账号类别，不携带则默认是全部
 * @param searchKey   不填写等同与获取推荐公众账号，按照公众账号，名字，描述进行模糊搜索
 * @param channelId 渠道号id
 */
class CinSearchPPAccountPacket extends PublishPacket {
    method: string = METHOD_NAME.ppService;
    event: number = SEARCH_PP_ACCOUNT_EVENT_CODE;
    from: number;
    reqNum: number;
    startPos: number;
    type: number;
    searchKey: string;
    channelId: string;
    constructor(object: {
        from: number,
        reqNum: number,
        startPos: number,
        type?: number,
        searchKey: string,
        channelId: string
    }) {
        super();
        this.from = object.from;
        this.reqNum = object.reqNum;
        this.startPos = object.startPos;
        this.type = object.type;
        this.searchKey = object.searchKey;
        this.channelId = object.channelId;
    }
}


/**
 * 搜索公众账号响应
 * @class CinSearchPPAccountAckPacket
 * @extends {PubAckPacket}
 * @param from 查询者id
 * @param email 邮件
 * @param status 错误信息(依据请求头的Language来判断返回的错误内容语言)
 * @param ppAccountNum 公众号数量
 * @param focusPPListInfo 公众号信息
 */
class CinSearchPPAccountAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;
    email: number;
    status: string;
    ppAccountNum: number;
    focusPPListInfo: any; // :body
    toObject(): {
        from: number;
        email: number;
        status: string;
        ppAccountNum: number;
        // focusPPListInfo: CinPPAccountInfoPacket;
        focusPPListInfo: any;
    } {
        let object = super.toObject();
        console.log('obj 0x04___________________--------------------------' ,object)
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
// class CinPPAccountInfoPacket extends CinSubPacket {
//     PPAccountId: number;
//     PPAccountName: string;
//     PPAccountPortraitId: string;
//     PPAccountDescribeInfo: string;
//     isReceiveMsg: number;
//     isFoucs: number;
//     isOfficial: number;

//     constructor(options: any) {
//         super();
//         // this.PPAccountId = options && options.PPAccountId;
//         // this.PPAccountName = options && options.PPAccountName;
//         // this.PPAccountPortraitId = options && options.PPAccountPortraitId;
//         // this.PPAccountDescribeInfo = options && options.PPAccountDescribeInfo;
//         // this.isReceiveMsg = options && options.isReceiveMsg;
//         // this.isFoucs = options && options.isFoucs;
//         // this.isOfficial = options && options.isOfficial;
//     }
// }

let SearchPPAccountReqId = METHOD_NAME.ppService + "_request_" + SEARCH_PP_ACCOUNT_EVENT_CODE + "_up";
let SearchPPAccountRespId = METHOD_NAME.ppService + "_response_" + SEARCH_PP_ACCOUNT_EVENT_CODE + "_down";

TemplateManager.registerTemplate(SearchPPAccountReqId, "SearchPPAccountReq");
TemplateManager.registerTemplate(SearchPPAccountRespId, "SearchPPAccountResp");

PacketManager.setDefine(SearchPPAccountReqId, CinSearchPPAccountPacket);
PacketManager.setDefine(SearchPPAccountRespId, CinSearchPPAccountAckPacket);
// PacketManager.setDefine('FocusPPListInfo', CinPPAccountInfoPacket);

export {
    CinSearchPPAccountPacket,
    CinSearchPPAccountAckPacket
};