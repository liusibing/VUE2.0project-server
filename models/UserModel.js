// 账号密码访问数据库的规则

const mongoose = require('mongoose');
// 密码加密用的MD5
const md5 = require('blueimp-md5')

// 对要存储的用户进行约定（规则）
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    phone: String,
    create_time: { type: Number, default: Date.now },
    role_id: String,
    name:String
})
// 生成用户（模型）
const UserModel = mongoose.model('users', userSchema)

// 管理员账户
UserModel.findOne({ username: 'admin' }).then(user => {
    if (!user) {
        UserModel.create({ username: 'admin', password: md5('admin') }).then(user => {
            console.log("初始化用户：admin")
        })
    }
})

// （导出模型）
module.exports = UserModel