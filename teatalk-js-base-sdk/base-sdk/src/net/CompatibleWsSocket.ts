/**
 * Created by H5 on 2020/2/22.
 */

import { WsSocket } from "./WsSocket";
import SockJS = require("sockjs-client");

export class CompatibleWsSocket extends WsSocket {
    isClosed(): boolean {
        return false;
    }

    open(url: string, binary: boolean): {} {
        let options = {
            "protocols_whitelist": [
                "websocket",
                "xhr-streaming",
                "xdr-streaming",
                "xhr-polling",
                "xdr-polling",
                "iframe-htmlfile",
                "iframe-eventsource",
                "iframe-xhr-polling"
            ]
        };
        let ws;
        try {
            ws = new SockJS(url, options);
        } catch (e) {
            return {
                error: e
            };
        }
        ws.onopen = (event: Event) => {
            this.onOpen && this.onOpen(event);
        };
        ws.onclose = (event: Event) => {
            this.onClose && this.onClose(event);
        };
        ws.onmessage = (event: Event) => {
            this.onMessage && this.onMessage(event);
        };
        ws.ontimeout = (event: Event) => {
            this.onClose && this.onClose(event);
        };
        ws.onerror = (event: Event) => {
            this.onClose && this.onClose(event);
        };
        this.ws = ws;
        return {
            "socket": ws
        };
    }
}