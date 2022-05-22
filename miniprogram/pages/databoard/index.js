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
        showChart: false,
        sorts: [],
        sortData: "重点基金",
        ranklist: [],
    },
    bindSortChange: function (e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            sortData: this.data.sorts[e.detail.value]
        })
        this.getDataboard("get_ranks", { sort: this.data.sortData })
    },
    bindMultiPickerChange: function (e) {
        this.setData({
            multiArray: this.data.tempMultiArray,
            multiIndex: e.detail.value
        })
        console.log('picker发送选择改变，携带值为', e.detail.value)
        let multiArray = this.data.tempMultiArray
        let multiIndex = this.data.multiIndex
        this.getDataboard("get_databoard", { sort: multiArray[0][multiIndex[0]], bank: multiArray[1][multiIndex[1]], username: multiArray[2][multiIndex[2]] }).then(res => {
            this.createChart()
        })
    },
    bindMultiPickerColumnChange: function (e) {
        console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
        var data = {
            tempMultiArray: this.data.tempMultiArray,
            tempMultiIndex: this.data.tempMultiIndex
        };
        data.tempMultiIndex[e.detail.column] = e.detail.value;
        switch (e.detail.column) {
            case 0:
                break;
            case 1:
                this.serviceHandle("users", "get_users", { bank: data.tempMultiArray[1][e.detail.value] })
                data.tempMultiIndex[2] = 0;
                break;
        }
        this.setData(data);
    },
    onCallbackDate: async function (e) {
        this.setData({
            tempMultiArray: this.data.multiArray,
            date: e.detail.date
        })
        if (this.data.multiArray.length <= 0) {
            await this.serviceHandle("sorts", "get_sorts")
            await this.serviceHandle("banks", "get_banks")
            await this.serviceHandle("users", "get_users", { bank: '全部' })
        }
        let multiArray = this.data.multiArray
        let multiIndex = this.data.multiIndex
        this.getDataboard("get_databoard", { sort: multiArray[0][multiIndex[0]], bank: multiArray[1][multiIndex[1]], username: multiArray[2][multiIndex[2]] }).then(res => {
            this.createChart()
        })
    },
    touchHandler: function (e) {
        keyFundChart.scrollStart(e);
    },
    moveHandler: function (e) {
        keyFundChart.scroll(e);
    },
    touchEndHandler: function (e) {
        keyFundChart.scrollEnd(e);
        keyFundChart.showToolTip(e, {
            format: function (item, category) {
                console.log(item)
                return item.username + ' ' + item.name + ':' + item.data
            }
        });
    },
    // 创建横纵轴数据
    createSimulationData: function (suorceData) {
        console.log(suorceData)
        let categories = suorceData.map(i => {
            return exchangeTime(i.date)
        })
        let data = suorceData.map(i => {
            return Number(i.moneyData)
        })
        let multiArray = this.data.multiArray
        let multiIndex = this.data.multiIndex
        let username = suorceData.map(i => {
            return multiArray[2][multiIndex[2]] != "全部" ? multiArray[2][multiIndex[2]] : multiArray[1][multiIndex[1]] != "全部" ? multiArray[1][multiIndex[1]] : ""
        })
        return {
            categories: categories,
            data: data,
            username: username
        }
    },
    // 创建图表
    createChart: function (options) {
        var windowWidth = 375;
        try {
            var res = wx.getSystemInfoSync();
            windowWidth = res.windowWidth;
        } catch (e) {
            console.error('getSystemInfoSync failed!');
        }
        let multiArray = this.data.multiArray
        let multiIndex = this.data.multiIndex
        var simulationData = this.createSimulationData(this.data.dataBoard);

        keyFundChart = new wxCharts({
            canvasId: 'lineCanvas',
            type: 'line',
            categories: simulationData.categories,
            animation: true,
            series: [{
                name: this.data.multiArray[0][this.data.multiIndex[0]],
                data: simulationData.data,
                username: simulationData.username,
                format: function (val, name) {
                    let retStr = ''
                    switch (multiArray[0][multiIndex[0]]) {
                        case "基金定投":
                            retStr = val + '笔'
                            break;
                        case "信用卡":
                            retStr = val + '张'
                            break;
                        case "商户":
                            retStr = val + '户'
                            break;
                        case "薪享通":
                            retStr = val + '户'
                            break;
                        default:
                            retStr = val + '万'
                            break;
                    }
                    return retStr;
                }
            }],
            xAxis: {
                disableGrid: false
            },
            yAxis: {
                title: multiArray[0][multiIndex[0]] == "基金定投" ? "业绩 (笔)" : multiArray[0][multiIndex[0]] == "信用卡" ? "业绩 (张)" : multiArray[0][multiIndex[0]] == "商户" || "薪享通" ? "业绩 (户)" : '业绩 (万)',
                format: function (val) {
                    return val;
                },
                min: 0
            },
            width: windowWidth,
            height: 200,
            dataLabel: true,
            dataPointShape: true,
            enableScroll: true,
            extra: {
                lineStyle: 'curve'
            }
        });
    },
    // 获取图表数据
    getDataboard: function (type, params) {
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
            if (resp.result.success) {
                let resData = resp.result.data
                console.log(resData)
                this.setData({
                    dataBoard: resData,
                    showChart: true
                })
            } else {
                this.setData({
                    showChart: false
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
            wx.hideLoading()
            wx.showToast({
                title: "获取数据出错！" || "",
                duration: 1000,
                icon: 'none',
                mask: true
            })
        })
    },
    // 请求方法
    serviceHandle: function (name, type, params) {
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
                    let tempSorts1 = tempSorts.filter(i => i.name != "贵金属")
                    this.setData({
                        'multiArray[0]': tempSorts1.map(item => item.name),
                        sorts: tempSorts1.map(item => item.name)
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
                if (type == "get_users") {
                    let arr = ["全部"]
                    resp.result.data.data.map(item => {
                        arr.push(item.username)
                    })
                    this.setData({
                        'multiArray[2]': arr
                    })
                    wx.hideLoading()
                    return arr
                }
            }
            wx.hideLoading()
        }).catch((e) => {
            wx.hideLoading()
            wx.showToast({
                title: "获取数据出错！" || "",
                duration: 1000,
                icon: 'none',
                mask: true
            })
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


    onLoad: function (e) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */

    onReady: function () {

    },

    /**

    * 生命周期函数--监听页面显示

    */

    onShow: function () {

    },

    /**

    * 生命周期函数--监听页面隐藏

    */

    onHide: function () {

    },

    /**

    * 生命周期函数--监听页面卸载

    */

    onUnload: function () {

    },

    /**

    * 页面相关事件处理函数--监听用户下拉动作

    */

    onPullDownRefresh: function () {

    },

    /**

    * 页面上拉触底事件的处理函数

    */

    onReachBottom: function () {

    },

    /**

    * 用户点击右上角分享

    */

    onShareAppMessage: function () {

    },

})