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
        multiArray: [],
        tempMultiArray: [],
        tempMultiIndex: [],
        multiIndex: [0, 0, 0],
        showTable: true,
        sorts: [],
        rankTypes: ["金额排行", "笔数排行"],
        rankTypeData: "金额排行",
        ranklist: [],
    },
    bindMultiPickerChange: function(e) {
        this.setData({
            multiArray: this.data.tempMultiArray,
            multiIndex: e.detail.value
        })
        console.log('picker发送选择改变，携带值为', e.detail.value)
        let multiArray = this.data.tempMultiArray
        let multiIndex = this.data.multiIndex
        this.getDataboard("get_ranks", { sort: multiArray[0][multiIndex[0]], bank: multiArray[1][multiIndex[1]], rankType: this.data.rankTypeData })
    },
    bindMultiPickerColumnChange: function(e) {
        console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
        var data = {
            tempMultiArray: this.data.tempMultiArray,
            tempMultiIndex: this.data.tempMultiIndex
        };
        data.tempMultiIndex[e.detail.column] = e.detail.value;
        // switch (e.detail.column) {
        //     case 0:
        //         break;
        //     case 1:
        //         console.log(e.detail.value)
        //             // this.serviceHandle("users", "get_users", { bank: data.tempMultiArray[1][e.detail.value] })
        //         data.tempMultiIndex[2] = 0;
        //         break;
        // }
        this.setData(data);
    },
    bindRankTypeChange: function(e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
                rankTypeData: this.data.rankTypes[e.detail.value]
            })
            // console.log(this.data.multiArray[0])
        this.getDataboard("get_ranks", { sort: this.data.multiArray[0][this.data.multiIndex[0]], rankType: this.data.rankTypeData })
    },
    // onCallbackDate: async function(e) {
    //     await this.serviceHandle("sorts", "get_sorts")
    //     this.setData({
    //         date: e.detail.date
    //     })
    //     this.getDataboard("get_ranks", { sort: this.data.sortData, rankType: this.data.rankTypeData })
    // },
    onCallbackDate: async function(e) {
        this.setData({
            tempMultiArray: this.data.multiArray,
            date: e.detail.date
        })
        console.log(this.data.multiArray.length)
            // if (!this.data.multiArray[0] && !this.data.multiArray[1] && !this.data.multiArray[2]) {
            //     console.log(2)
            //     await this.serviceHandle("sorts", "get_sorts")
            //     await this.serviceHandle("banks", "get_banks")
            //     this.getDataboard("get_ranks", { sort: this.data.tempMultiArray[0][0], bank: "全部", rankType: this.data.rankTypeData })
            // }
        if (this.data.multiArray.length <= 0) {
            await this.serviceHandle("sorts", "get_sorts")
            await this.serviceHandle("banks", "get_banks")
        }
        let multiArray = this.data.multiArray
        let multiIndex = this.data.multiIndex
        this.getDataboard("get_ranks", { sort: multiArray[0][multiIndex[0]], bank: multiArray[1][multiIndex[1]], rankType: this.data.rankTypeData })
    },
    // 获取图表数据
    getDataboard: function(type, params) {
        let date = this.data.date
        let exchangeStartDate = new Date(date.startDate)
        let exchangeEndDate = new Date(date.endDate)
        this.setData({
            showTable: false,
        })
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
                    let tempSorts2 = tempSorts1.filter(i => i.name != "贵金属")
                    this.setData({
                        'multiArray[0]': tempSorts2.map(item => item.name),
                        sorts: tempSorts2.map(item => item.name)
                    })
                }
                if (type == "get_banks") {
                    let arr = resp.result.data.data.map(item => {
                        return item.name
                    })
                    arr.unshift("全部")
                    this.setData({
                        'multiArray[1]': arr
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