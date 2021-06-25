// Type 0: string, 1:number, 2: body, 3: byte, 4: bytes, 5: buffer

export let templates = {
    // 获取用户信息请求
    "TakeUserInfoReq": {
        "Method": "Take",
        "Event": [0x01],
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from" // 用户id
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to" // 用户id
            },
            "Version": {
                "Type": 1,
                "isList": false,
                "Alias": "version" // To头用户名片版本号
            },
            // "WcmpInfo": {
            //     "Type": 0,
            //     "isList": false,
            //     "Alias": "to"
            // },
        }
    },
    // 获取用户信息响应
    "TakeUserInfoRes": {
        "Method": "Take",
        "Event": [0x01],
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "MobileNo": {
                "Type": 0,
                "isList": false,
                "Alias": "mobileNo" // 手机号码
            },
            "Status": {
                "Type": 1,
                "isList": false,
                "Alias": "status" // 是否有客户端在线
            },
            "Version": {
                "Type": 1,
                "isList": false,
                "Alias": "version" // 名片版本号
            },
            "Body": {
                "VisitingCardInfo": {
                    "_id_": "VisitingCardInfo",
                    "Type": 2,
                    "isList": false,
                    "isChange": false,
                    "Alias": "visitingCardInfo"
                }
            }
        }
    },
    "VisitingCardInfo": {
        "Method": "Take",
        "Headers": {
            "0x41": {
                "Type": 0,
                "isList": false,
                "Alias": "mobileNo" // 手机号码
            },
            "0x42": {
                "Type": 0,
                "isList": false,
                "Alias": "name"
            },
            "0x43": {
                "Type": 0,
                "isList": false,
                "Alias": "mood"
            },
            "0x44": {
                "Type": 1,
                "isList": false,
                "Alias": "expression"
            },
            "0x45": {
                "Type": 1,
                "isList": false,
                "Alias": "gender"
            },
            "0x46": {
                "Type": 0,
                "isList": false,
                "Alias": "portraitId"
            },
            "0x78": {
                "Type": 0,
                "isList": false,
                "Alias": "portraitUrl"
            }
        }
    },
    // 通过手机号获取用户信息请求
    "TakeUserInfoByPhoneNumReq": {
        "Method": "Service",
        "Event": [0x97],
        "Headers": {
            "Key": {
                "Type": 0,
                "isList": false,
                "Alias": "key" // 手机号码
            },
            "Channel_ID": {
                "Type": 1,
                "isList": false,
                "Alias": "channel" // 渠道编号
            },
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from" // 占位
            }
        }
    },
    // 通过手机号获取用户信息响应
    "TakeUserInfoByPhoneNumRes": {
        "Method": "Service",
        "Event": [0x97],
        "Headers": {
            "Body": {
                "Froms": {
                    "_id_": "Froms",
                    "Type": 1,
                    "isList": false,
                    "Alias": "froms"
                }
            }
        }
    },
    "Froms": {
        "Method": "Service",
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "Key": {
                "Type": 0,
                "isList": false,
                "Alias": "key"
            }
        }
    },

    //用户状态查询请求
    "TakeCardBatchReq": {
        "Method": "Take",
        "Event": 0x05,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from" // 用户id
            },
            // "WcmpInfo": {
            //     "Type": 0,
            //     "isList": false,
            //     "Alias": "wcmpInfo"
            // },
            "To": {
                "Type": 0,
                "isList": false,
                "Alias": "to"
            },
            "Index": {
                "Type": 1,
                "isList": true,
                "Alias": "index" // index是userid
            },
        }
    },
    // 用户状态查询响应
    "TakeCardBatchRes": {
        "Method": "Take",
        "Event": 0x05,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "Body": {
                "CardInfo": {
                    "_id_": "CardInfo",
                    "Type": 1,
                    "isList": false,
                    "isChange": false,
                    "Alias": "cardInfo"
                },
            }
        }
    },
    "CardInfo": {
        "Method": "Take",
        "Headers":{
            "0x01": {
                "Type": 1,
                "isList": false,
                "Alias": "userId" // 返回是userid
            },
            "0x02": {
                "Type": 0,
                "isList": false,
                "Alias": "status" // 用户在线状态
            }
        }
    },

    // 设置用户状态请求
    "TakeStatusReq": {
        "Method": "Take",
        "Event": 0x04,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from" // 用户id
            },
            "To": {
                "Type": 0,
                "isList": false,
                "Alias": "to"
            },
            "Status": {
                "Type": 1,
                "isList": false,
                "Alias": "status" // 用户在线状态
            },
        }
    },
    // 设置用户状态响应
    "TakeStatusRes": {
        "Method": "Take",
        "Event": 0x04,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
        }
    },

    // 修改个人信息请求
    "changeCardReq": {
        "Method": "Service",
        "Event": 8,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from" // 用户id
            },
            "Body": {
                "ChangeCardInfo": {
                    "_id_": "ChangeCardInfo",
                    "Type": 2,
                    "isList": false,
                    "isChange": false,
                    "Alias": "changeCardInfo"
                }
            }
        }
    },


    "ChangeCardInfo": {
        "Method": "Service",
        "Headers":{
            "0x42": {
                "Type": 0,
                "isList": false,
                "Alias": "name"
            },
            "0x43": {
                "Type": 0,
                "isList": false,
                "Alias": "mood"
            },
            "0x44": {
                "Type": 1,
                "isList": false,
                "Alias": "expression"
            },
            "0x45": {
                "Type": 1,
                "isList": false,
                "Alias": "gender"
            },
            "0x46": {
                "Type": 1,
                "isList": false,
                "Alias": "portraitId"
            },
        }
    },

    // 获取用户信息响应
    "changeCardRes": {
        "Method": "Service",
        "Event": 8,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "Version": {
                "Type": 1,
                "isList": false,
                "Alias": "version" // 名片版本号
            },
        }
    },
};