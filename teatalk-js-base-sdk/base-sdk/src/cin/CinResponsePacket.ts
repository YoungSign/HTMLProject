/**
 * Created by H5 on 2020/3/4.
 */
import { PACKET_TYPE } from "../Constant";
import { CinPacket } from "./CinPacket";
import { CinResponseMessage } from "./CinResponseMessage";
import { TemplateManager } from "../TemplateManager";
import { CinHeader } from "./CinHeader";

export class CinResponsePacket extends CinPacket {

    packetId: number | string;
    method: string;
    event: number;
    response: string;

    isAck()  {
        return true;
    }

    isHighQos() {
        return false;
    }

    getType(): PACKET_TYPE {
        return null;
    }

    toCinMessage(): CinResponseMessage {
        let respId = this.method + "_response_" + this.event;
        let respTemplate: any = TemplateManager.getTemplate(respId, "up").define;
        let cinMsg: CinResponseMessage = <CinResponseMessage> new CinResponseMessage().setMethod(this.method).setEvent(this.event).setRespCode(this.response);
        let result = <CinResponseMessage> super.toCinMessage(respTemplate, cinMsg);
        if (this.packetId && respTemplate["Headers"]["CallId"]) {
            let callIdH = new CinHeader("CallId", this.packetId);
            result.addHeader(callIdH);
        }
        return result;
    }

    toObject(): any {
        let object = {};
        let ignores = "packetId,method,event,response";
        super.transToObject(object, ignores);
        return object;
    }

    // Todo
    fromObject(obj: any): void {

    }
}