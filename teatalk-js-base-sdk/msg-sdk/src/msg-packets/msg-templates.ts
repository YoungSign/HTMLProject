// Type 0: string, 1:number, 2: body, 3: byte, 4: bytes, 5: buffer

export let templates = {
    // 消息上行请求
    "MessageSendRequest": {
        "Method": ["Message", "GroupMessage", "OrganizeMessage"],
        "Event": [0x10, 0, 0],
        "Headers": {
            "CallId": {
                "Type": 0,
                "isList": false,
                "index": "MessageID"
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
                "isList": true,
                "Alias": "mass"
            },
            "MessageID": {
                "Type": 0,
                "isList": false,
                "Alias": "messageId"
            },
            "Type": {
                "Type": 1,
                "isList": false,
                "Alias": "type"
            },
            "Status": {
                "Type": 1,
                "isList": false,
                "Alias": "status"
            },
            "MobileNo": {
                "Type": 0,
                "isList": false,
                "Alias": "mobileNo"
            },
            "Name": {
                "Type": 0,
                "isList": false,
                "Alias": "name"
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
    //
    "AtExtension": { // 目前的wcmp不支持同时带两个不一样的body，需要后端改造
        "Method": ["Message", "GroupMessage", "OrganizeMessage"],
        "Headers": {
            "Body": {
                "At": {
                    "Type": 0,
                    "isList": false,
                    "Alias": "atUserIds"
                }
            }
        }
    },
    // 消息上行响应
    "MessageSendResponse": {
        "Method": ["Message", "GroupMessage", "OrganizeMessage"],
        "Event": [0x10, 0, 0],
        "Headers": {
            "CallId": {
                "Type": 0,
                "isList": false,
                "index": "callbackRequest.Request.MessageID" // 解决wcmp返回群消息id乱码问题
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
                "isList": true,
                "Alias": "mass"
            },
            "MessageID": {
                "Type": 0,
                "isList": false,
                "Alias": "messageId"
            },
            "Status": {
                "Type": 1,
                "isList": false,
                "Alias": "status"
            },
            "Version": {
                "Type": 1,
                "isList": false,
                "Alias": "msgSequence"
            },
            "DateTime": {
                "Type": 1,
                "isList": false,
                "Alias": "serverTime"
            },
            "Capacity": {
                "Type": 0,
                "isList": false,
                "Alias": "capacity"
            },
            "Body": {
                "Tip": {
                    "Type": 0,
                    "isList": false,
                    "Alias": "tip"
                }
            }
        }
    },
    // 消息下行请求
    "MessageReceiveRequest": {
        "Method": ["Message", "GroupMessage", "OrganizeMessage"],
        "Event": [0x10, 0, 0],
        "Headers": {
            "CallId": {
                "Type": 0,
                "isList": false,
                "index": "MessageID"
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
            "MessageID": {
                "Type": 0,
                "isList": false,
                "Alias": "messageId"
            },
            "Type": {
                "Type": 1,
                "isList": false,
                "Alias": "type"
            },
            "Status": {
                "Type": 1,
                "isList": false,
                "Alias": "status"
            },
            "Version": {
                "Type": 1,
                "isList": false,
                "Alias": "msgSequence"
            },
            "DateTime": {
                "Type": 1,
                "isList": false,
                "Alias": "serverTime"
            },
            "Name": {
                "Type": 0,
                "isList": false,
                "Alias": "name"
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
    // // 消息下行响应 暂时不需要回应
    // "MessageReceiveResponse": {

    // }
    // 获取离线消息信息
    "MessageOffLineRequest": {
        "Method": "Message",
        "Event": 3,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "Key": {
                "Type": 1,
                "isList": false,
                "Alias": "msgListType"
            }
        }
    },
    // 获取离线消息信息返回数据
    "MessageOffLineResponse": {
        "Method": "Message",
        "Event": 3,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "Body": {
                "SessionInfo": {
                    "_id_": "SessionInfo",
                    "Type": 1,
                    "isList": false,
                    "Alias": "conversation"
                }
            }
        }
    },
    "SessionInfo": {
        "Method": "Message",
        "Headers":{
            "0x01": {
                "Type": 1,
                "isList": false,
                "Alias": "sessionId"
            },
            "0x02": {
                "Type": 1,
                "isList": false,
                "Alias": "messageCount"
            },
            "0x03": {
                "Type": 1,
                "isList": false,
                "Alias": "pageSize"
            }
        }
    },

    // 获取历史消息记录
    "MessageHistoryRequest": {
        "Method": "Message",
        "Event": 4,
        "Headers": {
            "CallId": {
                "Type": 1,
                "isList": false,
                "index": "Key"
            },
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "Key": {
                "Type": 1,
                "isList": false,
                "Alias": "msgListType"
            },
            "Index": {
                "Type": 0,
                "isList": false,
                "Alias": "msgType"
            },
            "Body": {
                "Session": {
                    "_id_": "Session",
                    "Type": 2,
                    "isList": false,
                    "Alias": "conversation"
                }
            }
        }
    },
    "Session": {
        "Method": "Message",
        "Headers":{
            "0x01": {
                "Type": 1,
                "isList": false,
                "Alias": "sessionId"
            },
            "0x02": {
                "Type": 1,
                "isList": false,
                "Alias": "index"
            },
            "0x03": {
                "Type": 1,
                "isList": false,
                "Alias": "pageSize"
            }
        }
    },
    "MessageHistoryResponse": {
        "Method": "Message",
        "Event": 4,
        "Headers": {
            "CallId": {
                "Type": 1,
                "isList": false,
                "index": "callbackRequest.Request.Key"
            },
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "Body": {
                "ContentBuffer": {
                    "Type": 5,
                    "isList": false,
                    "Alias": "content"
                }
            }
        }
    },

    // 消息撤回请求
    "MessageRevokeRequest": {
        "Method": "Message",
        "Event": 0x6A,
        "Headers": {
            // "CallId": {
            //     "Type": 0,
            //     "isList": false,
            //     "index": "From"
            // },
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "friUserId"
            },
            "Status": {
                "Type": 1,
                "isList": false,
                "Alias": "msgType"
            },
            "Key": {
                "Type": 1,
                "isList": false,
                "Alias": "version"
            },
            "Index": {
                "Type": 1,
                "isList": false,
                "Alias": "index"
            }
        }
    },

    //消息撤回响应
    "MessageRevokeResponse": {
        "Method": "Message",
        "Event": 0x6A,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "friUserId"
            },
        }
    },

    //消息撤回通知
    "MsgRevokeNotifyResponse": {
        "Method": "Notify",
        "Event": 0x6A,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "Key": {
                "Type": 1,
                "isList": false,
                "Alias": "version"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "friUserId"
            },
        }
    },
    //收藏消息
    "MessageCollectRequest": {
        "Method": "Service",
        "Event": 0x62,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "Index": {
                "Type": 1,
                "isList": false,
                "Alias": "byte"
            },
            "Body": {
                "Msgcollect": {
                    "Type": 0,
                    "isList": false,
                    "Alias": "message"
                }
            }
        }
    },
    "MessageCollectResponse": {
        "Method": "Service",
        "Event": 0x62,
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
            "Key": {
                "Type": 1,
                "isList": false,
                "Alias": "msgId"
            },
            "DateTime": {
                "Type": 1,
                "isList": false,
                "Alias": "dateTime"
            },
            "Index": {
                "Type": 1,
                "isList": false,
                "Alias": "msgnum"
            },
            "Status": {
                "Type": 1,
                "isList": false,
                "Alias": "status"
            }
        }
    },
    // 已读消息请求
    "MessageReadReplyRequest": {
        "Method": "ReadReply",
        "Event": 0,
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
            // "ServerData": {
            //     "Type": 1,
            //     "isList": false,
            //     "Alias": "serverData"
            // },
            "Index": {
                "Type": 1,
                "isList": false,
                "Alias": "friUserId"
            },
            // "Key": {
            //     "Type": 1,
            //     "isList": false,
            //     "Alias": "version"
            // },
            // "DateTime": {
            //     "Type": 1,
            //     "isList": false,
            //     "Alias": "dateTime"
            // }
        }
    },

    //已读消息响应
    "MessageReadReplyResponse": {
        "Method": "ReadReply",
        "Event": 0,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "friUserId"
            },
        }
    },

    // 已读消息通知
    "MessageReplyRequest": {
        "Method": "Reply",
        "Event": 0,
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
            "ServerData": {
                "Type": 1,
                "isList": false,
                "Alias": "serverData"
            },
            "Index": {
                "Type": 1,
                "isList": false,
                "Alias": "friUserId"
            },
            "Key": {
                "Type": 1,
                "isList": false,
                "Alias": "version"
            },
            "DateTime": {
                "Type": 1,
                "isList": false,
                "Alias": "dateTime"
            }
        }
    }, 
    //获取收藏消息的所有id请求
    "MessageCollectIdRequest": {
        "Method": "Service",
        "Event": 0x64,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            }
        }
    },
    //获取收藏消息的所有id请求响应
    "MessageCollectIdResponse": {
        "Method": "Service",
        "Event": 0x64,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "Body": {
                "BodyInfo": {
                    "Type": 1,
                    "isList": false,
                    "Alias": "bodyInfo"
                }
            }
        }
    },
    //获取收藏消息列表请求
    "MessageCollectListRequest": {
        "Method": "Service",
        "Event": 0x61,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "Body": {
                "ConversationInfo": {
                    "Type": 1,
                    "isList": false,
                    "Alias": "converInfo"
                }
            }
        }
    },
    //获取收藏消息列表请求响应
    "MessageCollectListResponse": {
        "Method": "Service",
        "Event": 0x61,
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
            "Body": {
                "BodyInfos": {
                    // "_id_": "BodyInfos",
                    "Type": 1,
                    "isList": false,
                    "Alias": "bodyInfoIds"
                }
            }
        }
    },
    "BodyInfos": {
        "Method": "Service",
        "Headers": {
            "0x01":{
                "Type": 1,
                "isList": false,
                "Alias": "msgcollectlistId"
            },
            "0x02":{
                "Type": 1,
                "isList": false,
                "Alias": "msgcollectTime"
            },
            "Body": {
                "BodyInfosd": {
                    "Type": 1,
                    "isList": false,
                    "Alias": "bodyInfoIdss"
                }
            }
        }
    },
    // 删除收藏消息请求
    "MessageCollectionDeleteRequest": {
        "Method": "Service",
        "Event": 0x63,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "Key": {
                "Type": 1,
                "isList": false,
                "Alias": "keyId"
            }
        }
    },

    //删除收藏消息响应
    "MessageCollectionDeleteResponse": {
        "Method": "Service",
        "Event": 0x63,
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
            }
        }
    },

    // 消息免打扰请求
    "MessageImmunityRequest": {
        "Method": "Service",
        "Event": 0x21,
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
            "DateTime": {
                "Type": 1,
                "isList": false,
                "Alias": "dateTime"
            },
            "Expire": {
                "Type": 1,
                "isList": false,
                "Alias": "expire"
            }
        }
    },
     // 消息免打扰响应
     "MessageImmunityResponse": {
        "Method": "Service",
        "Event": 0x21,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            }
        }
    },
    // 清除离线消息请求
    "MessageReadReplyClearRequest": {
        "Method": "ReadReply",
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
                "Alias": "friUserId"
            },
            "Index": {
                "Type": 1,
                "isList": false,
                "Alias": "userId"
            },
            "Key": {
                "Type": 1,
                "isList": false,
                "Alias": "key"
            },
            "Version": {
                "Type": 1,
                "isList": true,
                "Alias": "version"
            },
        }
    },

    // 清除离线消息响应
    "MessageReadReplyClearResponse": {
        "Method": "ReadReply",
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
                "Alias": "friUserId"
            },
        }
    },

    // 获取最近会话列表
    "sessionMessageRequest": {
        "Method": "Message",
        "Event": 0x15,
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
    // 获取最近会话列表响应
    "sessionMessageResponse": {
        "Method": "Message",
        "Event": 0x15,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "Body": {
                "BodyInfo": {
                    "Type": 5,
                    "isList": false,
                    "Alias": "sessMsgInfo"
                }
            }
        }
    },

    // 获取好友离线通知
    "MsgSocialOffLineNtfRequest": {
        "Method": "Message",
        "Event": 7,
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
    // 获取好友离线通知返回数据
    "MsgSocialOffLineNtfResponse": {
        "Method": "Message",
        "Event": 7,
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

    
};
