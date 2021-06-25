/**
 * Created by H5 on 2020/3/4.
 */
import { CinMessage } from "./CinMessage";
import { TemplateManager } from "../TemplateManager";
import { PacketManager } from "../PacketManager";
import { CinRequestPacket } from "./CinRequestPacket";
import { CinHeader } from "./CinHeader";

export class CinRequestMessage extends CinMessage {
    method: string;
    event: number;
    packetId: number | string;

    setMethod(method: string): CinRequestMessage {
        this.method = method;
        return this;
    }

    setEvent(event: number): CinRequestMessage {
        this.event = event;
        return this;
    }

    toPacket(direction: string = "down"): CinRequestPacket {
        let reqId = this.method + "_request_" + this.event;
        let reqTemplate: any = TemplateManager.getTemplate(reqId, direction).define;
        let define = PacketManager.getDefine(reqId, direction);
        let cinReqPacket: CinRequestPacket = new define();
        super.toPacket(reqTemplate, cinReqPacket);
        cinReqPacket.method = this.method;
        cinReqPacket.event = this.event;
        cinReqPacket.packetId = this.packetId;
        // let callIdH = this.findCinHeader("CallId");
        // if (callIdH) {
        //     cinReqPacket.packetId = <number | string>callIdH.value;
        // }
        cinReqPacket.format();
        return cinReqPacket;
    }

    toJson(): any {
        let reqId = this.method + "_request_" + this.event;
        let reqTemplate: any = TemplateManager.getTemplate(reqId, "up").define;
        let out = {};
        out["Method"] = this.method;
        out["Event"] = this.event;
        out["UUID"] = this.packetId;
        out["Request"] = super.toJson(reqTemplate);
        // let callIdH = this.findCinHeader("CallId");
        // if (callIdH) {
        //     out["Request"]["WcmpInfo"] = callIdH.value;
        // }
        return out;
    }

    fromJson(input: any, direction: string = "down"): void {
        let method = input["Method"];
        let event = input["Event"];
        // let packetId = input["UUID"]
        let reqId = method + "_request_" + event;
        let reqTemplate: any = TemplateManager.getTemplate(reqId, direction).define;
        this.setMethod(method);
        this.setEvent(event);
        // this.packetId = packetId;
        let cinContent = input["Request"];
        super.fromJson(reqTemplate, cinContent);
        // if (reqTemplate["Headers"]["CallId"]) {
        //     let index = reqTemplate["Headers"]["CallId"]["index"];
        //     if (index && cinContent[index]) {
        //         let callIdH = new CinHeader("CallId", cinContent[index]);
        //         this.addHeader(callIdH);
        //     } else if (cinContent["WcmpInfo"]) {
        //         let callIdH = new CinHeader("CallId", cinContent["WcmpInfo"]);
        //         this.addHeader(callIdH);
        //     }
        // }
    }

    // Todo
    toBytes(): Uint8Array {
        return null;
    }

    // Todo
    fromBytes(input: Uint8Array): void {
        let method = this.findMethod(input);
        let event = this.findEvent(input);
        let reqId = method + "_request_" + event;
        let reqTemplate: any = TemplateManager.getTemplate(reqId, "down").define;
        this.setMethod(method);
        this.setEvent(event);
        console.log(reqTemplate);
        // Todo
    }

    private findMethod (input: Uint8Array): string {
        // Todo
        return "";
    }

    private findEvent (input: Uint8Array): number {
        // Todo
        return 0;
    }
}