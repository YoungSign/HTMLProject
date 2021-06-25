import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";
import { METHOD_NAME, CONNACK_RETURN_CODE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const ORG_INIT_INFO_EVENT_CODE = 0x04;
const ORG_INIT_USERNAME_EVENT_CODE = 0x33;

/**
 * 用户初始化群请求
 * @class CinOrginitInfoPacket
 * @extends {PublishPacket}
 * @param method
 * @param event
 * @param from  发送方UserId
 * @param to    接收方Groupid
 * @param version
 */
class CinOrginitInfoPacket extends PublishPacket {
    method: string = METHOD_NAME.organize;
    event: number = ORG_INIT_INFO_EVENT_CODE;
    from: number;
    to: number | number[];
    version: number;
    constructor(object: {
        from: number,
        to: number,
        version: number
    }) {
        super();
        this.from = object.from;
        this.to = object.to;
        this.version = object.version;
    }
}

/**
 * 用户初始化群响应
 * @class CinOrginitInfoAckPacket
 * @extends {PubAckPacket}
 * @param from  发送方Groupid 
 * @param to    接收方userid
 * @param index 群成员userid
 * @param version
 * @param type  自己的消息接收类型 1、接收并提醒 2、接收不提醒 3、不接收消息
 * @param orgUserInitInfo
 */
class CinOrginitInfoAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;
    to: number;
    index: number;
    version: number;
    type: number;
    orgUserInitInfo: CinOrgUserInitInfoPacket;
    toObject(): {
        from: number;
        to: number;
        index: number;
        version: number;
        type: number;
        orgUserInitInfo: CinOrgUserInitInfoPacket;
    } {
        let object = super.toObject();
        return object;
    }
}

class CinOrgUserInitInfoPacket extends CinSubPacket {
    groupName: string; // 群名称
    portraitId: string; // 群头像ID
    groupProclamation: string; // 群公告
    groupIntroduction: string; // 群简介
    groupManager: number;   // 群管理员ID
    createuserId: number; // 群主ID
    groupSize: number; // 群上限
    groupAddSetting: number; // 仅管理员添加成员开关
    constructor(options: any) {
        super();
    }
}

/**
 * 用户初始化群请求（包含用户信息）
 * @class CinOrginitUsernamePacket
 * @extends {PublishPacket}
 * @param method
 * @param event
 * @param from
 * @param to
 * @param version
 */
class CinOrginitUsernamePacket extends PublishPacket {
    method: string = METHOD_NAME.organize;
    event: number = ORG_INIT_USERNAME_EVENT_CODE;
    from: number;
    to: number | number[];
    version: number;
    constructor(object: {
        from: number,
        to: number,
        version: number
    }) {
        super();
        this.from = object.from;
        this.to = object.to;
        this.version = object.version;
    }
}

/**
 * 用户初始化群响应（包含用户信息）
 * @class CinOrginitUsernameAckPacket
 * @extends {PubAckPacket}
 * @param from 用户id
 * @param to 群id
 * @param groupPortraitId 群头像id
 * @param groupName 群名称
 * @param groupProclamation 群公告
 * @param groupIntroduction  群简介
 * @param administratorsId 群管理员Id
 * @param mainGroupId 群主ID
 * @param groupSize 群上限
 * @param version 群版本号
 * @param receiveType 消息接收类型 1：接受并提醒，2：接受不提醒，3：不接受消息
 * @param OrgUserInfo 群成员信息
 */
class CinOrginitUsernameAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;
    to: number;
    groupPortraitId: number;
    groupName: string;
    groupProclamation: string;
    groupIntroduction: string;
    administratorsId: number | number[];
    mainGroupId: number | number[];
    groupSize: number | number[];
    version: number;
    receiveType: number;
    orgUserInfo: CinOrgUserInitNewPacket;
    toObject(): {
        from: number;
        to: number;
        groupPortraitId: number;
        groupName: string;
        groupProclamation: string;
        groupIntroduction: string;
        administratorsId: number | number[];
        mainGroupId: number | number[];
        groupSize: number | number[];
        version: number;
        receiveType: number;
        orgUserInfo: CinOrgUserInitNewPacket;
    } {
        let object = super.toObject();
        return object;
    }
}

class CinOrgUserInitNewPacket extends CinSubPacket {
    userId: number; // 用户userId
    name: string; // 用户的名字
    portraitId: string; // 头像Id
    portraitUrl: string; // 头像URL
    constructor(options: any) {
        super();
    }
}

let orgInitInfoReqId = METHOD_NAME.organize + "_request_" + ORG_INIT_INFO_EVENT_CODE + "_up";
let orgInitInfoRespId = METHOD_NAME.organize + "_response_" + ORG_INIT_INFO_EVENT_CODE + "_down";
let orgInitUsernameReqId = METHOD_NAME.organize + "_request_" + ORG_INIT_USERNAME_EVENT_CODE + "_up";
let orgInitUsernameRespId = METHOD_NAME.organize + "_response_" + ORG_INIT_USERNAME_EVENT_CODE + "_down";

TemplateManager.registerTemplate(orgInitInfoReqId, "InitialzeGroupReq");
TemplateManager.registerTemplate(orgInitInfoRespId, "InitialzeGroupRes");
TemplateManager.registerTemplate(orgInitUsernameReqId, "InitialzeGroupNewReq");
TemplateManager.registerTemplate(orgInitUsernameRespId, "InitialzeGroupNewRes");

PacketManager.setDefine(orgInitInfoReqId, CinOrginitInfoPacket);
PacketManager.setDefine(orgInitInfoRespId, CinOrginitInfoAckPacket);
PacketManager.setDefine(orgInitUsernameReqId, CinOrginitUsernamePacket);
PacketManager.setDefine(orgInitUsernameRespId, CinOrginitUsernameAckPacket);
PacketManager.setDefine('OrgUserInitInfo', CinOrgUserInitInfoPacket);
PacketManager.setDefine('OrgUserInitInfoNew', CinOrgUserInitNewPacket);

export {
    CinOrginitInfoPacket,
    CinOrginitInfoAckPacket,
    CinOrginitUsernamePacket,
    CinOrginitUsernameAckPacket
};