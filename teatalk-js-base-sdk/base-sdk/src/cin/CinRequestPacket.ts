/**
 * Created by H5 on 2020/3/4.
 */
/**
 * Created by H5 on 2020/3/4.
 */
import { PACKET_TYPE } from "../Constant";
import { CinPacket } from "./CinPacket";
import { CinRequestMessage } from "./CinRequestMessage";
import { TemplateManager } from "./../TemplateManager";
import { CinHeader } from "./CinHeader";

export class CinRequestPacket extends CinPacket {

    packetId: number | string; // 信令唯一标志
    method: string;
    event: number;

    isAck()  {
        return false;
    }

    isHighQos() {
        return true;
    }

    getType(): PACKET_TYPE {
        return null;
    }

    toCinMessage(): CinRequestMessage {
        let reqId = this.method + "_request_" + this.event;
        let reqTemplate: any = TemplateManager.getTemplate(reqId, "up").define;
        let cinMsg: CinRequestMessage = <CinRequestMessage> new CinRequestMessage().setMethod(this.method).setEvent(this.event);
        cinMsg.packetId = this.packetId;
        let result = <CinRequestMessage> super.toCinMessage(reqTemplate, cinMsg);
        // if (this.packetId && reqTemplate["Headers"]["CallId"]) {
        //     let callIdH = new CinHeader("CallId", this.packetId);
        //     result.addHeader(callIdH);
        // }
        return result;
    }

    toObject(): any {
        let object = {};
        // let ignores = "packetId,method,event";
        let ignores = "packetId,method";
        super.transToObject(object, ignores);
        return object;
    }

    // Todo
    fromObject(obj: any): void {

    }
}