import { HanZiPinYin } from '../../hzpy.js'

function getTitleLetter (str) {
  return HanZiPinYin.get(str).substring(0, 1)
}

function pySegSort (arr) {
  if (!String.prototype.localeCompare) { return null }
  let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  let segs = []
  let unmatch = {
    letter: '#',
    data: []
  }
  let curr
  letters.forEach(function (item) {
    if (!arr.length) {
      return false
    }
    curr = {letter: item, data: []}
    for (var j = 0; j < arr.length; j++) {
      let curItem = arr[j]
      let letter = getTitleLetter(curItem.userName)
      if (letter === item) {
        let matchItem = arr.splice(j, 1)[0]
        curr.data.push(matchItem)
        j--
      } else if (letter.localeCompare('a') < 0 || letter.localeCompare('z') > 0) {
        let unmatchItem = arr.splice(j, 1)[0]
        unmatch.data.push(unmatchItem)
        j--
      }
    }
    if (curr.data.length) {
      segs.push(curr)
      // curr.data.sort(function (a, b) {
      //   return a.userName.localeCompare(b.userName)
      // })
    }
  })
  if (unmatch.data.length) {
    segs.push(unmatch)
    // unmatch.data.sort(function (a, b) {
    //   return a.userName.localeCompare(b.userName)
    // })
  }
  return segs
}

