//app.js
import config from './config';
import isObjEqual from "./utils/objEqual"
App({
    onLaunch: function() {
        this.globalData = {}
        this.userInfo = {}
        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力')
        } else {
            wx.cloud.init({
                // env 参数说明：
                //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
                //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
                //   如不填则使用默认环境（第一个创建的环境）
                // env: 'my-env-id',
                env: config.cloud_env,
                traceUser: true,
            })
        }
        let localData = this.getLocalUserData();
        if (localData.userInfo) {
            wx.showLoading({
                title: '加载中',
            })
            wx.cloud.callFunction({
                name: "users",
                data: {
                    type: "search_user",
                    params: { mobile: localData.userInfo.mobile }
                }
            }).then((resp) => {
                let data = resp.result.data.data
                if (resp.result.success) {
                    isObjEqual(data[0], localData.userInfo) ? wx.switchTab({
                        url: '/pages/index/index',
                    }) : wx.redirectTo({
                        url: '/pages/login/index'
                    })
                    wx.hideLoading()
                } else {
                    that.showModal(resp.result.message)
                }
                wx.hideLoading()
            }).catch((e) => {
                // wx.showToast({
                //     title: '"获取数据出错！"',
                //     icon: 'none',
                //     image: '',
                //     duration: 1500,
                //     mask: false,
                //     success: (result) => {

                //     },
                //     fail: () => {},
                //     complete: () => {}
                // });
                wx.hideLoading()
            })
        } else {
            wx.redirectTo({
                url: '/pages/login/index'
            })
        }
        // let localData = this.getLocalUserData();
        // if (localData.userInfo.mobile) {
        //     wx.cloud.callFunction({
        //         name: 'users',
        //         data: {
        //             type: 'search_user',
        //             params: { mobile: localData.userInfo.mobile }
        //         }
        //     }).then((resp) => {
        //         if (resp.result.success) {
        //             if(localData.userInfo.mobile != resp.result.data.data[0]){
        //                 wx.setStorageSync('userInfo', resp.result.data);
        //             }
        //          } else {
        //             wx.showModal({
        //                 title: '温馨提示',
        //                 content: '登录密码已更改，请重新登录！',
        //                 showCancel: false,
        //                 confirmText: '重新登录',
        //                 success: (result) => {
        //                     if (result.confirm) {
        //                         wx.redirectTo({
        //                             url: '/pages/login/index' //[登录页面]
        //                         })
        //                     }
        //                 },
        //                 fail: () => { },
        //                 complete: () => { }
        //             });
        //         }
        //         wx.hideLoading()
        //     }).catch((e) => {
        //         wx.showModal({
        //             title: '密码错误',
        //             content: '密码错误' //session中用户名和密码不为空触发
        //         });
        //     })
        // } else {
        //     wx.redirectTo({
        //         url: '/pages/login/index' //[登录页面]
        //     })
        // }
    },
    getLocalUserData: function() {
        let localData = {};
        try {
            localData.userInfo = wx.getStorageSync('userInfo');
            this.globalData = {...this.globalData, ...localData };
            return localData;
        } catch (e) {
            // Do something when catch error
        }
    },
})