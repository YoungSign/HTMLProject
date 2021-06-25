import { CinRequestPacket } from "./../cin/CinRequestPacket";
import { Future } from "./Future";
import { BaseSocket } from "../net/BaseSocket";

export class FutureManager {
    count: number = 0;
    private futures = {};
    private nextPacketId = 1;

    takePacketId(): string {
      let i = this.nextPacketId;
      while (this.futures[i]) {
        i = (i === 1024 * 1024) ? 1 : i + 1;
        if (i === this.nextPacketId) {
          throw new Error("no available packet identifier");
        }
      }
      this.nextPacketId = i + 1;
      return i.toString();
    }

    createFuture<T>(ws: BaseSocket, packet: CinRequestPacket, timeout: number, callback: (success: boolean, ack: T, reason: string) => void, pId: string, respId: string): Future<any> {
      let future = new Future<T>(ws, packet, timeout, callback, respId);
      let packetId =  pId || this.takePacketId();
      packet.packetId = packetId;
      this.count++;
      this.futures[packetId] = future;
      return future;
    }

    popup(packetId: string | number): Future<any> {
      let future = this.futures[packetId] as Future<any>;
      if (future) {
        this.remove(packetId);
      }
      return future;
    }

    find(packetId: string | number): Future<any> {
      return this.futures[packetId] as Future<any>;
    }

    each(handler: (packetId: string | number, future: Future<any>) => void): void {
      for (let packetId in this.futures) {
        handler(packetId, this.futures[packetId] as Future<any>);
      }
    }

    remove(packetId: string | number): void {
      delete this.futures[packetId];
      this.count--;
    }

}
