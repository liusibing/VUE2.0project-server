const mongoose = require('mongoose')
const roleSchema = new mongoose.Schema({
    name: { type: String, required: true },   //角色名称
    auth_name: String,   //授权人
    auth_time: Number,  //授权时间
    create_time: { type: Number, default: Date.now },  //默认值
    menus: Array
})

// roles是本数据库的名字   roleSchema是本数据库的规则
const RoleModel = mongoose.model('roles', roleSchema);
module.exports = RoleModel

