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
            username: event.params.username
        }).get()
        if (userInfo.data.length <= 0) {
            return {
                message: '无权限，请找管理员添加权限！',
                code: 1,
            };
        }
        if (userInfo.data[0].username == event.params.username && userInfo.data[0].mobile.toString().substring(userInfo.data[0].mobile.toString().length - 4) == event.params.password) {
            return {
                message: "登录成功！",
                success: true,
                data: userInfo.data[0],
                code: 0
            }
        }
        return {
            message: '密码错误（请输入手机号后四位）！',
            code: 1,
        };

    } catch (e) {
        return {
            success: false,
            errMsg: e
        }
    }
}