const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 修改数据库信息云函数入口函数
exports.main = async(event, context) => {
    try {
        console.log(event.params)
        let userInfo = await db.collection('users').where({
            mobile: Number(event.params.mobile)
        }).get()
        if (userInfo.data.length <= 0) {
            return {
                message: '未找到用户！',
                code: 1,
            };
        }
        return {
            success: true,
            message: '搜索成功！',
            data: userInfo,
            code: 0,
        };

    } catch (e) {
        return {
            success: false,
            errMsg: e
        }
    }
}