class App {
    static loginUserId: number = 0;
    static binary: boolean = false;
    static transferToken: string = "";
    static dtcurl: string = "";
    static eutinterfaceurl: string = ""; // 登录后返回的企业通讯录地址
    static needDecodeBase64: boolean = true; // wcmp拉历史消息竟然又是明文了
}

export {
    App
};
