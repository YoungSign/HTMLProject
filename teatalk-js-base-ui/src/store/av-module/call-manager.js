// import { MessageType, RoomStatus, HungupReason } from './av-status'
import { RoomStatus, HungupReason } from './av-status'

function getRemoteReason (reason) {
  switch (reason) {
    case HungupReason.BUSY_LINE:
      return HungupReason.REMOTE_BUSY_LINE

    case HungupReason.CANCEL:
      return HungupReason.REMOTE_CANCEL

    case HungupReason.REJECT:
      return HungupReason.REMOTE_REJECT

    case HungupReason.HANGUP:
      return HungupReason.REMOTE_HANGUP

    case HungupReason.NETWORK_ERROR:
      return HungupReason.REMOTE_NETWORK_ERROR

    default:
      return reason
  }
}

/**
 * 呼叫信令处理
 */
export default {
  // 收到邀请
  onInvite ({ commit, dispatch, state, rootState }, data) {
    if (state.status !== RoomStatus.IDEL) {
      this.hangup({commit, dispatch, state, rootState},
        {reason: HungupReason.BUSY_LINE,
          callId: data.channelID,
          users: data.to.concat(data.from).map(id => { return {id} }),
          mediaType: data.mediaType,
          sessionType: data.sessionType,
          sessionId: data.sessionId})
      return
    }
    const myId = rootState.base.userId
    commit('setMediaType', data.mediaType)
    commit('setCallId', data.channelID)
    commit('setSessionType', data.sessionType)
    commit('setSessionId', data.sessionId)

    // FIXME: 多人时设置创建者
    const creator = data.from
    const inviter = data.from

    commit('setCreator', creator)
    commit('setInviter', inviter)

    data.to.concat(data.from).map(id => {
      let userStatus = RoomStatus.RINGING
      if (id === inviter) {
        userStatus = RoomStatus.CALLING
      }
      let user = {
        id,
        status: userStatus,
        hungupReason: '',
        mediaType: data.mediaType,
        streams: [],
        isMuted: false
      }
      commit('addUser', user)
    })

    commit('setRoomStatus', RoomStatus.RINGING)
    // 收到邀请振铃
    window.TeatalkSdk.invoke('sendRinging',
      {
        options: {
          from: rootState.base.userId,
          to: state.users.map(u => u.id).filter(id => id !== myId),
          channelID: state.callId,
          sessionType: state.sessionType,
          sessionId: state.sessionId
        },
        callback: (success, result, reason) => {

        }
      })
  },

  // 收到成员音视频类型更改
  onChangeMediaType ({ commit, state, rootState }, data) {

  },

  // 收到成员接受邀请
  onAccept ({ commit, state, rootState }, data) {
    // 忽略不是当前通话的消息
    if (state.callId !== data.channelID) {
      return
    }
    const myId = rootState.base.userId
    if (data.from === myId) {
      if (state.status === RoomStatus.RINGING) {
        // 已在其他端接听
        commit('hungupReason', HungupReason.ACCEPT_ON_OTHER_TERM)
        commit('setRoomStatus', RoomStatus.HUNGUP)
      }
      return
    }
    // 更新用户状态
    let mediaType = data.mediaType || state.mediaType
    commit('setUserStatus', {id: data.from, status: RoomStatus.CONNECTED, mediaType})
    // 修改自己和房间状态
    if (state.creator === myId || state.sessionType === 1) {
      commit('setUserStatus', {id: myId, status: RoomStatus.CONNECTED})
      commit('setRoomStatus', RoomStatus.CONNECTED)
    }
  },

  // 收到成员挂断
  onHangup ({ commit, state, rootState }, data) {
    // 忽略不是挂断当前通话的消息
    if (state.callId !== data.channelID) {
      return
    }
    commit('setUserStatus', {id: data.from, status: RoomStatus.HUNGUP, hungupReason: data.reason})
    if (state.sessionType === 1) {
      commit('setHungupReason', getRemoteReason(data.reason))
      commit('setRoomStatus', RoomStatus.HUNGUP)
    }
  },

  // 收到成员变更
  onChangeMember ({ commit, state, rootState }, data) {

  },
  // 超时
  onTimeout ({ commit, state, rootState }, userId) {
    commit('setUserStatus', {id: userId, status: RoomStatus.HUNGUP, hungupReason: HungupReason.NO_RESPONSE})

    const myId = rootState.base.userId
    // 如果自己没有接听超时，或者二人音视频对方未接听，呼叫挂断
    if (userId === myId) {
      commit('setHungupReason', HungupReason.NO_RESPONSE)
      commit('setRoomStatus', RoomStatus.HUNGUP)
    } else if (state.sessionType === 1) {
      commit('setHungupReason', HungupReason.REMOTE_NO_RESPONSE)
      commit('setRoomStatus', RoomStatus.HUNGUP)
    } else if (!state.filter(u => u.id !== myId).some(u => u.hungupReason !== HungupReason.REMOTE_NO_RESPONSE)) {
      // 所有人都超时未接听
    }
  },

  hangup ({ commit, state, rootState }, {reason, callId, users, mediaType, sessionType, sessionId}) {
    window.TeatalkSdk.invoke('sendHangup',
      {
        options: {
          from: rootState.base.userId,
          to: users ? users.map(u => u.id) : state.users.map(u => u.id),
          mediaType: mediaType || state.mediaType,
          channelID: callId || state.callId,
          reason,
          sessionType: sessionType || state.sessionType,
          sessionId: sessionId || state.sessionId
        },
        callback: (success, result, reason) => {

        }
      })
  },

  // 接听
  accept ({ commit, state, rootState }, mediaType) {
    return new Promise((resolve, reject) => {
      window.TeatalkSdk.invoke('sendAcceptInvite',
        {
          options: {
            from: rootState.base.userId,
            to: state.users.map(u => u.id),
            mediaType,
            channelID: state.callId,
            sessionType: state.sessionType,
            sessionId: state.sessionId
          },
          callback: (success, result, reason) => {
            if (success) {
              resolve(result)
            } else {
              reject(result, reason)
            }
          }
        })
    })
  },

  changeMediaType ({ commit, state, rootState }, mediaType) {

  }

}
