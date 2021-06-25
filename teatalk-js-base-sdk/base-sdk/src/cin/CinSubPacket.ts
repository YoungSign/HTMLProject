/**
 * Created by H5 on 2020/3/4.
 */
import { PACKET_TYPE } from "../Constant";
import { CinPacket } from "./CinPacket";
import { CinSubMessage } from "./CinSubMessage";

export class CinSubPacket extends CinPacket {
    method: string;

    getType(): PACKET_TYPE {
        return null;
    }

    toCinSubMessage(subTemplate: any): CinSubMessage {
        let cinMsg: CinSubMessage = <CinSubMessage> new CinSubMessage().setMethod(this.method);
        return <CinSubMessage> super.toCinMessage(subTemplate, cinMsg);
    }

    toObject(): any {
        let object = {};
        let ignores = "method";
        super.transToObject(object, ignores);
        return object;
    }

    // Todo
    fromObject(obj: any): void {

    }
}