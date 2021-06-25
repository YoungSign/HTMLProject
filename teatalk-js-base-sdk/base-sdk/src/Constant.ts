/**
 * Created by H5 on 2020/3/3.
 */

/**
* 客户端状态枚举
*/
export enum CLIENT_STATE {
    /*新建*/
    NEW = 10,
    /*终端主动关闭*/
    CLOSED = 11,
    /*连接失败*/
    CONNECT_FAILED = 12,
    /*被动断开（断网、被踢）*/
    DISCONNECTED = 13,
    /*正在连接*/
    CONNECTING = 20,
    /*正在主动断开连接*/
    CLOSING = 21,
    /*已连接*/
    CONNECTED = 30,
}

export enum CONNACK_RETURN_CODE {
    CONNECTION_ACCEPTED = "OK",
    SERVER_UNAVAILABLE = "Error",
    BAD_USER_NAME_OR_PASSWORD = "NotAvailable"
}

export enum PACKET_TYPE {
    CONNECT = 0x01,
    CONNACK = 0x02,
    PUBLISH = 0x03,
    PUBACK = 0x04,
    PUBREC = 0x05,
    PUBREL = 0x06,
    PUBCOMP = 0x07,
    SUBSCRIBE = 0x08,
    SUBACK = 0x09,
    UNSUBSCRIBE = 0x0a,
    UNSUBACK = 0x0b,
    PINGREQ = 0x0c,
    PINGRESP = 0x0d,
    DISCONNECT = 0x0e
}

/**
 * 方法名称枚举
 */
export enum METHOD_NAME {
    service = "Service",
    message = "Message",
    groupMessage = "GroupMessage",
    reply = "Reply",
    readReply = "ReadReply",
    keepAlive = "KeepAlive",
    logon = "Logon",
    organize = "Organize",
    organizeMessage = 'OrganizeMessage',
    social = 'Social',
    socialNotify = 'SocialNotify',
    take = 'Take',
    msgNotify = 'Notify',
    ppmessage = 'PPMessage',
    ppService = "PPService",
    qrcode = "QRCODE"
}

/**
 * 方法名称枚举
 */
export enum RESPONSE_CODE {
    OK = 0x80,
    TokenNotAvailable = 0x81,
    TokenError = 0x82,
    TokenBusy = 0x83,
    TokenNotExist = 0x84,
    TokenNotSupport = 0x85,
}

/**
 * 方法字节值枚举
 */
export enum METHOD_BYTE {
    Service = 0x01,
    Message = 0x02,
    Reply = 0x03,
    ReadReply = 0x04,
    KeepAlive = 0x05,
    Logon = 0x07
}

/**
 * header枚举
 */
export enum HEADER__KEY_NAME {
    from = "From",
    to = "To",
    callId = "CallId",
    cseq = "Csequence",
    msdId = "MessagedId",
    dateTime = "DateTime",
    token = "Token",
    password = "Password",
    credential = "Credential",
    type = "Type",
    mobileNo = "MobileNo",
    expire = "Expire",
    event = "Event",
    route = "Route",
    recordRoute = "RecordRoute",
    pushToken = "PushToken",
    key = "Key",
    status = "Status",
    deviceToken = "DeviceToken",
    version = "Version",
    index = "Index",
    name = "Name",
    subVersion = "SubVersion",
    email = "Email",
    language = "Language",
    fpid = "Fpid",
    tpid = "Tpid",
    serverData = "ServerData",
    serverPid = "ServerPid",
    serverKey = "ServerKey",
    unknown = "Unknown",
    body = "Body",
    end = "End"
}

export enum HEADER__KEY_BYTE {
    from = 0x01,
    to = 0x02,
    callId = 0x03,
    cseq = 0x04,
    msdId = 0x05,
    dateTime = 0x06,
    token = 0x07,
    password = 0x08,
    credential = 0x09,
    type = 0x0A,
    mobileNo = 0x0B,
    expire = 0x0C,
    event = 0x0D,
    route = 0x0E,
    recordRoute = 0x0F,
    pushToken = 0x10,
    key = 0x12,
    status = 0x13,
    deviceToken = 0x14,
    version = 0x15,
    index = 0x16,
    name = 0x17,
    subVersion = 0x18,
    email = 0x19,
    language = 0x1A,
    fpid = 0xF9,
    tpid = 0xFA,
    serverData = 0xFB,
    serverPid = 0xFC,
    serverKey = 0xFD,
    unknown = 0xFE,
    body = 0xFF,
    end = 0x00
}

export enum FIELD_TYPE {
    string = 0,
    number = 1,
    body = 2,
    byte = 3,
    bytes = 4,
    buffer = 5
}
