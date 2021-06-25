import { applyProperties } from "../../base-sdk/src/util/utils";
import { templates as contactTemplates } from "./contact-packets/contact-templates";
import { TemplateManager } from "../../base-sdk/src/TemplateManager";
import { CinTakeUserInfoPacket } from "./contact-packets/TakeUserInfoTransaction";
import { CinTakeUserInfoByPhoneNumPacket } from "./contact-packets/TakeUserInfoByPhoneNumTransaction";

import { CinTakeCardBatchPacket } from "./contact-packets/TakeCardBatchTransaction";
import { CinTakeStatusPacket } from "./contact-packets/TakeStatusTransaction";
import { CinChangeCardPacket } from "./contact-packets/ChangeCardTransaction";

const MODULE_ID = "TAKE";
TemplateManager.loadTemplates(MODULE_ID, contactTemplates);

let TeatalkContactSdk: any = {
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

        // 接口1--获取用户信息
        self.baseSdk.register("takeUserInfo", function (params: {
            options: {
                from: number,
                to: number,
                version: number
            },
            callback: (success: boolean, result: {
                from: number,
                mobileNo: string,
                status: number,
                version: number,
                visitingCardInfo: any
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinTakeUserInfoPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 接口2--根据手机号获取用户信息
        self.baseSdk.register("takeUserInfoByPhoneNum", function (params: {
            options: {
                key: string,
                channel: number,
                from: number,
            },
            callback: (success: boolean, result: {
                froms: any[],
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinTakeUserInfoByPhoneNumPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

         // 接口3--根据userid获取用户状态
         self.baseSdk.register("takeCardBatch", function (params: {
            options: {
                from: number,
                to: number,
                index: number | number[],
            },
            callback: (success: boolean, result: {
                from: number,
                cardInfo: any
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinTakeCardBatchPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 接口4--设置用户在线状态
        self.baseSdk.register("takeStatus", function (params: {
            options: {
                from: number,
                to: number,
                status: number,
            },
            callback: (success: boolean, result: {
                from: number,
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinTakeStatusPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 接口5--修改用户信息
        self.baseSdk.register("changeCard", function (params: {
            options: {
                from: number,
                changeCardInfo: any,
            },
            callback: (success: boolean, result: {
                from: number,
                version: number,
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinChangeCardPacket(object);
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
                self.listener && self.listener(session, moduleType, serverPublish);
            }
        });
    }
};

export {
    TeatalkContactSdk
};