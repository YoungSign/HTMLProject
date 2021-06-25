import { EventBus } from '../../event-bus'

const state = {
    loginStatus: false,
    userId: '',
    userName: '',
    toUserId: 0
}
const mutations = {
    setLoginStatus(state, payload) {
        state.loginStatus = payload.loginStatus
    },
    setUserId(state, payload) {
        state.userId = payload.userId
    },
    setToUserId(state, payload) {
        state.toUserId = payload.toUserId
    },
    setUserName(state, payload) {
        state.userName = payload.userName
    },
    // setUrlList (state, payload) {
    //   state.userName = payload.urlList
    // },
}
const actions = {
    doLogin({ dispatch, commit, state }, { username, password, logonType, channel, type, status, targetRoute, vm }) {
        window.TeatalkSdk.invoke('connect', {
                options: {
                    name: username,
                    password: password,
                    keepAlive: 30,
                    logonType,
                    channel,
                    type,
                    status,
                },
                callback: (success, result, reason) => {
                    console.log('UI___connectCallback-res:', result)
                    if (!success) {
                        console.warn('通信连接失败', result, reason)
                        return
                    }
                    if (result.response === 'OK') { // 登录连接成功
                        dispatch('initLoginInfo', {vm, targetRoute, result})
                        // dispatch('msgBind')
                        // let loginStatus = true
                        // let userId = result.userId
                        // sessionStorage.setItem('loginStatus', loginStatus)
                        // commit('setLoginStatus', { loginStatus })
                        // commit('setUserId', { userId })
                        // sessionStorage.setItem('dtcurl', result.dtcurl)
                        // sessionStorage.setItem('eutinterfaceurl', result.eutinterfaceurl)
                        // sessionStorage.setItem('videourl', result.videourl)
                        // let toUserId = sessionStorage.getItem('toUserId')
                        // commit('setToUserId', { toUserId: parseInt(toUserId) })
                        //     // 获取个人名片信息
                        // dispatch('takeUserInfo', {})
                        //     // 注册监听音视频SDK通知
                        //     // dispatch('peerAvOption')
                        //     // 获取好友列表
                        //     // dispatch('getFriendList')
                        //     // 获取朋友圈好友列表
                        // dispatch('getSocialContactList')
                        //     // 获取群组列表
                        // dispatch('getGroupList')
                        // EventBus.$emit('routerReplace', targetRoute)
                        //     // 获取公众号列表
                        // dispatch('getPPFocusList')
                        // dispatch('orgMsgBind', { vm }) // 群组通知
                        // dispatch('av/init')
                        // dispatch('friMsgBind') // 好友通知
                        // dispatch('baseBind') // base通知
                        // dispatch('PPBind') // 公众号通知
                        // dispatch('baseMsgBind') //被挤掉通知
                        // let msgListType = 1
                        // vm.$nextTick(() => { // ui延迟获取离线消息和通知
                        //     dispatch('msgOffLine', { msgListType }) // 拉取离线消息信息
                        //     dispatch('getOrgOfflineMsg', { vm }) // 拉取群离线通知
                        //     dispatch('msgSocialOffLineNtf', { vm }) // 拉取好友离线通知
                        // })
                        // dispatch('setEnpHttpConfig') // 设置企业通讯录http配置
                        // let item = {
                        //     deptid: ''
                        // }
                        // dispatch('getDepartment', { item }) // 企业通讯录
                    } else if (result.response === 'TokenNotAvailable') { // 用户名或密码错误
                        // showDialog('用户名或密码错误')
                        EventBus.$emit('showDialog', '用户名或密码错误')
                    } else if (result.response === 'TokenError') { // 服务器异常
                        // showDialog('服务器异常')
                        EventBus.$emit('showDialog', '服务器异常')
                    } else if (result.response === 'TokenBusy') { // 服务器忙
                        // showDialog('服务器忙')
                        EventBus.$emit('showDialog', '服务器忙')
                    } else if (result.response === 'TokenNotExist') { // 用户不存在
                        // showDialog('用户不存在')
                        EventBus.$emit('showDialog', '用户不存在')
                    } else if (result.response === 'TokenNotSupport') { // 不支持
                        // showDialog('不支持')
                        EventBus.$emit('showDialog', '不支持')
                    }
                }
            })
            // 刷新自动登录用
        sessionStorage.setItem('username', username)
        sessionStorage.setItem('password', password)
        sessionStorage.setItem('logonType', logonType)
        sessionStorage.setItem('channel', channel)
        sessionStorage.setItem('type', type)
        sessionStorage.setItem('status', status)
    },
    takeUserInfo({ commit, state, rootState }, {}) {
        let params = {
            options: {
                from: rootState.base.userId,
                to: rootState.base.userId,
                version: 0
            },
            callback: (success, result, reason) => {
                console.log(success)
                console.log(result)
                if (!success) {
                    console.warn('获取个人信息失败', result, reason)
                        // return
                }
                let userName = result.data.visitingCardInfo.name
                commit('setUserName', { userName })
            }
        }
        console.log('takeUserInfo--params: ', params)
        window.TeatalkSdk.invoke('takeUserInfo', params)
    },
    baseMsgBind({ commit, dispatch, state, rootState }) {
        window.TeatalkSdk.invoke('baseMsgBind', {
            callback: (session, moduleType, data) => {
                console.log('baseMsgBind-session: ', session)
                console.log('baseMsgBind-moduleType: ', moduleType)
                console.log('baseMsgBind-data: ', data)
                EventBus.$emit('routerReplace', '/login');
                // managerEventer.emit(types.KICKED_OFF, data);
            }
        })
    },

    baseBind({ commit, dispatch, state, rootState }) {
        window.TeatalkSdk.invoke('baseBind', {
            callback: (session, moduleType, data) => {
                console.log("sdk 状态：newState, oldState, reason, packet::", newState, oldState, reason, packet)
                console.log("重连token，data.version::", data.version)
                console.log('UI___baseBindCallback-session: ', session)
                console.log('UI___baseBindCallback-moduleType: ', moduleType)
                console.log('UI___baseBindCallback-data: ', data)
            }
        })
    },

    logout({ dispatch, commit, state }, {}) {
        window.TeatalkSdk.invoke('logout', {
            options: {
                from: state.userId !== undefined ? state.userId : ''
            },
            callback: (success, result, reason) => {
                console.log('UI___connectCallback-res:', result)
                if (!success) {
                    console.warn('通信连接失败', result, reason)
                    return
                }
                if (success) {
                    console.log('退出登录成功')
                    EventBus.$emit('routerReplace', '/login')
                }
            }
        })
    },

    // 获取扫码之后二维码的状态
    getQrcodeState({ dispatch }, {qrcode, targetRoute, vm, callback }) {
        window.TeatalkSdk.invoke('getQrcodeState', {
            options:{qrcode},
            callback: (success, result, reason) => {
                // debugger
                console.log('UI___getQrcodeState__resp:', result);
                if (success && result.status == 2) {
                    dispatch('initLoginInfo', { vm, targetRoute, result })
                } else {
                    callback(success, result, reason);
                }
            }
        })
    },

    // 登陆成功后的本地信息初始化
    initLoginInfo({dispatch, commit}, {vm,targetRoute, result}) {
        // debugger
        dispatch('msgBind')
        let loginStatus = true;
        let userId = result.userId
        sessionStorage.setItem('loginStatus', loginStatus)
        commit('setLoginStatus', { loginStatus })
        commit('setUserId', { userId })
        sessionStorage.setItem('dtcurl', result.dtcurl)
        sessionStorage.setItem('eutinterfaceurl', result.eutinterfaceurl)
        sessionStorage.setItem('videourl', result.videourl)
        let toUserId = sessionStorage.getItem('toUserId')
        commit('setToUserId', { toUserId: parseInt(toUserId) })
            // 获取个人名片信息
        dispatch('takeUserInfo', {})
            // 注册监听音视频SDK通知
            // dispatch('peerAvOption')
            // 获取好友列表
            // dispatch('getFriendList')
            // 获取朋友圈好友列表
        dispatch('getSocialContactList')
            // 获取群组列表
        dispatch('getGroupList')
        EventBus.$emit('routerReplace', targetRoute)
            // 获取公众号列表
        dispatch('getPPFocusList')
        dispatch('orgMsgBind', { vm }) // 群组通知
        dispatch('av/init')
        dispatch('friMsgBind') // 好友通知
        dispatch('baseBind') // base通知
        dispatch('PPBind') // 公众号通知
        dispatch('baseMsgBind') //被挤掉通知
        let msgListType = 1
        vm.$nextTick(() => { // ui延迟获取离线消息和通知
            dispatch('msgOffLine', { msgListType }) // 拉取离线消息信息
            dispatch('getOrgOfflineMsg', { vm }) // 拉取群离线通知
            dispatch('msgSocialOffLineNtf', { vm }) // 拉取好友离线通知
        })
        dispatch('setEnpHttpConfig') // 设置企业通讯录http配置
        let item = {
            deptid: ''
        }
        dispatch('getDepartment', { item }) // 企业通讯录
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