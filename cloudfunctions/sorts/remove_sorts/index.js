const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 修改数据库信息云函数入口函数
exports.main = async(event, context) => {
    try {
        await db.collection('sorts').where({
            name: event.params
        }).remove()
        let sorts = await db.collection('sorts').get()
        return {
            success: true,
            message: "删除业绩分类成功！",
            data: sorts,
            code: 0
        }
    } catch (e) {
        return {
            success: false,
            errMsg: e
        }
    }
}