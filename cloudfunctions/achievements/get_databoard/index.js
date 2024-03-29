const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

const structureObjFn = (arr, name) => {
    let obj = {};
    let temp = name.toString()
    if (Array.isArray(arr)) {
        for (var i = 0; i < arr.length; ++i) {
            var name = arr[i][temp];
            if (name in obj) obj[name].push(arr[i]);
            else obj[name] = [arr[i]];
        }
    }
    return obj
}
const structureArrFn = (obj, type) => {
    let totalArr = []
    for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
            const element = obj[key];
            let temp = {}
            temp.moneyData = element.reduce((pre, cur) => {
                    if (cur.unit == "元") {
                        cur.moneyData = cur.moneyData / 10000
                    }
                    if (cur.sortData == "保险") {
                        cur.moneyData = cur.moneyData * cur.insuranceRateData.substring(0, cur.insuranceRateData.lastIndexOf("\年"))
                    }

                    if (cur.sortData == "基金定投") {
                        cur.moneyData = 1
                    }
                    return (pre * 10000 + cur.moneyData * 10000) / 10000
                }, 0)
                // temp.username = "全部"
            temp.date = element[0].date
            totalArr.push(temp)
        }
    }
    return totalArr
}

const db = cloud.database()
    // 修改数据库信息云函数入口函数
exports.main = async(event, context) => {
    try {
        const _ = db.command
        let queryObj = {
            date: _.and(_.gte(event.params.startDate), _.lte(event.params.finallDate)),
            sortData: event.params.sort,
        }
        if (event.params.bank == "全部" && event.params.username !== "全部") {
            queryObj = Object.assign({}, queryObj, {
                    username: event.params.username
                })
                // 筛选时间和银行相同的数据
                // let obj = {}
                // achievements.data.map(i => {
                //     var test = i.bankData + i.date;
                //     if (test in obj) obj[test].push(i);
                //     else obj[test] = [i];
                // })
        } else if (event.params.bank != "全部" && event.params.username == "全部") {
            queryObj = Object.assign({}, queryObj, {
                bankData: event.params.bank
            })
        } else if (event.params.bank != "全部" && event.params.username != "全部") {
            queryObj = Object.assign({}, queryObj, {
                bankData: event.params.bank,
                username: event.params.username
            })
        }
        let count = await getCount();
        count = count.total;
        let achievements = []
        for (let i = 0; i < count; i += 100) { //自己设置每次获取数据的量
            achievements = achievements.concat(await getAchievements(i));
        }
        async function getCount() { //获取数据的总数，这里记得设置集合的权限
            let count = await db.collection('achievements').where({
                ...queryObj
            }).orderBy('date', 'asc').count()
            return count;
        }
        async function getAchievements(skip) { //分段获取数据
            let achievements = await db.collection('achievements').where({
                ...queryObj
            }).orderBy('date', 'asc').skip(skip).get()
            return achievements.data;
        }
        achievements = structureArrFn(structureObjFn(achievements, "date"))
        if (achievements.length <= 0) {
            return {
                success: false,
                message: "没有数据啦！",
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