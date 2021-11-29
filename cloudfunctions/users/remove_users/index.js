const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 修改数据库信息云函数入口函数
exports.main = async(event, context) => {
    try {
        await db.collection('users').where({
            mobile: Number(event.params)
        }).remove()
        return {
            success: true,
            message: "删除用户信息成功！",
            code: 0
        }
    } catch (e) {
        return {
            success: false,
            errMsg: e
        }
    }
}