const app = getApp()
import isObjEqual from "../../utils/objEqual"
Page({
    data: {
        userInfo: {},
        username: '',
        password: ''
    },
    onload: function() {
        let localData = app.getLocalUserData();
        if (localData.userInfo) {
            this.getInfo("users", "search_user", { mobile: localData.userInfo.mobile }).then(r => {
                isObjEqual(this.data.userInfo, localData.userInfo) ? wx.switchTab({
                    url: '/pages/index/index',
                }) : ''
            });

        }
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        setTimeout(() => {
            wx.hideHomeButton()
        }, 500);
        let localData = app.getLocalUserData();
        if (localData.userInfo) {
            this.getInfo("users", "search_user", { mobile: localData.userInfo.mobile }).then(r => {
                isObjEqual(this.data.userInfo, localData.userInfo) ? wx.switchTab({
                    url: '/pages/index/index',
                }) : ''
            });

        }
    },
    getInfo: function(name, type, params) {
        let that = this
        wx.showLoading({
            title: '加载中',
        })
        return wx.cloud.callFunction({
            name: name,
            data: {
                type: type,
                params: {...params }
            }
        }).then((resp) => {
            let data = resp.result.data.data
            if (resp.result.success) {
                if (name == "users") {
                    that.setData({
                        userInfo: data[0]
                    })
                    wx.hideLoading()
                    return resp.result.data
                }
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
    },
    usernameInput: function(e) {
        this.setData({
            username: e.detail.value
        })
    },
    passwordInput: function(e) {
        this.setData({
            password: e.detail.value
        })
    },
    loginBtnClick: function(a) {
        var that = this
        if (that.data.username.length == 0 || that.data.password.length == 0) {
            wx.showModal({
                title: '温馨提示',
                content: '用户名或密码不能为空！',
                showCancel: false
            })
        } else {
            wx.showLoading({
                title: '',
            })
            wx.cloud.callFunction({
                name: 'users',
                data: {
                    type: 'login_register',
                    params: {
                        username: that.data.username,
                        password: that.data.password
                    }
                }
            }).then((resp) => {
                if (resp.result.success) {
                    try {
                        wx.setStorageSync('userInfo', resp.result.data);
                    } catch (error) { console.log(error) }
                    wx.switchTab({
                        url: '/pages/index/index',
                    })
                } else {
                    wx.showModal({
                        // title: '密码错误',
                        content: resp.result.message //session中用户名和密码不为空触发
                    });
                }
                wx.hideLoading()
            }).catch((e) => {
                console.log(e)
                wx.showModal({
                    title: '密码错误',
                    content: '密码错误' //session中用户名和密码不为空触发
                });
                wx.hideLoading()
            })
        }
    }
})