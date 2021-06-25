/**
 * Created by H5 on 2020/3/3.
 */
import { PACKET_TYPE } from "./../Constant";
import { CinRequestPacket } from "./../cin/CinRequestPacket";
import { CinResponsePacket } from "./../cin/CinResponsePacket";

export class PublishPacket extends CinRequestPacket {
    getType(): PACKET_TYPE {
        return PACKET_TYPE.PUBLISH;
    }
}

export class PubAckPacket extends CinResponsePacket {
    getType(): PACKET_TYPE {
        return PACKET_TYPE.PUBACK;
    }
}