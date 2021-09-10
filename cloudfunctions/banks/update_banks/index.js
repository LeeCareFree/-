const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 修改数据库信息云函数入口函数
exports.main = async(event, context) => {
    try {
        await db.collection('banks').where({
            name: event.params.old
        }).update({
            data: {
                name: event.params.new
            }
        })
        let banks = await db.collection('banks').get()
        return {
            success: true,
            message: "修改支行成功！",
            data: banks,
            code: 0
        }
    } catch (e) {
        return {
            success: false,
            errMsg: e
        }
    }
}