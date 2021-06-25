import { TeatalkBaseSdk } from "../../base-sdk/src/baseSdk";
import { TeatalkTransferSdk } from "../../transfer-sdk/src/transferSdk";
import { TeatalkMsgSdk } from "../../msg-sdk/src/msgSdk";
import { TeatalkPPSdk } from "../../pp-sdk/src/ppSdk";
// import { TeatalkRtcSdk } from "../../rtc-sdk/src/rtcSdk";
// import { TeatalkPeerAvSdk } from "../../peer-av-sdk/src/peerAvSdk";
// import { TeatalkMultiAvSdk } from "../../multi-av-sdk/src/multiAvSdk"
import { TeatalkGroupSdk } from "../../group-sdk/src/groupSdk";
import { TeatalkFriendSdk } from "../../friend-sdk/src/friendSdk";
import { TeatalkContactSdk } from "../../contact-sdk/src/contactSdk";
import { TeatalkAbcSdk } from "../../abc-sdk/src/abcSdk";
import { applyProperties } from "../../base-sdk/src/util/utils";
// import { TeatalkCallSdk } from "../../voip-call-sdk/src/callSdk"
// import { TeatalkEnterpriseSdk } from "../../enterprise-sdk/src/enterpriseSdk";

let TeatalkSdk = {
    init: function(params) {
        let sdkParams = params || {};
        TeatalkBaseSdk.init(sdkParams.BASE);
        TeatalkTransferSdk.init(applyProperties(sdkParams.TRANSFER, { baseSdk: TeatalkBaseSdk }));
        TeatalkMsgSdk.init(applyProperties(sdkParams.MSG, { baseSdk: TeatalkBaseSdk, transferSdk: TeatalkTransferSdk }));
        TeatalkPPSdk.init(applyProperties(sdkParams.PP, {baseSdk: TeatalkBaseSdk, transferSdk: TeatalkTransferSdk}));
        // TeatalkRtcSdk.init(applyProperties(sdkParams.RTC, {baseSdk: TeatalkBaseSdk}));
        // TeatalkPeerAvSdk.init(applyProperties(sdkParams.PEERAV, {baseSdk: TeatalkBaseSdk}));
        // TeatalkMultiAvSdk.init(applyProperties(sdkParams.PEERAV, {baseSdk: TeatalkBaseSdk}));
        TeatalkGroupSdk.init(applyProperties(sdkParams.GROUP, { baseSdk: TeatalkBaseSdk }));
        TeatalkFriendSdk.init(applyProperties(sdkParams.SOCIAL, { baseSdk: TeatalkBaseSdk }));
        TeatalkContactSdk.init(applyProperties(sdkParams.CONTACT, { baseSdk: TeatalkBaseSdk }));
        TeatalkAbcSdk.init(applyProperties(sdkParams.ABC, { baseSdk: TeatalkBaseSdk }));
        // TeatalkCallSdk.init(applyProperties(sdkParams.CALL, { baseSdk: TeatalkBaseSdk }));
        // TeatalkEnterpriseSdk.init(applyProperties(sdkParams.ENTERPRISE, { baseSdk: TeatalkBaseSdk }));
    },
    invoke: function(methodName, params) {
        return TeatalkBaseSdk.invoke(methodName, params);
    },
    ses: TeatalkBaseSdk.ses,
    app: TeatalkBaseSdk.app,
    MediaUtil: TeatalkBaseSdk.MediaUtil
}

export {
    TeatalkSdk
};