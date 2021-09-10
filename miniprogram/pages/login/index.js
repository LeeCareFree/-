Page({
    data: {
        username: '',
        password: ''
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        wx.hideHomeButton({
            success: function() {
                console.log(1);
            },
            fail: function() {
                console.log(2);
            },
            complete: function() {
                console.log(3);
            }
        });
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