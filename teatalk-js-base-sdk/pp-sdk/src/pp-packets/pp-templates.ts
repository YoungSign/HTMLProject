// Type 0: string, 1:number, 2: body, 3: byte, 4: bytes, 5: buffer

export let templates = {
    // 关注的公众账号请求
    "GetPPFocusListReq": {
        "Method": ["PPService"],
        "Event": [0x02],
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from" // 查询者id
            },
            "Type": {
                "Type": 1,
                "isList": false,
                "Alias": "accountType"  // 账号类别
            }
        }
    },
    // 关注的公众账号响应
    "GetPPFocusListResp": {
        "Method": ["PPService"],
        "Event": [0x02],
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from" // 查询者id
            },
            "Status": {
                "Type": 0,
                "isList": false,
                "Alias": "status" // 错误信息(依据请求头的Language来判断返回的错误内容语言)
            },
            "Key": {
                "Type": 1,
                "isList": false,
                "Alias": "focusNum" // 关注的公众账号总数量
            },
            "Body": {
                "FocusPPListInfo": {
                    "_id_": "FocusPPListInfo",
                    "Type": 1,
                    "isList": false,
                    "isChange": false,
                    "Alias": "focusPPListInfo"
                }
            }
        }
    },
    // 公众号信息
    "FocusPPListInfo": {
        "Method": "PPService",
        "Headers": {
            "0x01": {
                "Type": 1,
                "isList": false,
                "Alias": "PPAccountId"  // 公众账号ID
            },
            "0x02": {
                "Type": 0,
                "isList": false,
                "Alias": "PPAccountName"  // 公众账号名字
            },
            "0x03": {
                "Type": 0,
                "isList": false,
                "Alias": "PPAccountPortraitId"    // 公众账号头像ID
            },
            "0x04": {
                "Type": 0,
                "isList": false,
                "Alias": "PPAccountDescribeInfo"    // 公众账号描述信息
            },
            "0x05": {
                "Type": 1,
                "isList": false,
                "Alias": "isReceiveMsg"  // 接收消息开关 0 开 1 关
            },
            "0x06": {
                "Type": 1,
                "isList": false,
                "Alias": "isFoucs"    // 是否关注[0否 1是]
            },
            "0x07": {
                "Type": 1,
                "isList": false,
                "Alias": "isOfficial"    // 是否官方认证[0否 1是]
            }
        }
    },
    // 搜索公众账号请求
    "SearchPPAccountReq": {
        "Method": ["PPService"],
        "Event": [0x04],
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from" // 发起者id
            },
            "Key": {
                "Type": 1,
                "isList": false,
                "Alias": "reqNum" // 请求的数量
            },
            "Index": {
                "Type": 1,
                "isList": false,
                "Alias": "startPos" // 起始位置
            },
            "Type": {
                "Type": 1,
                "isList": false,
                "Alias": "type"  // 账号类别，不携带则默认是全部
            },
            "Status": {
                "Type": 0,
                "isList": false,
                "Alias": "searchKey"    // 不填写等同与获取推荐公众账号，按照公众账号，名字，描述进行模糊搜索
            },
            "Channel_ID": {
                "Type": 0,
                "isList": false,
                "Alias": "channelId"    // 渠道id
            }
        }
    },
    // 搜索公众账号响应
    "SearchPPAccountResp": {
        "Method": ["PPService"],
        "Event": [0x04],
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from" // 发起者id
            },
            "Email": {
                "Type": 0,
                "isList": false,
                "Alias": "email" // 邮件
            },
            "Status": {
                "Type": 0,
                "isList": false,
                "Alias": "status" // 错误信息(依据请求头的Language来判断返回的错误内容语言)
            },
            "Key": {
                "Type": 1,
                "isList": false,
                "Alias": "ppAccountNum" // 公众号数量
            },
            "Body": {
                "FocusPPListInfo": {
                    "_id_": "FocusPPListInfo",
                    "Type": 1,
                    "isList": false,
                    "isChange": false,
                    "Alias": "focusPPListInfo"
                }
            }
        }
    },
    // 取消/关注公众账号请求
    "SetPPFocusReq": {
        "Method": ["PPService"],
        "Event": [0x05],
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from" // 发起者id
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to" // 公众号id
            },
            "Type": {
                "Type": 1,
                "isList": false,
                "Alias": "eventType"  // 事件类型，0(取消订阅)、1(订阅)
            },
            "Channel_ID": {
                "Type": 0,
                "isList": false,
                "Alias": "channelId"    // 渠道Id 
            }
        }
    },
    // 取消/关注公众账号响应
    "SetPPFocusResp": {
        "Method": ["PPService"],
        "Event": [0x05],
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from" // 发起者id
            },
            "Status": {
                "Type": 0,
                "isList": false,
                "Alias": "status" // 错误信息(依据请求头的Language来判断返回的错误内容语言)
            }
        }
    },
    // 公众账号接收消息开关请求
    "SetPPReceiveReq": {
        "Method": ["PPService"],
        "Event": [0x06],
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from" // 发起者id
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to" // 公众号id
            },
            "Status": {
                "Type": 1,
                "isList": false,
                "Alias": "switcher"  // 开关类型 0：接收消息 1：不接收消息
            }
        }
    },
    // 公众账号接收消息开关响应
    "SetPPReceiveResp": {
        "Method": ["PPService"],
        "Event": [0x06],
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from" // 发起者id
            },
            "Status": {
                "Type": 0,
                "isList": false,
                "Alias": "status" // 错误信息(依据请求头的Language来判断返回的错误内容语言)
            }
        }
    },
    // 消息下行请求
    "PPMessageReceiveRequest": {
        "Method": ["PPMessage"],
        "Event": [0x01],
        "Headers": {
            "CallId": {
                "Type": 0,
                "isList": false,
                "index": "MessageID"
            },
            "From": {   // 开发者公众账号ID
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": { // 接收方userid
                "Type": 1,
                "isList": false,
                "Alias": "to"
            },
            "Index": {  // Index[图文消息，即Type头值为12时含此头], Byte 0：文本消息 1：富文本消息6：云盘
                "Type": 1,
                "isList": false,
                "Alias": "index"
            },
            "MessageID": {  // 消息ID
                "Type": 0,
                "isList": false,
                "Alias": "messageId"
            },
            "Type": {   // 如果没有就是普通文本消息, 0：图片, 1：语音, 2：文件, 3：视频, 4：动态表情, 5：涂鸦, 6：名片, 7：位置, 12：公众账号发的图文消息
                "Type": 1,
                "isList": false,
                "Alias": "type"
            },
            "Status": { // 此头为掩码作为消息各种开关的一个汇总
                "Type": 1,
                "isList": false,
                "Alias": "status"
            },
            "Version": {    // Int64消息在会话中的索引
                "Type": 1,
                "isList": false,
                "Alias": "msgSequence"
            },
            "DateTime": {   // Int64消息发送的时间
                "Type": 1,
                "isList": false,
                "Alias": "serverTime"
            },
            "Name": {
                "Type": 0,
                "isList": false,
                "Alias": "name"
            },
            "Channel_ID": {
                "Type": 1,
                "isList": false,
                "Alias": "channel"
            },
            "Body": {
                "ContentBuffer": {
                    "Type": 5,
                    "isList": false,
                    "Alias": "content"
                },
                "At": {
                    "_id_": "AtExtension",
                    "Type": 2,
                    "isList": false,
                    "Alias": "at"
                }
            }
        }
    },
    "PullOfflineMsgRequest": {
        "Method": ["PPMessage"],
        "Event": [0X02],
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "Body": {
                "offLineMsg": {
                    "_id_": "offLineMsg",
                    "Type": 2,
                    "isList": true,
                    "isChange": false,
                    "Alias": "offLineMsg"
                }
            }
        }
    },
    "offLineMsg": {
        "Method": ["PPMessage"],
        "Headers": {
            "0x01": {
                "Type": 1,
                "isList": false,
                "Alias": "accountId"
            },
            "0x02": {
                "Type": 1,
                "isList": false,
                "Alias": "versionId"
            }
        }
    },
    "PullOfflineMsgResponse": {
        "Method": ["PPMessage"],
        "Event": [0X02],
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "content"
            }
        }
    }
};
