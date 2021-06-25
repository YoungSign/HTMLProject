import { CinMessage } from "./CinMessage";
import { PacketManager } from "../PacketManager";
import { CinSubPacket } from "./CinSubPacket";

export class CinSubMessage extends CinMessage {
    method: string;

    setMethod(method: string): CinSubMessage {
        this.method = method;
        return this;
    }

    toSubPacket(subTemplate: any, subId: string): CinSubPacket {
        let define = PacketManager.getDefine(subId, "down");
        let cinSubPacket: CinSubPacket = new define();
        super.toPacket(subTemplate, cinSubPacket);
        cinSubPacket.format();
        return cinSubPacket;
    }

    toJson(subTemplate: any): any {
        let out = {};
        out["Headers"] = super.toJson(subTemplate);
        return out;
    }

    fromJson(subTemplate: any, input: any): void {
        let method = subTemplate["Method"];
        this.setMethod(method);
        let thisObj = input["Headers"];
        super.fromJson(subTemplate, thisObj);
    }

    // Todo
    toBytes(): Uint8Array {
        return null;
    }

    // Todo
    fromBytes(input: Uint8Array): void {

    }
}