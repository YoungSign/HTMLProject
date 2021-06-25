import { applyProperties } from "../../base-sdk/src/util/utils";
import { templates as ppTemplates } from "./pp-packets/pp-templates";
import { templates as ppBodyTemplates } from "./pp-packets/body/pp-body-template";
import { TemplateManager } from "../../base-sdk/src/TemplateManager";

import { CinPPFocusListPacket } from "./pp-packets/ppFocusListTransaction";
import { CinSearchPPAccountPacket } from "./pp-packets/searchPPAccountTransaction";
import { CinSetPPFocusPacket } from "./pp-packets/setPPFocusTransaction";
import { CinSetPPReceivePacket } from "./pp-packets/setPPReceiveTransaction";
import { CinSetPullOfflineMsgPacket} from "./pp-packets/PullOfflineMsgTransaction";

import "./pp-packets/ppMsgReceiveTrasaction";

// import { encode as encodeContent } from "./pp-packets/body/ppBodyParser";

const MODULE_ID = "PP";
TemplateManager.loadTemplates(MODULE_ID, ppTemplates);
TemplateManager.loadTemplates(MODULE_ID, ppBodyTemplates);

enum FileNotifyHandleName {
    STATE = "state",
    PROGRESS = "progress"
}

let TeatalkPPSdk: any = {
    sdkParams: {},
    baseSdk: null,
    transferSdk: null,
    listener: null,
    msgFileUpload: null,
    init: function (sdkParams: { baseSdk: any, transferSdk?: any }) {
        let self = this;
        self.sdkParams = applyProperties(self.sdkParams, sdkParams);
        self.baseSdk = sdkParams.baseSdk;
        self.transferSdk = sdkParams.transferSdk || null;
        if (!self.baseSdk) {
            console.error("未找到基础sdk");
            return;
        }

                
        // 接口1--获取所有关注的公众账号列表
        self.baseSdk.register("getPPFocusList", function (params: {
            options: {
                from: number,   // 查询者id
                accountType?: number    // 账号类别
            },
            callback: (success: boolean, result: {
                from: number,   // 查询者id
                status: string, // 错误信息(依据请求头的Language来判断返回的错误内容语言)
                focusNum: number,   // 关注的公众账号总数量
                focusPPListInfo: any    // 公众号信息
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinPPFocusListPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 接口2--搜索公众账号
        self.baseSdk.register("searchPPAccount", function (params: {
            options: {
                from: number,   // 查询者id
                reqNum: number, // 请求的数量
                startPos: number,   // 起始位置
                type?: number,   // 账号类别，不携带则默认是全部
                searchKey: string,   // 按照公众账号，名字，描述进行模糊搜索，不填写等同与获取推荐公众账号
                channelId: string   // 渠道号id
            },
            callback: (success: boolean, result: {
                from: number,   // 查询者id
                email: number,  // 邮件
                status: string, // 错误信息(依据请求头的Language来判断返回的错误内容语言)
                ppAccountNum: number, // 搜索到的公众号数量
                focusPPListInfo: any    // 公众号信息
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinSearchPPAccountPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 接口3--取消/关注公众账号
        self.baseSdk.register("setPPFocus", function (params: {
            options: {
                from: number,   // 查询者id
                to: number, // 公众号id
                eventType: number,  // 事件类型，0(取消订阅)、1(订阅)
                channelId: number   // 渠道Id
            },
            callback: (success: boolean, result: {
                from: number,   // 查询者id
                status: string  // 错误信息(依据请求头的Language来判断返回的错误内容语言)
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinSetPPFocusPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 接口4--公众账号接收消息开关
        self.baseSdk.register("setPPReceive", function (params: {
            options: {
                from: number,   // 查询者id
                to: number, // 公众号id
                switcher: number  // 开关类型 0：接收消息 1：不接收消息
            },
            callback: (success: boolean, result: {
                from: number,   // 查询者id
                status: string  // 错误信息(依据请求头的Language来判断返回的错误内容语言)
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinSetPPReceivePacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 接口5 -- 公众号离线推送接口
        self.baseSdk.register("pullOfflineMsg", function(params:{
            options: {
                from: number,
                orgUserInfo?: any
            },
            callback: (success: boolean, result: {
                status: string,
                content: any
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinSetPullOfflineMsgPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        })

        // 消息注册监听--接收各种消息
        self.baseSdk.register("PPBind", function (params: { callback: any; }) {
            let callback = params.callback;
            self.listener = callback;
        });

 
        // 内部1--绑定监听
        self.baseSdk.addBinder({
            moduleId: MODULE_ID,
            binder: function (session: any, moduleType: string, serverPublish: any) {
                console.log("收到消息", serverPublish);
                if (moduleType !== MODULE_ID) {
                    return;
                }
                if (serverPublish.event == 1) { // 收消息
                    serverPublish.event = 'receivePPMsg'
                }
                self.listener && self.listener(session, moduleType, serverPublish);
            }
        });
    }
};

declare global {

    interface File {
        relativePath: string;
        webkitRelativePath: string;
        fileName: string;
        uid: string;
    }
}

export {
    TeatalkPPSdk
};