// import { Base64 } from 'js-base64';
import { Base64 } from "../../../../base-sdk/src/util/utils";
import { CinFilePacket, CinCardPacket } from "./pp-body-packets";
import { TemplateManager } from "../../../../base-sdk/src/TemplateManager";
import { CinSubMessage } from "../../../../base-sdk/src/cin/CinSubMessage";
import { App } from "../../../../base-sdk/src/App";

export let encode = function (content: any, binary: boolean, type?: number) {
    if (type === null || type === undefined) { // 纯文本
        if (!binary) {
            return { // wcmp后端encode和decode不一致，这里只能专门处理下
                Body: Base64.base64Encode(content)
                // Body: Base64.toBase64(content)
            };
        } else {
            return null;
        }
    } else if (type === 0 || type === 2 || type === 3 || type === 5) { // 图片、文件、视频、相册
        let packet = new CinFilePacket(content);
        let template = TemplateManager.getTemplateByName("PPFileMessage").define;
        let msg = packet.toCinSubMessage(template);
        if (!binary) {
            return msg.toJson(template);
        } else {
            return msg.toBytes();
        }
    } else if (type === 6) { // 名片
        let packet = new CinCardPacket(content);
        let template = TemplateManager.getTemplateByName("PPCardMessage").define;
        let msg = packet.toCinSubMessage(template);
        if (!binary) {
            return msg.toJson(template);
        } else {
            return msg.toBytes();
        }
    } else {
        return null;
    }
};

export let decode = function (type, contentBuffer, binary) {
    if (type === null || type === undefined) { // 纯文本
        if (!binary) {
            if (App.needDecodeBase64) { // wcmp拉历史消息竟然又是明文了
                return contentBuffer;//不需要base64加密
                // return Base64.base64Decode(contentBuffer, null); // wcmp后端下行无base64编码
            }
            return contentBuffer;
        } else {
            return null;
        }
    } else if (type === 0 || type === 2 || type === 3 || type === 5) { // 图片、文件、视频、相册
        let msg = new CinSubMessage();
        let template = TemplateManager.getTemplateByName("PPFileMessage").define;
        if (!binary) {
            msg.fromJson(template, contentBuffer);
        } else {
            msg.fromBytes(new Uint8Array((<ArrayBuffer>contentBuffer)));
        }
        return msg.toSubPacket(template, "msgBody_2");
    } else if (type === 6) { // 名片
        let msg = new CinSubMessage();
        let template = TemplateManager.getTemplateByName("PPCardMessage").define;
        if (!binary) {
            msg.fromJson(template, contentBuffer);
        } else {
            msg.fromBytes(new Uint8Array((<ArrayBuffer>contentBuffer)));
        }
        return msg.toSubPacket(template, "msgBody_6");
    } else if (type === 12) { // 图文
        let msg = new CinSubMessage();
        let template = TemplateManager.getTemplateByName("PPGraphicTextMessage").define;
        if (!binary) {
            msg.fromJson(template, contentBuffer);
        } else {
            msg.fromBytes(new Uint8Array((<ArrayBuffer>contentBuffer)));
        }
        return msg.toSubPacket(template, "ppBody_12");
    } else {
        return null;
    }
};