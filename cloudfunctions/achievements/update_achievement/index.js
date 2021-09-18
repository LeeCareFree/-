const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 修改数据库信息云函数入口函数
exports.main = async(event, context) => {
    try {
        await db.collection('achievements').where({
            _id: event.params.old
        }).update({
            data: {...event.params.new }
        })
        let achievement = await db.collection('achievements').where({
            _id: event.params.old
        }).get()
        let returnObj = achievement.data.length <= 0 ? { success: false, message: "业绩已删除，请重新填写！", code: 0 } : {
            success: true,
            message: "修改业绩成功！",
            code: 0
        }
        return returnObj
    } catch (e) {
        return {
            success: false,
            errMsg: e
        }
    }
}