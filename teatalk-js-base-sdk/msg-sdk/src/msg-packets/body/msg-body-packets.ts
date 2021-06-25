import { CinSubPacket } from "../../../../base-sdk/src/cin/CinSubPacket";
import { METHOD_NAME } from "../../../../base-sdk/src/Constant";
import { PacketManager } from "../../../../base-sdk/src/PacketManager";

export class CinTextAtPacket extends CinSubPacket {
    method: string = METHOD_NAME.message;
    text: string; // :body

    constructor(options: string) {
        super();
        this.text = options;
    }
}

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
    groupType: number;

    constructor(options: any) {
        super();
        if (!options) {
            return;
        }
        this.userId = options.userId;
        this.mobileNo = options.mobileNo || "";
        this.name = options.name || "";
        this.department = options.department || "";
        this.groupType = options.groupType || 0;
    }
}

export class CinLocationPacket extends CinSubPacket {
    method: string = METHOD_NAME.message;
    latitude: number;
    longitude: number;
    thumbId: string;
    thumbSize: number;
    descFileId: string;

    constructor(options: any) {
        super();
        if (!options) {
            return;
        }
        this.latitude = options.latitude;
        this.longitude = options.longitude || "";
        this.thumbId = options.thumbId || "";
        this.thumbSize = options.thumbSize || "";
        this.descFileId = options.descFileId || "";
    }
}

export class CinAudioPacket extends CinSubPacket {
    method: string = METHOD_NAME.message;
    fileId: string;
    fileSize: number;
    type: number;
    bitrate: number;
    totalTime: number;

    constructor(options: any) {
        super();
        if (!options) {
            return;
        }
        this.fileId = options.fileId;
        this.fileSize = options.fileSize || "";
        this.type = options.type || "";
        this.bitrate = options.bitrate || "";
        this.totalTime = options.totalTime || "";
    }
}

PacketManager.setDefine("msgBody_55", CinTextAtPacket);
PacketManager.setDefine("msgBody_2", CinFilePacket);
PacketManager.setDefine("msgBody_6", CinCardPacket);
PacketManager.setDefine("msgBody_7", CinLocationPacket);
PacketManager.setDefine("msgBody_1", CinAudioPacket);