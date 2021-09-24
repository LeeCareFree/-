var wxCharts = require('../../utils/wxcharts.js');
import exchangeTime from "../../utils/exchangeTime"
var app = getApp();
var keyFundChart = null;
var regularFund = null
Page({
    data: {
        cycleId: 'weeks',
        date: {
            curDate: "",
            startDate: "",
            endDate: ""
        },
        showTable: true,
        sorts: [],
        rankTypes: ["金额排行", "笔数排行"],
        rankTypeData: "金额排行",
        sortData: "重点基金",
        ranklist: [],
    },
    bindSortChange: function(e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            sortData: this.data.sorts[e.detail.value]
        })
        this.getDataboard("get_ranks", { sort: this.data.sortData, rankType: this.data.rankTypeData })
    },
    bindRankTypeChange: function(e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            rankTypeData: this.data.rankTypes[e.detail.value]
        })
        this.getDataboard("get_ranks", { sort: this.data.sortData, rankType: this.data.rankTypeData })
    },
    onCallbackDate: async function(e) {
        await this.serviceHandle("sorts", "get_sorts")
        this.setData({
            date: e.detail.date
        })
        this.getDataboard("get_ranks", { sort: this.data.sortData, rankType: this.data.rankTypeData })
    },
    // 获取图表数据
    getDataboard: function(type, params) {
        let date = this.data.date
        let exchangeStartDate = new Date(date.startDate)
        let exchangeEndDate = new Date(date.endDate)
        wx.showLoading({
            title: '',
        })
        return wx.cloud.callFunction({
            name: "achievements",
            data: {
                type: type,
                params: {
                    startDate: exchangeStartDate.getTime(),
                    finallDate: exchangeEndDate.getTime(),
                    ...params
                }
            }
        }).then((resp) => {
            console.log(resp)
            if (resp.result.success) {
                let resData = resp.result.data.data
                this.setData({
                    showTable: true,
                    ranklist: resData
                })
            } else {
                this.setData({
                    showTable: false
                })
                wx.showToast({
                    title: resp.result.message || "",
                    duration: 1000,
                    icon: 'none',
                    mask: true
                })
            }
            wx.hideLoading()
        }).catch((e) => {
            console.log(e)
            wx.showToast({
                title: "获取数据出错！" || "",
                duration: 1000,
                icon: 'none',
                mask: true
            })
            wx.hideLoading()
        })
    },
    // 请求方法
    serviceHandle: function(name, type, params) {
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
            console.log(resp)
            if (resp.result.success) {
                if (type == "get_sorts") {
                    let tempSorts = resp.result.data.data.filter(i => i.name != "一体化联动")
                    let tempSorts1 = tempSorts.filter(i => i.name != "行外吸金-活期")
                    this.setData({
                        'multiArray[0]': tempSorts.map(item => item.name),
                        sorts: tempSorts1.map(item => item.name)
                    })
                }
            }
            wx.hideLoading()
        }).catch((e) => {
            wx.showToast({
                title: "获取数据出错！" || "",
                duration: 1000,
                icon: 'none',
                mask: true
            })
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
    /**
     * 周期切换点击
     * @param {*} e 
     */
    onClickTabCycle: function onClickTabCycle(e) {
        console.log(e);
        this.setData({
            cycleId: e.detail.id
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */


    onLoad: function(e) {

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

    },

    /**

    * 用户点击右上角分享

    */

    onShareAppMessage: function() {

    },

})