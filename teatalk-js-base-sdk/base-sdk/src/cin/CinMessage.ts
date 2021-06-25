/**
 * Created by H5 on 2020/3/4.
 */
import { FIELD_TYPE } from "./../Constant";
import { CinHeader } from "./CinHeader";
import { CinBody } from "./CinBody";
import { hexToBytes, bytesToHex } from "../util/utils";
import { CinSubMessage } from "./CinSubMessage";
import { TemplateManager } from "../TemplateManager";
import { CinPacket } from "./CinPacket";

export class CinMessage {

    headers: Array<CinHeader>;
    bodys: Array<CinBody>;

    addHeader(head: CinHeader): CinMessage {
        if (!this.headers) {
            this.headers = [];
        }
        this.headers.push(head);
        return this;
    }

    addBody(body: CinBody): CinMessage {
        if (!this.bodys) {
            this.bodys = [];
        }
        this.bodys.push(body);
        return this;
    }

    toPacket(template: any, packet: CinPacket): void {
        let headersTempl = template["Headers"];
        // headers
        let headers = this.headers || [];
        for (let i = 0; i < headers.length; i++) {
            let header = headers[i];
            let headerId = header.id;
            if (headerId === "CallId") {
                continue;
            }
            let headerVal = header.value;
            let hTempl = headersTempl[headerId];
            let alias = hTempl["Alias"];
            let isList = hTempl["isList"];
            if (packet[alias]) { // multi (not first)
                if (!Array.isArray(packet[alias])) {
                    console.error(alias + "数组类型数据" + headerVal + "提取错误：" + packet[alias]);
                    continue;
                }
                packet[alias].push(headerVal);
            } else {
                if (isList) { // multi (first)
                    packet[alias] = [];
                    packet[alias].push(headerVal);
                } else { // single
                    packet[alias] = headerVal;
                }
            }
        }
        // bodys
        let bTempls = headersTempl["Body"];
        let bodys = this.bodys || [];
        for (let i = 0; i < bodys.length; i++) {
            let body = bodys[i];
            let bodyId = body.id;
            let bodyVal = body.value;
            let bTempl = bTempls[bodyId];
            let alias = bTempl["Alias"];
            let typeCode = bTempl["Type"];
            let type = FIELD_TYPE[typeCode];
            let isList = bTempl["isList"];
            if (packet[alias]) { // multi (not first)
                if (!Array.isArray(packet[alias])) {
                    console.error(alias + "数组类型数据" + bodyVal + "写入错误：" + packet[alias]);
                    continue;
                }
                if (type === "body") {
                    let subCinMsg: CinSubMessage = <CinSubMessage> bodyVal;
                    let subId: string = bTempl["_id_"];
                    let subTemplate = TemplateManager.getTemplateByName(subId).define;
                    packet[alias].push(subCinMsg.toSubPacket(subTemplate, subId));
                    continue;
                } else {
                    packet[alias].push(bodyVal);
                }
            } else {
                if (isList) { // multi (first)
                    packet[alias] = [];
                    if (type === "body") {
                        let subCinMsg: CinSubMessage = <CinSubMessage> bodyVal;
                        let subId: string = bTempl["_id_"];
                        let subTemplate = TemplateManager.getTemplateByName(subId).define;
                        packet[alias].push(subCinMsg.toSubPacket(subTemplate, subId));
                        continue;
                    } else {
                        packet[alias].push(bodyVal);
                    }
                } else { // single
                    if (type === "body") {
                        let subCinMsg: CinSubMessage = <CinSubMessage> bodyVal;
                        let subId: string = bTempl["_id_"];
                        let subTemplate = TemplateManager.getTemplateByName(subId).define;
                        packet[alias] = subCinMsg.toSubPacket(subTemplate, subId);
                        continue;
                    } else {
                        packet[alias] = bodyVal;
                    }
                }
            }
        }
    }

