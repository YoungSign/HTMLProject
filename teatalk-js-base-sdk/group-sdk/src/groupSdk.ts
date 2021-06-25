import { applyProperties } from "./../../base-sdk/src/util/utils";
import { templates as groupTemplates } from "./group-packets/group-templates";
import { TemplateManager } from "../../base-sdk/src/TemplateManager";

import { CinOrgCreatePacket } from "./group-packets/createOrgTransaction";
import { CinOrgManagerPacket } from "./group-packets/OrgManagerTransaction";
import { CinOrgQuitPacket } from "./group-packets/OrgQuitTransaction";
import { CinOrgListPacket } from "./group-packets/OrgListTransaction";
import { CinOrgUpdateInfoPacket } from "./group-packets/OrgUpdateInfoTransaction";
import { CinOrginitInfoPacket, CinOrginitUsernamePacket } from "./group-packets/OrginitInfoTransaction";
import { CinOrgInviteBuddyPacket } from "./group-packets/OrgInviteBuddyTransation";//
import { CinIsAgreeJoinOrgPacket } from "./group-packets/IsAgreeJoinOrgTransaction";
import { CinUnorgPacket } from "./group-packets/UnorgTransaction";
import { CinOrgChangeCreaterPacket } from "./group-packets/OrgChangeCreaterTransaction";
import { CinOrgOfflinePacket } from "./group-packets/OrgOfflineTransaction";

import "./group-packets/OrgInviteBuddyNotifyTransaction";
import "./group-packets/OrgBuddyComeInNotifyTransaction";
import "./group-packets/ChangeOrgManagerNotifyTransaction";
import "./group-packets/UpdateOrgInfNotifyTransaction";
import "./group-packets/OrgBuddyLeaveNotifyTransaction";
import "./group-packets/UnorgNotifyTransaction";
import "./group-packets/RefuseJoinOrgNotifyTransaction";
import "./group-packets/OrgChangeCreaterNotifyTransaction";

const MODULE_ID = "GROUP";
TemplateManager.loadTemplates(MODULE_ID, groupTemplates);

