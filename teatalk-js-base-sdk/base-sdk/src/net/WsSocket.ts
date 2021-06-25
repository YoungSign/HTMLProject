/**
 * Created by H5 on 2020/2/22.
 */

import { BaseSocket } from "./BaseSocket";

export class WsSocket extends BaseSocket {
    ws: WebSocket;

    isClosed(): boolean {
        if (this.ws && this.ws.readyState === WebSocket.CLOSED) {
            return true;
        }
        return false;
    }

    open(url: string, binary: boolean): {} {
        let self = this;
        let ws;
        try {
            ws = new WebSocket(url);
            if (binary) {
                ws.binaryType = "arraybuffer";
            }
        } catch (e) {
            return {
                error: e
            };
        }
        ws.onopen = (event: Event) => {
            self.onOpen && self.onOpen(event);
        };
        ws.onclose = (event: Event) => {
            self.onClose && self.onClose(event);
        };
        ws.onerror = (event: Event) => {
            self.onError && self.onError(event);
        };
        ws.onmessage = (event: Event) => {
            self.onMessage && self.onMessage(event);
        };
        self.ws = ws;
        return {
            "socket": ws
        };
    }

    send(data: string | Uint8Array): void {
        this.ws.send(data);
    }

    close(): void {
        this.ws.close();
    }
}