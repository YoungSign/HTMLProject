import { applyProperties } from "./../../base-sdk/src/util/utils";
import { UploadFactory } from "./UploadFactory";
import { Upload } from "./httpUpload/Upload";

const MODULE_ID = "TRANSFER";

let TeatalkTransferSdk: any = {
    sdkParams: {},
    baseSdk: null,
    listener: null,
    uploadFactory: UploadFactory,
    init: function (sdkParams: { baseSdk: any }) {
        let self = this;
        self.baseSdk = sdkParams.baseSdk;
        if (!self.baseSdk) {
            console.error("未找到基础sdk");
            return;
        }
        self.sdkParams = applyProperties(self.sdkParams, sdkParams);
        self.baseSdk.register("createUpload", function(params: any) {
            let callback = params.callback;
            let options = params.options;
            let upload: Upload = UploadFactory.getInstance(options);
            callback(upload);
        });
    }
};

export {
    TeatalkTransferSdk
};