let TeatalkGroupSdk: any = {
    sdkParams: {},
    baseSdk: null,
    listener: null,
    msgFileUpload: null,
    init: function (sdkParams: { baseSdk: any }) {
        let self = this;
        self.sdkParams = applyProperties(self.sdkParams, sdkParams);
        self.baseSdk = sdkParams.baseSdk;
        if (!self.baseSdk) {
            console.error("未找到基础sdk");
            return;
        }

        // 接口1--创建群组
        self.baseSdk.register("createOrganize", function (params: {
            options: {
                from: number,
                to: number | number[],
                index: number | number[],
                type: string,
                info: string
            },
            callback: (success: boolean, result: {
                from: number,
                to: number,
                groupId: number,
                status: number,
                version: number
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, { type: null });
            let packet = new CinOrgCreatePacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 接口2--变更管理权限
        self.baseSdk.register("changeOrgManager", function (params: {
            options: {
                from: number,
                to: number,
                userId: number,
                status: number
            },
            callback: (success: boolean, result: {
                from: number,
                to: number,
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinOrgManagerPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 接口3--退出群或踢人
        self.baseSdk.register("quitOrg", function (params: {
            options: {
                from: number,
                to: number,
                quitedName: string,
                orgUserInfo?: any
            },
            callback: (success: boolean, result: {
                from: number,
                to: number,
                orgVersion: number
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinOrgQuitPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 接口4--群组列表获取
        self.baseSdk.register("getOrgList", function (params: {
            options: {
                from: number,
                to: number
            },
            callback: (success: boolean, result: {
                from: number,
                to: number,
                groupList:  number | number[]
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinOrgListPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 接口5--更改群信息(修改群名称)
        self.baseSdk.register("updateOrgInf", function (params: {
            options: {
                from: number,
                to: number,
                name: string,   // 修改人姓名
                type: number,   // 修改属性   名称 1，公告 2，简介 3，tag 5
                orgInfo?: any
            },
            callback: (success: boolean, result: {
                from: number,
                to: number,
                type: number,
                orgVersion:  number // 群版本号
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinOrgUpdateInfoPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 接口6--获取群离线通知消息
        self.baseSdk.register("getOrgOfflineMsg", function (params: {
            options: {
                from: number,
                to: number,
            },
            callback: (success: boolean, result: {
                from: number,
                to: number
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinOrgOfflinePacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 接口7--接收各种通知
        self.baseSdk.register("orgMsgBind", function (params: { callback: any; }) {
            let callback = params.callback;
            self.listener = callback;
        });

        // 接口9--用户初始化群
        self.baseSdk.register("initOrgInfo", function (params: {
            options: {
                from: number,
                to: number,
                // event: number,
                version: number
            },
            callback: (success: boolean, result: {
                from: number,
                to: number,
                index: number,
                version: number,
                type: number,
                orgUserInitInfo: any
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinOrginitInfoPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 接口10--群组邀请好友加入群
        self.baseSdk.register("OrgInviteBuddy", function (params: {
            options: {
                from: number,
                orgId: number,
                inviteName: string,
                orgName: string,
                info?: any
            },
            callback: (success: boolean, result: {
                from: number,
                to: number,
                version: number
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinOrgInviteBuddyPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 接口11--是否同意加入群
        self.baseSdk.register("IsAgreeJoinOrg", function (params: {
            options: {
                from: number,
                groupId: number,
                myName: string,
                inviteUserId: number,
                inviteName: string,
                isAgree: number
            },
            callback: (success: boolean, result: {
                from: number,
                groupId: number,
                key: number
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinIsAgreeJoinOrgPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 接口12--用户初始化群包含用户信息
        self.baseSdk.register("initOrgInfoNew", function (params: {
            options: {
                from: number,
                to: number,
                // event: number,
                version: number
            },
            callback: (success: boolean, result: {
                from: number,
                to: number,
                groupPortraitId: number,
                groupName: string,
                groupProclamation: string,
                groupIntroduction: string,
                administratorsId: number | number[],
                mainGroupId: number | number[],
                groupSize: number | number[],
                version: number,
                type: number,
                orgUserInfo: any
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinOrginitUsernamePacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 接口13--解散群组
        self.baseSdk.register("unorganize", function (params: {
            options: {
                from: number,
                to: number,
                // event: number
            },
            callback: (success: boolean, result: {
                from: number,
                to: number,
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinUnorgPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 接口14--转移群主
        self.baseSdk.register("changeOrgCreater", function (params: {
            options: {
                orgId: number,
                originCreater: number,
                curCreater: number
            },
            callback: (success: boolean, result: {
                from: number,
                version: number
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinOrgChangeCreaterPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 内部1--绑定监听
        self.baseSdk.addBinder({
            moduleId: MODULE_ID,
            binder: function (session: any, moduleType: string, serverPublish: any) {
                console.log("收到通知", serverPublish);
                if (moduleType !== MODULE_ID) {
                    return;
                }
                if (serverPublish.event == 16) { // 被邀请加入群
                    serverPublish.event = 'inviteOrgiNotify'
                } else if (serverPublish.event == 17) { // 群信息更新通知
                    serverPublish.event = 'updateOrgInfNotify'
                } else if (serverPublish.event == 18) { // 新增群组成员通知
                    serverPublish.event = 'memberComeInReply'
                } else if (serverPublish.event == 19) { // 成员退出群通知
                    serverPublish.event = 'leaveOrgNotify'
                } else if (serverPublish.event == 22) { // 转移群主通知
                    serverPublish.event = 'changeCreaterNotify'
                } else if (serverPublish.event == 39) { // 解散群通知
                    serverPublish.event = 'unOrgNotify'
                } else if (serverPublish.event == 42) { // 变更管理权限通知
                    serverPublish.event = 'changeOrgManageNotify'
                } else if (serverPublish.event == 109) { // 获取离线群通知
                    serverPublish.event = 'offlineNotify'
                } else if (serverPublish.event == 33) { // 拒绝邀请加入群通知
                    serverPublish.event = 'refuseJoinOrgNotify'
                } 
                self.listener && self.listener(session, moduleType, serverPublish);
            }
        });    
    }
};

export {
    TeatalkGroupSdk
};