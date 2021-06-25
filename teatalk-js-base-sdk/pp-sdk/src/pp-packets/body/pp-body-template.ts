export let templates = {
    
    // 文件消息体
    "PPFileMessage": {
        "Method": ["PPMessage"],
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
    "PPCardMessage": {
        "Method": ["PPMessage"],
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
            }
        }
    },
    // 公众号图文消息体
    "PPGraphicTextMessage": {
        "Method": ["PPMessage"],
        "Headers": {
            "0x01": {
                "Type": 0,
                "isList": false,
                "Alias": "title"
            },
            "0x02": {
                "Type": 0,
                "isList": false,
                "Alias": "coverId"
            },
            "0x03": {
                "Type": 1,
                "isList": false,
                "Alias": "imgSize"
            },
            "0x04": {
                "Type": 1,
                "isList": false,
                "Alias": "dateTime"
            },
            "0x06": {
                "Type": 1,
                "isList": false,
                "Alias": "showOrder"
            },
            "0x07": {
                "Type": 1,
                "isList": false,
                "Alias": "template"
            },
            "0x08": {
                "Type": 1,
                "isList": false,
                "Alias": "materialType"
            },
            "0x10": {
                "Type": 0,
                "isList": false,
                "Alias": "messageId"
            }
        }
    }
}