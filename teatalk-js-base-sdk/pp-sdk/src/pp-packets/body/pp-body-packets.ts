import { CinSubPacket } from "../../../../base-sdk/src/cin/CinSubPacket";
import { METHOD_NAME } from "../../../../base-sdk/src/Constant";
import { PacketManager } from "../../../../base-sdk/src/PacketManager";

export class CinFilePacket extends CinSubPacket {
    method: string = METHOD_NAME.message;
    fileId: string;
    fileSize: number;
    fileName: string;
    thumbId: string;
    thumbSize: number;
    originImageId: string;
    originImageSize: number;

    constructor(options: any) {
        super();
        if (!options) {
            return;
        }
        this.fileId = options.fileId;
        this.fileSize = options.fileSize;
        this.fileName = options.fileName || "";
        this.thumbId = options.thumbId || "";
        this.thumbSize = options.thumbSize || 0;
        this.originImageId = options.originImageId || "";
        this.originImageSize = options.originImageSize || 0;
    }
}

export class CinCardPacket extends CinSubPacket {
    method: string = METHOD_NAME.message;
    userId: string;
    mobileNo: string;
    name: string;
    department: string;

    constructor(options: any) {
        super();
        if (!options) {
            return;
        }
        this.userId = options.userId;
        this.mobileNo = options.mobileNo || "";
        this.name = options.name || "";
        this.department = options.department || "";
    }
}

export class CinGraphicTextPacket extends CinSubPacket {
    method: string = METHOD_NAME.message;
    title: string;  // 标题
    coverId: string;    // 封面id
    imgSize: number;    //  图片大小
    dateTime: number;   
    showOrder: number;  
    template: number;
    materialType: number;
    messageId: string;

    constructor(options: any) {
        super();
        if (!options) {
            return;
        }
        this.title = options.title;
        this.coverId = options.coverId || "";
        this.imgSize = options.imgSize || "";
        this.dateTime = options.dateTime || "";
        this.showOrder = options.showOrder || "";
        this.template = options.template || "";
        this.materialType = options.materialType || "";
        this.messageId = options.messageId || "";
        
    }
}

PacketManager.setDefine("msgBody_2", CinFilePacket);
PacketManager.setDefine("msgBody_6", CinCardPacket);
PacketManager.setDefine("ppBody_12", CinGraphicTextPacket);