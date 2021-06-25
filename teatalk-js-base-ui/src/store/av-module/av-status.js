
const MessageType = {
  INVITE_NOTIFY: 0, // 收到邀请
  RING_NOTIFY: 1, // 收到振铃
  REJECT_NOTIFY: 2, //
  ACCEPT_NOTIFY: 3, // 收到同意
  MEDIATYPE_CHANGE_NOTIFY: 4, // 收到变更音视频类型
  USER_CHANGE_NOTIFY: 5, // 收到添加、删除成员
  LOCAL_STREAM_NOTIFY: 6,
  STREAM_CHANGE_NOTIFY: 7,
  HUNGUP_NOTIFY: 8, // 收到成员挂断
  DISCONNECT_NOTIFY: 9,
  NO_RESPONSE_NOTIFY: 10,
  ERROR_NOTIFY: 99
}

const RoomStatus = {
  IDEL: 'idel', // 空闲
  INITMEDIA: 'initmedia', // 呼叫时主播先进入音视频
  CALLING: 'calling', // 呼出，等待对方处理
  RINGING: 'ringing', // 收到呼叫，正在响铃
  CONNECTED: 'connected', // 已接听，同意进入房间
  HUNGUP: 'hungup' // 挂断
}

const HungupReason = {
  CANCEL: '1', // 己方取消已发出的通话请求（挂断）
  REJECT: '2', // 己方拒绝收到的通话请求（拒绝）
  HANGUP: '3', // 己方挂断（挂断）
  BUSY_LINE: '4', // 己方忙碌（拒绝）
  NO_RESPONSE: '5', // 己方未接听（挂断）
  ENGINE_UNSUPPORTED: '6', // 当前引擎不支持（拒绝）
  NETWORK_ERROR: '7', // *己方网络出错（sdk error时发出算挂断）
  INIT_VIDEO_ERROR: '8', // *己方摄像头初始化错误，可能是没有打开使用摄像头权限（挂断）
  REMOTE_CANCEL: '11', // 对方取消已发出的通话请求
  REMOTE_REJECT: '12', // 对方拒绝收到的通话请求
  REMOTE_HANGUP: '13', // 通话过程对方挂断
  REMOTE_BUSY_LINE: '14', // 对方忙碌
  REMOTE_NO_RESPONSE: '15', // 对方未接听
  REMOTE_ENGINE_UNSUPPORTED: '16', // 对方引擎不支持
  REMOTE_NETWORK_ERROR: '17', // 对方网络错误
  KICKED_OFF: '18', // 被踢出
  ACCEPT_ON_OTHER_TERM: '19', // 其他端已经接听
  REJECT_ON_OTHER_TERM: '20' // 其他端已经拒绝
}

export {MessageType, RoomStatus, HungupReason}
