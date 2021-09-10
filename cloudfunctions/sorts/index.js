const get_sorts = require('./get_sorts/index')
const update_sorts = require('./update_sorts/index')
const add_sorts = require('./add_sorts/index')
const remove_sorts = require('./remove_sorts/index')
    // 云函数入口函数
exports.main = async(event, context) => {
    switch (event.type) {
        case 'get_sorts':
            return await get_sorts.main(event, context)
        case 'update_sorts':
            return await update_sorts.main(event, context)
        case 'add_sorts':
            return await add_sorts.main(event, context)
        case 'remove_sorts':
            return await remove_sorts.main(event, context)
    }
}