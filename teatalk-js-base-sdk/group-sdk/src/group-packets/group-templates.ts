// Type 0: string, 1:number, 2: body, 3: byte, 4: bytes, 5: buffer

export let templates = {
    // 创建群请求
    "OrganizeSendRequest": {
        "Method": ["Organize"],
        "Event": [0],
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            },
            "Index": {
                "Type": 1,
                "isList": true,
                "Alias": "index"
            },
            "Type": {
                "Type": 0,
                "isList": false,
                "Alias": "createName"
            },
            "Body": {
                "Content": {
                    "_id_": "Content",
                    "Type": 2,
                    "isList": false,
                    "Alias": "info"
                }
            }
        }
    },

    "Content": {
        "Method": "Organize",
        "Headers":{
            "0x01": {
                "Type": 0,
                "isList": false,
                "Alias": "groupName"
            },
            "0x02": {
                "Type": 0,
                "isList": false,
                "Alias": "groupPortraitid"
            },
            "0x03": {
                "Type": 0,
                "isList": false,
                "Alias": "groupProclamation"
            },
            "0x04": {
                "Type": 0,
                "isList": false,
                "Alias": "groupIntroduction"
            }
        }
    },
    // 创建群响应
    "OrganizeSendResponse": {
        "Method": ["Organize"],
        "Event": [0],
        "Headers": {
            // "CallId": {
            //     "Type": 0,
            //     "isList": false,
            //     "index": "callbackRequest.Request.MessageID" // 解决wcmp返回群消息id乱码问题
            // },
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            },
            "Key": {
                "Type": 1,
                "isList": false,
                "Alias": "groupId"
            },
            "Status": {
                "Type": 1,
                "isList": false,
                "Alias": "status"
            },
            "Version": {
                "Type": 1,
                "isList": false,
                "Alias": "version"
            },
        }
    },
    // 变更管理员权限请求
    "ChangeManagerReq": {
        "Method": "Organize",
        "Event": 0x00,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            },
            "Key": {
                "Type": 1,
                "isList": false,
                "Alias": "userId"   // 要变更的人员的userId
            },
            "Status": {
                "Type": 1,
                "isList": false,
                "Alias": "status"
            }
        }
    },
    // 变更管理员权限响应
    "ChangeManagerRes": {
        "Method": "Organize",
        "Event": 0x00,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            }
        }
    },
    // 退出群或是踢人请求
    "QuitOrgReq": {
        "Method": "Organize",
        "Event": 0x03,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            },
            "Name": {
                "Type": 0,
                "isList": false,
                "Alias": "quitedName"   // 退群者或者踢人者的名字
            },
            "Body": {
                "OrgUserInfo": {
                    "_id_": "OrgUserInfo",
                    "Type": 2,
                    "isList": true,
                    "isChange": false,
                    "Alias": "orgUserInfo"
                }
            }
        }
    },
    // 用户信息
    "OrgUserInfo": {
        "Method": "Organize",
        "Headers":{
            "0x01": {
                "Type": 1,
                "isList": false,
                "Alias": "userId"   // 用户userId
            },
            "0x02": {
                "Type": 0,
                "isList": false,
                "Alias": "name"     // 用户的名字
            },
            "0x03": {
                "Type": 0,
                "isList": false,
                "Alias": "portraitId"   // 头像Id
            },
            "0x04": {
                "Type": 0,
                "isList": false,
                "Alias": "portraitUrl"     // 头像URL
            }
        }
    },
    // 退出群或是踢人响应
    "QuitOrgRes": {
        "Method": "Organize",
        "Event": 0x03,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            },
            "Version": {
                "Type": 1,
                "isList": false,
                "Alias": "orgVersion"   // 群版本号
            }
        }
    },
    // 获取群列表请求
    "ListOrgReq": {
        "Method": "Organize",
        "Event": 0x05,
        "Headers": {
            "From" : {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To" : {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            }
        }
    },
    // 获取群列表响应
    "ListOrgRes": {
        "Method": "Organize",
        "Event": 0x05,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            },
            "Index": {
                "Type": 1,
                "isList": true,
                "Alias": "groupList"    // 群列表信息
            }
        }
    },
    // 更改群信息请求
    "UpdateOrgInfReq": {
        "Method": "Organize",
        "Event": 1,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            },
            "Index": {
                "Type": 0,
                "isList": false,
                "Alias": "name"     // 修改人姓名
            },
            "Type": {
                "Type": 1,
                "isList": false,
                "Alias": "type"     // 修改属性   名称 1，公告 2，简介 3，tag 5
            },
            "Body": {
                "OrgInfo": {
                    "_id_": "OrgInfo",
                    "Type": 2,
                    "isList": false,
                    "isChange":false,
                    "Alias": "orgInfo"
                }
            }
        }
    },
    "OrgInfo" : {
        "Method": "Organize",
        "Headers":{
            "0x01": {
                "Type": 0,
                "isList": false,
                "Alias": "groupName"
            },
            "0x02": {
                "Type": 0,
                "isList": false,
                "Alias": "groupPortraitId"  // 群头像ID
            },
            "0x03": {
                "Type": 0,
                "isList": false,
                "Alias": "groupProclamation"    // 群公告
            },
            "0x04": {
                "Type": 0,
                "isList": false,
                "Alias": "groupIntroduction"    // 群简介
            }
        }
    },
    // 更改群信息响应
    "UpdateOrgInfRes": {
        "Method": "Organize",
        "Event": 1,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            },
            "Version": {
                "Type": 1,
                "isList": false,
                "Alias": "orgVersion"   // 群版本号
            }
        }
    },
    // 修改群公告请求
    "ModifyOrgProclaReq": {
        "Method": "Organize",
        "Event": 0x49,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            },
            "Key": {
                "Type": 1,
                "isList": false,
                "Alias": "type" 
            },
            "Body": {
                "Proclamation": {
                    "Type": 0,
                    "isList": false,
                    "Alias": "proclamation"
                }
            }
        }
    },
    // 修改群公告响应
    "ModifyOrgProclaRes": {
        "Method": "Organize",
        "Event": 0x49,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            },
            "Version": {
                "Type": 1,
                "isList": false,
                "Alias": "orgVersion"   // 群版本号
            }
        }
    },
    // 被邀请加入群通知
    "OrgInviteBuddyNotifyRequest": {
        "Method": "Organize",
        "Event": 0x10,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            },
            "Key": {
                "Type": 1,
                "isList": false,
                "Alias": "inviteUserId"
            },
            "Index": {
                "Type": 0,
                "isList": false,
                "Alias": "inviteName"
            },
            "Name": {
                "Type": 0,
                "isList": false,
                "Alias": "orgName"
            },
            "Status": {
                "Type": 1,
                "isList": false,
                "Alias": "maxNum"
            }
        }
    },
    // 被邀请加入群通知响应
    "OrgInviteBuddyNotifyResponse": {
        "Method": "Organize",
        "Event": 0x10,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            },
        }
    },
    // 新增群组成员通知
    "OrgBuddyComeInNotifyRequest": {
        "Method": "Organize",
        "Event": 0x12,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            },
            "Key": {
                "Type": 1,
                "isList": false,
                "Alias": "inviteUserId"
            },
            "Version": {
                "Type": 1,
                "isList": false,
                "Alias": "version"
            },
            "Name": {
                "Type": 0,
                "isList": false,
                "Alias": "inviteName"
            },
            "Type": {
                "Type": 1,
                "isList": false,
                "Alias": "type"     // 加群方式：1为邀请加入群 2 通过搜索加入
            },
            "Index": {
                "Type": 1,
                "isList": true,
                "Alias": "addedUserIds" // 新增的userid
            },
        }
    },
    // 被邀请加入群通知响应
    "OrgBuddyComeInNotifyResponse": {
        "Method": "Organize",
        "Event": 0x12,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            },
        }
    },
    // 初始化群请求
    "InitialzeGroupReq": {
        "Method": "Organize",
        "Event": [0x04],
        "Headers": {
            "CallId": {
                "Type": 1,
                "isList": false,
                "index": "To"
            },
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            },
            // "WcmpInfo": {
            //     "Type": 0,
            //     "isList": false,
            //     "Alias": "to"
            // },
            "Version": {
                "Type": 1,
                "isList": false,
                "Alias": "version"
            }
        }
    },
    // 初始化群响应
    "InitialzeGroupRes": {
        "Method": "Organize",
        "Event": [0x04],
        "Headers": {
            "CallId": {
                "Type": 1,
                "isList": false,
                "index": "callbackRequest.Request.To"
            },
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            },
            "Index": {
                "Type": 1,
                "isList": false,
                "Alias": "index"
            },
            "Version": {
                "Type": 1,
                "isList": false,
                "Alias": "version"
            },
            "Type": {
                "Type": 1,
                "isList": false,
                "Alias": "type"
            },
            "Body": {
                "OrgUserInitInfo": {
                    "_id_": "OrgUserInitInfo",
                    "Type": 2,
                    "isList": false,
                    "isChange": false,
                    "Alias": "orgUserInitInfo"
                }
            }
        }
    },
    // 初始化用户信息
    "OrgUserInitInfo": {
        "Method": "Organize",
        "Headers":{
            "0x01": {
                "Type": 0,
                "isList": false,
                "Alias": "groupName"    // 群名称
            },
            "0x02": {
                "Type": 0,
                "isList": false,
                "Alias": "portraitId"    // 群头像ID
            },
            "0x03": {
                "Type": 0,
                "isList": false,
                "Alias": "groupProclamation"    // 群公告
            },
            "0x04": {
                "Type": 0,
                "isList": false,
                "Alias": "groupIntroduction"    // 群简介
            },
            "0x05": {
                "Type": 1,
                "isList": false,
                "Alias": "groupManager"    // 群管理员
            },
            "0x06": {
                "Type": 1,
                "isList": false,
                "Alias": "createuserId"    // 群主ID
            },
            "0x07": {
                "Type": 1,
                "isList": false,
                "Alias": "groupSize"    // 群上限
            },
            "0x08": {
                "Type": 1,
                "isList": false,
                "Alias": "groupAddSetting"    // 仅管理员添加成员开关
            }
        }
    },
    // 初始化群请求
    "InitialzeGroupNewReq": {
        "Method": "Organize",
        "Event": [0x33],
        "Headers": {
            "CallId": {
                "Type": 1,
                "isList": false,
                "index": "To"
            },
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            },
            // "WcmpInfo": {
            //     "Type": 0,
            //     "isList": false,
            //     "Alias": "to"
            // },
            "Version": {
                "Type": 1,
                "isList": false,
                "Alias": "version"
            }
        }
    },
    // 初始化群响应
    "InitialzeGroupNewRes": {
        "Method": "Organize",
        "Event": [0x33],
        "Headers": {
            "CallId": {
                "Type": 1,
                "isList": false,
                "index": "callbackRequest.Request.To"
            },
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from" // 用户id
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to" // 群id
            },
            "Index": {
                "Type": 1,
                "isList": true,
                "Alias": "groupPortraitId" // 群头像id
            },
            "Name" : {
                "Type": 0,
                "isList": true,
                "Alias": "groupName" // 群名称
            },
            "Key" : {
                "Type": 0,
                "isList": true,
                "Alias": "groupProclamation" // 群公告
            },
            "Token" : {
                "Type": 0,
                "isList": true,
                "Alias": "groupIntroduction" // 群简介
            },
            "ServerData" : {
                "Type": 1,
                "isList": true,
                "Alias": "administratorsId" // 群管理员Id  是个数组
            },
             "ServerKey" : {
                "Type": 1,
                "isList": true,
                "Alias": "mainGroupId" // 群主ID
            },
            "Status" : {
                "Type": 1,
                "isList": true,
                "Alias": "groupSize" // 群上限
            },
            "Version": {
                "Type": 1,
                "isList": false,
                "Alias": "version"
            },
            "Type": {
                "Type": 1,
                "isList": false,
                "Alias": "receiveType" // 消息接收类型 1：接受并提醒，2：接受不提醒，3：不接受消息
            },
            "Body": {
                "OrgUserInfo": {
                    "_id_": "OrgUserInfo",
                    "Type": 2,
                    "isList": true,
                    "isChange": false,
                    "Alias": "orgUserInfo"
                }
            }
        }
    },
    // 变更管理员通知请求
    "ChangeManagerNotifyReq": {
        "Method": "Organize",
        "Event": 0x2a,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            },
            "Key": {
                "Type": 1,
                "isList": false,
                "Alias": "modifiedUserId"
            },
            "Status": {
                "Type": 1,
                "isList": false,
                "Alias": "type"
            }
        }
    },
    // 变更管理员通知响应
    "ChangeManagerNotifyRes": {
        "Method": "Organize",
        "Event": 0x2a,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            },
        }
    },
    // 群信息更新通知请求
    "UpdateOrgInfNotifyReq": {
        "Method": "Organize",
        "Event": 0x11,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            },
            "Key": {
                "Type": 1,
                "isList": false,
                "Alias": "sourceUserId"
            },
            "Index": {
                "Type": 0,
                "isList": false,
                "Alias": "modifierName"
            },
            "Name": {
                "Type": 0,
                "isList": false,
                "Alias": "orgName"
            },
            "Version": {
                "Type": 1,
                "isList": false,
                "Alias": "version"
            },
            "Type": {
                "Type": 1,
                "isList": false,
                "Alias": "type"
            },
            "Status": {
                "Type": 1,
                "isList": false,
                "Alias": "orgMaxMembers"
            }
        }
    },
    // 群信息更新通知响应
    "UpdateOrgInfNotifyRes": {
        "Method": "Organize",
        "Event": 0x11,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            },
        }
    },
    // 邀请好友加入群请求
    "OrgInviteBuddyRequest": {
        "Method": ["Organize"],
        "Event": 0x02,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "orgId"
            },
            "Name": {
                "Type": 0,
                "isList": false,
                "Alias": "inviteName"
            },
            "Index": {
                "Type": 0,
                "isList": false,
                "Alias": "orgName"
            },
            "Body": {
                "FriList": {
                    "_id_": "FriList",
                    "Type": 2,
                    "isList": true,
                    "Alias": "info"
                }
            }
        }
    },

    "FriList": {
        "Method": "Organize",
        "Headers":{
            "0x01": {
                "Type": 1,
                "isList": false,
                "Alias": "friUserId"
            },
            "0x02": {
                "Type": 0,
                "isList": false,
                "Alias": "friUserName"
            }
        }
    },
    // 邀请好友加入群响应
    "OrgInviteBuddyResponse": {
        "Method": ["Organize"],
        "Event": 0x02,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "orgId"
            },
            "Version": {
                "Type": 1,
                "isList": false,
                "Alias": "version"
            },
        }
    },
    // 成员退出群通知请求
    "OrgBuddyLeaveNotifyReq": {
        "Method": "Organize",
        "Event": 0x13,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "groupid"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            },
            "Key": {
                "Type": 1,
                "isList": false,
                "Alias": "sourceUserId"
            },
            "Name": {
                "Type": 0,
                "isList": false,
                "Alias": "quitedName"  // 退群者或者踢人者的名字
            },
            "Version": {
                "Type": 1,
                "isList": false,
                "Alias": "version"
            },
            "Body": {
                "OrgUserInfo": {
                    "_id_": "OrgUserInfo",
                    "Type": 2,
                    "isList": true,
                    "isChange": false,
                    "Alias": "orgUserInfo"
                }
            }
        }
    },
    // 成员退出群通知响应
    "OrgBuddyLeaveNotifyRes": {
        "Method": "Organize",
        "Event": 0x13,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            }
        }
    },
    // 是否同意加入群请求
    "IsAgreeJoinOrgRequest": {
        "Method": "Organize",
        "Event": 0x20,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "groupId"
            },
            "Index": {
                "Type": 0,
                "isList": false,
                "Alias": "myName"
            },
            "Key": {
                "Type": 1,
                "isList": false,
                "Alias": "inviteUserId"
            },
            "Name": {
                "Type": 0,
                "isList": false,
                "Alias": "inviteName"
            },
            "Status": {
                "Type": 1,
                "isList": false,
                "Alias": "isAgree"
            },
        }
    },
    // 是否同意加入群响应
    "IsAgreeJoinOrgRespone": {
        "Method": "Organize",
        "Event": 0x20,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            },
            "Key": {
                "Type": 1,
                "isList": false,
                "Alias": "key"
            },
        }
    },
    // 解散群组（通知）请求
    "UnorgReq": {
        "Method": "Organize",
        "Event": [0x26, 0x27],
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            }
        }
    },
    // 解散群组（通知）响应
    "UnorgRes": {
        "Method": "Organize",
        "Event": [0x26, 0x27],
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            }
        }
    },
    // 转移群主请求
    "OrgChangeCreaterRequest": {
        "Method": ["Organize"],
        "Event": 67,
        "Headers": {
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "orgId"
            },
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "originCreater"
            },
            "Key": {
                "Type": 1,
                "isList": false,
                "Alias": "curCreater"
            }
        }
    },
    // 转移群主响应
    "OrgChangeCreaterResponse": {
        "Method": ["Organize"],
        "Event": 67,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "Version": {
                "Type": 1,
                "isList": false,
                "Alias": "version"
            },
        }
    },
    // 转移群主请求通知
    "OrgChangeCreaterNotifyReq":{
        "Method": ["Organize"],
        "Event": 22,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            },
            "Key": {
                "Type": 1,
                "isList": false,
                "Alias": "key"
            },
            "Status": {
                "Type": 1,
                "isList": false,
                "Alias": "status"
            }
        }
    },
    // 转移群主响应通知
    "OrgChangeCreaterNotifyResp":{
        "Method": ["Organize"],
        "Event": 22,
        "Headers": {
            "From": {   // 发起者id
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            }
        }
    },
    // 获取离线群通知请求
    "OrgOfflineRequest": {
        "Method": ["Message"],
        "Event": 109,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            }
        }
    },
    // 获取离线群通知响应
    "OrgOfflineResponse": {
        "Method": ["Message"],
        "Event": 109,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to"
            }
        }
    },
    // 拒绝邀请加入群通知
    "RefuseJoinOrgNotifyRequest": {
        "Method": "Organize",
        "Event": 0x21,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "groupId"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "userId"
            },
            "Key": {
                "Type": 1,
                "isList": false,
                "Alias": "refuseUserId"
            },
            "Index": {
                "Type": 0,
                "isList": false,
                "Alias": "inviteName"
            }
        }
    },
    // 拒绝邀请加入群通知响应
    // "RefuseJoinOrgNotifyResponse": {
    //     "Method": "Organize",
    //     "Event": 0x21,
    //     "Headers": {
    //         "From": {
    //             "Type": 1,
    //             "isList": false,
    //             "Alias": "from"
    //         },
    //         "To": {
    //             "Type": 1,
    //             "isList": false,
    //             "Alias": "groupid"
    //         },
    //     }
    // },
};
