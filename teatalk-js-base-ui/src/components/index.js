import TopNav from './top-nav'
import Dialog from './dialog'
import VoipSingle from './voip'
import Portrait from './portrait'
import Toast from './toast'
import Message from './message'
import List from './list'
import PortraitList from './portrait-list'
import Msgcollect from './msgcollect'
import enterpriseList from './enterprise-list'
import enpMemberList from './enpMember-list'
import departmentList from './department-list'
import search from './search'

const components = [
  TopNav,
  Dialog,
  Portrait,
  Toast,
  Message,
  VoipSingle,
  List,
  PortraitList,
  Msgcollect,
  enterpriseList,
  enpMemberList,
  departmentList,
  search
]

const install = function (Vue) {
  components.map(component => {
    Vue.component(component.name, component)
  })
}

export default {
  install
}
