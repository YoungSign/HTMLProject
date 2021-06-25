import { EventBus } from '../../event-bus'

const state = {
  callId: 0,
  mediaType: 1, // 媒体类型 1：音频；2：视频
  sessionType: 1, // 会话类型 1：二人
  isFromUser: true, // true：发起方；false：接收方
  isConnected: false, // 是否接通 true：已接通；false：未接通
  isMute: false, // 是否静音 true: 静音；false：非静音
  toUserIdVoip: '', // 音视频通话接收方userId
  mediaStream: null // 媒体流
}
const mutations = {
  setCallId (state, payload) {
    state.callId = payload.callId
  },
  setMediaType (state, payload) {
    state.mediaType = payload.mediaType
  },
  setSessionType (state, payload) {
    state.sessionType = payload.sessionType
  },
  setIsFromUser (state, payload) {
    state.isFromUser = payload.isFromUser
  },
  setIsConnected (state, payload) {
    state.isConnected = payload.isConnected
  },
  setIsMute (state, payload) {
    state.isMute = payload.isMute
  },
  setToUserIdVoip (state, payload) {
    state.toUserIdVoip = payload.toUserIdVoip
  },
  setMediaStream (state, payload) {
    state.mediaStream = payload.mediaStream
  }
}
const actions = {
  // 注册监听音视频SDK通知
  peerAvOption ({ commit, dispatch, state, rootState }) {
    console.log('UI___注册监听音视频SDK通知')
    window.TeatalkSdk.invoke('peerAvOption', {
      // options暂时传空对象
      options: {},
      callback: (event, data) => {
        console.log('UI___peerAvOptionCallback-event: ', event)
        console.log('UI___peerAvOptionCallback-data: ', data)
        if (event === 'recv_invite') { // 收到邀请通知
          dispatch('recvInvite', { data })
        } else if (event === 'show_av_win') { // 显示音视频窗口通知
          dispatch('showAvWin', { data })
        } else if (event === 'close_av_win') { // 关闭音视频窗口（包括邀请窗口）通知
          dispatch('closeAvWin', { data })
        } else if (event === 'local_media') { // 播放本地媒体流通知
          if (state.mediaType === 2) { // 视频才播放本地媒体流
            dispatch('localMedia', { data })
          }
        } else if (event === 'media_add') { // 媒体流新增通知
          dispatch('mediaAdd', { data })
        } else if (event === 'switch_to_audio') { // 切换到音频界面通知
          dispatch('switchToAudio', { data })
        }
      }
    })
  },
  // 发起音视频通话
  sendPeerAvInvite ({ commit, state, rootState }, { from, to, mediaType }) {
    let result = null
    result = window.TeatalkSdk.invoke('sendPeerAvInvite', {
      from: from,
      to: to,
      mediaType: mediaType,
      ownerDomId: 'videoEleMin',
      userDomId: 'videoEle'
    })
    console.log('UI___sendPeerAvInvite-result: ', result)
    if (result.result === 'ok') {
      commit('setCallId', {callId: result.callId})
    } else {
      EventBus.$emit('showToast', result.result)
    }
  },
  // 同意邀请
  acceptPeerAvInvite ({ commit, state, rootState }) {
    let callId = state.callId
    let reason = ''
    reason = window.TeatalkSdk.invoke('acceptPeerAvInvite', {
      callId,
      ownerDomId: 'videoEleMin',
      userDomId: 'videoEle'
    })
    if (reason !== 'ok') {
      EventBus.$emit('showToast', reason)
    }
  },
  // 拒绝邀请
  refusePeerAvInvite ({ commit, state, rootState }) {
    let callId = state.callId
    let reason = ''
    reason = window.TeatalkSdk.invoke('refusePeerAvInvite', {callId})
    if (reason !== 'ok') {
      EventBus.$emit('showToast', reason)
    }
  },
  // 视频切换至音频
  degradePeerAv ({ commit, state, rootState }) {
    let callId = state.callId
    let reason = ''
    reason = window.TeatalkSdk.invoke('degradePeerAv', {callId})
    if (reason !== 'ok') {
      EventBus.$emit('showToast', reason)
    } else {
      let audioEle = document.getElementById('audioEle')
      audioEle.srcObject = state.mediaStream
      commit('setMediaType', {mediaType: 1})
    }
  },
  // 主动取消/挂断音视频通话
  hangUpPeerAv ({ commit, state, rootState }) {
    let callId = state.callId
    let reason = ''
    reason = window.TeatalkSdk.invoke('hungupPeerAv', {callId})
    if (reason !== 'ok') {
      EventBus.$emit('showToast', reason)
    }
  },
  // 静音开关
  changePeerAvMute ({ commit, state, rootState }) {
    let callId = state.callId
    let reason = ''
    reason = window.TeatalkSdk.invoke('changePeerAvMute', {callId, isMute: state.isMute})
    if (reason !== 'ok') {
      EventBus.$emit('showToast', reason)
    }
  },
  /* 通知 */
  // 收到邀请
  recvInvite ({ commit, state, rootState }, { data }) {
    commit('setCallId', {callId: data.callId})
    commit('setIsFromUser', {isFromUser: false})
    commit('setToUserIdVoip', {toUserIdVoip: data.from})
    commit('setMediaType', {mediaType: data.mediaType})
    commit('setSessionType', {sessionType: data.sessionType})
    EventBus.$emit('showVoipSingle')
  },
  // 接收方同意邀请
  showAvWin ({ commit, state, rootState }, { data }) {
    commit('setIsConnected', {isConnected: true})
  },
  // 关闭音视频通话
  closeAvWin ({ commit, state, rootState }, { data }) {
    commit('setCallId', {callId: 0})
    commit('setIsConnected', {IsConnected: false})
    EventBus.$emit('hideVoipSingle')
  },
  localMedia ({ commit, state, rootState }, { data }) {
    let videoEleMin = document.getElementById('videoEleMin')
    videoEleMin.srcObject = data.stream
  },
  mediaAdd ({ commit, state, rootState }, { data }) {
    if (state.mediaType === 1) {
      let audioEle = document.getElementById('audioEle')
      audioEle.srcObject = data.stream
    } else if (state.mediaType === 2) {
      let videoEle = document.getElementById('videoEle')
      videoEle.srcObject = data.stream
    }
    commit('setMediaStream', {mediaStream: data.stream})
  },
  switchToAudio ({ commit, state, rootState }, { data }) {
    let audioEle = document.getElementById('audioEle')
    audioEle.srcObject = state.mediaStream
    commit('setMediaType', {mediaType: 1})
  }
}
const getters = {

}

export default {
  state,
  mutations,
  actions,
  getters
}
