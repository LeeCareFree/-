const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 修改数据库信息云函数入口函数
exports.main = async(event, context) => {
    try {
        console.log(event.params)
        await db.collection('achievements').add({
            // data 字段表示需新增的 JSON 数据
            data: {
                ...event.params
            }
        })
        return {
            success: true,
            message: "提交成功！",
            code: 0
        }
    } catch (error) {
        return {
            success: false,
            errMsg: error
        }
    }
}