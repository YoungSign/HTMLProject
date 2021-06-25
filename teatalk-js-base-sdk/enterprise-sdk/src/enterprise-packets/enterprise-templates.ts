// Type 0: string, 1:number, 2: body, 3: byte, 4: bytes, 5: buffer

export let templates = {
    // 获取eid请求
    "GetEidRequest": {
        "Method": "Take",
        "Event": 0x06,
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

    // 获取eid响应
    "GetEidResponse": {
        "Method": "Take",
        "Event": 0x06,
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
            "Body": {
                "eidInfo": {
                    "_id_": "EidInfo",
                    "Type": 1,
                    "isList": false,
                    "Alias": "eidInfo"
                }
            }
        },
        // eid信息
        "EidInfo": {
            "Method": "Take",
            "Headers": {
                "0x01": {
                    "Type": 1,
                    "isList": false,
                    "Alias": "eid"
                },
                "0x02": {
                    "Type": 1,
                    "isList": false,
                    "Alias": "userId"
                }
            }
        },
    },
};