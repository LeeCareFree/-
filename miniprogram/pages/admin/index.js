// pages/admin.js
import getTodayTime from "../../utils/getTodayTime"
Page({

    /**
     * 页面的初始数据
     */
    data: {
        banks: [],
        sorts: [],
        updateUserInfo: {},
        addUserInfo: {},
        bankData: "",
        sortData: "",
        selectedBank: "",
        selectedSort: "",
        autoFocus: true,
        searchName: '',
        // 修改的支行
        updateBankData: "",
        addBankData: "",
        // 修改的业绩分类
        updateSortData: "",
        addSortData: "",
        isUpdateBank: false,
        isUpdateSort: false,
        isAddBank: false,
        isAddSort: false,
        isUpdateUser: false,
        isAddUser: false,
        startDate: "",
        finallDate: ""
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let that = this
        this.serviceHandle("banks", "get_banks");
        this.serviceHandle("sorts", "get_sorts");
    },
    exportExcel: function() {
        if (!this.data.startDate || !this.data.finallDate) {
            this.showModal("请输入完整的起始时间！")
        } else {
            let tempStartDate = new Date(this.data.startDate)
            let tempFinallDate = new Date(this.data.finallDate)
            wx.showLoading({
                title: '',
            })
            return wx.cloud.callFunction({
                name: "achievements",
                data: {
                    type: "export_achievements",
                    params: {
                        startDate: tempStartDate.getTime(),
                        finallDate: tempFinallDate.getTime()
                    }
                }
            }).then((resp) => {
                console.log(resp)
                let fileID = resp.result.fileID
                    //获取云存储文件下载地址，这个地址有效期一天
                    // let that = this;
                wx.cloud.getTempFileURL({
                    fileList: [fileID],
                    success: res => {
                        // get temp file URL
                        var timestamp = new Date().getTime()
                        wx.downloadFile({
                            url: `${res.fileList[0].tempFileURL}?timestamp=${timestamp}`,
                            success(res) {
                                const filePath = res.tempFilePath
                                wx.saveFile({
                                    tempFilePath: filePath,
                                    success: function(res) {
                                        wx.openDocument({
                                            filePath: res.savedFilePath,
                                            showMenu: true,
                                            fileType: "xlsx",
                                            success: function(res) {
                                                console.log('打开文档成功')
                                            }
                                        })
                                    },
                                    fail: function(e) {
                                        console.log(e)
                                    }
                                })

                            }
                        })
                    },
                })
                this.showModal(resp.result.message)
                wx.hideLoading()
            }).catch((e) => {
                wx.showModal({
                    title: "温馨提示",
                    content: '获取数据出错！',
                    showCancel: false,
                });
                wx.hideLoading()
            })
        }
    },
    bindStartDateChange: function(e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            startDate: e.detail.value
        })
    },
    bindFinallDateChange: function(e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            finallDate: e.detail.value
        })
    },
    bindUserBankChange: function(e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        let type = e.currentTarget.dataset.type
        switch (type) {
            case "update":
                this.setData({
                    "updateUserInfo.bank": this.data.banks[e.detail.value]
                })
                break;
            case "add":
                this.setData({
                    "addUserInfo.bank": this.data.banks[e.detail.value]
                })
                break;
            default:
                break;
        }
    },
    bindBankChange: function(e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            bankData: this.data.banks[e.detail.value]
        })
    },
    bindSortChange: function(e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            sortData: this.data.sorts[e.detail.value]
        })
    },
    searchNameInput: function(e) {
        this.setData({
            searchName: e.detail.value
        })
    },
    updateBankInput: function(e) {
        this.setData({
            updateBankData: e.detail.value
        })
    },
    addBankInput: function(e) {
        this.setData({
            addBankData: e.detail.value
        })
    },
    updateSortInput: function(e) {
        this.setData({
            updateSortData: e.detail.value
        })
    },
    addSortInput: function(e) {
        this.setData({
            addSortData: e.detail.value
        })
    },
    usernameInput: function(e) {
        let type = e.currentTarget.dataset.type
        switch (type) {
            case "update":
                this.setData({
                    "updateUserInfo.username": e.detail.value
                })
                break;
            case "add":
                this.setData({
                    "addUserInfo.username": e.detail.value
                })
                break;
            default:
                break;
        }
    },
    positionInput: function(e) {
        let type = e.currentTarget.dataset.type
        switch (type) {
            case "update":
                this.setData({
                    "updateUserInfo.position": e.detail.value
                })
                break;
            case "add":
                this.setData({
                    "addUserInfo.position": e.detail.value
                })
                break;
            default:
                break;
        }
    },
    mobileInput: function(e) {
        let type = e.currentTarget.dataset.type
        switch (type) {
            case "update":
                this.setData({
                    "updateUserInfo.mobile": e.detail.value
                })
                break;
            case "add":
                this.setData({
                    "addUserInfo.mobile": e.detail.value
                })
                break;
            default:
                break;
        }
    },
    // 修改数据方法
    adminHandle: function(e) {
        let collection = e.currentTarget.dataset.collection
        let type = e.currentTarget.dataset.type
        let mobileReg = /^[1][3,4,5,7,8,9][0-9]{9}$/;
        switch (type) {
            case "update":
                if (collection == "banks") {
                    if (this.data.bankData) {
                        this.setData({ isUpdateBank: true, isAddBank: false })
                        if (!this.data.updateBankData) {
                            this.showModal("请先输入修改后的支行！")
                        } else {
                            this.serviceHandle(collection, 'update_banks', { old: this.data.bankData, new: this.data.updateBankData })
                            this.setData({
                                bankData: this.data.updateBankData
                            })
                        }
                    } else {
                        this.showModal("请先选择支行！")
                    }
                }
                if (collection == "sorts") {
                    if (this.data.sortData) {
                        this.setData({ isUpdateSort: true, isAddSort: false })
                        if (!this.data.updateSortData) {
                            this.showModal("请先输入修改后的业绩分类！")
                        } else {
                            this.serviceHandle(collection, 'update_sorts', { old: this.data.sortData, new: this.data.updateSortData })
                            this.setData({
                                sortData: this.data.updateSortData
                            })
                        }
                    } else {
                        this.showModal("请先选择业绩分类！")
                    }
                }
                if (collection == "users") {
                    if (this.data.updateUserInfo.mobile) {
                        this.setData({
                            isUpdateUser: true,
                            isAddUser: false
                        })
                        if (!this.data.updateUserInfo.username || !this.data.updateUserInfo.position || !this.data.updateUserInfo.bank || !mobileReg.test(this.data.updateUserInfo.mobile)) {
                            this.showModal("请填写完整正确的用户信息！")
                        } else {
                            this.serviceHandle(collection, 'update_users', {
                                old: this.data.searchName,
                                new: {
                                    username: this.data.updateUserInfo.username,
                                    position: this.data.updateUserInfo.position,
                                    mobile: this.data.updateUserInfo.mobile,
                                    bank: this.data.updateUserInfo.bank
                                }
                            })
                        }
                    } else {
                        this.showModal("请先查询用户后更新！")
                    }
                }
                break;
            case "remove":
                if (collection == "banks") {
                    this.setData({
                        isAddBank: false,
                        isUpdateBank: false
                    })
                    if (!this.data.bankData) {
                        this.showModal("请先选择支行！")
                    } else {
                        this.serviceHandle(collection, 'remove_banks', this.data.bankData)
                        this.setData({
                            bankData: ""
                        })
                    }
                }
                if (collection == "sorts") {
                    this.setData({
                        isAddSort: false,
                        isUpdateSort: false
                    })
                    if (!this.data.sortData) {
                        this.showModal("请先选择业绩分类！")
                    } else {
                        this.serviceHandle(collection, 'remove_sorts', this.data.sortData)
                        this.setData({
                            sortData: ""
                        })
                    }
                }
                if (collection == "users") {
                    if (!this.data.updateUserInfo) {
                        this.showModal("请先输入手机号查询确认后删除！")
                    } else {
                        this.serviceHandle(collection, 'remove_users', this.data.searchName)
                        this.setData({
                            updateUserInfo: {}
                        })
                    }
                }
                break;
            case "add":
                if (collection == "banks") {
                    this.setData({ isAddBank: true, isUpdateBank: false })
                    if (this.data.isAddBank) {
                        if (!this.data.addBankData) {
                            this.showModal("请先输入新增的支行！")
                        } else if (this.data.banks.indexOf(this.data.addBankData) > -1) {
                            this.showModal("已经存在此支行！")
                        } else {
                            this.serviceHandle(collection, 'add_banks', this.data.addBankData)
                            this.setData({
                                bankData: ""
                            })
                        }
                    }
                }
                if (collection == "sorts") {
                    this.setData({ isAddSort: true, isUpdateSort: false })
                    if (this.data.isAddSort) {
                        if (!this.data.addSortData) {
                            this.showModal("请先输入新增的业绩分类！")
                        } else if (this.data.sorts.indexOf(this.data.addSortData) > -1) {
                            this.showModal("已经存在此业绩分类！")
                        } else {
                            this.serviceHandle(collection, 'add_sorts', this.data.addSortData)
                            this.setData({
                                sortData: ""
                            })
                        }
                    }
                }
                if (collection == "users") {
                    this.setData({
                        isUpdateUser: false,
                        isAddUser: true
                    })
                    if (!this.data.addUserInfo.username || !this.data.addUserInfo.position || !this.data.addUserInfo.bank || !mobileReg.test(this.data.addUserInfo.mobile)) {
                        this.showModal("请输入完整正确的用户信息！")
                    } else {
                        this.serviceHandle(collection, 'add_users', {
                                username: this.data.addUserInfo.username,
                                position: this.data.addUserInfo.position,
                                mobile: this.data.addUserInfo.mobile,
                                bank: this.data.addUserInfo.bank
                            })
                            // 置空并隐藏
                        this.setData({ isAddUser: false, addUserInfo: {} })
                    }
                }
                break;
            default:
                break;
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
    //取消，返回上一页
    searchHandle: function() {
        let mobileReg = /^[1][3,4,5,7,8,9][0-9]{9}$/;
        if (!mobileReg.test(this.data.searchName)) {
            wx.showModal({
                title: "温馨提示",
                content: "请输入正确的手机号查询！",
                showCancel: false,
            })

        } else {
            this.serviceHandle("users", "search_user", { mobile: this.data.searchName }).then(res => {
                this.data.updateUserInfo.mobile ? this.setData({ isUpdateUser: true, isAddUser: false }) : this.setData({ isUpdateUser: false, isAddUser: false })
            })
        }
    },
    // 获取表单数据
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
                if (name == "users") {
                    resp.result.data ?
                        this.setData({
                            updateUserInfo: resp.result.data.data[0]
                        }) : ''
                    wx.hideLoading()
                    this.showModal(resp.result.message)
                    return
                } else {
                    this.setData({
                        [name]: resp.result.data.data.map(item => {
                            return item.name
                        })
                    })
                }
                this.showModal(resp.result.message)
            } else {
                name == "users" ? this.setData({ updateUserInfo: {} }) : ""
                this.showModal(resp.result.message)
            }
            wx.hideLoading()
        }).catch((e) => {
            wx.showModal({
                title: "温馨提示",
                content: '获取数据出错！',
                showCancel: false,
            });
            wx.hideLoading()
        })
    },
    setBankVal: function(e) {
        this.setData({
            selectedBank: e.detail
        })
    },
    setSortVal: function(e) {
        this.setData({
            selectedSort: e.detail
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

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})