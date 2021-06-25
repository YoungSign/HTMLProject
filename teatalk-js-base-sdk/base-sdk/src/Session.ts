/**
 * Created by H5 on 2020/2/14.
 */

import { CLIENT_STATE, PACKET_TYPE } from "./Constant";
import { SessionOption } from "./SessionOption";
import { Client } from "./Client";
import { ConnAckPacket } from "./base-packets/WEBIMLogonTransaction";
import { CinPacket } from "./cin/CinPacket";
import { PublishPacket, PubAckPacket } from "./base-packets/PublishTransaction";
import logger from "./util/Logger";
import { CinResponsePacket } from "./cin/CinResponsePacket";
import { TemplateManager } from "./TemplateManager";
import { applyProperties } from "./util/utils";
import { HttpConnection, Http} from "./net/Http";

export class Session {

  /**
   * Session 配置
   */
  private option: SessionOption;
  /**
   * 客户端实例
   */
  private client: Client;
  /**
   * 当接收到 ServerPublish 时的回调
   */
  onServerPublish: (session: Session, messageType: string, serverPublish: any) => void;

  /**
   * 当 Session 的状态发生变化时的回调
   */
  onStateChange: (session: Session, newState: CLIENT_STATE, oldState: CLIENT_STATE, reason?: string, packet?: CinPacket, packetContent?: any, logonType?: number) => void;

  constructor(option?: SessionOption) {
    this.updateOption(option);
    this.client = new Client();
    this.client.onStateChange = (newState, oldState, reason, packet) => {
        if (this.onStateChange) {
            let packetContent;
            switch (newState) {
            case CLIENT_STATE.CONNECTED:
            case CLIENT_STATE.CONNECT_FAILED:
                packetContent = <any>packet as ConnAckPacket;
                break;
            default:
                packetContent = <any>(packet);
                break;
            }
            this.onStateChange(this, newState, oldState, reason, packet, packetContent);
        }
    };
    this.client.onPacket = (packet) => {
        switch (packet.getType()) {
        case PACKET_TYPE.PUBLISH:
            if (this.onServerPublish) {
                let serverPublishPacket = <any>packet as PublishPacket;
                let reqId = serverPublishPacket.method + "_request_" + serverPublishPacket.event;
                let reqModuleId: any = TemplateManager.getTemplate(reqId, "down").module;
                this.onServerPublish(this, reqModuleId, serverPublishPacket.toObject());
            }
            break;
        default:
            logger.logWarn(`inbound packet unsupported. PacketType=${PACKET_TYPE[packet.getType()]}`);
        }
    };
  }

  /**
   * 更新 Session 配置，该方法使用属性附加原则，会使用新option的属性更新当前option
   * @param option 新option，设置为null则什么也不做
   */
  updateOption(option?: SessionOption) {
    if (option) {
      this.option = applyProperties(this.option, option);
    }
  }

  /**
   * 与服务端建立连接
   * @param option 连接时要使用的 SessionOption，作用参考 updateOption，可以设置为null
   * @param callback 连接完成时的回调
   */
  connect(option: SessionOption = null, logonType: number, callback?: (success: boolean, ackPacket: CinResponsePacket, reason: string) => void): void {
    if (option) {
        this.updateOption(option);
    }
    this.client.connect(this.option, logonType, callback && ((success: boolean, ackPacket: CinResponsePacket, reason: string) => {
        console.log(success, ackPacket, reason);
        ackPacket && callback(success, ackPacket, reason);
    }));
  }

  /**
   * 主动关闭连接，正常情况下 Session 状态会从当前状态跳转到 CLOSING 而后关闭完成后变为 CLOSED
   * @param reason 关闭原因
   */
  close(reason?: string) {
    this.client.close(reason);
  }

  /**
   * 发送请求
   * @param message 参考结构体 ClientPublishMessage
   * @param callback 发送完成后的回调
   */
  sendRequest(packet: PublishPacket, callback?: (success: boolean, ack: PubAckPacket, reason: string) => void): void {
    this.client.publish(packet, callback);
  }

  /**
   * 发送请求
   * @param message 参考结构体 ClientPublishMessage
   * @param callback 发送完成后的回调
   */
  sendResponse(packet: PubAckPacket): void {
    this.client.publish(packet);
  }

  /**
   * 发送http请求
   * TODO for cin protocol
   */
  sendHttpRequest(): void {

  }

  getHttpConnection(options: any): HttpConnection {
    return Http.getConnection(options);
  }
}
