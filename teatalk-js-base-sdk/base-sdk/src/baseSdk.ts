/**
 * Created by H5 on 2020/2/14.
 */

import { CLIENT_STATE } from "./Constant";
import { Session } from "./Session";
import { SessionOption } from "./SessionOption";
import { TokenSessionOption } from "./TokenSessionOption";
import { templates as baseTemplates } from "./base-packets/base-templates";
import { TemplateManager } from "./TemplateManager";
import { CinResponsePacket } from "./cin/CinResponsePacket";
import { applyProperties, MediaUtil } from "./util/utils";
import { App } from "./App";

import { CinWEBIMLogoutPacket } from "./base-packets/WEBIMLogoutTransaction";
import { CinWEBIMSystemTimePacket } from "./base-packets/WEBIMSystemTimeTransaction";
import { CinWEBIMQrcodePacket } from "./base-packets/WEBIMQrcodeTransaction";
import { CinWEBIMQrcodeConnectPacket } from "./base-packets/WEBIMQrcodeLogonTransaction";

import "./base-packets/WEBIMLogonOfflineTransaction";

const MODULE_ID = "BASE";
TemplateManager.loadTemplates(MODULE_ID, baseTemplates);

// 别名：CAKESdk
let TeatalkBaseSdk: any = {
    sdkParams: {
        connect_url: ""
    },
    handlers: {},
    ses: null,
    app: App,
    MediaUtil,
    listeners: {},
    stateListener: null,
    init: function (sdkParams: any) {
        let self = this;
        self.sdkParams = applyProperties(self.sdkParams, sdkParams || {});

        self.register("baseBind", function (params: { callback: any; }) {
            let callback = params.callback;
            self.stateListener = callback;
        });

        self.register("connect", function (params: {
            options: {
                name: string,
                password: string,
                wcmpInfo: number,
                keepAlive: number,
                binary: boolean,
                logonType: number,
                channel: number,
                type: number,
                status: number,
                credential: number,
            },
            callback?: (success: boolean, result: any, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let binary = options.binary || false;
            App.binary = binary;
            let logonType = options.logonType;
            // let channel = options.channel;
            if (logonType == 1) { // token登录
                var ses: Session = new Session(<TokenSessionOption>{
                    url: self.sdkParams.connect_url,
                    name: options.name,
                    password: options.password,
                    channel: options.channel,
                    // wcmpInfo: options.wcmpInfo,
                    type: options.type,
                    status: options.status,
                    keepAlive: options.keepAlive || 60,
                    binary: binary
                });
            } else if (logonType == 0) { // 密码登录
                var ses: Session = new Session(<SessionOption>{
                    url: self.sdkParams.connect_url,
                    name: options.name,
                    password: options.password,
                    channel: options.channel,
                    type: options.type,
                    status: options.status,
                    credential: options.credential,
                    keepAlive: options.keepAlive || 60,
                    binary: binary
                });
            } else if (logonType == 2) { //扫码登陆
                console.log('扫码登陆')
                var ses: Session = new Session(<SessionOption>{
                    url: self.sdkParams.connect_url,
                    channel: options.channel,
                    type: options.type,
                    status: options.status,
                    credential: options.credential,
                    keepAlive: options.keepAlive || 60,
                    binary: binary
                });
            }
            ses.onStateChange = function (session, newStateCode, oldStateCode, reason, packet, packetContent, logonType) {
                let newState = CLIENT_STATE[newStateCode];
                let oldState = CLIENT_STATE[oldStateCode];
                reason && console.warn("之前状态：" + oldState + "," + "当前状态：" + newState + ",原因：" + reason);
                packetContent && console.warn(packetContent);
                try {
                    self.stateListener && self.stateListener(newState, oldState, reason, packet);
                } catch (e) {
                    console.warn("处理IM状态变更时出错：" + e);
                }
            };

            ses.onServerPublish = function (session: Session, moduleType: string, serverPublish: any) {
                if (self.listeners[moduleType]) {
                    let listenersQueue = self.listeners[moduleType];
                    for (let i = 0; i < listenersQueue.length; i++) {
                        let binder = listenersQueue[i];
                        binder && binder(session, moduleType, serverPublish);
                    }
                }
            };
            TeatalkBaseSdk.ses = ses;
            readyHandler({ callback: callback }, logonType);
        });

        // 接口2--退出登录
        self.register("logout", function (params: {
            options: {
                from: number,
            },
            callback: (success: boolean, result: {
                from: number,
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, { type: null });
            let packet = new CinWEBIMLogoutPacket(object);
            self.ses.sendRequest(packet, callback);
            self.ses.close('注销用户登录');
        });

        // 接口3--获取服务端时间戳
        self.register("getSystemTime", function (params: {
            options: {
                from: number,
            },
            callback: (success: boolean, result: {
                systemTime: number,
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinWEBIMSystemTimePacket(object);
            self.ses.sendRequest(packet, callback);
        });

        // 接口4--接收各种通知
        self.register("baseMsgBind", function (params: { callback: any; }) {
            let callback = params.callback;
            self.listener = callback;
        });

        // 内部1--绑定监听
        self.addBinder({
            moduleId: MODULE_ID,
            binder: function (session: any, moduleType: string, serverPublish: any) {
                // console.log("登录监听", serverPublish);
                if (moduleType !== MODULE_ID) {
                    return;
                }
                if (serverPublish.event == 8) { // 被踢下线
                    serverPublish.event = 'WEBIMLogonOffline';
                    self.ses.close('用户被踢下线');
                }
                self.listener && self.listener(session, moduleType, serverPublish);
            }
        });

        // 获取二维码
        self.register('getQrcode', function(params: {
            options: {},
            callback: (success: boolean, result: { status: string }, reason? : string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinWEBIMQrcodePacket(object);
            self.ses.sendRequest(packet, (success: boolean, result: { status: string }, reason? : string) => {
                success && (App.loginUserId = result['userId']);
                callback(success, result, reason);
            });
        })

        //获取二维码状态
        self.register('getQrcodeState', function(params: {
            options: {},
            callback: (success: boolean, result: { status: string }, reason? : string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinWEBIMQrcodeConnectPacket(object);
            self.ses.sendRequest(packet, (success: boolean, result: { status: string }, reason? : string) => {
                success && (App.loginUserId = result['userId']);
                callback(success, result, reason);
            });
        })

        let readyHandler = function (params: {
            callback: (success: boolean, result: any, reason?: string) => void
        }, logonType) {
            let callback = params.callback;
            if (!self.ses) {
                console.error("session未初始化");
                callback && callback(false, {
                    response: "NotAvailable"
                }, "session未初始化");
                return;
            }

            self.ses.connect(null, logonType, (success: boolean, ackPacket: CinResponsePacket, reason: string) => {
                console.log('dologin-connect', '--readyHandler')
                if (ackPacket.response === "OK") {
                    console.log("----------------------IM传输连接已建立----------------------");
                } else {
                    console.warn("IM传输连接建立失败:" + ackPacket.response);
                }
                callback && callback(success, ackPacket, reason);
            });
        };

        self.register("ready", readyHandler);
    },
    addBinder: function (params: { moduleId: any; binder: any; }) {
        let self = this;
        let moduleId = params.moduleId;
        let binder = params.binder;
        let listenersQueue = self.listeners[moduleId];
        if (!listenersQueue) {
            listenersQueue = [];
            self.listeners[moduleId] = listenersQueue;
        }
        listenersQueue.push(binder);
    },
    register: function (methodName: string | number, handler: any) {
        let self = this;
        self.handlers[methodName] = handler;
    },
    invoke: function (methodName: string | number, params: { options?: any, callback?: any; }) {
        params = params || {};
        let self = this;
        let thisMethodHandler = self.handlers[methodName];
        if (!thisMethodHandler) {
            let callback = params.callback;
            if (callback) {
                callback(false, {}, "sdk方法缺失");
            }
            return;
        }

        return thisMethodHandler(params);
    }
};

export {
    TeatalkBaseSdk
};
