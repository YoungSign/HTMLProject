/**
 * Created by H5 on 2020/3/4.
 */
import { FIELD_TYPE, PACKET_TYPE } from "../Constant";
import { CinMessage } from "./CinMessage";
import { CinSubMessage } from "./CinSubMessage";
import { CinHeader } from "./CinHeader";
import { CinBody } from "./CinBody";
import { CinSubPacket } from "./CinSubPacket";
import { TemplateManager } from "./../TemplateManager";

export abstract class CinPacket {

    abstract getType(): PACKET_TYPE;

    isAck()  {
        return false;
    }

    isHighQos() {
        return false;
    }

    is(packetType: PACKET_TYPE): boolean {
        return this.getType() === packetType;
    }

    toCinMessage(template: any, cinMsg: CinMessage): CinMessage {
        let headersTempl = template["Headers"];
        let packet = this;

        for (let headerId in headersTempl) {
            let hTempl = headersTempl[headerId];
            if (headerId === "CallId") {
                continue;
            }
            if (headerId !== "Body") { // header
                let alias = hTempl["Alias"];
                if (!packet.hasOwnProperty(alias)) {
                    continue;
                }
                let value = packet[alias];
                if (value == undefined) {
                    continue;
                }
                let isList = hTempl["isList"];
                if (isList) { // multi
                    if (!Array.isArray(value)) {
                        console.error(headerId + "数据类型错误");
                        continue;
                    }
                    for (let i = 0; i < value.length; i++) {
                        let cinH = new CinHeader(headerId, value[i]);
                        cinMsg.addHeader(cinH);
                    }
                } else { // single
                    let cinH = new CinHeader(headerId, value);
                    cinMsg.addHeader(cinH);
                }
            } else { // body
                for (let bodyId in hTempl) {
                    let bTempl = hTempl[bodyId];
                    let alias = bTempl["Alias"];
                    if (!packet.hasOwnProperty(alias)) {
                        continue;
                    }
                    let value = packet[alias];
                    if (value == undefined) {
                        continue;
                    }
                    let typeCode = bTempl["Type"];
                    let type = FIELD_TYPE[typeCode];
                    let isList = bTempl["isList"];
                    if (isList) { // multi
                        let bValArr = Array.isArray(value) ? value : [value];
                        for (let i = 0; i < bValArr.length; i++) {
                            if (type === "body" && bValArr[i] != null && bValArr[i] instanceof CinPacket) { // cinMessage
                                let subId: string = bTempl["_id_"];
                                let subCinMsg: CinSubMessage = (<CinSubPacket>bValArr[i]).toCinSubMessage(TemplateManager.getTemplateByName(subId).define);
                                let cinB = new CinBody(bodyId, subCinMsg);
                                cinMsg.addBody(cinB);
                            } else { // plain
                                let cinB = new CinBody(bodyId, bValArr[i]);
                                cinMsg.addBody(cinB);
                            }
                        }
                    } else { // single
                        if (type === "body") { // cinMessage
                            let subId: string = bTempl["_id_"];
                            let subCinMsg: CinSubMessage = (<CinSubPacket>value).toCinSubMessage(TemplateManager.getTemplateByName(subId).define);
                            let cinB = new CinBody(bodyId, subCinMsg);
                            cinMsg.addBody(cinB);
                        } else { // plain
                            let cinB = new CinBody(bodyId, value);
                            cinMsg.addBody(cinB);
                        }
                    }
                }
            }
        }

        return cinMsg;
    }

    format() {

    }

    transToObject(object: any, ignores: string) {
        let packet = this;
        for (let key in packet) {
            if (ignores.indexOf(key) >= 0) {
                continue;
            }
            if (!packet.hasOwnProperty(key)) {
                continue;
            }
            if (packet[key] instanceof CinSubPacket) {
                let subPacket = packet[key];
                let subObeject = (<CinSubPacket><unknown>subPacket).toObject();
                object[key] = subObeject;
                continue;
            }
            object[key] = packet[key];
        }
    }

    // Todo
    fromObject(obj: any): void {

    }
}
