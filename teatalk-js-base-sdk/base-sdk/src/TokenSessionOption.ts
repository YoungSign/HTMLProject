import { TokenConnectPacket } from "./base-packets/WEBIMTokenLogonTransaction"

export interface TokenSessionOption extends TokenConnectPacket {
    keepAlive: number;
    wcmpInfo: number;
    url?: string;
    binary?: boolean;
}