    toJson(template: any): any {
        let headersTempl = template["Headers"];
        let out = {};
        // headers
        let headers = this.headers || [];
        for (let i = 0; i < headers.length; i++) {
            let header = this.headers[i];
            let headerId = header.id;
            if (headerId === "CallId") {
                continue;
            }
            let headerVal = header.value;
            let hTempl = headersTempl[headerId];
            let typeCode = hTempl["Type"];
            let type = FIELD_TYPE[typeCode];
            let isList = hTempl["isList"];
            if (out[headerId]) { // multi (not first)
                if (!Array.isArray(out[headerId])) {
                    console.error(headerId + "数组类型数据" + headerVal + "写入错误：" + out[headerId]);
                    continue;
                }
                if (headerVal == undefined) {
                    continue;
                }
                let hVal = null;
                if (type === "bytes") {
                    hVal = bytesToHex(<number[]>headerVal);
                } else if (type === "byte") {
                    hVal = bytesToHex([<number>headerVal]);
                } else {
                    hVal = headerVal;
                }
                let valItem = {}; // 处理后端特殊的格式，希望后端改进
                valItem[out[headerId].length + 1] = hVal;
                out[headerId].push(valItem);
                // out[headerId].push(hVal)
            } else {
                if (isList) { // multi (first)
                    out[headerId] = [];
                    if (headerVal == undefined) {
                        continue;
                    }
                    let hVal = null;
                    if (type === "bytes") {
                        hVal = bytesToHex(<number[]>headerVal);
                    } else if (type === "byte") {
                        hVal = bytesToHex([<number>headerVal]);
                    } else {
                        hVal = headerVal;
                    }
                    let valItem = {}; // 处理后端特殊的格式，希望后端改进
                    valItem[1] = hVal;
                    out[headerId].push(valItem);
                    // out[headerId].push(hVal) 
                } else { // single
                    if (headerVal == undefined) {
                        continue;
                    }
                    let hVal = null;
                    if (type === "bytes") {
                        hVal = bytesToHex(<number[]>headerVal);
                    } else if (type === "byte") {
                        hVal = bytesToHex([<number>headerVal]);
                    } else {
                        hVal = headerVal;
                    }
                    out[headerId] = hVal;
                }
            }
        }
        // bodys
        let bTempls = headersTempl["Body"];
        let bodys = this.bodys || [];
        for (let i = 0; i < bodys.length; i++) {
            let body = bodys[i];
            let bodyId = body.id;
            let bodyVal = body.value;
            let bTempl = bTempls[bodyId];
            let typeCode = bTempl["Type"];
            let type = FIELD_TYPE[typeCode];
            let isList = bTempl["isList"];
            if (bodys.length > 1 && out["Body"]) { // multi (not first)
                if (!Array.isArray(out["Body"])) {
                    console.error("Body数组类型数据" + bodyVal + "写入错误：" + out["Body"]);
                    continue;
                }
                if (bodyVal == undefined) {
                    continue;
                }
                let bVal = null;
                if (type === "body") {
                    let subCinMsg: CinSubMessage = <CinSubMessage> bodyVal;
                    let subId: string = bTempl["_id_"];
                    if (bodyId === "At") {
                        let valItem = {};
                        valItem["Body"] = subCinMsg.toJson(TemplateManager.getTemplateByName(subId).define)['Headers']['Body'];
                        out["Body"].push(valItem);
                    } else {
                        out["Body"].push(subCinMsg.toJson(TemplateManager.getTemplateByName(subId).define));
                    }
                    continue;
                } else if (type === "bytes") {
                    bVal = bytesToHex(<number[]>bodyVal);
                } else if (type === "byte") {
                    bVal = bytesToHex([<number>bodyVal]);
                } else {
                    bVal = bodyVal;
                }
                let valItem = {}; // 处理后端特殊的格式，希望后端改进
                valItem[out["Body"].length + 1] = bVal;
                out["Body"].push(valItem);
                // out["Body"].push(bVal)
            } else if (bodys.length === 1 || (bodys.length > 1 && !out["Body"])) {
                if (isList) { // multi (first)
                    out["Body"] = [];
                    if (bodyVal == undefined) {
                        continue;
                    }
                    let bVal = null;
                    if (type === "body") {
                        let subCinMsg: CinSubMessage = <CinSubMessage> bodyVal;
                        let subId: string = bTempl["_id_"];
                        out["Body"].push(subCinMsg.toJson(TemplateManager.getTemplateByName(subId).define));
                        continue;
                    } else if (type === "bytes") {
                        bVal = bytesToHex(<number[]>bodyVal);
                    } else if (type === "byte") {
                        bVal = bytesToHex([<number>bodyVal]);
                    } else {
                        bVal = bodyVal;
                    }
                    let valItem = {}; // 处理后端特殊的格式，希望后端改进
                    valItem[1] = bVal;
                    out["Body"] = [];
                    out["Body"].push(valItem);
                    // out["Body"].push(bVal)
                } else { // single
                    if (bodyVal == undefined) {
                        continue;
                    }
                    let bVal = null;
                    if (type === "body") {
                        let subCinMsg: CinSubMessage = <CinSubMessage> bodyVal;
                        let subId: string = bTempl["_id_"];
                        out["Body"] = subCinMsg.toJson(TemplateManager.getTemplateByName(subId).define);
                        continue;
                    } else if (type === "bytes") {
                        bVal = bytesToHex(<number[]>bodyVal);
                    } else if (type === "byte") {
                        bVal = bytesToHex([<number>bodyVal]);
                    } else {
                        bVal = bodyVal;
                    }
                    if (bodys.length === 1) {
                        out["Body"] = bVal;
                    } else {
                        out["Body"]  = [];
                        out["Body"].push(bVal);
                    }
                }
            }
        }
        return out;
    }

