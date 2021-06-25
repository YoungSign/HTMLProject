const state = {
  enterpriseList: [], // 企业
  departmentList: [], // 部门
  enpAllMemberList: [], // 人员
  enpInformation: {}, // 详细资料
  enpSearchList: [] // 搜索结果
}

const mutations = {
  setEnterpriseList (state, payload) {
    state.enterpriseList = payload.enterpriseList
  },
  setDepartmentList (state, payload) {
    state.departmentList = payload.departmentList
  },
  setEnpAllMemberList (state, payload) {
    state.enpAllMemberList = payload.enpAllMemberList
  },
  setEnpInformation (state, payload) {
    state.enpInformation = payload.enpInformation
  },
  setEnpSearchList (state, payload) {
    state.enpSearchList = payload.enpSearchList
  }
}

const actions = {
  setEnpHttpConfig ({ dispatch, commit, state, rootState }) {
    let params = {
      options: {
        userid: rootState.base.userId
      },
      callback: (success, result, reason) => {
        if (!success) {
          console.warn('获取失败', result, reason)
          return
        }
        console.log('setEnpHttpConfig:', result)
      }
    }
    window.TeatalkSdk.invoke('setEnpHttpConfig', params)
  },
  // 1、获取当前登录用户所在的企业、分公司、及所在部门信息
  queryLoginUserInfo ({ dispatch, commit, state, rootState }) {
    let params = {
      options: {
        userid: '1659385',
        eid: '2000',
        token: '1',
        agent: 'web'
      },
      callback: (success, result, reason) => {
        if (!success) {
          console.warn('获取失败', result, reason)
          return
        }
        console.log('queryLoginUserInfo:', result)
        // result.data && result.data.length && (function () {
        //   commit('setLoginUserInfo, { loginUserInfo: result.data })
        // })()
      }
    }
    window.TeatalkSdk.invoke('queryLoginUserInfo', params)
  },
  // 2、获取所有部门
  getDepartment ({ dispatch, commit, state, rootState }, { item }) {
    let params = {
      options: {
        userid: '1659385',
        eid: '2000',
        deptid: item.deptid || '',
        version: '',
        dorgversion: 0,
        empvorsion: 0,
        type: '0', // type 0 明文 1 密文
        updateCorp: '1',
        incremental_update: '1',
        token: '1',
        agent: 'web'
      },
      callback: (success, result, reason) => {
        if (!success) {
          console.warn('获取失败', result, reason)
          return
        }
        console.log('getDepartment 列表获取-----------', result)
        result.dept_list && result.dept_list.length && (function () {
          if (item.deptid) {
            commit('setDepartmentList', { departmentList: result.dept_list })
          } else {
            commit('setEnterpriseList', { enterpriseList: result.dept_list })
          }
        })()
      }
    }
    window.TeatalkSdk.invoke('getDepartment', params)
  },
  // 3、获取某个部门所有员工
  getEmployeeForOneDeptid ({ commit, dispatch, state, rootState }, { item }) {
    let params = {
      options: {
        userid: '1659385',
        eid: '2000',
        deptid: item.deptid || '',
        token: '1',
        agent: 'web'
      },
      callback: (success, result, reason) => {
        if (!success) {
          console.warn('获取失败', result, reason)
          return
        }
        console.log('enpAllMemberList 列表res----------', result)
        result && (function () {
          commit('setEnpAllMemberList', { enpAllMemberList: result.employees })
        })()
      }
    }
    window.TeatalkSdk.invoke('getEmployeeForOneDeptid', params)
  },
  // 4、根据pgmuserid获取该员工的详细信息
  queryEmployeesForPgmuserid ({ commit, dispatch, state, rootState }, { item }) {
    let params = {
      options: {
        userid: '1659385',
        eid: '2000',
        pgmuserids: item.userid,
        token: '1',
        agent: 'web'
      },
      callback: (success, result, reason) => {
        if (!success) {
          console.warn('获取失败', result, reason)
          return
        }
        console.log('enpInformation 列表res----------', result)
        result && (function () {
          commit('setEnpInformation', { enpInformation: result })
        })()
      }
    }
    window.TeatalkSdk.invoke('queryEmployeesForPgmuserid', params)
  },
  // 4、根据用户编号查询用户信息(支持批量查询)
  queryEmployeesForUserids ({ commit, dispatch, state, rootState }, { item }) {
    let params = {
      options: {
        userid: '1659385',
        eid: '2000',
        userids: item.userid,
        token: '1',
        agent: 'web'
      },
      callback: (success, result, reason) => {
        if (!success) {
          console.warn('获取失败', result, reason)
          return
        }
        console.log('enpInformation 列表res----------', result)
        result && (function () {
          commit('setEnpInformation', { enpInformation: result })
        })()
      }
    }
    window.TeatalkSdk.invoke('queryEmployeesForUserids', params)
  },
  // 5、搜索企业联系人
  queryEmployeeForSearch ({ commit, dispatch, state, rootState }, searcheName) {
    let params = {
      options: {
        userid: '1659385',
        eid: '2000',
        searcheName: searcheName,
        tyoe: '0',
        updateCorp: '0',
        incremental_update: '1',
        token: '1',
        agent: 'web'
      },
      callback: (success, result, reason) => {
        if (!success) {
          console.warn('获取失败', result, reason)
          return
        }
        console.log('enpSearchList 列表res----------', result)
        result && result.employees.length && (function () {
          commit('setEnpSearchList', { enpSearchList: result.employees })
        })()
      }
    }
    window.TeatalkSdk.invoke('queryEmployeeForSearch', params)
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
