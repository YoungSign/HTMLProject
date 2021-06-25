import { CinRequestPacket } from "./../cin/CinRequestPacket";
import logger from "./../util/Logger";
import { BaseSocket } from "../net/BaseSocket";

export class Future<T> {

    ws: BaseSocket;
    packet: CinRequestPacket;
    startTime: number;
    timeout: number;
    done: boolean = false;
    respId: string = "";
    callback: (success: boolean, ack: T, reason: string) => void;

    constructor(ws: BaseSocket, packet: CinRequestPacket, timeout: number, callback: (success: boolean, ack: T, reason: string) => void, respId: string) {
      this.ws = ws;
      this.packet = packet;
      this.startTime = Date.now();
      this.timeout = timeout * 1000;
      this.callback = callback;
      this.respId = respId;
    }

    update(packet: CinRequestPacket): void {
      this.packet = packet;
      this.resetTimeout();
    }

    resetTimeout(): void {
      this.startTime = Date.now();
    }

    isTimeout(): boolean {
      return Date.now() > (this.startTime + this.timeout);
    }

    success(ack: any): void {
      this.complete(true, ack, null);
    }

    fault(reason: string, ack?: any): void {
      this.complete(false, ack, reason);
    }

    complete(success: boolean, ack?: any, reason?: string): void {
      if (!this.done) {
        this.done = true;
        if (this.callback) {
          try {
            this.callback(success, ack as T, reason);
          } catch (e) {
            logger.logError(`invoke Future ${success ? "success" : "fault"} error. ` + e.message, this);
          }
        }
        logger.logDebug(`future ${success ? "success" : "fault"}. PacketId=${this.packet.packetId}`, reason, ack, this);
      }
    }
}
