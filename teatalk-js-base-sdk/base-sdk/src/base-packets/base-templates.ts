// Type 0: string, 1:number, 2: body, 3: byte, 4: bytes, 5: buffer

export let templates = {
    // 登录连接请求
    "WEBIMLogonRequest": {
        "Method": "Logon",
        "Event": 0x10,
        "Headers": {
            "CallId": {
                "Type": 1,
                "isList": false
            },
            "Name": {
                "Type": 0,
                "isList": false,
                "Alias": "name"
            },
            "Password": {
                "Type": 0,
                "isList": false,
                "Alias": "password"
            },
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "Channel_ID": {
                "Type": 1,
                "isList": false,
                "Alias": "channel"
            },
            "Type": {
                "Type": 1,
                "isList": false,
                "Alias": "type"
            },
            // "Status": {
            //     "Type": 1,
            //     "isList": false,
            //     "Alias": "status"
            // },
            "Body": {
                "Info": {
                    "_id_": "WEBIMLogonRequestInfo",
                    "Type": 2,
                    "isList": false,
                    "Alias": "info"
                }
            }
        }
    },
    // 请求信息
    "WEBIMLogonRequestInfo": {
        "Method": "Service",
        "Headers": {
            "0x01": {
                "Type": 0,
                "isList": false,
                "Alias": "fpid"
            },
            "0x02": {
                "Type": 0,
                "isList": false,
                "Alias": "userAgent"
            },
            "0x03": {
                "Type": 0,
                "isList": false,
                "Alias": "clientIp"
            }
        }
    },
    // 登录连接响应
    "WEBIMLogonResponse": {
        "Method": "Logon",
        "Event": 0x10,
        "Headers": {
            "CallId": {
                "Type": 1,
                "isList": false
            },
            "Key": {
                "Type": 1,
                "isList": false,
                "Alias": "userId"
            },
            "Token": {
                "Type": 0,
                "isList": false,
                "Alias": "transferToken"
            },
            "dtcurl": {
                "Type": 0,
                "isList": false,
                "Alias": "dtcurl"
            },
            "eutinterfaceurl": {
                "Type": 0,
                "isList": false,
                "Alias": "eutinterfaceurl"
            },
            "videourl": {
                "Type": 0,
                "isList": false,
                "Alias": "videourl"
            },
        }
    },
    "KeepAliveRequest": {
        "Method": "Logon",
        "Event": 0x10,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "Status": {
                "Type": 1,
                "isList": false,
                "Alias": "status"
            }
        }
    },
    "KeepAliveResponse": {
        "Method": "Logon",
        "Event": 0x10,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "Expire": {
                "Type": 1,
                "isList": false,
                "Alias": "expire"
            },
            "Token": {
                "Type": 0,
                "isList": false,
                "Alias": "transferToken"
            }
        }
    },
    // token登录连接请求
    "WEBIMTokenLogonRequest": {
        "Method": "Service",
        "Event": 145,
        "Headers": {
            "WcmpInfo": {
                "Type": 1,
                "isList": false,
                "Alias": "wcmpInfo"
            },
            "Name": {
                "Type": 0,
                "isList": false,
                "Alias": "name"
            },
            "Password": {
                "Type": 0,
                "isList": false,
                "Alias": "password"
            },
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "Channel_ID": {
                "Type": 1,
                "isList": false,
                "Alias": "channel"
            },
            "Type": {
                "Type": 1,
                "isList": false,
                "Alias": "type"
            },
            // "Status": {
            //     "Type": 1,
            //     "isList": false,
            //     "Alias": "status"
            // },
            "Body": {
                "Info": {
                    "_id_": "WEBIMTokenLogonRequestInfo",
                    "Type": 2,
                    "isList": false,
                    "Alias": "info"
                }
            }
        }
    },
    // 请求信息
    "WEBIMTokenLogonRequestInfo": {
        "Method": "Service",
        "Headers": {
            "0x01": {
                "Type": 0,
                "isList": false,
                "Alias": "fpid"
            },
            "0x02": {
                "Type": 0,
                "isList": false,
                "Alias": "userAgent"
            },
            "0x03": {
                "Type": 0,
                "isList": false,
                "Alias": "clientIp"
            }
        }
    },
    // token登录连接响应
    "WEBIMTokenLogonResponse": {
        "Method": "Service",
        "Event": 145,
        "Headers": {
            "Key": {
                "Type": 1,
                "isList": false,
                "Alias": "userId"
            },
            "Token": {
                "Type": 0,
                "isList": false,
                "Alias": "transferToken"
            },
            "dtcurl": {
                "Type": 0,
                "isList": false,
                "Alias": "dtcurl"
            },
            "eutinterfaceurl": {
                "Type": 0,
                "isList": false,
                "Alias": "eutinterfaceurl"
            },
            "videourl": {
                "Type": 0,
                "isList": false,
                "Alias": "videourl"
            },
        }
    },

    // 退出登录请求
    "WEBIMTokenLogoutRequest": {
        "Method": "Logon",
        "Event": 5,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
        }
    },
    // 退出登录响应
    "WEBIMTokenLogoutResponse": {
        "Method": "Logon",
        "Event": 5,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
        }
    },

    // 被踢下线
    "WEBIMLogonOfflineRequest": {
        "Method": "Logon",
        "Event": 8,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
        }
    },
    // "WEBIMLogoutRequest": {
    //     "Method": "Logon",
    //     "Event": 5,
    //     "Headers": {
    //         "From": {
    //             "Type": 1,
    //             "isList": false,
    //             "Alias": "from"
    //         },
    //     }
    // },
    // "WEBIMLogoutResponse": {
    //     "Method": "Logon",
    //     "Event": 5,
    //     "Headers": {
    //         "From": {
    //             "Type": 1,
    //             "isList": false,
    //             "Alias": "from"
    //         },
    //     }
    // },

    // 获取服务端时间戳请求
    "SystemTimeRequest": {
        "Method": "Service",
        "Event": 0,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
        }
    },
    // 获取服务端时间戳响应
    "SystemTimeResponse": {
        "Method": "Service",
        "Event": 0,
        "Headers": {
            "SystemTime": {
                "Type": 1,
                "isList": false,
                "Alias": "systemTime"
            },
        }
    },

    // 获取二维码唯一识别码请求
    "WEBIMQrcodeRequest": {
        "Method": 'QRCODE',
        "Event": 0x01,
        "Headers": {
            "From": {
                "Type": 1,
                "isList": false,
                "Alias": "from"
            },
            "WcmpInfo": {
                "Type": 1,
                "isList": false,
                "Alias": "wcmpInfo"
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
            "Credential": {
                "Type": 0,
                "isList": false
            },
            "Body": {
                "Info": {
                    "_id_": "WEBIMQrcodeRequestInfo",
                    "Type": 2,
                    "isList": false,
                    "Alias": "info"
                }
            }
        }
    },

    "WEBIMQrcodeRequestInfo": {
        "Method": "QRCODE",
        "Headers": {
            "0x01": {
                "Type": 0,
                "isList": false,
                "Alias": "fpid"
            },
            "0x02": {
                "Type": 0,
                "isList": false,
                "Alias": "userAgent"
            },
            "0x03": {
                "Type": 0,
                "isList": false,
                "Alias": "clientIp"
            },
            "0x04": {
                "Type": 0,
                "isList": false,
            }
        }
    },

    // 获取二维码唯一识别码响应
    "WEBIMQrcodeResponse": {
        "Method": "QRCODE",
        "Event": 0x01,
        "Headers": {
            //QR_URL
            "Code": {
                "Type": 0,
                "isList": false,
                "Alias": "codeUrl"
            },
            "Status": {
                "Type": 0,
                "isList": false,
                "Alias": "status"
            },
            "Token": {
                "Type": 0,
                "isList": false,
                "Alias": "transferToken"
            },
            "ExceptionMessage": {
                "Type": 0,
                "isList": false,
                "Alias": "message"
            },
        }
    },

    // 二维码登录状态请求
    "WEBIMQrcodeLogonRequest": {
        "Method": "QRCODE",
        "Event": 0x04,
        "Headers": {
            "Code": {
                "Type": 0,
                "isList": false,
                "Alias": 'qrcode'
            }
        }
    },
    // 二维码登录状态响应
    "WEBIMQrcodeLogonResponse": {
        "Method": "QRCODE",
        "Event": 0x04,
        "Headers": {
            "Status": {
                "Type": 1,
                "isList": false,
                "Alias": "status"
            },
            "Channel_Id": {
                "Type": 1,
                "isList": false,
                "Alias": "channel_id"
            },
            "Key": {
                "Type": 1,
                "isList": false,
                "Alias": "userId"
            },
            "Token": {
                "Type": 0,
                "isList": false,
                "Alias": "transferToken"
            },
            "dtcurl": {
                "Type": 0,
                "isList": false,
                "Alias": "dtcurl"
            },
            "eutinterfaceurl": {
                "Type": 0,
                "isList": false,
                "Alias": "eutinterfaceurl"
            },
            "videourl": {
                "Type": 0,
                "isList": false,
                "Alias": "videourl"
            },
            "Fpid": {
                "Type": 0,
                "isList": false,
                "Alias": "videourl"
            }
        }
    },
};
