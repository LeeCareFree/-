const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 修改数据库信息云函数入口函数
exports.main = async(event, context) => {
    try {
        let banks = await db.collection('banks').get()
        if (banks.data.length <= 0) {
            return {
                message: '还未创建表单分类哦~',
                code: 1,
            };
        }
        return {
            success: true,
            data: banks
        }
    } catch (e) {
        return {
            success: false,
            errMsg: e
        }
    }
}