    fromJson(template: any, cinContent: any): void {
        let headersTempl = template["Headers"];

        for (let key in cinContent) {
            let hTempl = headersTempl[key];
            if (key !== "Body") { // header
                if (key === "WcmpInfo") {
                    continue;
                }
                if (!hTempl) {
                    console.warn("模板未定义数据项：" + key);
                    continue;
                }
                let typeCode = hTempl["Type"];
                let type = FIELD_TYPE[typeCode];
                let isList = hTempl["isList"];
                let value = cinContent[key];
                if (isList) { // multi
                    if (!Array.isArray(value)) {
                        console.error(key + "数据类型错误");
                        continue;
                    }
                    for (let i = 0; i < value.length; i++) {
                        let hVal = value[i][i + 1]; // 处理后端特殊的格式，希望后端改进
                        if (type === "bytes") {
                            let cinH = new CinHeader(key, hexToBytes(hVal));
                            this.addHeader(cinH);
                        } else if (type === "byte") {
                            let cinH = new CinHeader(key, hexToBytes(hVal)[0]);
                            this.addHeader(cinH);
                        } else {
                            let cinH = new CinHeader(key, hVal);
                            this.addHeader(cinH);
                        }
                    }
                } else { // single
                    if (type === "bytes") {
                        let cinH = new CinHeader(key, hexToBytes(value));
                        this.addHeader(cinH);
                    } else if (type === "byte") {
                        let cinH = new CinHeader(key, hexToBytes(value)[0]);
                        this.addHeader(cinH);
                    } else {
                        let cinH = new CinHeader(key, value);
                        this.addHeader(cinH);
                    }
                }
            } else { // body
                for (let bodyId in hTempl) {
                    let bTempl = hTempl[bodyId];
                    if (!bTempl) {
                        console.warn("模板未定义数据项：Body");
                        continue;
                    }
                    let typeCode = bTempl["Type"];
                    let type = FIELD_TYPE[typeCode];
                    let isList = bTempl["isList"];
                    let value = cinContent[key];
                    if (isList) { // multi
                        if (!Array.isArray(value)) {
                            console.error(key + "数据类型错误");
                            continue;
                        }
                        for (let i = 0; i < value.length; i++) {
                            if (type === "body") {
                                let subCinMsg: CinSubMessage = new CinSubMessage();
                                let subId: string = bTempl["_id_"];
                                subCinMsg.fromJson(TemplateManager.getTemplateByName(subId).define, value[i]);
                                let cinB = new CinBody(bodyId, subCinMsg);
                                this.addBody(cinB);
                            } else if (type === "bytes") {
                                let cinB = new CinBody(bodyId, hexToBytes(value[i][i + 1]));
                                this.addBody(cinB);
                            } else if (type === "byte") {
                                let cinB = new CinBody(bodyId, hexToBytes(value[i][i + 1])[0]);
                                this.addBody(cinB);
                            } else {
                                let cinB = new CinBody(bodyId, value[i][i + 1]);
                                this.addBody(cinB);
                            }
                        }
                    } else { // single
                        if (type === "body") {
                            let subCinMsg: CinSubMessage = new CinSubMessage();
                            let subId: string = bTempl["_id_"];
                            subCinMsg.fromJson(TemplateManager.getTemplateByName(subId).define, value);
                            let cinB = new CinBody(bodyId, subCinMsg);
                            this.addBody(cinB);
                        } else if (type === "bytes") {
                            let cinB = new CinBody(bodyId, hexToBytes(value));
                            this.addBody(cinB);
                        } else if (type === "byte") {
                            let cinB = new CinBody(bodyId, hexToBytes(value)[0]);
                            this.addBody(cinB);
                        } else {
                            let cinB = new CinBody(bodyId, value);
                            this.addBody(cinB);
                        }
                    }
                }
            }
        }
    }

    // Todo
    toBytes(): Uint8Array {
        return null;
    }

    // Todo
    fromBytes(input: Uint8Array): void {

    }

    protected findCinHeader(headerId: string): CinHeader {
        if (!this.headers) {
            return null;
        }
        for (let i = 0; i < this.headers.length; i++) {
            let header = this.headers[i];
            let id = header.id;
            if (id === headerId) {
                return header;
            }
        }
        return null;
    }
}