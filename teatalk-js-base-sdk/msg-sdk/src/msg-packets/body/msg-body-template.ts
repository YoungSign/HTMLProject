export let templates = {
    // 文本消息体（at）
    "TextAtMessage": { // 目前的wcmp不支持同时带两个不一样的body，需要后端改造
        "Method": "Message",
        "Headers": {
            "Body": {
                "Text": {
                    "Type": 0,
                    "isList": false,
                    "Alias": "text"
                }
            }
        }
    },
    // 文件消息体
    "FileMessage": {
        "Method": "Message",
        "Headers": {
            "0x01": {
                "Type": 0,
                "isList": false,
                "Alias": "fileId"
            },
            "0x02": {
                "Type": 1,
                "isList": false,
                "Alias": "fileSize"
            },
            "0x03": {
                "Type": 0,
                "isList": false,
                "Alias": "fileName"
            },
            "0x04": {
                "Type": 0,
                "isList": false,
                "Alias": "thumbId"
            },
            "0x05": {
                "Type": 1,
                "isList": false,
                "Alias": "thumbSize"
            },
            "0x06": {
                "Type": 0,
                "isList": false,
                "Alias": "originImageId"
            },
            "0x07": {
                "Type": 1,
                "isList": false,
                "Alias": "originImageSize"
            }
        }
    },
    // 名片消息体
    "CardMessage": {
        "Method": "Message",
        "Headers": {
            "0x01": {
                "Type": 0,
                "isList": false,
                "Alias": "userId"
            },
            "0x02": {
                "Type": 0,
                "isList": false,
                "Alias": "mobileNo"
            },
            "0x03": {
                "Type": 0,
                "isList": false,
                "Alias": "name"
            },
            "0x04": {
                "Type": 0,
                "isList": false,
                "Alias": "department"
            },
            "0x07": {
                "Type": 0,
                "isList": false,
                "Alias": "groupType"
            }
        }
    },
    "LocationMessage": {
        "Method": ["Message", "GroupMessage"],
        "Headers": {
            "0x01": {
                "Type": 1,
                "isList": false,
                "Alias": "latitude"
            },
            "0x02": {
                "Type": 1,
                "isList": false,
                "Alias": "longitude"
            },
            "0x03": {
                "Type": 0,
                "isList": false,
                "Alias": "thumbId"
            },
            "0x04": {
                "Type": 1,
                "isList": false,
                "Alias": "thumbSize"
            },
            "0x05": {
                "Type": 0,
                "isList": false,
                "Alias": "descFileId"
            }
        }
    },
    "AudioMessage": {
        "Method": ["Message", "GroupMessage"],
        "Headers": {
            "0x01": {
                "Type": 0,
                "isList": false,
                "Alias": "fileId"
            },
            "0x02": {
                "Type": 1,
                "isList": false,
                "Alias": "fileSize"
            },
            "0x03": {
                "Type": 1,
                "isList": false,
                "Alias": "type"
            },
            "0x04": {
                "Type": 1,
                "isList": false,
                "Alias": "bitrate"
            },
            "0x05": {
                "Type": 1,
                "isList": false,
                "Alias": "totalTime"
            }
        }
    }
}