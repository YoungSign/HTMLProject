import { applyProperties } from "../../base-sdk/src/util/utils";
import { templates as enperpriseTemplates } from "./enterprise-packets/enterprise-templates";
import { TemplateManager } from "../../base-sdk/src/TemplateManager";


import { CinGetEidPacket } from "./enterprise-packets/GetEidTransaction";

const MODULE_ID = "ENTERPRISE";
TemplateManager.loadTemplates(MODULE_ID, enperpriseTemplates);

let TeatalkEnterpriseSdk: any = {
    sdkParams: {
        baseURL: "", 
        timeout: 5000
    },
    baseSdk: null,
    currUserId: "",
    httpConnection: null,
    init: function (sdkParams: { baseSdk: any }) {
        let self = this;
        self.sdkParams = applyProperties(self.sdkParams, sdkParams || {});
        self.baseSdk = sdkParams.baseSdk;
        if (!self.baseSdk) {
            console.error("未找到基础sdk");
            return;
        }
        
        // 初始化配置http请求
        self.baseSdk.register("setEnpHttpConfig", function(params: {
            options: {
                userid: string
            },
            callback: any; }) {
            self.currUserId = params.options.userid;
            console.log("eutinterfaceurl ~~~~~~~~~", self.baseSdk.app.eutinterfaceurl);
            self.httpConnection = self.baseSdk.ses.getHttpConnection({
                baseURL: self.baseSdk.app.eutinterfaceurl || self.sdkParams.baseURL,
                timeout: self.sdkParams.timeout
            }).instance;
        });

        // 接口2--1.1.1	全量下载和增量更新组织架构 getDepartment
        self.baseSdk.register("getDepartment", function (params: {
            options: {
                userid: string,
                eid: string,
                deptid: string,
                version: string
                dorgversion: number,
                empvorsion: number,
                type: string,
                updateCorp: string,
                incremental_update: number,
                token: string,
                gzip: number,
                agent: string
            },
            callback: (success: boolean, result: any, reason?: string) => void
        }) {
            self.httpConnection({
                url: "/getDepartment",
                method: "get",
                params: params.options
            }).then((res) => {
                console.log(res);
                params.callback(res.status == 200 ? true : false, res.data.result, res.statusText)
            })
        });

        // 接口3--1.1.3	更新指定节点下通讯录数据 getEmployeeForOneDeptid
        self.baseSdk.register("getEmployeeForOneDeptid", function (params: {
            options: {
                userid: string,
                eid: string,
                deptid: string,
                token: string,
                agent: string
            },
            callback: (success: boolean, result: any, reason?: string) => void
        }) {
            self.httpConnection({
                url: "/getEmployeeForOneDeptid",
                method: "get",
                params: params.options
            }).then((res) => {
                console.log(res.data);
                params.callback(res.status == 200 ? true : false, res.data.result, res.statusText)
            })
        });

        // 接口4--根据pgmuserid获取该员工的详细信息
        self.baseSdk.register("queryEmployeesForPgmuserid", function (params: {
            options: {
                userid: string,
                eid: string,
                pgmuserids: string,
                gzip: string
                token: string,
                agent: string
            },
            callback: (success: boolean, result: any, reason?: string) => void
        }) {
            self.httpConnection({
                url: "/queryEmployeesForPgmuserids",
                method: "get",
                params: params.options
            }).then((res) => {
                console.log(res.data);
                params.callback(res.status == 200 ? true : false, res.data.result, res.statusText)
            })
        });

        // 接口5--1.1.2	全量下载登录用户所在分公司的所有员工信息 getAllEmployeesByDeptId
        self.baseSdk.register("getAllEmployeesByDeptId", function (params: {
            options: {
                userid: string,
                eid: string,
                deptid: string,
                token: string,
                agent: string
            },
            callback: (success: boolean, result: any, reason?: string) => void
        }) {
            self.httpConnection({
                url: "/getAllEmployeesByDeptId",
                method: "get",
                params: params.options
            }).then((res) => {
                console.log(res.data);
                params.callback(res.status == 200 ? true : false, res.data.result, res.statusText)
            })
        });

        // 接口6--1.1.11根据用户编号查询用户信息(支持批量查询) queryEmployeesForUserids
        self.baseSdk.register("queryEmployeesForUserids", function (params: {
            options: {
                userid: string,
                eid: string,
                userids: string,
                token: string,
                agent: string
            },
            callback: (success: boolean, result: any, reason?: string) => void
        }) {
            self.httpConnection({
                url: "/queryEmployeesForUserids",
                method: "get",
                params: params.options
            }).then((res) => {
                console.log(res.data);
                params.callback(res.status == 200 ? true : false, res.data.result, res.statusText)
            })
        });

        // 接口7--获取当前登录用户所在的企业、分公司、及所在部门信息
        self.baseSdk.register("queryLoginUserInfo", function (params: {
            options: {
                userid: string,
                eid: string,
                token: string,
                agent: string
            },
            callback: (success: boolean, result: any, reason?: string) => void
        }) {
            self.httpConnection({
                url: "/queryLoginUserInfo",
                method: "get",
                params: params.options
            }).then((res) => {
                params.callback(res.status == 200 ? true : false, res.data.result, res.statusText)
            })
        });

        // 接口8--搜索企业联系人
        self.baseSdk.register("queryEmployeeForSearch", function (params: {
            options: {
                userid: string,
                eid: string,
                searcheName: string,
                tyoe: string,
                updateCorp: string,
                incremental_update: string,
                token: string,
                agent: string
            },
            callback: (success: boolean, result: any, reason?: string) => void
        }) {
            self.httpConnection({
                url: "/queryEmployeeForSearch",
                method: "get",
                params: params.options
            }).then((res) => {
                console.log("queryEmployeeForSearch", res.data);
                params.callback(res.status == 200 ? true : false, res.data.result, res.statusText)
            })
        });

        // 接口9--取部门和人
        self.baseSdk.register("updateDeptAndEmployees", function (params: {
            options: {
                eid: string,
                deptid: string,
                dorgversion: string,
                empvorsion: string,
                userid: string,
                empsum: string,
                incremental_update: string,
                gzip: string,
                updateCorp: string,
                token: string,
                agent: string,
                // type: string
            },
            callback: (success: boolean, result: any, reason?: string) => void
        }) {
            self.httpConnection({
                url: "/updateDeptAndEmployees",
                method: "get",
                params: params.options
            }).then((res) => {
                console.log("updateDeptAndEmployees", res);
                params.callback(res.status == 200 ? true : false, res.data.result, res.statusText)
            })
        });

        // 接口10--获取eid
        self.baseSdk.register("getEid", function (params: {
            options: {
                from: number,
                to: number
            },
            callback: (success: boolean, result: {
                from: number;
                to: number;
                eidInfo: any;
            }, reason?: string) => void
        }) {
            let callback = params.callback;
            let options = params.options;
            let object: any = applyProperties(options, {});
            let packet = new CinGetEidPacket(object);
            self.baseSdk.ses.sendRequest(packet, callback);
        });
    }
};

export {
    TeatalkEnterpriseSdk
};