const login_register = require('./login-register/index')
const search_user = require('./search_user/index')
const update_users = require('./update_users/index')
const remove_users = require('./remove_users/index')
const add_users = require('./add_users/index')
const get_users = require('./get_users/index')
    // 云函数入口函数
exports.main = async(event, context) => {
    switch (event.type) {
        case 'login_register':
            return await login_register.main(event, context)
        case 'search_user':
            return await search_user.main(event, context)
        case 'update_users':
            return await update_users.main(event, context)
        case 'remove_users':
            return await remove_users.main(event, context)
        case 'add_users':
            return await add_users.main(event, context)
        case 'get_users':
            return await get_users.main(event, context)
    }
}