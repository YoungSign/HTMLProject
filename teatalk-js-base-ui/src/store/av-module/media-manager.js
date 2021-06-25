import { RoomStatus, HungupReason } from './av-status'
import sha1 from 'crypto-js/sha1'
// const { WebSDK, Channel /*, RemoteAssist, Message, Record */ } = window.WEBSDK

// 初始化时设置 vuex 的变量，用于以后修改状态
let commit, dispatch, state, rootState

// ========= SDK 调用 =============
const sdkParams = {
  appKey: 'JRT',
  appSecret: 'd23a0f7b04c05f78e26125c6b9648e37',
  serverUrl: 'srtcp.fetiononline.com:443',
  inviteExpire: 30000
}

function init () {
  return new Promise((resolve, reject) => {
    WebSDK.init({
      onSuccess: (code, desc) => {
        resolve()
      },
      onFailure: (code, desc) => {
        reject(code, desc)
      }
    })
  })
}

function login (serverUrl, appKey, appSecret, userId) {
  return new Promise((resolve, reject) => {
    WebSDK.setRootServerUrl(serverUrl)
    let token = userId
    let curTime = Date.now()
    let nonce = userId
    let checkSum = sha1(appSecret + nonce + curTime)

    WebSDK.login({
      appKey,
      uccId: userId,
      type: 1,
      nonce,
      token,
      curTime,
      checkSum,
      onSuccess: (code, res) => {
        resolve()
      },
      onFailure: (code, desc) => {
        reject({code, desc})
      }
    })
  })
}

function joinChannel (roomId, role, mediaType) {
  return new Promise((resolve, reject) => {
    Channel.join({
      channelKey: roomId,
      role,
      channelName: roomId,
      profile: mediaType,
      onSuccess: (res) => {
        resolve(res)
      },
      onFailure: (code, desc) => {
        reject({code, desc})
      }
    })
  })
}

function setListener () {
  Channel.on('user-join', (uccId) => {
    console.log('--------- listen user join ', uccId)
  })
  Channel.on('user-leave', (uccId) => {
    console.log('--------- listen user leave: ', uccId)
  })
  Channel.on('stream-publish', (stream) => {
    console.log('-------流发布成功')
    // 自己的流
    onAddStream(stream)
  })
  Channel.on('stream-add', (stream) => {
    let uccId = stream.uccId
    let streamId = stream.streamId
    onAddStream(stream)
    if (uccId) {
      console.log('--------- listen stream add ', streamId)

      // let elementId = 'peer'
      // if(stream.videoType === 1) {
      //     elementId = 'peer-screen'
      //     peerScreenStreamId = streamId
      //     console.log('收到屏幕流')
      // } else {
      //     console.log('收到视频流')
      //     peerStreamId = streamId
      // }

      // Channel.playMedia({
      //     streamId:streamId,
      //     elementId,
      //     onSuccess: (code) => {
      //         console.log('用户'+uccId+'进入房间！流id '+ streamId)
      //     },
      //     onFailure: (code,desc) => {

      //     }
      // })
    }
  })
  Channel.on('video-removed', (stream) => {
    // let uccId = stream.uccId
    // 别人的流移除
    onRemoveStream(stream)
    // if(uccId){
    //   console.log('--------- listen stream removed ', uccId)
    //   if(stream.videoType === 1) {
    //       console.log('移除屏幕流')
    //   } else {
    //       console.log('移除视频流')
    //   }
    // }
  })

  Channel.on('speaking', (speaking) => {

  })
  Channel.on('audio-mute', (uccId) => {
    console.log('用户' + uccId + '关闭了麦克风')
    // TODO: 别人静音
  })
  Channel.on('audio-unmute', (uccId) => {
    console.log('用户' + uccId + '打开了麦克风')
    // TODO: 别人取消静音
  })
  Channel.on('video-mute', (uccId) => {
    console.log('用户' + uccId + '关闭了摄像头')
    // TODO: 别人关闭摄像头
  })
  Channel.on('video-unmute', (uccId) => {
    console.log('用户' + uccId + '打开了摄像头')
    // TODO: 别人开摄像头
  })
  Channel.on('kickout', (res) => {
    if (res.code === 1) {
      console.log('主持人已退出')
    }
    if (res.code === 2) {
      console.log('一个房间只能有一个主持人，你被踢出去了')
    }
    if (res.code === 3) {
      console.log('你被主持人踢出房间')
    }
    console.log('-------kickout', res)
    // 自己异常退出
    dispatch('hangup', HungupReason.NETWORK_ERROR)
  })
  Channel.on('error', (err) => {
    console.log('user error', err)
    // 出错了，退出
    dispatch('hangup', HungupReason.NETWORK_ERROR)
  })
  Channel.on('disconnect', ({code}) => {
    console.log('断开连接')
    // 退出 1000 正常退出，其他异常
    if (code !== 1000) {
      dispatch('hangup', HungupReason.NETWORK_ERROR)
    }
  })
}

// 打开本地音视频
function playLocal () {
  return new Promise((resolve, reject) => {
    Channel.playMedia({
      onSuccess: function () {
        resolve()
      },
      onFailure: function (code, desc) {
        reject({code, desc})
      }
    })
  })
}

// ========== 业务处理 =============
function onAddStream (stream) {
  const userId = stream.uccId
  const user = state.users.find(u => (u.id + '') === userId)
  if (!user) {
    return
  }
  let index = user.streams.findIndex(s => s.id === stream.id)
  if (index !== -1) {
    user.streams.splice(index, 1, stream)
  } else {
    user.streams.push(stream)
  }
}

function onRemoveStream (stream) {
  const userId = stream.uccId
  const user = state.users.find(u => (u.id + '') === userId)
  if (!user) {
    return
  }
  let index = user.streams.findIndex(s => s.id === stream.id)
  if (index !== -1) {
    user.streams.splice(index, 1)
  }
}

export default {
  init (commit0, dispatch0, state0, rootState0) {
    commit = commit0
    dispatch = dispatch0
    state = state0
    rootState = rootState0
  },

  async joinRoom (userId, roomId, role, mediaType) {
    try {
      await init()
      await login(sdkParams.serverUrl, sdkParams.appKey, sdkParams.appSecret, userId)
      await joinChannel(roomId, role, mediaType)
      setListener()
      await playLocal()
    } catch (e) {
      console.warn(e)
      return new Error()
    }
  },

  close () {
    Channel.leave({
      onSuccess: () => {
        console.log('退出房间成功')
      },
      onFailure: (errMsg) => {
        console.log('退出房间失败', errMsg)
      }
    })
    WebSDK.logOut({
      onSuccess: (code, desc) => {
        console.log('登出成功', code, desc)
      },
      onFailure: (code, desc) => {
        console.log('登出失败', code, desc)
      }
    })
  }
}
