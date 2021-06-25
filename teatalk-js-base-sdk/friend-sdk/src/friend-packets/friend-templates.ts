// Type 0: string, 1:number, 2: body, 3: byte, 4: bytes, 5: buffer

export let templates = {
    // 添加好友请求
    "AddFriendRequest": {
        "Method": "Social",
        "Event": 0x22,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "Index": {
                "Type": 1,
                "isList": false,
                "Alias": "friendUserId"
            },
            "Key": {
                "Type": 0,
                "isList": false,
                "Alias": "nickname"
            },
            "MobileNo": {
                "Type": 0,
                "isList": false,
                "Alias": "mobileNo"
            }
        }
    },

    // 添加好友响应
    "AddFriendResponse": {
        "Method": "Social",
        "Event": 0x22,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "DateTime": {
                "Type": 1,
                "isList": false,
                "Alias": "dateTime"
            }
        }
    },

    // 被邀请添加好友通知
    "SocialNotifyResponse": {
        "Method": "socialNotify",
        "Event": 0x03,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "Index": {
                "Type": 0,
                "isList": false,
                "Alias": "nickname"
            },
            "Key": {
                "Type": 1,
                "isList": false,
                "Alias": "friendUserId"
            },
            "MobileNo": {
                "Type": 0,
                "isList": false,
                "Alias": "mobileNo"
            },
            "PortraitId": {
                "Type": 0,
                "isList": false,
                "Alias": "portraitId"
            },
            "DateTime": {
                "Type": 1,
                "isList": false,
                "Alias": "dateTime"
            }
        }
    },

    // 是否同意添加好友请求
    "IsAddFriendRequest": {
        "Method": "Social",
        "Event": 0x24,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "Type": {
                "Type": 1,
                "isList": false,
                "Alias": "type"
            },
            "Index": {
                "Type": 1,
                "isList": false,
                "Alias": "friendUserId"
            },
            "Key": {
                "Type": 0,
                "isList": false,
                "Alias": "nickname"
            },
        }
    },

    // 是否同意添加好友响应
    "IsAddFriendResponse": {
        "Method": "Social",
        "Event": 0x24,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            }
        }
    },

    // 删除好友请求
    "DeleteFriendRequest": {
        "Method": "Social",
        "Event": 0x26,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "Index": {
                "Type": 1,
                "isList": false,
                "Alias": "friendUserId"
            }
        }
    },
    // 删除好友响应
    "DeleteFriendResponse": {
        "Method": ["Social"],
        "Event": 0x26,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            }
        }
    },
    // 被删除好友通知
    "DeleteFriendNotifyRequest": {
        "Method": "SocialNotify",
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
                "isList": false,
                "Alias": "friendUserId"
            }
        }
    },

    // 获取朋友圈好友列表请求
    "GetSocialContactListReq": {
        "Method": "Social",
        "Event": [0x21],
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "userid"
            },
            "Version": {
                "Type": 1,
                "isList": false,
                "Alias": "version"
            }
        },
    },

    // 获取朋友圈好友列表响应
    "GetSocialContactListRes": {
        "Method": "Social",
        "Event": 33,
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
            "Index": {
                "Type": 1,
                "isList": true,
                "Alias": "contactUserid"
            },
            "Body": {
                "FriendInfo": {
                    "_id_": "FriendInfo",
                    "Type": 2,
                    "isList": true,
                    "isChange": false,
                    "Alias": "friendInfo"
                }
            }
        }
    },

    // 好友列表信息
    "FriendInfo": {
        "Method": "Social",
        "Headers": {
            "0x01":{
                "Type": 1,
                "isList": false,
                "Alias": "friendUserid"
            },
            "0x02":{
                "Type":0,
                "isList": false,
                "Alias": "remark"
            },
            "0x03":{
                "Type": 0,
                "isList": false,
                "Alias": "description"
            },
            "0x04":{
                "Type":0,
                "isList": false,
                "Alias": "sparefield1"
            },
            "0x05":{
                "Type": 0,
                "isList": false,
                "Alias": "sparefield2"
            },
            "0x06":{
                "Type": 0,
                "isList": false,
                "Alias": "sparefield3"
            },
            "0x07":{
                "Type": 0,
                "isList": false,
                "Alias": "sparefield4"
            },
            "0x08":{
                "Type": 0,
                "isList": false,
                "Alias": "sparefield5"
            },
            "0x09":{
                "Type": 1,
                "isList": false,
                "Alias": "settings"
            },
            "0x10":{
                "Type": 0,
                "isList": false,
                "Alias": "userName"
            },
            "0x11":{
                "Type": 0,
                "isList": false,
                "Alias": "phoneNum"
            },
            "0x12":{
                "Type": 1,
                "isList": false,
                "Alias": "userAvatar"
            }
        }
    },

    // 对方同意添加好友通知
    "ApproveAddFriNotifyRequest": {
        "Method": "SocialNotify",
        "Event": 0x04,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "userId"
            },
            "Key": {
                "Type": 1,
                "isList": false,
                "Alias": "friendUserId"
            },
            "Index": {
                "Type": 0,
                "isList": false,
                "Alias": "friendUserName"
            },
            "DateTime": {
                "Type": 1,
                "isList": false,
                "Alias": "DateTime"
            }
        }
    },
};