import Vue from 'vue'
import Vuex from 'vuex'
import base from './base-module'
import msg from './msg-module'
import voip from './voip-module'
import friend from './friend-module'
import group from './group-module'
import enterprise from './enterprise-module'
import av from './av-module'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    base,
    msg,
    voip,
    friend,
    group,
    enterprise,
    av
  }
})

export default store
