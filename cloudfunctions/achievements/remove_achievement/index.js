const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 修改数据库信息云函数入口函数
exports.main = async(event, context) => {
    try {
        await db.collection('achievements').where({
            _id: event.params._id
        }).remove()
        return {
            success: true,
            message: "删除业绩成功！",
            code: 0
        }
    } catch (error) {
        return {
            success: false,
            errMsg: error
        }
    }
}