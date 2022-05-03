const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema({
    name: {  //姓名
        type: String,
        required: true
    },
    gender: {  //性别
        type: String,
        required: true
    },
    school: String,  //学校
    major: String,  //专业
    grade: String,  //年级
    education: String,  //学历
    direction: {  //学习方向
        type: String,
        required: true
    },
    id_number: String,  //身份证号
    phone: {  //联系电话
        type: String,
        required: true
    },
    parent: String,  //家长姓名
    parent_phone: String,  //家长电话
    address: String,  //家庭地址
    qq: String,  //qq
    class: {  //所在班级
        type: String,
        required: true
    },
    admission_data: String,  //入学时间
    teacher_id: {  //授课教师
        type: String,
        required: true
    },
    manager_id: {  //辅导员
        type: String,
        required: true
    },
    pictures: Array,  //照片
    note: String  //备注
})

const StudentModel = mongoose.model('students', studentSchema);
module.exports = StudentModel;