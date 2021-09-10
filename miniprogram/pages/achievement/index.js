// pages/form.js
import getTodayTime from "../../utils/getTodayTime"
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
        showIcon: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
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
                this.showModal(resp.result.message)
            }
            wx.hideLoading()
        }).catch((e) => {
            this.showModal("获取数据出错！")
            wx.hideLoading()
        })
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