import { applyProperties } from "./../../base-sdk/src/util/utils";
import { templates as friendTemplates } from "./friend-packets/friend-templates";
import { TemplateManager } from "../../base-sdk/src/TemplateManager";

import { CinAddFriendPacket } from "./friend-packets/AddFriendTransaction";
import { CinIsAddFriendPacket } from "./friend-packets/IsAddFriendTransaction";
import { CinDeleteFriendPacket } from "./friend-packets/DeleteFriendTransaction";
import { CinContactListPacket } from "./friend-packets/ContactListTransaction";

import "./friend-packets/SocialNotifyTransaction";
import "./friend-packets/DeleteFriendNotifyTransaction";
import "./friend-packets/ApproveAddFriNotifyTransaction";

const MODULE_ID = "SOCIAL";
TemplateManager.loadTemplates(MODULE_ID, friendTemplates);

let TeatalkFriendSdk: any = {
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

        // 接口1--添加好友
        self.baseSdk.register("addFriend", function (params: {
            options: {
                from: number,
                friendUserId: number,
                nickname: string,
                mobileNo: string,
            },
            callback: (success: boolean, result: {
                from: number,
                dateTime: number,
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinAddFriendPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 接口2--接收各种通知
        self.baseSdk.register("friendMsgBind", function (params: { callback: any; }) {
            let callback = params.callback;
            self.listener = callback;
        });

        // 接口3--是否同意添加好友
        self.baseSdk.register("isAddFriend", function (params: {
            options: {
                from: number,
                type: number,
                friendUserId: number,
                nickname: string,
            },
            callback: (success: boolean, result: {
                from: number,
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinIsAddFriendPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 接口4--删除好友
        self.baseSdk.register("deleteFriend", function (params: {
            options: {
                from: number,
                friendUserId: number
            },
            callback: (success: boolean, result: {
                from: number,
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, { type: null });
            let packet = new CinDeleteFriendPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 接口5--获取朋友圈好友列表
        self.baseSdk.register("getSocialContactList", function (params: {
            options: {
                userid: number,
                version: number
            },
            callback: (success: boolean, result: {
                from: number;
                contactUserid: number;
                version: number;
                friendInfo: any;
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinContactListPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 内部1--绑定监听
        self.baseSdk.addBinder({
            moduleId: MODULE_ID,
            binder: function (session: any, moduleType: string, serverPublish: any) {
                console.log("收到好友通知", serverPublish);
                if (moduleType !== MODULE_ID) {
                    return;
                }
                if(serverPublish.event == 3) { // 被添加好友通知
                    serverPublish.event = 'addFriNotify'
                }else if(serverPublish.event == 4) { // 对方同意添加好友通知
                    serverPublish.event = 'ApproveAddFriNotify'
                }else if(serverPublish.event == 5) { // 被删除好友通知
                    serverPublish.event = 'delFriNotify'
                }
                self.listener && self.listener(session, moduleType, serverPublish);
            }
        });    
    }
};

export {
    TeatalkFriendSdk
};