import Vue from 'vue'
import Router from 'vue-router'
import indexPage from '@/pages/index'
import loginPage from '@/pages/login'
import chatPage from '@/pages/chat'
import searchMembPage from '@/pages/searchMemb'
import groupListPage from '@/pages/group/group'
import groupAllMembPage from '@/pages/group/groupAllMembPage'
import addOrMinusMembPage from '@/pages/group/addOrMinusMemb'
import groupControlPage from '@/pages/group/controlPage'
import groupManagePage from '@/pages/group/groupManage'
import QRCodeGroupPage from '@/pages/group/QRCodeGroup'
import groupAdminPage from '@/pages/group/groupAdmin'
import editGroupNamePage from '@/pages/group/editGroupName'
import editGroupProPage from '@/pages/group/editGroupPro'
import enterpriseListPage from '@/pages/enterprise/enterprise'
import departmentListPage from '@/pages/enterprise/department'
import enpAllMemberPage from '@/pages/enterprise/allMember'
import enpDetailedPage from '@/pages/enterprise/enpDetailed'
import enpInformationPage from '@/pages/enterprise/information'
import enpSearchPage from '@/pages/enterprise/enpSearch'
import chooseAtMembPage from '@/pages/group/chooseAtMemb'
import membDetailPage from '@/pages/group/membDetail'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'indexPage',
      meta: {requiresAuth: true, pageTitle: '云通信'},
      component: indexPage
    },
    {
      path: '/login',
      name: 'loginPage',
      meta: {requiresAuth: false, pageTitle: '登录'},
      component: loginPage
    },
    {
      path: '/chat/:id',
      name: 'chatPage',
      meta: {requiresAuth: true, pageTitle: '聊天'},
      component: chatPage
    },
    {
      path: '/searchMemb',
      name: 'searchMembPage',
      meta: {requiresAuth: true, pageTitle: '搜索'},
      component: searchMembPage
    },
    {
      path: '/group',
      name: 'group',
      meta: {requiresAuth: true, pageTitle: '群组'},
      component: groupListPage
    },
    {
      path: '/groupAllMemb',
      name: 'groupAllMemb',
      meta: {requiresAuth: true, pageTitle: '聊天成员'},
      component: groupAllMembPage
    },
    {
      path: '/addOrMinusMemb',
      name: 'addOrMinusMemb',
      meta: {requiresAuth: true, pageTitle: '选择成员'},
      component: addOrMinusMembPage
    },
    {
      path: '/groupChat/:id',
      name: 'groupChat',
      meta: {requiresAuth: true, pageTitle: '群组聊天'},
      component: chatPage
    },
    {
      path: '/groupControl',
      name: 'groupControl',
      meta: {requiresAuth: true, pageTitle: '群资料'},
      component: groupControlPage
    },
    {
      path: '/groupManage',
      name: 'groupManage',
      meta: {requiresAuth: true, pageTitle: '群管理'},
      component: groupManagePage
    },
    {
      path: '/groupAdmin',
      name: 'groupAdmin',
      meta: {requiresAuth: true, pageTitle: '群管理员'},
      component: groupAdminPage
    },
    {
      path: '/QRCodeGroup',
      name: 'QRCodeGroup',
      meta: {requiresAuth: true, pageTitle: '二维码名片'},
      component: QRCodeGroupPage
    },
    {
      path: '/editGroupName',
      name: 'editGroupName',
      meta: {requiresAuth: true, pageTitle: '修改群聊名称'},
      component: editGroupNamePage
    },
    {
      path: '/editGroupPro',
      name: 'editGroupPro',
      meta: {requiresAuth: true, pageTitle: '群聊公告'},
      component: editGroupProPage
    },
    {
      path: '/membDetail',
      name: 'membDetail',
      meta: {requiresAuth: true, pageTitle: '详细资料'},
      component: membDetailPage
    },
    {
      path: '/chooseAtMemb',
      name: 'chooseAtMemb',
      meta: {requiresAuth: true, pageTitle: '选择提醒的人'},
      component: chooseAtMembPage
    },
    {
      path: '/enterprise',
      name: 'enterprise',
      meta: {requiresAuth: true, pageTitle: '企业通讯录'},
      component: enterpriseListPage
    },
    {
      path: '/enpDepartment',
      name: 'enpDepartment',
      meta: {requiresAuth: true, pageTitle: '部门'},
      component: departmentListPage
    },
    {
      path: '/enpAllMember',
      name: 'enpAllMember',
      meta: {requiresAuth: true, pageTitle: '部门人员'},
      component: enpAllMemberPage
    },
    {
      path: '/enpDetailed',
      name: 'enpDetailed',
      meta: {requiresAuth: true, pageTitle: '详细资料'},
      component: enpDetailedPage
    },
    {
      path: '/enpInformation',
      name: 'enpInformation',
      meta: {requiresAuth: true, pageTitle: '企业信息'},
      component: enpInformationPage
    },
    {
      path: '/enpSearch',
      name: 'enpSearch',
      meta: {requiresAuth: true, pageTitle: '搜索企业联系人'},
      component: enpSearchPage
    }
  ]
})
