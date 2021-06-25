// import { EventBus } from '../../event-bus'
import callManager from './call-manager'
import mediaManager from './media-manager'
import { MessageType, RoomStatus, HungupReason } from './av-status'

const state = {
  callId: '', // 房间号
  mediaType: 1, // 媒体类型 1：音频；2：视频
  sessionType: 1, // 会话类型 1：二人
  sessionId: 0, // 会话id,二人不用
  inviter: '', // 邀请者id
  creator: '', // 创建者id
  users: [], // 成员数组
  // streams: [], // 媒体流数组
  status: RoomStatus.IDEL, // 房间状态
  hungupReason: '' // 挂断原因
}
const mutations = {
  // 添加成员
  addUser (state, user) {
    let index = state.users.findIndex(u => u.id === user.id)
    if (index > -1) {
      state.users.splice(index, 1, user)
    } else {
      state.users.push(user)
    }
  },

  // 移除成员
  removeUser (state, userId) {
    let index = state.users.findIndex(u => u.id === userId)
    if (index > -1) {
      state.users.splice(index, 1)
    }
  },
  // 设置成员状态
  setUserStatus (state, user) {
    let u = state.users.find(u => u.id === user.id)
    if (u) {
      Object.assign(u, user)
    }
  },
  // 设置房间状态
  setRoomStatus (state, roomStatus) {
    state.status = roomStatus
  },

  // 设置房间号
  setCallId (state, callId) {
    state.callId = callId
  },

  // 设置呼叫的媒体类型
  setMediaType (state, mediaType) {
    state.mediaType = mediaType
  },

  // 设置会话类型
  setSessionType (state, sessionType) {
    state.sessionType = sessionType
  },

  // 设置会话类型
  setSessionId (state, sessionId) {
    state.sessionId = sessionId
  },

  // 设置创建者
  setCreator (state, creator) {
    state.creator = creator
  },

  // 设置邀请者
  setInviter (state, inviter) {
    state.inviter = inviter
  },

  // 设置挂断原因
  setHungupReason (state, reason) {
    state.hungupReason = reason
  },

  // 清空房间信息
  clearRoom (state) {
    state.callId = ''
    state.mediaType = 1
    state.sessionType = 1
    state.inviter = ''
    state.creator = ''
    state.users = []
    state.status = RoomStatus.IDEL
  }
}
const actions = {
  // 初始化，开始监听音视频呼叫信令
  init ({ commit, dispatch, state, rootState }) {
    // 注册监听音视频SDK通知
    console.log('UI___注册监听音视频SDK通知')
    mediaManager.init(commit, dispatch, state, rootState)
    window.TeatalkSdk.invoke('initCall', {
      // options暂时传空对象
      options: {},
      callback: (event, data) => {
        console.log('UI___peerAvOptionCallback-event: ', event)
        console.log('UI___peerAvOptionCallback-data: ', JSON.stringify(data))
        if (event === MessageType.INVITE_NOTIFY) { // 收到邀请通知
          callManager.onInvite({ commit, dispatch, state, rootState }, data)
        } else if (event === MessageType.ACCEPT_NOTIFY) { // 收到成员接受邀请
          callManager.onAccept({ commit, dispatch, state, rootState }, data)
        } else if (event === MessageType.MEDIATYPE_CHANGE_NOTIFY) { // 音视频媒体类型变化
          callManager.onChangeMediaType({ commit, dispatch, state, rootState }, data)
        } else if (event === MessageType.HUNGUP_NOTIFY) { // 收到成员挂断
          callManager.onHangup({ commit, dispatch, state, rootState }, data)
          // 音视频关闭处理
          mediaManager.close()
        } else if (event === MessageType.USER_CHANGE_NOTIFY) { // 收到添加删除成员通知
          callManager.onChangeMember({ commit, dispatch, state, rootState }, data)
        } else if (event === MessageType.NO_RESPONSE_NOTIFY) { // 超时
          callManager.onTimeout({ commit, dispatch, state, rootState }, data)
        } else { // 切换到音频界面通知
          console.warn('未处理的音视频消息类型')
        }
      }
    })
  },

  // 关闭当前音视频通话
  close ({ commit, state, rootState }) {
    commit('clearRoom')
  },

  // 发起音视频
  startCall ({ commit, dispatch, state, rootState }, { invitee, mediaType, sessionType, sessionId }) {
    return new Promise((resolve, reject) => {
      if (state.status !== RoomStatus.IDEL && state.status !== RoomStatus.HUNGUP) {
        reject(new Error('av status ' + state.status))
      } else {
        const myId = rootState.base.userId
        commit('setCallId', Date.now().toString())
        commit('setMediaType', mediaType)
        commit('setCreator', myId)
        commit('setInviter', myId)
        commit('setSessionType', sessionType)
        commit('setSessionId', sessionId)
        commit('setRoomStatus', RoomStatus.INITMEDIA)

        invitee.concat(myId).map(i => {
          let user = {
            id: i,
            status: RoomStatus.CALLING,
            hungupReason: '',
            mediaType,
            streams: [],
            isMuted: false
          }
          commit('addUser', user)
        })

        // 进房间
        mediaManager.joinRoom(myId, state.callId, state.creator === myId ? 1 : 2, mediaType || state.mediaType).then(res => {
          if (res && res.name === 'Error') {
            // 失败, 挂断，退出
            console.log('进入房间失败')
            dispatch('hangup', HungupReason.NETWORK_ERROR)
          } else {
            window.TeatalkSdk.invoke('sendInvite', {
              options: {
                from: myId,
                to: invitee,
                mediaType,
                channelID: state.callId,
                sessionType,
                sessionId
              },
              callback: (success, result, reason) => {
                if (success) {
                  resolve(result)
                } else {
                  reject(new Error(reason))
                }
              }    
            })
            commit('setRoomStatus', RoomStatus.CALLING)
          }
        })
      }
    })
  },

  // 添加成员
  addMember ({ commit, state, rootState }, { data }) {

  },

  // 移除成员
  removeMember ({ commit, state, rootState }, { members }) {

  },

  // 挂断
  hangup ({ commit, state, rootState }, reason) {
    const self = state.users.find(u => u.id === rootState.base.userId)
    if (!reason) {
      if (self.status === RoomStatus.CALLING) {
        reason = HungupReason.CANCEL
      } else if (self.status === RoomStatus.CONNECTED) {
        reason = HungupReason.HANGUP
      } else if (self.status === RoomStatus.RINGING) {
        reason = HungupReason.REJECT
      }
    }
    // 发送挂断信令
    callManager.hangup({ commit, state, rootState }, {reason})

    commit('setHungupReason', reason)
    commit('setRoomStatus', RoomStatus.HUNGUP)
    // 音视频关闭处理
    mediaManager.close()
  },

  // 接听
  accept ({ commit, dispatch, state, rootState }, mediaType) {
    callManager.accept({ commit, state, rootState }, mediaType).then(
      (success) => {
        const myId = rootState.base.userId
        commit('setRoomStatus', RoomStatus.CONNECTED)
        commit('setUserStatus', {id: myId, status: RoomStatus.CONNECTED})

        // 进房间
        mediaManager.joinRoom(myId, state.callId, state.creator === myId ? 1 : 2, mediaType || state.mediaType).then(res => {
          if (res && res.name === 'Error') {
            // 失败, 挂断，退出
            console.log('进入房间失败')
            dispatch('hangup', HungupReason.NETWORK_ERROR)
          }
        })
      },
      (result, reason) => {
        commit('setHungupReason', HungupReason.NETWORK_ERROR)
        commit('setRoomStatus', RoomStatus.HUNGUP)
      }
    )
  },

  mute ({ commit, state, rootState }, isMuted) {
    mediaManager.mute({ commit, state, rootState }, isMuted)

    commit('setUserStatus', {id: rootState.base.userId, isMuted})
  }

}
const getters = {

}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
