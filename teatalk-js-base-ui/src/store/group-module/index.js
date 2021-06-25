import Vue from 'vue'
import { EventBus } from '../../event-bus'

const state = {
  orgList: [], // 群列表（包含群详细信息）
  orgNotifyList: [], // 群通知列表信息
  userInfos: {} // 当前群信息
}

const mutations = {
  initOrgList (state, paylaod) {
    state.orgList.push(paylaod)
  },
  editOrgList (state, paylaod) {
    for (let i = 0, l = state.orgList.length; i < l; i++) {
      if (state.orgList[i].groupId === paylaod.groupId) {
        state.orgList[i] = paylaod
        Vue.set(state.orgList, i, paylaod)
        break
      }
    }
  },
  resetOrgList (state) {
    state.orgList = []
  },
  setOrgNotifyList (state, payload) {
    state.orgNotifyList = payload.orgNotifyList
  },
  setUserInfos (state, payload) {
    state.userInfos = payload.userInfos
  }
}

const actions = {
  changeOrgManager ({ commit, state, rootState }, { param, vm }) {
    let params = {
      options: {},
      callback: (success, result, reason) => {
        if (!success) {
          console.warn('更改失败', result, reason)
          return
        }
        console.log('success: ', success)
        // console.log('result: ', result)
      }
    }
    params.options = param
    window.TeatalkSdk.invoke('changeOrgManager', params)
  },
  quitOrg ({ commit, state, rootState }, { param, vm }) {
    let params = {
      options: {},
      callback: (success, result, reason) => {
        if (!success) {
          console.warn('操作失败', result, reason)
          return
        }
        console.log('success: 删除成功', success)
        console.log('result: ', result)
      }
    }
    params.options = param
    window.TeatalkSdk.invoke('quitOrg', params)
  },
  getGroupList ({ dispatch, commit, state, rootState }) {
    let params = {
      options: {
        from: rootState.base.userId,
        to: rootState.base.userId
      },
      callback: (success, result, reason) => {
        if (!success) {
          console.warn('获取失败', result, reason)
          return
        }
        result && result.data && dispatch('initialGroup', {data: { groupData: result.data }})
      }
    }
    window.TeatalkSdk.invoke('getOrgList', params)
  },
  initialGroup ({ commit, state }, { data, isInit = true }) {
    let from = data.groupData.from || 0
    let to = data.groupData.to || 0
    let groupList = data.groupData.groupList || []
    let params = {
      options: {
        from: from,
        to: to,
        version: 0
      },
      callback: (success, result, reason) => {
        if (!success) {
          console.warn('获取失败', result, reason)
          return
        }
        let temp = {
          userId: result.data.from, // 用户id
          groupId: result.data.to, // 群组id
          groupName: (result.data.groupName && result.data.groupName[0]) || '未命名', // 群名称
          groupSize: result.data.groupSize && result.data.groupSize[0], // 群上限
          createuserId: (result.data.mainGroupId && result.data.mainGroupId[0]) || '', // 群主id
          groupProclamation: (result.data.groupProclamation && result.data.groupProclamation[0]) || '', // 群公告
          groupIntroduction: (result.data.groupIntroduction && result.data.groupIntroduction[0]) || '', // 群简介
          groupPortraitId: (result.data.groupPortraitId && result.data.groupPortraitId[0]) || 0, // 群头像id
          administratorsId: result.data.administratorsId || 0, // 群管理员Id
          receiveType: result.data.receiveType, // 消息接收类型 1：接受并提醒，2：接受不提醒，3：不接受消息
          orgUserInfo: result.data.orgUserInfo // 群成员信息
        }
        if (!isInit) {
          commit('editOrgList', temp)
          commit('setUserInfos', { userInfos: temp })
          sessionStorage.setItem('userInfos', JSON.stringify(temp))
          return
        }
        commit('initOrgList', temp)
      }
    }
    groupList.length && groupList.forEach(item => {
      params.options.to = item
      window.TeatalkSdk.invoke('initOrgInfoNew', params)
    })
  },
  updateOrgInf ({ dispatch, commit, state, rootState }, { param, vm }) {
    let params = {
      options: {},
      callback: (success, result, reason) => {
        if (!success) {
          console.warn('修改失败', result, reason)
          return
        }
        vm.$router.go(-1)
        console.log('successUpdate: ', success)
        console.log('resultUpdate: ', result)
      }
    }
    params.options = param
    window.TeatalkSdk.invoke('updateOrgInf', params)
  },
  orgMsgBind ({ commit, dispatch, state, rootState }, { vm }) {
    window.TeatalkSdk.invoke('orgMsgBind', {
      callback: (session, moduleType, data) => {
        console.log('UI___msgBindCallback-session: ', session)
        console.log('UI___msgBindCallback-moduleType: ', moduleType)
        console.log('UI___msgBindCallback-data: ', data)
        // dispatch('updateReceiveMsg', { msgItem: data })
        // let content = data.inviteName + '邀请你加入' + data.orgName
        let userInfos = {}
        if (data.event === 'updateOrgInfNotify') { // 更新群信息
          dispatch('refreshUserInfos', { data })
        } else if (data.event === 'changeOrgManageNotify') { // 变更群管理权限
          let txt = !data.type ? '增加' : '删除'
          userInfos = JSON.parse(sessionStorage.getItem('userInfos'))
          EventBus.$emit('showToast', `id为${data.modifiedUserId}的好友${txt}管理员成功`)
          if (!userInfos || userInfos.groupId !== data.from) {
            return
          }
          if (!data.type && (!userInfos.administratorsId || !userInfos.administratorsId.length)) {
            userInfos.administratorsId = [data.modifiedUserId]
          } else if (!data.type && userInfos.administratorsId.length) {
            userInfos.administratorsId.push(data.modifiedUserId)
          } else if (data.type) {
            // userInfos.administratorsId.splice(userInfos.administratorsId.indexOf(data.modifiedUserId), 1)
          }
          commit('setUserInfos', { userInfos })
          sessionStorage.setItem('userInfos', JSON.stringify(userInfos))
        } else if (data.event === 'memberComeInReply') { // 群成员入群
          commit('resetOrgList')
          dispatch('getGroupList')
          EventBus.$emit('showToast', '加入成功')
        } else if (data.event === 'leaveOrgNotify') { // 群成员退出群组
          commit('resetOrgList')
          dispatch('getGroupList')
          EventBus.$emit('showToast', '删除成功')
        } else if (data.event === 'unOrgNotify') { // 解散群组
          userInfos = JSON.parse(sessionStorage.getItem('userInfos'))
          commit('resetOrgList')
          dispatch('getGroupList')
          EventBus.$emit('showToast', `id为${data.from}的群组已解散`)
          if (!userInfos || userInfos.groupId !== data.from) {
            return
          }
          commit('setUserInfos', { userInfos: {} })
          // sessionStorage.setItem('userInfos', JSON.stringify({}))
          // vm.$router.push({name: 'indexPage'})
        } else if (data.event === 'RefuseJoinOrgNotify') { // 拒绝邀请加入群通知
          EventBus.$emit('showToast', `${data.refuseUserId}拒绝${data.inviteName}的邀请加入群${data.groupId}`)
        } else if (data.event === 'changeCreaterNotify') { // 转移群主通知
          EventBus.$emit('showToast', `id为${data.key}的成员被设置为 id为${data.from}群的群主`)
        } else {
          let orgNotifyList = JSON.parse(JSON.stringify(state.orgNotifyList || []))
          orgNotifyList.push(data)
          commit('setOrgNotifyList', { orgNotifyList })
        }
        // if (data.type === 55) {
        //   let atReceiver = data.content[1]['Headers']['0x02']
        //   userInfos = JSON.parse(sessionStorage.getItem('userInfos'))
        //   let users = userInfos.orgUserInfo
        //   users.forEach( el => {
        //     if(el.userId === atReceiver) { }
        //   })
        // }
        // console.log(data.inviteName + '邀请你加入' + data.orgName)
      }
    })
  },
  refreshUserInfos ({ commit, state, dispatch, rootState }, { data }) { // 更新群信息
    let temp = {
      groupData: {
        from: rootState.base.userId,
        to: rootState.base.userId,
        groupList: [data.from]
      }
    }
    dispatch('initialGroup', { data: temp, isInit: false })
  },
  OrgInviteBuddy ({ commit, state, rootState }, { friendid, friendname, orgId, orgName, vm }) {
    let friendInfo = []
    friendInfo.push({'friUserId': friendid, 'friUserName': friendname})
    let params = {
      options: {
        from: rootState.base.userId,
        orgId,
        inviteName: rootState.base.userName,
        orgName,
        info: friendInfo
      },
      callback: (success, result, reason) => {
        if (!success) {
          console.warn('邀请好友加入群失败', result, reason)
          // return
        }
      }
    }
    console.log('OrgInviteBuddy--params: ', params)
    window.TeatalkSdk.invoke('OrgInviteBuddy', params)
  },
  IsAgreeJoinOrg ({ state, commit, dispatch, rootState }, { friendid, isAgree, item, vm }) {
    let params = {
      options: {
        from: rootState.base.userId,
        groupId: item.from,
        myName: rootState.base.userName,
        inviteUserId: item.inviteUserId,
        inviteName: item.inviteName,
        isAgree
      },
      callback: (success, result, reason) => {
        console.log('result', result)
        if (!success) {
          console.warn('是否加入群请求失败', result, reason)
          // return
        }
        // commit('resetOrgList')
        // dispatch('getGroupList')
      }
    }
    console.log('IsAgreeJoinOrg--params: ', params)
    window.TeatalkSdk.invoke('IsAgreeJoinOrg', params)
  },
  isAddFriend ({ dispatch, commit, state, rootState }, { friUserId, isAgree, vm }) {
    let params = {
      options: {
        from: rootState.base.userId,
        type: isAgree,
        friendUserId: parseInt(friUserId),
        nickname: ''
      },
      callback: (success, result, reason) => {
        console.log(success)
        console.log(result)
        if (!success) {
          console.warn('是否同意添加好友失败', result, reason)
          // return
        }
        dispatch('getSocialContactList')
      }
    }
    console.log('isAddFriend--params: ', params)
    window.TeatalkSdk.invoke('isAddFriend', params)
  },
  unorganize ({ commit, state, rootState }, { param, vm }) {
    let params = {
      options: {},
      callback: (success, result, reason) => {
        if (!success) {
          console.warn('解散群组失败', result, reason)
          // return
        }
        // vm.$router.push({name: 'indexPage'})
      }
    }
    params.options = param
    window.TeatalkSdk.invoke('unorganize', params)
  },
  changeCreater ({ commit, state, rootState }, { param, vm }) {
    let params = {
      options: {},
      callback: (success, result, reason) => {
        if (!success) {
          console.warn('转移群主失败', result, reason)
          // return
        }
        // vm.$router.push({name: 'indexPage'})
      }
    }
    params.options = param
    window.TeatalkSdk.invoke('changeOrgCreater', params)
  },
  // 获取群离线消息通知
  getOrgOfflineMsg ({ commit, state, rootState }) {
    let params = {
      options: {
        from: rootState.base.userId,
        to: rootState.base.userId
      },
      callback: (success, result, reason) => {
        if (!success) {
          console.warn('获取群离线通知失败', result, reason)
          // return
        }
        console.log('获取群离线通知：------------------', result)
      }
    }
    window.TeatalkSdk.invoke('getOrgOfflineMsg', params)
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
