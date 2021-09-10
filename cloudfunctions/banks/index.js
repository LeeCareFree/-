const get_banks = require('./get_banks/index')
const update_banks = require('./update_banks/index')
const add_banks = require('./add_banks/index')
const remove_banks = require('./remove_banks/index')
    // 云函数入口函数
exports.main = async(event, context) => {
    switch (event.type) {
        case 'get_banks':
            return await get_banks.main(event, context)
        case 'update_banks':
            return await update_banks.main(event, context)
        case 'add_banks':
            return await add_banks.main(event, context)
        case 'remove_banks':
            return await remove_banks.main(event, context)
    }
}