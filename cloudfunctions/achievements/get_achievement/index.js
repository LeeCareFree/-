const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 修改数据库信息云函数入口函数
exports.main = async(event, context) => {
    try {
        let achievements = await db.collection('achievements').where({
            date: event.params.date
        }).skip((event.params.pageNum - 1) * 10).limit(10).get()
        if (achievements.data.length <= 0) {
            return {
                success: false,
                message: "没有数据啦！",
                data: achievements,
                code: 0
            }
        }
        return {
            success: true,
            message: "获取成功！",
            data: achievements,
            code: 0
        }
    } catch (error) {
        return {
            success: false,
            errMsg: error
        }
    }
}