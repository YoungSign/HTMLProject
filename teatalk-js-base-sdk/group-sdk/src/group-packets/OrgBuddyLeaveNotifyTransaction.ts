import { PublishPacket } from "../../../base-sdk/src/base-packets/PublishTransaction";
import { CinSubPacket } from "../../../base-sdk/src/cin/CinSubPacket";
import { METHOD_NAME } from "../../../base-sdk/src/Constant";
import { TemplateManager } from "../../../base-sdk/src/TemplateManager";
import { PacketManager } from "../../../base-sdk/src/PacketManager";

const ORGANIZE_EVENT_CODE = 0x13;

class CinOrgBuddyLeaveNotifyPacket extends PublishPacket {
    method: string = METHOD_NAME.organize;
    event: number = ORGANIZE_EVENT_CODE;
    groupid: number;
    to: number; // 接收方id
    sourceUserId: number; // 操作者Id
    quitedName: string; // 退群者或者踢人者的名字
    version: number;
    orgUserInfo: CinOrgUserInfoPacket;

    toObject(): {
        groupid: number;
        to: number;
        sourceUserId: number;
        quitedName: string;
        version: number;
        orgUserInfo: any;
    } {
        let object = super.toObject();
        return object;
    }
}

class CinOrgUserInfoPacket extends CinSubPacket {
    userId: number; // 用户id
    name: string; // 用户名
    constructor(options: any) {
        super();
        this.userId = (options && options.userId) || 0;
        this.name = options && options.name;
    }
}

let OrgBuddyLeaveNotifyReqId = METHOD_NAME.organize + "_request_" + ORGANIZE_EVENT_CODE + "_down";
TemplateManager.registerTemplate(OrgBuddyLeaveNotifyReqId, "OrgBuddyLeaveNotifyReq");
PacketManager.setDefine(OrgBuddyLeaveNotifyReqId, CinOrgBuddyLeaveNotifyPacket);

export {
    CinOrgBuddyLeaveNotifyPacket
};