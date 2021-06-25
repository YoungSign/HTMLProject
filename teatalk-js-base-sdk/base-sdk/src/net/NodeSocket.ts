/**
 * Created by H5 on 2020/2/22.
 */

import { BaseSocket } from "./BaseSocket";
import net = require("net");

export class NodeSocket extends BaseSocket {
    ns: net.Socket;

    isClosed(): boolean {
        return false;
    }

    open(url: string, binary: boolean): {} {
        let ns;
        ns = new net.Socket();
        ns.connect( "", url, () => {
            this.onOpen && this.onOpen(null);
        });
        ns.on("data", (msg) => {
            this.onMessage && this.onMessage(msg);
        });
        ns.on("close", (event) => {
            this.onClose && this.onClose(event);
        });
        ns.on("error", (event) => {
            this.onClose && this.onClose(event);
        });
        return {
            "socket": ns
        };
    }

    send(data: string | Uint8Array): void {
        this.ns.write(data);
    }

    close(): void {
        this.ns.destroy();
    }
}