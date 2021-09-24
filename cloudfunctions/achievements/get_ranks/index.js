const cloud = require('wx-server-sdk')

cloud.init({
        env: cloud.DYNAMIC_CURRENT_ENV
    })
    /**数组根据数组对象中的某个属性值进行排序的方法 
     * 使用例子：newArray.sort(sortBy('number',false)) //表示根据number属性降序排列;若第二个参数不传递，默认表示升序排序
     * @param attr 排序的属性 如number属性
     * @param rev true表示升序排列，false降序排序
     * */
const sortBy = (attr, rev) => {
    //第二个参数没有传递 默认升序排列
    if (rev == undefined) {
        rev = 1;
    } else {
        rev = (rev) ? 1 : -1;
    }

    return function(a, b) {
        a = a[attr];
        b = b[attr];
        if (a < b) {
            return rev * -1;
        }
        if (a > b) {
            return rev * 1;
        }
        return 0;
    }
}
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
                if (cur.sortData == "行外吸金-活期") {
                    cur.moneyData = 0
                }
                if (cur.sortData == "行外吸金-定期" && type == "笔数排行") {
                    cur.moneyData = 1
                }
                return pre + Number(cur.moneyData)
            }, 0)
            temp.bank = element[0].bankData
            temp.username = element[0].username
            totalArr.push(temp)
        }
    }
    var map = totalArr.reduce((all, m) => {
        let list = all.get(m.moneyData);
        if (!list) {
            list = [];
            all.set(m.moneyData, list);
        }
        list.push(m);
        return all;
    }, new Map());
    const finalArr = []
    Array.from(map.entries())
        // 这里过滤掉 list 只有一个元素的，剩下的就是有重复的
        // .filter(([moneyData, list]) => list.length > 1)
        .forEach(([moneyData, list]) => {
            let tempObj = {}
            tempObj["sortMoney"] = moneyData
            tempObj["list"] = list
            finalArr.push(tempObj)
        });
    // 排序
    let parseArr = JSON.parse(JSON.stringify(finalArr))
    let tempArr = parseArr.sort(sortBy('sortMoney', false))
        // 截取排序的数组前十个
    return JSON.parse(JSON.stringify(tempArr)).splice(0, 10)
}
const db = cloud.database()

// 修改数据库信息云函数入口函数
exports.main = async(event, context) => {
    try {
        const _ = db.command
        let achievements = await db.collection('achievements').where({
            date: _.and(_.gte(event.params.startDate), _.lte(event.params.finallDate)),
            sortData: event.params.sort,
        }).get()
        achievements.data = structureArrFn(structureObjFn(achievements.data, "username"), event.params.rankType)
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