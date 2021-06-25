import Vue from 'vue'
import { msgScrollBottom } from '../../utils'
// import { config } from 'shelljs'

/**
 * @param msgList 消息列表
 * @param msgItem 待处理的新消息
 */
function handleIsShowMsgTime(msgList, msgItem) {
    if (msgList.length) {
        let isFind = false
        for (let i = msgList.length - 1; i >= 0; i--) {
            let curItem = msgList[i]
            if (curItem.isShowMsgTime) {
                isFind = true
                msgItem.isShowMsgTime = (msgItem.serverTime - curItem.serverTime) > 10 * 60 * 1000
                break
            }
        }
        if (!isFind) {
            msgItem.isShowMsgTime = true
        }
    } else {
        msgItem.isShowMsgTime = true
    }
    return msgItem
}

const state = {
    maxMsgSequence: 0,
    msgList: [],
    /**
     * key: chatId
     * value: chatInfo
     */
    chatMap: {},
    /**
     * key: chatId
     * value: msgList
     */
    msgListMap: {
        // '500000315': [
        //   {
        //     content: '1',
        //     from: 500000345,
        //     isShowMsgTime: true,
        //     localTime: 1590054939496,
        //     messageId: 'C5F42AF149364F20E8640ECBAE3CD9E6',
        //     msgSequence: 0,
        //     sendStatus: 0,
        //     sender: 500000345,
        //     serverTime: 1590054939496,
        //     to: '500000315'
        //   }
        // ]
    },
    chatList: [],
    sessionList: [],
    bodyInfoId: [],
    msgReadReplyList: [],
    msgCollectLists: []
}
const mutations = {
    setMsgList(state, payload) {
        // state.msgList = payload.msgList.sort((a, b) => a.msgSequence - b.msgSequence)
        let msgList = payload.msgList.sort((a, b) => a.msgSequence - b.msgSequence)
        Vue.set(state.msgListMap, payload.chatId, msgList)
        console.log('UI___mutations-setMsgList-msgListMap: ', state.msgListMap)
    },
    setMaxMsgSequence(state, payload) {
        if (state.maxMsgSequence < payload.maxMsgSequence) {
            state.maxMsgSequence = payload.maxMsgSequence
        }
    },
    setSessionList(state, payload) {
        state.sessionList = payload.sessionList
        console.log(state.sessionList)
    },
    setBodyInfoId(state, payload) {
        state.bodyInfoId = payload.bodyInfoId
    },
    setMsgCollectLists(state, payload) {
        state.msgCollectLists = payload.msgCollectLists
    },
    setMsgReadReplyList(state, payload) {
        console.log(payload)
            // Vue.set(state.msgReadReplyList, payload.chatId, payload.msgReadReplyInfo)
        state.msgReadReplyList = payload.msgReadReplyList
        console.log('UI___mutations-setMsgReadReplyList-msgReadReplyList: ', state.msgReadReplyList)
        console.log('UI___mutations-setMsgReadReplyList-msgReadReplyList: ', state.msgReadReplyList[0].chatId)
    }
}
const actions = {
    sendMsg({ commit, dispatch, state, rootState }, { msgVal, chatId, type }) {
        // let msgList = JSON.parse(JSON.stringify(state.msgList))
        let msgList = JSON.parse(JSON.stringify(state.msgListMap[chatId] || []))
            /**
             * @param sendType 0:二人；1:群、群聊；
             */
        let params = {
            sendType: type,
            options: {
                from: rootState.base.userId,
                to: chatId, //type === 1 ? rootState.group.userInfos.groupId : chatId,
                content: msgVal
            },
            callback: (success, result, reason) => {
                console.log('UI___sendMsgCallback-success: ', success)
                console.log('UI___sendMsgCallback-result: ', result)
                console.log('UI___sendMsgCallback-reason: ', reason)
                if (!success) {
                    console.warn('通信连接失败', result, reason)
                    return
                }
                // dispatch('updateSendMsg', { result })
                dispatch('updateSendMsg', { result, chatId })
                sessionStorage.setItem('orgMsgVal', '')
            }
        }
        let orgMsgAtVal = JSON.parse(sessionStorage.getItem('orgMsgAtVal')) || ''
        if (orgMsgAtVal.length) {
            let tempAtIdsArr = []
                // params.options.type = 55
            orgMsgAtVal.forEach(el => {
                tempAtIdsArr.push(el[0])
            })
            params.options.at = tempAtIdsArr.join(',')
        }
        console.log('UI___sendMsg--params: ', params)
        let messageId = window.TeatalkSdk.invoke('sendTextMsg', params)
            /**
             * @param sendStatus 消息发送状态 0：发送中；1: 成功；2：失败
             * @param isShowMsgTime 是否显示消息时间 默认false不显示
             * @param msgSequence 消息顺序 消息排序依赖此字段
             * @param localTime 本地时间戳
             * @param sender 发送者id
             */
        let msgItem = {
            sendStatus: 0,
            isShowMsgTime: false,
            serverTime: new Date().getTime(),
            msgSequence: state.maxMsgSequence,
            localTime: new Date().getTime(),
            sender: rootState.base.userId,
            messageId,
            ...params.options
        }
        msgItem = handleIsShowMsgTime(msgList, msgItem)
        msgList.push(msgItem)
        console.log(msgList)
        let sendType = type
        dispatch('handleSessionItem', { sessionItemId: params.options.to, sendType })
            // commit('setMsgList', { msgList })
        commit('setMsgList', { msgList, chatId })
        sessionStorage.removeItem('orgMsgAtVal')
        msgScrollBottom('chatSection')
    },
    sendImg({ commit, dispatch, state, rootState }, { file, thumb, thumbUrl, type, chatId }) {
        let msgList = JSON.parse(JSON.stringify(state.msgListMap[chatId] || []))
            // let msgList = JSON.parse(JSON.stringify(state.msgList))
            /**
             * @param sendType 0:二人；1:群、群聊；
             */
        let params = {
            sendType: type,
            options: {
                from: rootState.base.userId,
                to: type === 1 ? rootState.group.userInfos.groupId : chatId
            },
            blobs: {
                file,
                thumb
            },
            onNotify: (handleName, msgId, result) => {
                console.log(handleName, msgId, result)
            },
            callback: (success, result, reason) => {
                if (!success) {
                    console.warn('通信连接失败', result, reason)
                    return
                }
                // dispatch('updateSendMsg', { result })
                dispatch('updateSendMsg', { result, chatId, fg: '1' })
            }
        }
        console.log('UI___sendMsg--params: ', params)
        let messageId = window.TeatalkSdk.invoke('sendImageMsg', params)
            /**
             * @param sendStatus 消息发送状态 0：发送中；1: 成功；2：失败
             * @param isShowMsgTime 是否显示消息时间 默认false不显示
             * @param msgSequence 消息顺序 消息排序依赖此字段
             * @param localTime 本地时间戳
             * @param sender 发送者id
             */
        let msgItem = {
            sendStatus: 0,
            isShowMsgTime: false,
            serverTime: new Date().getTime(),
            msgSequence: state.maxMsgSequence,
            localTime: new Date().getTime(),
            sender: rootState.base.userId,
            messageId,
            ...params.options,
            thumbUrl,
            type: 0
        }
        msgItem = handleIsShowMsgTime(msgList, msgItem)
        console.log(msgItem)
        msgList.push(msgItem)
        let sendType = type
        dispatch('handleSessionItem', { sessionItemId: params.options.to, sendType })
            // commit('setMsgList', { msgList })
        commit('setMsgList', { msgList, chatId })
        msgScrollBottom('chatSection')
    },
    sendFile({ commit, dispatch, state, rootState }, { file, type, chatId }) {
        let msgList = JSON.parse(JSON.stringify(state.msgListMap[chatId] || []))
            // let msgList = JSON.parse(JSON.stringify(state.msgList))
            /**
             * @param sendType 0:二人；1:群、群聊；
             */
        let params = {
            sendType: type,
            options: {
                from: rootState.base.userId,
                to: type === 1 ? rootState.group.userInfos.groupId : chatId
            },
            blobs: {
                file
            },
            onNotify: (handleName, msgId, result) => {
                console.log(handleName, msgId, result)
            },
            callback: (success, result, reason) => {
                if (!success) {
                    console.warn('通信连接失败', result, reason)
                    return
                }
                // dispatch('updateSendMsg', { result })
                dispatch('updateSendMsg', { result, chatId })
            }
        }
        console.log('UI___sendMsg--params: ', params)
        let messageId = window.TeatalkSdk.invoke('sendFileMsg', params)
            /**
             * @param sendStatus 消息发送状态 0：发送中；1: 成功；2：失败
             * @param isShowMsgTime 是否显示消息时间 默认false不显示
             * @param msgSequence 消息顺序 消息排序依赖此字段
             * @param localTime 本地时间戳
             * @param sender 发送者id
             */
        let msgItem = {
            sendStatus: 0,
            isShowMsgTime: false,
            serverTime: new Date().getTime(),
            msgSequence: state.maxMsgSequence,
            localTime: new Date().getTime(),
            sender: rootState.base.userId,
            messageId,
            ...params.options,
            type: 2
        }
        msgItem = handleIsShowMsgTime(msgList, msgItem)
        msgList.push(msgItem)
        let sendType = type
        dispatch('handleSessionItem', { sessionItemId: params.options.to, sendType })
            // commit('setMsgList', { msgList })
        commit('setMsgList', { msgList, chatId })
        msgScrollBottom('chatSection')
    },
    msgBind({ commit, dispatch, state, rootState }) {
        window.TeatalkSdk.invoke('msgBind', {
            callback: (session, moduleType, data) => {
                console.log('UI___msgBindCallback-session: ', session)
                console.log('UI___msgBindCallback-moduleType: ', moduleType)
                console.log('UI___msgBindCallback-data: ', data)
                if (data.messageId) { // 收消息
                    dispatch('updateReceiveMsg', { msgItem: data })
                } else if (data.friUserId) { // 消息撤回通知
                    let chatId = data.from
                    let msgList = JSON.parse(JSON.stringify(state.msgListMap[chatId] || []))
                    for (let i = 0; i < msgList.length; i++) {
                        if (data.version === msgList[i].msgSequence) {
                            msgList.splice(i, 1)
                            break
                        }
                    }
                    commit('setMsgList', { msgList, chatId })
                } else {
                    console.log('已读消息')
                    let chatId = data.from
                    let msgReadReply = true
                    let msgReadReplyList = JSON.parse(JSON.stringify(state.msgReadReplyList || []))
                    let list = {
                        chatId,
                        msgReadReply,
                        userId: data.userId
                    }
                    msgReadReplyList.push(list)
                    commit('setMsgReadReplyList', { msgReadReplyList })
                }
            }
        })
    },
    updateSendMsg({ commit, state, rootState }, { result, chatId, fg }) {
        console.log('UI___actions-updateSendMsg-msgListMap: ', state.msgListMap)
        let msgList = JSON.parse(JSON.stringify(state.msgListMap[chatId] || []))
            // let msgList = JSON.parse(JSON.stringify(state.msgList))
        for (let i = msgList.length - 1; i >= 0; i--) {
            let curItem = msgList[i]
            if (curItem.messageId === result.data.messageId) {
                if (result.response === 'OK') {
                    console.log(result.data)
                    curItem.serverTime = result.data.serverTime
                    curItem.msgSequence = result.data.msgSequence
                    if (fg === '1') {
                        curItem.content = result.data.content
                    }
                    curItem.sendStatus = 1
                } else {
                    curItem.sendStatus = 2
                }
                commit('setMaxMsgSequence', { maxMsgSequence: curItem.msgSequence || 0 })
                break
            }
        }
        // commit('setMsgList', { msgList })
        commit('setMsgList', { msgList, chatId })
        msgScrollBottom('chatSection')
    },
    updateReceiveMsg({ commit, dispatch, state, rootState }, { msgItem }) {
        // let msgList = JSON.parse(JSON.stringify(state.msgList))
        let chatId = msgItem.from
        let msgList = JSON.parse(JSON.stringify(state.msgListMap[chatId] || []))
        msgItem = handleIsShowMsgTime(msgList, msgItem)
        msgList.push(msgItem)
        commit('setMaxMsgSequence', { maxMsgSequence: msgItem.msgSequence })
            // commit('setMsgList', { msgList })
        commit('setMsgList', { msgList, chatId })
        let sendType = msgItem.name ? 1 : 0
        dispatch('handleSessionItem', { sessionItemId: chatId || 0, sendType })
        msgScrollBottom('chatSection')
    },
    /**
     * @param {*} index 消息起始索引
     * @param {*} pageSize 页数
     */
    historyMsg({ commit, state, rootState, dispatch }, { index, pageSize, msgType, chatId, type, vm }) {
        let msgList = JSON.parse(JSON.stringify(state.msgList))
        let params = {
            options: {
                from: rootState.base.userId,
                sessionId: chatId,
                index,
                pageSize,
                msgType,
                msgListType: type
            },
            callback: (success, result, reason) => {
                if (!success) {
                    console.warn('拉取历史记录失败', result, reason)
                    return
                }
                console.log(result.data)
                let msgVersionList = []
                for (let i = 0; i < result.data.content.length; i++) {
                    let msgItem = {
                        isShowMsgTime: false,
                        serverTime: result.data.content[i].serverTime,
                        sender: result.data.content[i].from,
                        content: result.data.content[i].type === 0 || result.data.content[i].type === 2 ? '暂不支持图片、文件消息' : result.data.content[i].content,
                        ...params.options
                    }
                    if (msgItem.msgListType !== 0) {
                        let sendType = chatId.slice(0, 1) === 9 ? 1 : 0
                        dispatch('handleSessionItem', { sessionItemId: chatId || 0, sendType })
                        dispatch('updateReceiveMsg', { msgItem })
                        msgVersionList.push(result.data.content[i].msgSequence)
                    } else {
                        msgItem = handleIsShowMsgTime(msgList, msgItem)
                            // commit('setMsgList', { msgList })
                        msgList.push(msgItem)
                        commit('setMsgList', { msgList, chatId })
                    }
                    msgScrollBottom('chatSection')
                }
                let friUserId = chatId
                if (msgVersionList) {
                    dispatch('msgReadReplyClear', { friUserId, msgVersionList }) // 清除离线消息
                    msgVersionList = []
                }
            }
        }
        console.log('historyMsg--params: ', params)
        window.TeatalkSdk.invoke('receiveHisMsg', params)
    },
    /**
     * @param sessionList 会话缓存列表
     * @param sessionItemId 待处理新会话用户id或群id
     * @param orgList 群列表
     * @param sendType 0:二人；1:群、群聊；
     */
    handleSessionItem({ commit, dispatch, state, rootState }, { sessionItemId, sendType }) {
        let lists = state.sessionList
        let orgList = rootState.group.orgList
        let from = rootState.base.userId
        let sessionItem = {}
        let oldItem = {}
        let found = false
        if (sendType === 1) {
            if (orgList.length) {
                for (let i = orgList.length - 1; i >= 0; i--) {
                    if (sessionItemId === orgList[i].groupId) {
                        sessionItem = orgList[i]
                        break
                    }
                }
            }
        } else {
            sessionItem.sessionId = sessionItemId
        }
        if (sendType === 1) {
            for (let i = lists.length - 1; i >= 0; i--) {
                if (sessionItemId === lists[i].groupId) {
                    lists.splice(i, 1)
                    break
                }
            }
            lists.unshift(sessionItem)
        } else {
            for (let i = lists.length - 1; i >= 0; i--) {
                if (sessionItemId === lists[i].sessionId) {
                    found = true
                    oldItem = lists.splice(i, 1)
                    break
                }
            }
            if (found) {
                lists.unshift(oldItem[0])
            } else {
                let params = {
                    options: {
                        from: from,
                        to: sessionItemId,
                        version: 0
                    },
                    callback: (success, result, reason) => {
                        if (!success) {
                            console.warn('通信连接失败', result, reason)
                            return
                        }
                        console.log('result: ', result)
                        result && result.data && (function() {
                            sessionItem.chatName = result.data.visitingCardInfo.name
                            sessionItem.mobileNo = result.data.visitingCardInfo.mobileNo
                            lists.unshift(sessionItem)
                        })()
                    }
                }
                console.log('params--------------', params)
                window.TeatalkSdk.invoke('takeUserInfo', params)
            }
        }
        commit('setSessionList', { sessionList: lists })
    },
    msgCollect({ commit, state, rootState }, { item, msgbyte, type, types }) {
        console.log(item)
        let message = {}
        let Body
        if (types === 0) {
            Body = {
                Headers: {
                    '0x01': item.content.fileId,
                    '0x02': item.content.fileSize,
                    '0x03': item.content.fileName ? item.content.fileName : "",
                    '0x04': item.content.thumbId,
                    '0x05': item.content.thumbSize,
                    '0x06': '',
                    '0x07': 0
                }
            }
        } else {
            Body = { Body: item.content }
        }
        // let Headersing = {
        //   From: item.from,
        //   To: item.to,
        //   MessageID: item.messageId,
        //   Status: type
        // }
        let Request = {
                From: item.from,
                To: item.to,
                MessageID: item.messageId,
                Status: type,
                Type: types,
                WcmpInfo: item.messageId,
                Body: Body
            }
            // message.Headers = Headersing
        message.Request = Request
        let params = {
            options: {
                from: rootState.base.userId,
                byte: msgbyte,
                message: message
            },
            callback: (success, result, reason) => {
                console.log(success)
                console.log(result)
                if (!success) {
                    console.warn('收藏消息失败', result, reason)
                        // return
                }
            }
        }
        console.log('msgCollect222', params)
        window.TeatalkSdk.invoke('msgCollect', params)
    },
    msgRevoke({ commit, state, rootState }, { item, msgType }) {
        let chatId = item.to
        let msgList = JSON.parse(JSON.stringify(state.msgListMap[chatId] || []))
        console.log(msgList)
        let params = {
            options: {
                from: item.from,
                friUserId: item.to,
                msgType: msgType,
                version: item.serverTime
            },
            callback: (success, result, reason) => {
                console.log(success)
                console.log(result)
                if (!success) {
                    console.warn('消息撤回失败', result, reason)
                        // return
                }
                for (let i = 0; i < msgList.length; i++) {
                    if (item.messageId === msgList[i].messageId) {
                        msgList.splice(i, 1)
                        break
                    }
                }
                commit('setMsgList', { msgList, chatId })
                return true
            }
        }
        console.log('msgRevoke', params)
        window.TeatalkSdk.invoke('msgRevoke', params)
    },
    msgCollectId({ commit, dispatch, state, rootState }, { vm }) {
        let params = {
            options: {
                from: rootState.base.userId
            },
            callback: (success, result, reason) => {
                if (!success) {
                    console.warn('获取收藏消息的所有id失败', result, reason)
                }
                console.log('收藏消息id----------', result)
                result.data.bodyInfo && result.data.bodyInfo.length && (function() {
                    let bodyInfoId = result.data.bodyInfo
                    commit('setBodyInfoId', { bodyInfoId })
                    dispatch('msgCollectList', { vm })
                })()
            }
        }
        window.TeatalkSdk.invoke('msgCollectId', params)
    },
    msgCollectList({ commit, dispatch, state, rootState }, { vm }) {
        let msgCollectLists = []
        let params = {
            options: {
                from: rootState.base.userId,
                converInfo: state.bodyInfoId
            },
            callback: (success, result, reason) => {
                console.log('收藏消息----------', success, result)
                if (!success) {
                    console.warn('获取收藏消息失败', result, reason)
                }
                result.data.bodyInfoIds && result.data.bodyInfoIds.length && (function() {
                    msgCollectLists = result.data.bodyInfoIds
                    commit('setMsgCollectLists', { msgCollectLists })
                    msgScrollBottom('chatSection')
                })()
            }
        }
        window.TeatalkSdk.invoke('msgCollectList', params)
    },
    msgCollectionDelete({ commit, state, rootState }, { item }) {
        let params = {
            options: {
                from: item.Form,
                keyId: item.Id
            },
            callback: (success, result, reason) => {
                console.log(result)
                if (!success) {
                    console.warn('消息收藏删除失败', result, reason)
                }
                for (let i = 0; i < state.msgCollectLists.length; i++) {
                    if (item.Id === state.msgCollectLists[i].Id) {
                        state.msgCollectLists.splice(i, 1)
                        break
                    }
                }
            }
        }
        console.log('msgCollectionDelete', params)
        window.TeatalkSdk.invoke('msgCollectionDelete', params)
    },
    msgReadReply({ commit, state, rootState }, { friUserId }) {
        console.log(friUserId)
        let params = {
            options: {
                from: rootState.base.userId,
                friUserId,
                userId: rootState.base.userId
            },
            callback: (success, result, reason) => {
                console.log(success)
                console.log(result)
                if (!success) {
                    console.warn('已读消息失败', result, reason)
                        // return
                }
            }
        }
        console.log('msgReadReply', params)
        window.TeatalkSdk.invoke('msgReadReply', params)
    },
    msgImmunity({ commit, state, rootState }, { getFlag, dateTime, expire, vm }) {
        let params = {
                options: {
                    from: rootState.base.userId,
                    type: getFlag,
                    dateTime: dateTime,
                    expire: expire
                },
                callback: (success, result, reason) => {
                    console.log(success)
                    console.log(result)
                    if (!success) {
                        console.warn('消息免打扰失败', result, reason)
                    }
                }
            }
            // console.log('msgImmunity', params)
        window.TeatalkSdk.invoke('msgImmunity', params)
    },
    msgSendcard ({ commit, dispatch, state, rootState }, { chatId, type, result }) {
        let msgList = JSON.parse(JSON.stringify(state.msgListMap[chatId] || []))
        /**
         * @param sendType 0:二人；1:群、群聊；
         */
        let params = {
          sendType: type,
          options: {
            from: rootState.base.userId,
            to: type === 1 ? rootState.group.userInfos.groupId : chatId,
            content: {
              name: result.data.visitingCardInfo.name,
              userId: result.data.visitingCardInfo.userId || rootState.base.userId,
              mobileNo: result.data.visitingCardInfo.mobileNo,
              department: ''
            }
          },
          callback: (success, result, reason) => {
            if (!success) {
              console.warn('通信连接失败', result, reason)
              return
            }
            // dispatch('updateSendMsg', { result })
            dispatch('updateSendMsg', { result, chatId, fg: '' })
          }
        }
        if (type === 1) {
          params.options.content.groupType = result.data.visitingCardInfo.groupType
        }
        console.log('名片: ', params)
        let messageId = window.TeatalkSdk.invoke('msgSendcard', params)
        let msgItem = {
          sendStatus: 0,
          isShowMsgTime: false,
          serverTime: new Date().getTime(),
          msgSequence: state.maxMsgSequence,
          localTime: new Date().getTime(),
          sender: rootState.base.userId,
          messageId,
          ...params.options,
          name: result.data.visitingCardInfo.name,
          userId: rootState.base.userId,
          mobileNo: result.data.visitingCardInfo.mobileNo,
          department: '',
          type: 6
        }
        msgItem = handleIsShowMsgTime(msgList, msgItem)
        console.log(msgItem)
        msgList.push(msgItem)
        console.log(msgList)
        let sendType = type
        dispatch('handleSessionItem', {sessionItemId: params.options.to, sendType})
        commit('setMsgList', { msgList, chatId })
        msgScrollBottom('chatSection')
    },
    cardInfo ({ commit, dispatch, state, rootState }, {chatId, type, groupType}) {
    let from = rootState.base.userId
    if (type === 0) { // 个人名片获取
        let params = {
        options: {
            from: from,
            to: chatId,
            version: 0
        },
        callback: (success, result, reason) => {
            if (!success) {
            console.warn('通信连接失败', result, reason)
            return
            }
            console.log('result: ', result)
            result && result.data && (function () {
            dispatch('msgSendcard', {chatId, type, result})
            })()
        }
        }
        console.log('params--------------', params)
        window.TeatalkSdk.invoke('takeUserInfo', params)
    } else if (type === 1) {  // 群名片
        let userInfos = JSON.parse(sessionStorage.getItem('userInfos'))
        let result = {
        data: {
            visitingCardInfo: {
            name: userInfos.groupName,
            userId: userInfos.groupId,
            mobileNo: userInfos.mobileNo,
            department: '',
            groupType
            }
        }
        }
        dispatch('msgSendcard', {chatId, type, result})
    }
    },
    msgOffLine({ commit, state, rootState, dispatch }, { msgListType, vm }) {
        let params = {
            options: {
                from: rootState.base.userId,
                msgListType
            },
            callback: (success, result, reason) => {
                if (!success) {
                    console.warn('拉取离线消息信息失败', result, reason)
                    return
                }
                console.log(result.data)
                for (let i = 0; i < result.data.conversation.length; i++) {
                    let index = result.data.conversation[i].Headers['0x03']
                    let pageSize = result.data.conversation[i].Headers['0x02']
                    let chatId = result.data.conversation[i].Headers['0x01']
                    let type = result.data.conversation[i].Headers['0x01']
                    if (pageSize === 0) {
                        return
                    }
                    let msgType = 'WEBIM'
                    dispatch('historyMsg', { index, pageSize, msgType, chatId, type, vm })
                }
            }
        }
        console.log('msgOffLine--params: ', params)
        window.TeatalkSdk.invoke('msgOffLine', params)
    },

    msgReadReplyClear({ commit, state, rootState }, { friUserId, msgVersionList }) {
        console.log(friUserId)
        let params = {
            options: {
                from: friUserId,
                friUserId: rootState.base.userId,
                userId: friUserId,
                version: msgVersionList
            },
            callback: (success, result, reason) => {
                console.log(success)
                console.log(result)
                if (!success) {
                    console.warn('清除离线消息失败', result, reason)
                        // return
                }
            }
        }
        console.log('msgReadReplyClear', params)
        window.TeatalkSdk.invoke('msgReadReplyClear', params)
    },
    getSessionMsg ({ commit, state, dispatch, rootState }, { vm }) {
        // let msgList = JSON.parse(JSON.stringify(state.msgList))
        let params = {
          options: {
            from: rootState.base.userId,
            to: rootState.base.userId
          },
          callback: (success, result, reason) => {
            console.log(result)
            if (!success) {
              console.warn('获取最近会话列表失败', result, reason)
            }
            let msgVersionList = []
            for (let i = 0; i < result.data.sessMsgInfo.length; i++) {
              let chatId = result.data.sessMsgInfo[i].to
              let msgItem = {
                isShowMsgTime: false,
                serverTime: result.data.sessMsgInfo[i].serverTime,
                sender: result.data.sessMsgInfo[i].from,
                content: result.data.sessMsgInfo[i].type === 0 || result.data.sessMsgInfo[i].type === 2 ? '暂不支持图片、文件消息' : result.data.sessMsgInfo[i].content,
                ...params.options
              }
              // msgItem = handleIsShowMsgTime(msgList, msgItem)
              // // commit('setMsgList', { msgList })
              // msgList.push(msgItem)
              // commit('setMsgList', { msgList, chatId })
              // let sendType = chatId.slice(0, 1) === 9 ? 1 : 0
              let sendType = 0
              dispatch('handleSessionItem', {sessionItemId: chatId || 0, sendType})
              dispatch('updateReceiveMsg', { msgItem })
              msgVersionList.push(result.data.sessMsgInfo[i].msgSequence)
              msgScrollBottom('chatSection')
            }
          }
        }
        console.log('getSessionMsg--params: ', params)
        window.TeatalkSdk.invoke('getSessionMsg', params)
    },
    getOrgOfflineMsg ({ commit, state, rootState, dispatch }, { vm }) {
    let params = {
        options: {
        from: rootState.base.userId,
        to: rootState.base.userId
        },
        callback: (success, result, reason) => {
        if (!success) {
            console.warn('拉取群离线通知失败', result, reason)
            return
        }
        console.log(result.data)
        }
    }
    console.log('getOrgOfflineMsg--params: ', params)
    window.TeatalkSdk.invoke('getOrgOfflineMsg', params)
    },
    msgSocialOffLineNtf ({ commit, state, rootState, dispatch }, { vm }) {
    let params = {
        options: {
        from: rootState.base.userId,
        to: rootState.base.userId
        },
        callback: (success, result, reason) => {
        if (!success) {
            console.warn('拉取好友离线通知失败', result, reason)
            return
        }
        console.log(result.data)
        }
    }
    console.log('msgSocialOffLineNtf--params: ', params)
    window.TeatalkSdk.invoke('msgSocialOffLineNtf', params)
    },
    sendLocation ({ commit, dispatch, state, rootState }, { latitude, longitude, thumb, descFileId, type, chatId }) {
    let msgList = JSON.parse(JSON.stringify(state.msgListMap[chatId] || []))
    // let msgList = JSON.parse(JSON.stringify(state.msgList))
    /**
     * @param sendType 0:二人；1:群、群聊；
     */
    let params = {
        sendType: type,
        options: {
        from: rootState.base.userId,
        to: type === 1 ? rootState.group.userInfos.groupId : chatId,
        content: {
            latitude: latitude,
            longitude: longitude,
            descFileId: descFileId
        }        
        },
        blobs: {
        thumb
        },
        onNotify: (handleName, msgId, result) => {
        console.log(handleName, msgId, result)
        },
        callback: (success, result, reason) => {
        if (!success) {
            console.warn('通信连接失败', result, reason)
            return
        }
        // dispatch('updateSendMsg', { result })
        dispatch('updateSendMsg', { result, chatId, fg: '1' })
        }
    }
    console.log('UI___sendMsg--params: ', params)
    let messageId = window.TeatalkSdk.invoke('sendLocationMsg', params)
    /**
     * @param sendStatus 消息发送状态 0：发送中；1: 成功；2：失败
     * @param isShowMsgTime 是否显示消息时间 默认false不显示
     * @param msgSequence 消息顺序 消息排序依赖此字段
     * @param localTime 本地时间戳
     * @param sender 发送者id
     */
    let msgItem = {
        sendStatus: 0,
        isShowMsgTime: false,
        serverTime: new Date().getTime(),
        msgSequence: state.maxMsgSequence,
        localTime: new Date().getTime(),
        sender: rootState.base.userId,
        messageId,
        ...params.options,
        type: 7
    }
    msgItem = handleIsShowMsgTime(msgList, msgItem)
    console.log(msgItem)
    msgList.push(msgItem)
    let sendType = type
    dispatch('handleSessionItem', {sessionItemId: params.options.to, sendType})
    // commit('setMsgList', { msgList })
    commit('setMsgList', { msgList, chatId })
    msgScrollBottom('chatSection')
    },
    sendAudio  ({ commit, dispatch, state, rootState }, { file, filetype, bitrate, totalTime, type, chatId }) {
        let msgList = JSON.parse(JSON.stringify(state.msgListMap[chatId] || []))
        // let msgList = JSON.parse(JSON.stringify(state.msgList))
        /**
         * @param sendType 0:二人；1:群、群聊；
         */
        let params = {
            sendType: type,
            options: {
            from: rootState.base.userId,
            to: type === 1 ? rootState.group.userInfos.groupId : chatId,
            content: {
                type: filetype,
                bitrate: bitrate,
                totalTime: totalTime
            }   
            },
            blobs: {
            file
            },
            onNotify: (handleName, msgId, result) => {
            console.log(handleName, msgId, result)
            },
            callback: (success, result, reason) => {
            if (!success) {
                console.warn('通信连接失败', result, reason)
                return
            }
            // dispatch('updateSendMsg', { result })
            dispatch('updateSendMsg', { result, chatId, fg: '1' })
            }
        }
        console.log('UI___sendMsg--params: ', params)
        let messageId = window.TeatalkSdk.invoke('sendAudioMsg', params)
        /**
         * @param sendStatus 消息发送状态 0：发送中；1: 成功；2：失败
         * @param isShowMsgTime 是否显示消息时间 默认false不显示
         * @param msgSequence 消息顺序 消息排序依赖此字段
         * @param localTime 本地时间戳
         * @param sender 发送者id
         */
        let msgItem = {
            sendStatus: 0,
            isShowMsgTime: false,
            serverTime: new Date().getTime(),
            msgSequence: state.maxMsgSequence,
            localTime: new Date().getTime(),
            sender: rootState.base.userId,
            messageId,
            ...params.options,
            type: 1
        }
        msgItem = handleIsShowMsgTime(msgList, msgItem)
        console.log(msgItem)
        msgList.push(msgItem)
        let sendType = type
        dispatch('handleSessionItem', {sessionItemId: params.options.to, sendType})
        // commit('setMsgList', { msgList })
        commit('setMsgList', { msgList, chatId })
        msgScrollBottom('chatSection')
    },
    // 发送视频
    sendVideo ({ commit, dispatch, state, rootState }, { file, thumb, thumbUrl, type, chatId }) {
        let msgList = JSON.parse(JSON.stringify(state.msgListMap[chatId] || []))
        /**
         * @param sendType 0:二人；1:群、群聊；
         */
        let params = {
        sendType: type,
        options: {
            from: rootState.base.userId,
            to: type === 1 ? rootState.group.userInfos.groupId : chatId
        },
        blobs: {
            file,
            thumb
        },
        onNotify: (handleName, msgId, result) => {
            console.log(handleName, msgId, result)
        },
        callback: (success, result, reason) => {
            if (!success) {
            console.warn('通信连接失败', result, reason)
            return
            }
            // dispatch('updateSendMsg', { result })
            dispatch('updateSendMsg', { result, chatId, fg: '1' })
        }
        }
        console.log('UI___sendMsg--params: ', params)
        let messageId = window.TeatalkSdk.invoke('sendVideoMsg', params)
        /**
         * @param sendStatus 消息发送状态 0：发送中；1: 成功；2：失败
         * @param isShowMsgTime 是否显示消息时间 默认false不显示
         * @param msgSequence 消息顺序 消息排序依赖此字段
         * @param localTime 本地时间戳
         * @param sender 发送者id
         */
        let msgItem = {
        sendStatus: 0,
        isShowMsgTime: false,
        serverTime: new Date().getTime(),
        msgSequence: state.maxMsgSequence,
        localTime: new Date().getTime(),
        sender: rootState.base.userId,
        messageId,
        ...params.options,
        thumbUrl,
        type: 3
        }
        msgItem = handleIsShowMsgTime(msgList, msgItem)
        console.log(msgItem)
        msgList.push(msgItem)
        let sendType = type
        dispatch('handleSessionItem', {sessionItemId: params.options.to, sendType})
        commit('setMsgList', { msgList, chatId })
        msgScrollBottom('chatSection')
    },
    getSystemTime ({ commit, state, dispatch, rootState }, { vm }) {
        let params = {
          options: {
            from: rootState.base.userId,
          },
          callback: (success, result, reason) => {
            console.log(result)
            if (!success) {
              console.warn('获取服务端时间戳', result, reason)
            }
            
          }
        }
        console.log('getSystemTime--params: ', params)
        window.TeatalkSdk.invoke('getSystemTime', params)
    },
}

const getters = {}

export default {
    state,
    mutations,
    actions,
    getters
}