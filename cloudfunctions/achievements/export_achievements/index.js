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
        let achievements = await db.collection('achievements').where({
            date: _.and(_.gte(event.params.startDate), _.lte(event.params.finallDate))
        }).orderBy('date', 'asc').get()
            //1,定义excel表格名
        let dataCVS = '业绩数据.xlsx'
            //2，定义存储数据的
        let alldata = [];
        let row = ['日期', '支行', '职位', '姓名', '业绩分类', '产品', '金额', '单位', '频率', '备注']; //表属性
        alldata.push(row);
        for (let i = 0; i < achievements.data.length; i++) {
            let arr = [];
            arr.push(exchangeTime(achievements.data[i].date));
            arr.push(achievements.data[i].bankData);
            arr.push(achievements.data[i].position);
            arr.push(achievements.data[i].username);
            arr.push(achievements.data[i].sortData);
            arr.push(achievements.data[i].prodData);
            arr.push(achievements.data[i].moneyData);
            arr.push(achievements.data[i].unit);
            achievements.data[i].fundRateData ? arr.push(achievements.data[i].fundRateData) : achievements.data[i].insuranceRateData ? arr.push(achievements.data[i].insuranceRateData) : arr.push("")
            arr.push(achievements.data[i].notesData);
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