// 云函数入口文件
const cloud = require('wx-server-sdk')
const set_achievement = require('./set_achievement/index')
const get_achievement = require('./get_achievement/index')
const export_achievements = require('./export_achievements/index')
const get_databoard = require('./get_databoard/index')
cloud.init()

// 云函数入口函数
exports.main = async(event, context) => {
    const wxContext = cloud.getWXContext()
    switch (event.type) {
        case 'set_achievement':
            return await set_achievement.main(event, context)
        case 'get_achievement':
            return await get_achievement.main(event, context)
        case 'export_achievements':
            return await export_achievements.main(event, context)
        case 'get_databoard':
            return await get_databoard.main(event, context)
    }
    return {
        event,
        openid: wxContext.OPENID,
        appid: wxContext.APPID,
        unionid: wxContext.UNIONID,
    }
}