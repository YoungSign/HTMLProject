import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";
import { METHOD_NAME, CONNACK_RETURN_CODE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const ORG_UPDATE_INFO_EVENT_CODE = 0x01;

/**
 * @class CinOrgUpdateInfoPacket
 * @extends {PublishPacket}
 * @param method
 * @param event
 * @param from  发起方
 * @param to    群组id
 * @param name    修改人姓名
 * @param type  修改属性   名称 1，公告 2，简介 3，tag 5
 * @param orgInfo  群组信息
 */
class CinOrgUpdateInfoPacket extends PublishPacket {
    method: string = METHOD_NAME.organize;
    event: number = ORG_UPDATE_INFO_EVENT_CODE;
    from: number;
    to: number;
    name: string;
    type: number;
    orgInfo: CinOrgInfoPacket;
    constructor(object: {
        from: number,
        to: number,
        name: string,
        type: number,
        orgInfo: any
    }) {
        super();
        this.from = object.from;
        this.to = object.to;
        this.name = object.name;
        this.type = object.type;
        this.orgInfo = new CinOrgInfoPacket(object.orgInfo);
    }
}


/**
 * @class CinOrgInfoPacket
 * @extends {CinSubPacket}
 * @param groupName     群名称
 * @param groupPortraitId   群头像ID
 * @param groupProclamation 群公告
 * @param groupIntroduction 群简介
 */
class CinOrgInfoPacket extends CinSubPacket {
    groupName: string;
    groupPortraitId: string;
    groupProclamation: string;
    groupIntroduction: string;
    constructor(options: any) {
        super();
        this.groupName = options.groupName;
        this.groupPortraitId = options.groupPortraitId;
        this.groupProclamation = options.groupProclamation;
        this.groupIntroduction = options.groupIntroduction;
    }
}

/**
 * @class CinOrgInfoAckPacket
 * @extends {PubAckPacket}
 * @param from  发送者id
 * @param to    接收者groupid
 * @param orgVersion 群版本号
 */
class CinOrgInfoAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;
    to: number;
    orgVersion: number;
}

let orgInfoReqId = METHOD_NAME.organize + "_request_" + ORG_UPDATE_INFO_EVENT_CODE + "_up";
let orgInfoRespId = METHOD_NAME.organize + "_response_" + ORG_UPDATE_INFO_EVENT_CODE + "_down";

TemplateManager.registerTemplate(orgInfoReqId, "UpdateOrgInfReq");
TemplateManager.registerTemplate(orgInfoRespId, "UpdateOrgInfRes");

PacketManager.setDefine(orgInfoReqId, CinOrgUpdateInfoPacket);
PacketManager.setDefine(orgInfoRespId, CinOrgInfoAckPacket);
PacketManager.setDefine('orgBaseInfo', CinOrgInfoPacket);

export {
    CinOrgUpdateInfoPacket,
    CinOrgInfoAckPacket
};