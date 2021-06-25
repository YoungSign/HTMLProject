import { applyProperties } from "../../base-sdk/src/util/utils";
import { templates as abcTemplates } from "./abc-packets/abc-templates";
import { TemplateManager } from "../../base-sdk/src/TemplateManager";
import { GetTokenByUserIdPacket } from "./abc-packets/GetTokenByUserId";
import { GetGWAddressPacket } from "./abc-packets/GetGWAddress";

const MODULE_ID = "TAKE";
TemplateManager.loadTemplates(MODULE_ID, abcTemplates);

let TeatalkAbcSdk: any = {
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

        // 接口1--根据userId获取token
        self.baseSdk.register("getTokenByUserId", function (params: {
            options: {
                to: number
            },
            callback: (success: boolean, result: {
                token: string,
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new GetTokenByUserIdPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });

        // 接口2--根据token和channelId获取GW地址
        self.baseSdk.register("getGWAddress", function (params: {
            options: {
                channel: string,
                to: number
            },
            callback: (success: boolean, result: {
                address: string,
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new GetGWAddressPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });
    }
};

export {
    TeatalkAbcSdk
};