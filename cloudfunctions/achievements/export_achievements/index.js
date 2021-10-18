const cloud = require('wx-server-sdk')

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
})

function exchangeTime(oldTime) {
    let date = new Date(oldTime);
    //获取年份  
    var Y = date.getFullYear();
    //获取月份  
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    //获取当日日期 
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    return Y + "-" + M + "-" + D
}
const db = cloud.database()
    //操作excel用的类库
const xlsx = require('node-xlsx');
// 修改数据库信息云函数入口函数
exports.main = async(event, context) => {
    try {
        const _ = db.command
            // let achievements = await db.collection('achievements').where({
            //         date: _.and(_.gte(event.params.startDate), _.lte(event.params.finallDate))
            //     }).orderBy('date', 'asc').get()
            //1,定义excel表格名
        let count = await getCount();
        count = count.total;
        let achievements = []
        for (let i = 0; i < count; i += 100) { //自己设置每次获取数据的量
            achievements = achievements.concat(await getAchievements(i));
        }
        async function getCount() { //获取数据的总数，这里记得设置集合的权限
            let count = await db.collection('achievements').where({
                date: _.and(_.gte(event.params.startDate), _.lte(event.params.finallDate))
            }).orderBy('date', 'asc').count()
            return count;
        }
        async function getAchievements(skip) { //分段获取数据
            let achievements = await db.collection('achievements').where({
                date: _.and(_.gte(event.params.startDate), _.lte(event.params.finallDate))
            }).orderBy('date', 'asc').skip(skip).get()
            return achievements.data;
        }
        let dataCVS = '业绩数据.xlsx'
            //2，定义存储数据的
        let alldata = [];
        let row = ['日期', '支行', '职位', '姓名', '业绩分类', '产品', '业绩', '单位', '频率', '备注']; //表属性
        alldata.push(row);
        for (let i = 0; i < achievements.length; i++) {
            let arr = [];
            arr.push(exchangeTime(achievements[i].date));
            arr.push(achievements[i].bankData);
            arr.push(achievements[i].position);
            arr.push(achievements[i].username);
            arr.push(achievements[i].sortData);
            arr.push(achievements[i].prodData);
            arr.push(achievements[i].moneyData);
            arr.push(achievements[i].unit);
            achievements[i].fundRateData ? arr.push(achievements[i].fundRateData) : achievements[i].insuranceRateData ? arr.push(achievements[i].insuranceRateData) : arr.push("")
            arr.push(achievements[i].notesData);
            alldata.push(arr)
        }
        // 把数据保存到excel里
        var buffer = await xlsx.build([{
            name: "业绩数据",
            data: alldata
        }]);
        //4，把excel文件保存到云存储里
        return await cloud.uploadFile({
            cloudPath: dataCVS,
            fileContent: buffer, //excel二进制文件
        })
    } catch (error) {
        return {
            success: false,
            errMsg: error
        }
    }
}