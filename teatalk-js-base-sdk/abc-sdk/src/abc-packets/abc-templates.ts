// Type 0: string, 1:number, 2: body, 3: byte, 4: bytes, 5: buffer

export let templates = {
    // 根据userId获取token
    "GetTokenByUserIdReq": {
        "Method": "Take",
        "Event": [0x09],
        "Headers": {
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to" // 用户id
            },
        }
    },
    // 根据userId获取token
    "GetTokenByUserIdResp": {
        "Method": "Take",
        "Event": [0x09],
        "Headers": {
            "Token": {
                "Type": 0,
                "isList": false,
                "Alias": "token"
            }
        }
    },
    // 获取GW地址
    "GetGWAddressReq": {
        "Method": "Take",
        "Event": [0x78],
        "Headers": {
            "Channel_ID": {
                "Type": 1,
                "isList": false,
                "Alias": "channel" // 用户id
            },
            "To": {
                "Type": 1,
                "isList": false,
                "Alias": "to" // 用户id
            }
        }
    },
    // 获取GW地址
    "GetGWAddressResp": {
        "Method": "Take",
        "Event": [0x78],
        "Headers": {
            "Name": {
                "Type": 0,
                "isList": false,
                "Alias": "address"
            }
        }
    },
};