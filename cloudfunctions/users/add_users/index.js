const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 修改数据库信息云函数入口函数
exports.main = async(event, context) => {
    try {
        let users = await db.collection('users').where({
            mobile: Number(event.params.mobile)
        }).get()
        if (users.data.length > 0) {
            throw "新增用户已存在！"
        } else {
            await db.collection('users').add({
                data: event.params
            })
            return {
                success: true,
                message: "新增用户成功！",
                data: users,
                code: 0
            }
        }
    } catch (e) {
        return {
            success: false,
            message: e
        }
    }
}