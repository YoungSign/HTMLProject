/**
 * Created by H5 on 2020/3/4.
 */
import { CinMessage } from "./CinMessage";
import { TemplateManager } from "../TemplateManager";
import { CinHeader } from "./CinHeader";
import { CinResponsePacket } from "./CinResponsePacket";
import { PacketManager } from "../PacketManager";
import { RESPONSE_CODE } from "../Constant";
import { FutureManager } from "../task/FutureManager";
import { Future } from "../task/Future";

export class CinResponseMessage extends CinMessage {
    method: string;
    event: number;
    packetId: number | string;
    respCode: string;

    setMethod(method: string): CinResponseMessage {
        this.method = method;
        return this;
    }

    setEvent(event: number): CinResponseMessage {
        this.event = event;
        return this;
    }

    setRespCode(respCode: string): CinResponseMessage {
        this.respCode = respCode;
        return this;
    }

    toPacket(direction: string = "down"): CinResponsePacket {
        let respId = this.method + "_response_" + this.event;
        let respTemplate: any = TemplateManager.getTemplate(respId, direction).define;
        let define = PacketManager.getDefine(respId, direction);
        let cinRespPacket: CinResponsePacket = new define();
        super.toPacket(respTemplate, cinRespPacket);
        cinRespPacket.method = this.method;
        cinRespPacket.event = this.event;
        cinRespPacket.packetId = this.packetId;
        cinRespPacket.response = this.respCode;
        // let callIdH = this.findCinHeader("CallId");
        // if (callIdH) {
        //     cinRespPacket.packetId = <number | string>callIdH.value;
        // }
        cinRespPacket.format();
        return cinRespPacket;
    }

    toJson(): any {
        let respId = this.method + "_response_" + this.event;
        let respTemplate: any = TemplateManager.getTemplate(respId, "up").define;
        let out = {};
        out["Method"] = this.method;
        out["Event"] = this.event;
        out["Response"] = super.toJson(respTemplate);
        out["Code"] = this.abnormalizeCode(RESPONSE_CODE[this.respCode]);
        let callIdH = this.findCinHeader("CallId");
        if (callIdH) {
            out["Request"]["WcmpInfo"] = callIdH.value;
        }
        return out;
    }

    fromJson(input: any, direction: string = "down"): void {
        let method = input["Method"];
        let event = input["Event"];
        let packetId = input["UUID"]
        let reqId = method + "_request_" + event;
        let respId = method + "_response_" + event;
        let respTemplate: any = TemplateManager.getTemplate(respId, direction).define;
        this.setMethod(method);
        this.setEvent(event);
        this.packetId = packetId
        this.setRespCode(RESPONSE_CODE[this.normalizeCode(input["Code"])]);
        let cinContent = input["Response"];
        super.fromJson(respTemplate, cinContent);
        // if (respTemplate["Headers"]["CallId"]) {
        //     let index = respTemplate["Headers"]["CallId"]["index"];
        //     if (index && index.indexOf(".") > 0) {
        //         // tslint:disable-next-line: no-eval
        //         let callIdH = new CinHeader("CallId", eval("input." + index));
        //         this.addHeader(callIdH);
        //     } else if (index && cinContent[index]) {
        //         let callIdH = new CinHeader("CallId", cinContent[index]);
        //         this.addHeader(callIdH);
        //     } else if (cinContent["WcmpInfo"]) {
        //         let callIdH = new CinHeader("CallId", cinContent["WcmpInfo"]);
        //         this.addHeader(callIdH);
        //     } else if (input["callbackRequest"]["Request"]["WcmpInfo"]) {
        //         let callIdH = new CinHeader("CallId", input["callbackRequest"]["Request"]["WcmpInfo"]);
        //         this.addHeader(callIdH);
        //     }
        // } else { // 功能设计有缺失，只能使用reqId（针对wcmp设计问题，cmp应该无此问题）
        //     let callIdH = new CinHeader("CallId", reqId);
        //     this.addHeader(callIdH);
        // }
    }

    private normalizeCode(src: number): string {
        return (256 + src).toString();
    }

    private abnormalizeCode(src: number): string {
        return (src - 256).toString();
    }

    // Todo
    toBytes(): Uint8Array {
        return null;
    }

    // Todo
    fromBytesByResonse(input: Uint8Array, futures: FutureManager): void {
        let callId = this.findCallId(input);
        if (!callId) {
            console.error("无法识别响应类型");
            return;
        }
        let future: Future<any> = futures.find(callId);
        if (!future) {
            console.warn("无法识别，该响应已失效");
            return;
        }
        let respId: string = future.respId;
        let respTemplate: any = TemplateManager.getTemplate(respId, "down").define;
        console.log(respTemplate);
    }

    private findCallId (input: Uint8Array): number {
        // Todo
        return 0;
    }

    static isResponse (input: Uint8Array) {
        // Todo
        return true;
    }
}