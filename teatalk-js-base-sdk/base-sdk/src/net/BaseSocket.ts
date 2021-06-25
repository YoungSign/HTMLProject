/**
 * Created by H5 on 2020/2/21.
 */

export abstract class BaseSocket {
    constructor () {
        this.onOpen = null;
        this.onClose = null;
        this.onMessage = null;
        this.onError = null;
    }
    onOpen: (event: Event) => void;
    onClose: (event: Event) => void;
    onError: (event: Event) => void;
    onMessage: (event: Event) => void;
    abstract isClosed(): boolean
    abstract open(url: string, binary: boolean): {}
    abstract send(data: string | Uint8Array): void
    abstract close(): void
}
