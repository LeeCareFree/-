// pages/form.js
import getTodayTime from "../../utils/getTodayTime"
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        date: getTodayTime(),
        achievements: [],
        pageNum: 1,
        showLoad: false,
        // 文字和图切换
        showIcon: false,
        userInfo: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let localData = app.getLocalUserData();
        this.setData({
            userInfo: localData.userInfo || {}
        })
        let tempDate = new Date(this.data.date)
        this.serviceHandle("achievements", "get_achievement", { date: tempDate.getTime(), pageNum: 1 })
    },
    bindDateChange: function(e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        let tempDate = new Date(e.detail.value)
        this.serviceHandle("achievements", "get_achievement", { date: tempDate.getTime(), pageNum: 1 }, true)
        this.setData({
            date: e.detail.value
        })
    },
    changeHandle: function(e) {
        let type = e.currentTarget.dataset.type
        let item = e.currentTarget.dataset.item
        switch (type) {
            case "fix":
                let parser = JSON.stringify(item);
                wx.reLaunch({
                    url: '/pages/index/index?data=' + parser,
                    success: (result) => {

                    },
                    fail: () => {},
                    complete: () => {}
                });
                break;
            case "remove":
                this.removerService("achievements", "remove_achievement", { _id: item._id }).then(r => {
                    this.setData({
                        achievements: this.data.achievements.filter(i => i._id !== item._id)
                    })
                })
                break;
            default:
                break;
        }
    },
    removerService: function(name, type, params) {
        wx.showLoading({
            title: '',
        })
        return wx.cloud.callFunction({
            name: name,
            data: {
                type: type,
                params: params || {}
            }
        }).then((resp) => {
            this.showToast(resp.result.message)
            wx.hideLoading()
        }).catch((e) => {
            this.showToast('数据出错！');
            wx.hideLoading()
        })
    },
    // 提示框函数
    showModal(msg) {
        wx.showModal({
            title: "温馨提示",
            content: msg,
            showCancel: false,
        })
    },
    serviceHandle: function(name, type, params, setEmpty) {
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
                if (params.pageNum != 1) {
                    let oldList = this.data.achievements
                    this.setData({
                        achievements: oldList.concat(data)
                    })
                } else {
                    this.setData({
                        [name]: data
                    })
                }
                wx.hideLoading()
                return data
            } else {
                setEmpty ? this.setData({ achievements: [] }) : ""
                this.showToast(resp.result.message || "")
            }
            wx.hideLoading()
        }).catch((e) => {
            this.showModal("获取数据出错！")
            wx.hideLoading()
        })
    },
    showToast(msg) {
        msg ?
            wx.showToast({
                title: msg || "",
                duration: 1000,
                icon: 'none',
                mask: true
            }) : ""
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        this.setData({
            pageNum: this.data.pageNum + 1
        })
        let tempDate = new Date(this.data.date)
        this.serviceHandle("achievements", "get_achievement", { date: tempDate.getTime(), pageNum: this.data.pageNum })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})