// Type 0: string, 1:number, 2: body, 3: byte, 4: bytes, 5: buffer

export let templates = {
    // 登录连接请求
    "RtcRequest": {
        "Method": "Message",
        "Event": 0x10,
        "Headers": {
            "CallId": {
                "Type": 1,
                "isList": false
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
                "Alias": "receiver"
            },
            "Body": {
                "Info": {
                    "_id_": "RtcRequestContent",
                    "Type": 2,
                    "isList": false,
                    "Alias": "content"
                }
            }
        }
    },
    // 请求信息
    "RtcRequestContent": {
        "Method": "Service",
        "Headers": {
            "0x01": {
                "Type": 1,
                "isList": false,
                "Alias": "operateCode"
            },
            "0x02": {
                "Type": 1,
                "isList": false,
                "Alias": "mediaType"
            },
            "0x03": {
                "Type": 0,
                "isList": false,
                "Alias": "channelID"
            },
            "0x04": {
                "Type": 1,
                "isList": true,
                "Alias": "invitee"
            },
            "0x05": {
                "Type": 1,
                "isList": false,
                "Alias": "modifyMemberType"
            },
            "0x06": {
                "Type": 1,
                "isList": false,
                "Alias": "sessionType"
            },
            "0x07": {
                "Type": 1,
                "isList": false,
                "Alias": "sessionId"
            },
            "0x08": {
                "Type": 0,
                "isList": false,
                "Alias": "extension1"
            },
            "0x14": {
                "Type": 1,
                "isList": false,
                "Alias": "domain"
            },
            "0x15": {
                "Type": 1,
                "isList": false,
                "Alias": "createId"
            }
        }
    },
    // 登录连接响应
    "RtcResponse": {
        "Method": "Message",
        "Event": 0x10,
        "Headers": {
            "CallId": {
                "Type": 1,
                "isList": false
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
            }
        }
    }
}