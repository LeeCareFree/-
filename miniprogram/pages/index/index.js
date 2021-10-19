//index.js
const app = getApp()
const { envList } = require('../../envList.js')
import WxValidate from '../../utils/WxValidate.js'
import loadImg from "../../utils/loadImg"
import getTodayTime from "../../utils/getTodayTime"
import isObjEqual from "../../utils/objEqual"
import getByteLen from "../../utils/getByteLen"
import { createCanvasInit, fontRext } from '../../utils/canvas.js'
Page({
    data: {
        canvasWidth: "",
        canvasHeight: "",
        userInfo: {},
        form: {
            username: "",
            date: "",
            bankData: "",
            sortData: "",
            prodData: "",
            moneyData: "",
            notesData: "",
            fundRateData: "",
            insuranceRateData: "",
            unit: "万"
        },
        shareInfo: {},
        rateType: "",
        fundRate: ['/天', '/周', '/月', '/年'],
        banks: [],
        sorts: [],
        insuranceRate: ["1年", "2年", "3年", "4年", "5年", "6年", "7年", "8年", "9年", "10年"],
        units: ["万", "元"],
        showShareModal: false,
        isFix: false
    },
    onLoad: function(options) {
        options.data ? this.setData({
            form: {...JSON.parse(options.data) },
            isFix: true
        }) : {}; //获取参数
        this.getInfo("banks", "get_banks");
        this.getInfo("sorts", "get_sorts")
    },
    onShow: function() {
        let localData = app.getLocalUserData();
        if (localData.userInfo != "") {
            this.setData({
                'form.username': localData.userInfo.username,
                'form.bankData': localData.userInfo.bank,
                'form.position': localData.userInfo.position,
                'form.date': getTodayTime()
            })
            this.getInfo("users", "search_user", { mobile: localData.userInfo.mobile }).then(r => {
                isObjEqual(this.data.userInfo, localData.userInfo) ? "" : wx.redirectTo({
                    url: '/pages/login/index'
                })
            });
        } else {
            wx.redirectTo({
                url: '/pages/login/index'
            })
        }
    },
    usernameInput: function(e) {
        this.setData({
            'form.username': e.detail.value
        })
    },
    prodInput: function(e) {
        this.setData({
            'form.prodData': e.detail.value
        })
    },
    moneyInput: function(e) {
        this.setData({
            'form.moneyData': e.detail.value
        })
    },
    notesInput: function(e) {
        this.setData({
            'form.notesData': e.detail.value
        })
    },
    // 获取表单分类数据
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
            if (resp.result.success) {
                let data = resp.result.data.data
                if (name == "users") {
                    that.setData({
                        userInfo: data[0]
                    })
                    wx.hideLoading()
                    return resp.result.data
                } else {
                    that.setData({
                        [name]: data.map(item => {
                            return item.name
                        })
                    })
                    wx.hideLoading()
                }
                wx.hideLoading()
            } else {
                // wx.showToast({
                //     title: resp.result.message || "获取数据出错！",
                //     icon: 'none',
                //     image: '',
                //     duration: 1500,
                //     mask: false,
                //     success: (result) => {

                //     },
                //     fail: () => {},
                //     complete: () => {}
                // });
            }
            wx.hideLoading()
        }).catch((e) => {
            wx.showToast({
                title: '"获取数据出错！"',
                icon: 'none',
                image: '',
                duration: 1000,
                mask: false,
                success: (result) => {

                },
                fail: () => {},
                complete: () => {}
            });
            // that.showModal()
            wx.hideLoading()
        })
    },
    bindUnitChange: function(e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            'form.unit': this.data.units[e.detail.value]
        })
    },
    bindDateChange: function(e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            'form.date': e.detail.value
        })
    },
    bindBankChange: function(e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            'form.bankData': this.data.banks[e.detail.value]
        })
    },
    bindSortChange: function(e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.data.sorts[e.detail.value] == "贵金属" ?
            this.setData({
                units: ["g", "件"]
            }) : this.setData({
                units: ["万", "元"]
            })
        this.setData({
            'form.sortData': this.data.sorts[e.detail.value],
            "form.prodData": "",
            "form.moneyData": "",
            "form.notesData": "",
            "form.fundRateData": "",
            "form.insuranceRateData": "",
            "form.unit": this.data.units[0]
        })
    },
    bindRateChange: function(e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        if (this.data.form.sortData == "保险") {
            this.setData({
                'form.insuranceRateData': this.data.insuranceRate[e.detail.value]
            })
        } else if (this.data.form.sortData == "基金定投") {
            this.setData({
                'form.fundRateData': this.data.fundRate[e.detail.value]
            })
        }
    },
    // 提示框函数
    showModal(msg) {
        wx.showModal({
            title: "温馨提示",
            content: msg,
            showCancel: false,
        })
    },
    //验证函数
    initValidate(data) {
        let rules = {
            username: {
                required: true,
                maxlength: 5
            },
            bankData: {
                required: true,
            },
            sortData: {
                required: true,
            },
            date: {
                required: true,
            },
            notesData: {
                required: false,
                maxlength: 30
            }
        }
        data.sortData != "一体化联动" ? rules = Object.assign({}, rules, {
            money: {
                required: true,
                maxlength: 8,
                number: true
            },
        }) : ""
        data.sortData.indexOf("行外吸金") < 0 ? rules = Object.assign({}, rules, {
            prodData: {
                required: true,
                maxlength: 10
            },
        }) : ""
        const messages = {
            username: {
                required: '请填写姓名！',
                minlength: '请输入正确的姓名！'
            },
            bankData: {
                required: '请选择支行！',
            },
            sortData: {
                required: '请选择业绩分类！',
            },
            prodData: {
                required: '请填写产品名称！',
                maxlength: '超出字数！'
            },
            money: {
                required: '请填写业绩！',
                maxlength: "超出字数！",
                number: '业绩只能输入数字！'
            },
            date: {
                required: '请选择时间！',
            },
            notesData: {
                maxlength: '超出字数！'
            },
        }
        this.WxValidate = new WxValidate(rules, messages)
    },
    formSubmit(e) {
        this.initValidate(e.detail.value) //验证规则函数
        console.log('form发生了submit事件，携带的数据为：', e)
        const params = e.detail.value
        if ((params.sortData == "基金定投" || params.sortData == "保险") && !params.rateData) {
            this.showModal("请选择频率！")
        } else {
            if (!this.WxValidate.checkForm(params)) {
                const error = this.WxValidate.errorList[0]
                this.showModal(error.msg)
                return false
            }
            wx.showLoading({
                    title: '加载中',
                })
                // 转换时间戳上传
            let exchangeDate = new Date(this.data.form.date)
            let paramsObj = {
                date: exchangeDate.getTime(),
                bankData: this.data.form.bankData,
                username: this.data.form.username,
                sortData: this.data.form.sortData,
                prodData: this.data.form.prodData,
                position: this.data.form.position,
                moneyData: this.data.form.moneyData,
                notesData: this.data.form.notesData,
                fundRateData: this.data.form.fundRateData,
                insuranceRateData: this.data.form.insuranceRateData,
                unit: this.data.form.sortData != "一体化联动" ? this.data.form.unit : "",
                mobile: this.data.userInfo.mobile || ""
            }
            wx.cloud.callFunction({
                name: "achievements",
                data: {
                    type: this.data.isFix ? "update_achievement" : "set_achievement",
                    params: this.data.isFix ? { old: this.data.form._id || "", new: Object.assign({}, paramsObj, { isFix: true }) } : {...paramsObj }
                }
            }).then((resp) => {
                if (resp.result.success) {
                    wx.hideLoading()
                    this.setData({
                        isFix: false,
                        showShareModal: true,
                    })
                }
                wx.hideLoading()
                wx.showToast({
                    title: resp.result.message || "获取数据出错！",
                    icon: 'none',
                    image: '',
                    duration: 1000,
                    mask: false,
                    success: (result) => {

                    },
                    fail: () => {},
                    complete: () => {}
                });
            }).catch((e) => {
                console.log(e)
                this.showModal('获取数据出错！')
                wx.hideLoading()
            })
        }
    },
    /**
     * 用户点击分享
     */
    onShareAppMessage: function(e) {
        const colors = [
            { sortName: "重点基金", color: "#9ca8b8" },
            { sortName: "建信理财", color: "#dfd7d7" },
            { sortName: "保险", color: "#96a48b" },
            { sortName: "基金定投", color: "#c1cbd7" },
            { sortName: "私募", color: "#8696a7" },
            { sortName: "一体化联动", color: "#bfbfbf" },
            { sortName: "贵金属", color: "#d8caaf" },
            { sortName: "行外吸金-定期", color: "#fff" },
            { sortName: "行外吸金-活期", color: "#fff" },
            { sortName: "基金", color: "#c1cbd7" }
        ]
        const promise = new Promise(resolve => {
            // 通过 SelectorQuery 获取 Canvas 节点
            wx.createSelectorQuery()
                .select('#myCanvas')
                .fields({
                    node: true,
                    size: true,
                })
                .exec((res) => {
                    const width = res[0].width
                    const height = res[0].height

                    const canvas = res[0].node
                    const ctx = canvas.getContext('2d')

                    const dpr = wx.getSystemInfoSync().pixelRatio
                    canvas.width = width * dpr
                    canvas.height = height * dpr
                    ctx.scale(dpr, dpr)
                    colors.map(i => {
                        if (i.sortName === this.data.form.sortData) {
                            ctx.save()
                            ctx.fillStyle = i.color; //填充
                            ctx.fillRect(0, 0, canvas.width, canvas.height); //画出矩形背景
                            ctx.restore()
                        }
                    })
                    let imgs = [
                        "../../images/prize.png",
                        "../../images/salute.png",
                        "../../images/medal.png",
                        "../../images/fire.png",
                    ]
                    Promise.all(imgs.map((src) => loadImg(canvas, src))).then(res => {
                        const data = this.data.form
                        const xPosition = (320 / 2 - 15)
                        const space = 32
                        ctx.drawImage(res[0], xPosition - ((data.sortData.length + 2) / 2) * (this.data.form.sortData.indexOf("行外吸金") < 0 ? space : 27), 40, 30, 30)
                        ctx.drawImage(res[0], xPosition + ((data.sortData.length + 2) / 2) * (this.data.form.sortData.indexOf("行外吸金") < 0 ? space : 27), 40, 30, 30)
                        let bankSpace = data.bankData.length > 6 ? 29 : space;
                        ctx.drawImage(res[1], xPosition - ((data.bankData.length + data.username.length) / 2) * bankSpace, 90, 30, 30);
                        ctx.drawImage(res[1], xPosition + ((data.bankData.length + data.username.length) / 2) * bankSpace, 90, 30, 30);
                        let lengths = getByteLen(data.moneyData + data.unit + data.insuranceRateData + data.fundRateData)
                        let prodSpace = getByteLen(data.prodData) <= 4 ? 40 : 29
                        this.data.form.sortData.indexOf("行外吸金") < 0 ? ctx.drawImage(res[2], xPosition - ((getByteLen(data.prodData)) / 2) * prodSpace, 140, 30, 30) : ""
                        this.data.form.sortData.indexOf("行外吸金") < 0 ? ctx.drawImage(res[2], xPosition + ((getByteLen(data.prodData)) / 2) * prodSpace, 140, 30, 30) : ""

                        this.data.form.sortData != "一体化联动" ? ctx.drawImage(res[2], xPosition - ((lengths + 0.5) / 2) * space, this.data.form.sortData.indexOf("行外吸金") < 0 ? 190 : 140, 30, 30) : ""
                        this.data.form.sortData != "一体化联动" ? ctx.drawImage(res[2], xPosition + ((lengths + 0.5) / 2) * space, this.data.form.sortData.indexOf("行外吸金") < 0 ? 190 : 140, 30, 30) : ""

                        // ctx.drawImage(res[3], xPosition + 60, 170, 30, 30);
                        // ctx.drawImage(res[3], xPosition + 60, 210, 30, 30);
                        // ctx.drawImage(res[3], xPosition - 60, 170, 30, 30);
                        // ctx.drawImage(res[3], xPosition - 60, 210, 30, 30);
                        // ctx.fillStyle = "#000000";
                        ctx.font = '24px Times New Roman';
                        ctx.textAlign = "center";
                        ctx.fillText(`${this.data.form.sortData}喜报`, 160, 60);
                        ctx.fillText(`${this.data.form.bankData} ${this.data.form.username}`, 160, 110);
                        ctx.fillText(this.data.form.prodData, 160, 160);
                        this.data.form.sortData != "一体化联动" ? ctx.fillText(`${this.data.form.moneyData} ${this.data.form.unit}${this.data.form.insuranceRateData || this.data.form.fundRateData}`, 160, this.data.form.sortData.indexOf("行外吸金") < 0 ? 210 : 160) : "";
                        // const a = {
                        //     type: "text",
                        //     x: 320 / 2,
                        //     y: 120,
                        //     width: lengths * 20,
                        //     lineHeight: "22px",
                        //     fontSize: "22px",
                        //     fontColor: "#000000",
                        //     text: `${data.sortData !== "一体化联动" ? data.prodData + data.moneyData + data.unit + data.insuranceRateData + data.fundRateData : data.prodData}`
                        // }
                        // this.drawText(a, ctx)
                        // ctx.fillText(`冲刺全年`, 160, 190);
                        // ctx.fillText(`刻不容缓`, 160, 230);
                        const that = this;
                        wx.canvasToTempFilePath({
                            fileType: "png",
                            canvas: canvas,
                            success: function(res) {
                                let completeDate = that.data.form.date.replace(/(\d{4})\-(\d{2})\-(\d{2})/, "$1年$2月$3日")
                                let finallData = completeDate.substring(completeDate.indexOf('年') + 1, completeDate.length)
                                resolve({
                                    title: `${that.data.form.username}${finallData}业绩分享`,
                                    path: "/pages/index/index",
                                    imageUrl: res.tempFilePath
                                })
                            },
                            fail: function(res) {
                                that.setData({
                                    "form.sortData": "",
                                    "form.sortData": "",
                                    "form.prodData": "",
                                    "form.moneyData": "",
                                    "form.notesData": "",
                                    "form.fundRateData": "",
                                    "form.insuranceRateData": "",
                                    "form.unit": "万"
                                })
                            },
                            complete: function() {
                                that.setData({
                                    "form.sortData": "",
                                    "form.sortData": "",
                                    "form.prodData": "",
                                    "form.moneyData": "",
                                    "form.notesData": "",
                                    "form.fundRateData": "",
                                    "form.insuranceRateData": "",
                                    "form.unit": "万"
                                })
                                console.log("complete");
                            }
                        }, this);
                    })
                })
        })

        // const data = this.data.form
        // const width = 300,
        //     height = 240
        // const xPosition = (width / 2 - 15)
        // const fontSize = "20px"
        // const space = 25
        // const obj = [{
        //         type: "image",
        //         x: xPosition - ((data.sortData.length + 2) / 2) * space,
        //         y: 20,
        //         width: 30,
        //         height: 30,
        //         img: "/images/prize.png"
        //     }, {
        //         type: "text",
        //         x: width / 2,
        //         y: 30,
        //         fontSize: fontSize,
        //         fontColor: "#000000",
        //         text: `${data.sortData}喜报`
        //     }, {
        //         type: "image",
        //         x: xPosition + ((data.sortData.length + 2) / 2) * space,
        //         y: 20,
        //         width: 30,
        //         height: 30,
        //         img: "/images/prize.png"
        //     }, {
        //         type: "image",
        //         x: xPosition - ((data.bankData.length + data.username.length) / 2) * space,
        //         y: 60,
        //         width: 30,
        //         height: 30,
        //         img: "/images/salute.png"
        //     }, {
        //         type: "text",
        //         x: width / 2,
        //         y: 70,
        //         fontSize: fontSize,
        //         fontColor: "#000000",
        //         text: `${data.bankData} ${data.username}`
        //     }, {
        //         type: "image",
        //         x: xPosition + ((data.bankData.length + data.username.length) / 2) * space,
        //         y: 60,
        //         width: 30,
        //         height: 30,
        //         img: "/images/salute.png"
        //     }, {
        //         type: "image",
        //         x: xPosition - ((data.sortData !== "一体化联动" ? (data.prodData.length + data.moneyData.length + data.unit.length + data.insuranceRateData.length + data.fundRateData.length) : data.prodData.length + 1) / 2) * space,
        //         y: 100,
        //         width: 30,
        //         height: 30,
        //         img: "/images/medal.png"
        //     }, {
        //         type: "text",
        //         x: width / 2,
        //         y: 110,
        //         fontSize: fontSize,
        //         fontColor: "#000000",
        //         text: `${data.sortData !== "一体化联动" ? data.prodData + data.moneyData + data.unit + data.insuranceRateData + data.fundRateData : data.prodData}`
        //     }, {
        //         type: "image",
        //         x: xPosition + ((data.sortData !== "一体化联动" ? (data.prodData.length + data.moneyData.length + data.unit.length + data.insuranceRateData.length + data.fundRateData.length) : data.prodData.length + 1) / 2) * space,
        //         y: 100,
        //         width: 30,
        //         height: 30,
        //         img: "/images/medal.png"
        //     }, {
        //         type: "image",
        //         x: xPosition + 50,
        //         y: 150,
        //         width: 30,
        //         height: 30,
        //         img: "/images/fire.png"
        //     }, {
        //         type: "image",
        //         x: xPosition - 50,
        //         y: 150,
        //         width: 30,
        //         height: 30,
        //         img: "/images/fire.png"
        //     },
        //     {
        //         type: "text",
        //         x: width / 2,
        //         y: 160,
        //         width: 100,
        //         fontSize: fontSize,
        //         fontColor: "#000000",
        //         text: "冲刺全年"
        //     }, {
        //         type: "text",
        //         x: width / 2,
        //         y: 190,
        //         width: 100,
        //         fontSize: fontSize,
        //         fontColor: "#000000",
        //         text: "冲刺全年"
        //     }, {
        //         type: "image",
        //         x: xPosition + 50,
        //         y: 180,
        //         width: 30,
        //         height: 30,
        //         img: "/images/fire.png"
        //     }, {
        //         type: "image",
        //         x: xPosition - 50,
        //         y: 180,
        //         width: 30,
        //         height: 30,
        //         img: "/images/fire.png"
        //     },
        // ]
        // data.sortData !== "一体化联动" ? obj.concat({}) : ""
        // const promise = createCanvasInit({ id: "#myCanvas", width: width, height: height, array: obj }, this).then((url) => {
        //     this.setData({
        //         "form.sortData": "",
        //         "form.sortData": "",
        //         "form.prodData": "",
        //         "form.moneyData": "",
        //         "form.notesData": "",
        //         "form.fundRateData": "",
        //         "form.insuranceRateData": "",
        //         "form.unit": "万"
        //     })
        //     return ({
        //         title: `业绩分享`,
        //         imageUrl: url
        //     })
        // });
        return ({
            title: '自定义转发标题',
            promise
        })
    },
    cancel: function() {
        this.setData({
            "form.sortData": "",
            "form.sortData": "",
            "form.prodData": "",
            "form.moneyData": "",
            "form.notesData": "",
            "form.fundRateData": "",
            "form.insuranceRateData": "",
            "form.unit": "万"
        })
        this.setData({ showShareModal: false })
    },
    confirm: function() {
        this.setData({ showShareModal: false })
    },
    //绘画文本
    drawText: function(rect, ctx) {
        const newRect = JSON.parse(JSON.stringify(rect));
        let textWidth = 0; //累计宽度
        let substringIndex = 0; //截取位置

        for (let index = 0; index < rect.text.length; index++) {
            const element = rect.text[index];

            // 获取字体实际高度
            textWidth += element.charCodeAt(0) > 255 ? parseInt(rect.fontSize) : Math.ceil(ctx.measureText(element).width);
            //ctx.measureText(element).width
            // textWidth += 14;
            // 字体累计宽度大于文字宽度
            if (textWidth > (rect.width || option.width)) {
                //画截取字段
                newRect.text = rect.text.substring(substringIndex, index);
                fontRext(ctx, newRect);

                //设置开始下标 和 枢轴 y
                substringIndex = index;
                textWidth = 0;
                //计算得出每行间距
                const lineHeight = parseInt(newRect.lineHeight || newRect.fontSize) - parseInt(newRect.fontSize);
                newRect.y = newRect.y + parseInt(newRect.fontSize) + lineHeight;
            }

            //绘画剩余部分
            if (index === rect.text.length - 1) {
                newRect.text = rect.text.substring(substringIndex, index + 1);
                fontRext(ctx, newRect);
            }
        }
    }
})