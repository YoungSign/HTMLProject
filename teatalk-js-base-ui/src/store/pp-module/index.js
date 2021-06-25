/**
 * @param {*} listOne 被过滤的数组
 * @param {*} listTwo 参考数组
 * @param {*} key 根据过滤的属性
 * @returns Array
 */
function RemoveSameItem (listOne, listTwo, key) {
  return listOne.filter(n => {
    return !listTwo.find(m => m[key] === n[key])
  })
}

const state = {
  ppFocusList: [], // 已关注公众号列表
  searchedPPAcounts: [] // 搜索出的公众号列表(去掉已关注公众号)
}

const mutations = {
  initPPFocusList (state, paylaod) {
    state.ppFocusList = paylaod
  },
  resetPPFoucsList (state) {
    state.ppFocusList = []
  },
  setSearchedPPAcounts (state, paylaod) {
    state.searchedPPAcounts = paylaod
  },
  resetSearchedPPAcounts (state) {
    state.searchedPPAcounts = []
  }
}

const actions = {
  getPPFocusList ({ dispatch, commit, state, rootState }) {
    let params = {
      options: {
        from: rootState.base.userId
      },
      callback: (success, result, reason) => {
        // console.log('获取关注的公众号列表回调~~~~~~~~~~~~~~~~~~~~~~~PPFocusList:', success, result, reason)
        if (!success) {
          console.warn('获取失败', result, reason)
          return
        }
        let ppFocusList = result.data.focusPPListInfo
        commit('initPPFocusList', ppFocusList)
      }
    }
    window.TeatalkSdk.invoke('getPPFocusList', params)
  },
  searchPPAccount ({ dispatch, commit, state, rootState }, { searchKey, channelId }) {
    let params = {
      options: {
        from: rootState.base.userId,
        reqNum: 1000,
        startPos: 0,
        type: 0,
        searchKey: searchKey,
        channelId: channelId
      },
      callback: (success, result, reason) => {
        console.log('搜索公众号列表回调~~~~~~~~~~~~~~~~~~~~~~~SearchPPList:', success, result, reason)
        let ppSearchedList = []
        if (!success) {
          console.warn('获取失败', result, reason)
          return
        }
        if (!(result.data && result.data.focusPPListInfo)) { // 搜索出来无该关键字的公众号数据
          ppSearchedList = []
        } else if (result.data && result.data.focusPPListInfo && !state.ppFocusList.length) { // 搜索出来有该关键字的公众号且无已关注公众号
          ppSearchedList = result.data.focusPPListInfo
        } else if (result.data && result.data.focusPPListInfo.length && state.ppFocusList.length) { // 搜索出来有该关键字的公众号且有已关注公众号
          ppSearchedList = RemoveSameItem(result.data.focusPPListInfo, state.ppFocusList, 'PPAccountId')
        }
        commit('setSearchedPPAcounts', ppSearchedList)
      }
    }
    window.TeatalkSdk.invoke('searchPPAccount', params)
  },
  setPPFocus ({ dispatch, commit, state, rootState }, { param, vm }) {
    let params = {
      options: {
        from: rootState.base.userId,
        to: param.to,
        eventType: param.eventType,
        channelId: param.channelId
      },
      callback: (success, result, reason) => {
        console.log('设置公众号回调~~~~~~~~~~~~~~~~~~~~~~~:', success, result, reason)
        if (!success) {
          console.warn('设置失败', result, reason)
          return
        }
        if (param.eventType === 0) {
          let list = state.ppFocusList.filter(n => n.PPAccountId !== param.to)
          commit('initPPFocusList', list)
        } else if (param.eventType === 1) {
          setTimeout(function () {
            dispatch('getPPFocusList')
            // vm.$router.push({name: 'ppList'}) // 关注成功暂时跳转到已关注公众号列表页，后面改为跳转到公众号聊天页
            vm.$router.push({
              name: 'ppChat',
              params: {
                accountId: param.to
              }
            })
          }, 300)
        }
      }
    }
    window.TeatalkSdk.invoke('setPPFocus', params)
  },
  setPPReceive ({ dispatch, commit, state, rootState }, { to, switcher }) {
    let params = {
      options: {
        from: rootState.base.userId,
        to,
        switcher
      },
      callback: (success, result, reason) => {
        console.log('设置公众号接收消息开关设置回调~~~~~~~~~~~~~~~~~~~~~~~:', success, result, reason)
        if (!success) {
          console.warn('设置失败', result, reason)
          return
        }
      }
    }
    window.TeatalkSdk.invoke('setPPReceive', params)
  },

  // 公众号离线消息推送
  pullOfflineMsg({dispatch, commit, state}, {from}) {
    let params = {
      options: {
        from: from
      },
      callback: (success, result, reason) => {
        console.log('公众号离线消息拉取--------：', success, result, reason);
        if (!success) {
          console.warn('拉取失败', result, reason)
          return
        }
      }
    }

    window.TeatalkSdk.invoke('pullOfflineMsg', params)
  },

  PPBind ({ commit, dispatch, state, rootState }) {
    window.TeatalkSdk.invoke('PPBind', {
      callback: (session, moduleType, data) => {
        console.log('PPBind-session: ', session)
        console.log('PPBind-moduleType: ', moduleType)
        console.log('PPBind-data: ', data)  
      }
    })
  },
}

const getters = {

}

export default {
  state,
  mutations,
  actions,
  getters
}