const state = {
  friendList: [],
  initFriendList: [],
  friNotifyList: []
}
const mutations = {
  setFriendList (state, payload) {
    state.friendList = payload.friendList
  },
  setInitFriendList (state, payload) {
    state.initFriendList = payload.initFriendList
  },
  setFriNotifyList (state, payload) {
    state.friNotifyList = payload.friNotifyList
  }
}
const actions = {
  getFriendList ({ commit, dispatch, state, rootState }) {
    let p = new Promise(function (resolve, reject) {
      setTimeout(() => {
        let rawList = [
          {
            friendUserid: 500000315,
            userName: '3K72',
            userAvatar: require('../../assets/imgs/avatar_01.jpg')
          },
          {
            friendUserid: 500000316,
            userName: 'Alice你好',
            userAvatar: ''
          },
          {
            friendUserid: 500000315,
            userName: '孔子',
            userAvatar: require('../../assets/imgs/avatar_01.jpg')
          },
          {
            friendUserid: 500000315,
            userName: '大白',
            userAvatar: require('../../assets/imgs/avatar_01.jpg')
          },
          {
            friendUserid: 500000317,
            userName: '云通信cake哈哈',
            userAvatar: require('../../assets/imgs/avatar_default.jpg')
          },
          {
            friendUserid: 500000317,
            userName: '530嗨嗨',
            userAvatar: require('../../assets/imgs/avatar_default.jpg')
          },
          {
            friendUserid: 500000317,
            userName: '😃你好',
            userAvatar: require('../../assets/imgs/avatar_default.jpg')
          },
          {
            friendUserid: 500000317,
            userName: 'AyoM',
            userAvatar: require('../../assets/imgs/avatar_default.jpg')
          }
        ]
        resolve(rawList)
      }, 500)
    })

    p.then((data) => {
      console.log('UI___getFriendListData: ', data)
      let friendList = pySegSort(data)
      commit('setFriendList', { friendList })
      console.log('UI___state.friendList: ', state.friendList)
    }, (err) => {
      console.log(err)
    })
  },
  getSocialContactList ({ commit, dispatch, state, rootState }) {
    let params = {
      options: {
        userid: rootState.base.userId,
        version: 0
      },
      callback: (success, result, reason) => {
        if (!success) {
          console.warn('获取朋友圈好友列表失败', result, reason)
          return
        }
        // console.log('朋友圈好友列表res----------', result)
        result.data.friendInfo && result.data.friendInfo.length && (function () {
          commit('setInitFriendList', { initFriendList: result.data.friendInfo })
          let friendList = pySegSort(JSON.parse(JSON.stringify(result.data.friendInfo)))
          commit('setFriendList', { friendList })
        })()
      }
    }
    window.TeatalkSdk.invoke('getSocialContactList', params)
  },
  orgCreate ({ commit, state, dispatch, rootState }, { friUserId, vm }) {
    let friUserIdList = friUserId.toString().indexOf(',') !== -1 ? friUserId.split(',') : JSON.parse('[' + friUserId + ']')
    let params = {
      options: {
        from: rootState.base.userId,
        to: rootState.base.toUserId,
        // index: [100001061, 100001062],
        index: friUserIdList,
        createName: rootState.base.userName, // 创建者name
        info: {
          groupName: rootState.base.userName+'创建群组' + new Date().getTime(),
          groupPortraitid: '',
          groupProclamation: '',
          groupIntroduction: ''
        }
      },
      callback: (success, result, reason) => {
        console.log(success)
        console.log(result)
        if (!success) {
          console.warn('创建群组失败', result, reason)
          return
        }
        let temp = {
          groupData: {
            from: rootState.base.userId,
            to: rootState.base.userId,
            groupList: [result.data.groupId]
          }
        }
        dispatch('initialGroup', { data: temp, isInit: true })
      }
    }
    console.log('orgCreate--params: ', params)
    window.TeatalkSdk.invoke('createOrganize', params)
  },
  addFriend ({ commit, state, rootState }, { friUserId }) {
    let params = {
      options: {
        from: rootState.base.userId,
        friendUserId: friUserId,
        nickname: '11',
        mobileNo: ''
      },
      callback: (success, result, reason) => {
        console.log(success)
        console.log(result)
        if (!success) {
          console.warn('添加好友失败', result, reason)
          // return
        }
      }
    }
    console.log('addFriend--params: ', params)
    window.TeatalkSdk.invoke('addFriend', params)
  },
  friMsgBind ({ commit, dispatch, state, rootState }) {
    window.TeatalkSdk.invoke('friendMsgBind', {
      callback: (session, moduleType, data) => {
        console.log('好友通知')
        console.log('UI___msgBindCallback-session: ', session)
        console.log('UI___msgBindCallback-moduleType: ', moduleType)
        console.log('UI___msgBindCallback-data: ', data)
        if (data.event === 'ApproveAddFriNotify') {
          dispatch('getSocialContactList')
        } else if (data.event === 'addFriNotify') {
          let friNotifyList = JSON.parse(JSON.stringify(state.friNotifyList || []))
          friNotifyList.push(data)
          commit('setFriNotifyList', { friNotifyList })
        }
        // dispatch('updateReceiveMsg', { msgItem: data })
        // let content = data.inviteName + '邀请你加入' + data.orgName
        // console.log(data.inviteName + '邀请你加入' + data.orgName);
      }
    })
  },
  deleteFriend ({ commit, state, rootState }, { friUserId, vm }) {
    let params = {
      options: {
        from: rootState.base.userId,
        friendUserId: friUserId
      },
      callback: (success, result, reason) => {
        console.log(success)
        console.log(result)
        if (!success) {
          console.warn('删除好友失败', result, reason)
          // return
        }
      }
    }
    console.log('deleteFriend', params)
    window.TeatalkSdk.invoke('deleteFriend', params)
  },
  getEid ({ commit, state, rootState }, { vm }) {
    let params = {
      options: {
        from: rootState.base.userId,
        to: rootState.base.userId
      },
      callback: (success, result, reason) => {
        console.log(success)
        console.log(result)
        if (!success) {
          console.warn('获取eid失败', result, reason)
          // return
        }
      }
    }
    console.log('getEid', params)
    window.TeatalkSdk.invoke('getEid', params)
  },
  takeCardBatch ({ commit, state, dispatch, rootState }, { friUserId, vm }) {
    let keyList = friUserId.toString().indexOf(',') !== -1 ? friUserId.split(',') : JSON.parse('[' + friUserId + ']')
    let params = {
      options: {
        from: rootState.base.userId,
        to: rootState.base.userId,
        index: keyList,
      },
      callback: (success, result, reason) => {
        console.log(result)
        if (!success) {
          console.warn('获取用户在线状态', result, reason)
        }
        
      }
    }
    console.log('takeCardBatch--params: ', params)
    window.TeatalkSdk.invoke('takeCardBatch', params)
  },
  takeStatus ({ commit, state, dispatch, rootState }, { friUserId, vm }) {
    let params = {
      options: {
        from: rootState.base.userId,
        to: rootState.base.userId,
        status: friUserId,
      },
      callback: (success, result, reason) => {
        console.log(result)
        if (!success) {
          console.warn('设置用户在线状态', result, reason)
        }
        
      }
    }
    console.log('takeStatus--params: ', params)
    window.TeatalkSdk.invoke('takeStatus', params)
  },
  changeCard ({ commit, state, dispatch, rootState }, { name, mood, gender, expression, portraitId, vm }) {
    let params = {
      options: {
        from: rootState.base.userId,
        changeCardInfo: {
          name: name ? name : rootState.base.userName,
          mood: mood,
          expression: parseInt(expression),
          gender: parseInt(gender),
          portraitId: parseInt(portraitId),
        }
      },
      callback: (success, result, reason) => {
        console.log(result)
        if (!success) {
          console.warn('修改个人信息', result, reason)
        }
        
      }
    }
    console.log('changeCard--params: ', params)
    window.TeatalkSdk.invoke('changeCard', params)
  },
}
const getters = {}

export default {
  state,
  mutations,
  actions,
  getters
}
