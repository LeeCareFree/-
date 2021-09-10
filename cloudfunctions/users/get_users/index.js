const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 修改数据库信息云函数入口函数
exports.main = async(event, context) => {
    try {
        let users
        if (event.params.bank == "全部") {
            users = await db.collection('users').get()
        } else {
            users = await db.collection('users').where({
                bank: event.params.bank
            }).get()
        }
        return {
            success: true,
            message: '搜索成功！',
            data: users,
            code: 0,
        };

    } catch (e) {
        return {
            success: false,
            errMsg: e
        }
    }
}