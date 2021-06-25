import { PublishPacket, PubAckPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";
import { METHOD_NAME, CONNACK_RETURN_CODE } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const ORG_QUIT_EVENT_CODE = 0x03;

/**
 * @class CinOrgQuitPacket
 * @extends {PublishPacket}
 * @param method
 * @param event
 * @param from  发起方
 * @param to    群组id
 * @param quitedName    退群者或者踢人者的名字
 * @param orgUserInfo  被踢用户信息
 */
class CinOrgQuitPacket extends PublishPacket {
    method: string = METHOD_NAME.organize;
    event: number = ORG_QUIT_EVENT_CODE;
    from: number;
    to: number;
    quitedName: string;
    orgUserInfo: CinOrgUserInfoPacket[];
    constructor(object: {
        from: number,
        to: number,
        quitedName: string,
        orgUserInfo: any
    }) {
        super();
        this.from = object.from;
        this.to = object.to;
        this.quitedName = object.quitedName;
        this.orgUserInfo = [];
        if (object.orgUserInfo && object.orgUserInfo.length) {
            for(var i = 0; i < object.orgUserInfo.length; i++){
                this.orgUserInfo.push(new CinOrgUserInfoPacket(object.orgUserInfo[i]));
            }
        }
        // this.orgUserInfo = object.orgUserInfo ? new CinOrgUserInfoPacket(object.orgUserInfo) : null;
    }
}

class CinOrgUserInfoPacket extends CinSubPacket {
    userId: number;
    name: string;
    constructor(options: any) {
        super();
        this.userId = (options && options.userId) || 0;
        this.name = options && options.name;
    }
}

/**
 * @class CinOrgQuitAckPacket
 * @extends {PubAckPacket}
 * @param from  发送者id
 * @param to    群组id
 * @param orgVersion 群版本号
 */
class CinOrgQuitAckPacket extends PubAckPacket {
    response: CONNACK_RETURN_CODE;
    from: number;
    to: number;
    orgVersion: number;
}

let orgQuitReqId = METHOD_NAME.organize + "_request_" + ORG_QUIT_EVENT_CODE + "_up";
let orgQuitRespId = METHOD_NAME.organize + "_response_" + ORG_QUIT_EVENT_CODE + "_down";

TemplateManager.registerTemplate(orgQuitReqId, "QuitOrgReq");
TemplateManager.registerTemplate(orgQuitRespId, "QuitOrgRes");

PacketManager.setDefine(orgQuitReqId, CinOrgQuitPacket);
PacketManager.setDefine(orgQuitRespId, CinOrgQuitAckPacket);
PacketManager.setDefine('OrgUserInfo', CinOrgUserInfoPacket);

export {
    CinOrgQuitPacket,
    CinOrgQuitAckPacket
};