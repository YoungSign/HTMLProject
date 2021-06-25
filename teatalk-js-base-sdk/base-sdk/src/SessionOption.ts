import { ConnectPacket } from "./base-packets/WEBIMLogonTransaction"

export interface SessionOption extends ConnectPacket {
    keepAlive: number;
    url?: string;
    binary?: boolean;
}