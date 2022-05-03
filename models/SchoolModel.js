const mongoose = require('mongoose')
// 定义规则
const schoolSchema = new mongoose.Schema({
    schoolname: { type: String, required: true }
})

const SchoolModel = mongoose.model('schools', schoolSchema)

module.exports = SchoolModel