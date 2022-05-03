const express = require('express');
const md5 = require('blueimp-md5')
const UserModel = require('../models/UserModel')
const RoleModel = require('../models/RoleModel');
const SchoolModel = require("../models/SchoolModel")
const MajorModel = require('../models/MajorModel.js')
const ClassModel = require('../models/ClassModel.js')
const StudentModel = require('../models/StudentModel.js')

const router = express.Router();
// 登录
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    // 在数据库内比对
    // find()出来的是一个数组对象   findOne()出来的是查到的第一个对象 
    UserModel.findOne({ username, password: md5(password) })
        .then(user => {
            if (user) {  //登录成功
                console.log(user);
                if (user.role_id) {
                    RoleModel.findOne({ _id: user.role_id })
                        .then(role => {
                            
                            user._doc.role = role;
                            res.send({ status: 0, data: user, msg: '登录成功' })
                        })
                } else {
                    // 添加角色信息
                    user._doc.role = { menu: [] }
                    res.send({ status: 0, data: user, msg: '登录成功' })
                }
            } else {  //登录失败
                res.send({ status: 1, msg: '账户或密码错误' })
            }
        }).catch(error => {
            console.log('登录异常');
            res.send({ status: 1, msg: '异常，请重试' })
        });
})

// 校验密码是否正确
router.post('/manage/user/pwd', (req, res) => {
    var body = req.body;
    UserModel.findOne({ _id: body.userId, password: md5(body.password) })
        .then(user => {
            if (!user) {
                return res.send({ status: 1, msg: '密码不正确' })
            }
            return res.send({ status: 0, data: user })
        })
})

// 修改密码
router.put('/manage/user/pwd', (req, res) => {
    var id = req.body.userId;
    UserModel.findOne({ _id: id }).then(user => {
        if (!user) {
            return res.send({ status: 1, msg: '用户密码错误' })
        }
        user.password = md5(req.body.password)
        UserModel.findByIdAndUpdate(id, user).then(() => {
            return res.send({ status: 0, msg: '修改密码成功' })
        })
    })
})

//获取角色列表

router.get('/manage/role/list', (req, res) => {
    RoleModel.find().then(roles => {
        res.send({ status: 0, data: roles, msg: '获取角色列表成功' })
    }).catch(error => {
        console.error('获取角色列表异常', error)
        res.send({
            status: 1, msg: '获取角色列表异常，请重试'
        })
    })
})

//新增角色
router.post('/manage/role/add', (req, res) => {
    const { name } = req.body;
    RoleModel.create({ name }).then(role => {
        res.send({ status: 0, data: role, msg: '新增角色成功' })
    }).catch(error => {
        console.error('添加角色列表异常', error)
        res.send({
            status: 1, msg: '添加角色列表异常，请重试'
        })
    })
})

//更新角色
router.post('/manage/role/update', (req, res) => {
    const role = req.body;
    role.auth_time = Date.now();
    RoleModel.findOneAndUpdate({ _id: role._id }, role)
        .then(oldRole => {
            console.log(oldRole);
            res.send({ status: 0, msg: '更新角色成功' })
        }).catch(error => {
            res.send({
                status: 1, msg: '更新角色异常，请重试'
            })
        })
})


//获取用户列表
router.get('/manage/user/all', (req, res) => {
    UserModel.find({ username: { '$ne': 'admin' } })
        .then(users => {
            res.send({ status: 0, data: users, msg: '获取所有用户成功' })
        }).catch(error => {
            res.send({ status: 1, msg: '获取所有用户列表异常，请重试' })
        })
})

// 获取分页用户列表,$ne代表不等于
router.post('/manage/user/list', (req, res) => {
    let page = req.body.page || 1
    let size = req.body.size || 5
    UserModel.find({ username: { '$ne': 'admin' } })
        .then(users => {
            // total条数据
            let count = users.length;
            // skip()是跳过的意思  limit()限制长度

            // 这句代码的作用是要取到第几个页面的数据，也就是说，假如取第一页数据，就需要跳过0页，如果取第二页数据，就需要跳过第一页，且跳过5个数据，也就是(page - 1) * parseInt(size)个数据。跳过5个数据后在截取剩下的数据，同时页限制每次取到的数据条数，也就是parseInt(size)个数据
            UserModel.find({ username: { '$ne': 'admin' } })
                .skip((page - 1) * parseInt(size)).limit(parseInt(size)).exec((err, data) => {
                    RoleModel.find().then(roles => {
                        res.send({ status: 0, data: { total: count, data, roles }, msg: '获取用户列表成功' })
                    })
                })
        }).catch(error => {
            res.send({ status: 1, msg: '获取用户列表异常，请重新重试' })
        })
})

// 添加用户
router.post('/manage/user/add', (req, res) => {
    const { username, password } = req.body
    UserModel.findOne({ username }).then(user => {
        if (user) {
            res.send({ status: 1, msg: '此用户已存在' })
        } else {
            UserModel.create({ ...req.body, password: md5(password || 'buka') })
                .then(user => {
                    res.send({ status: 0, data: user, msg: '添加用户成功' })
                }).catch(error => {
                    res.send({ status: 1, msg: '添加用户异常，请稍后重试' })
                })
        }
    })

})

// 通过id查找一条用户
router.get('/manage/user/find', (req, res) => {
    const user = req.query
    UserModel.findById({ _id: user._id })
        .then(data => {
            res.send({ status: 0, data, msg: '查找用户成功' })
        }).catch(error => {
            res.send({ status: 1, msg: '根据Id查找用户异常，请重新尝试' })
        })
})

// 更新用户
router.post('/manage/user/update', (req, res) => {
    const user = req.body;
    UserModel.findByIdAndUpdate({ _id: user._id }, user)
        .then(oldUser => {
            const data = Object.assign(oldUser, user)
            res.send({ status: 0, data, msg: '更新用户成功' })
        }).catch(error => {
            res.send({ status: 1, msg: '更新异常，请重新尝试' })
        })
})

// 删除用户
router.post("/manage/user/delete", (req, res) => {
    const { userId } = req.body;
    UserModel.deleteOne({ _id: userId }).then(user => {
        res.send({ status: 0, msg: '删除用户成功' })
    }).catch(error => {
        res.send({ status: 1, msg: '删除用户异常，请重新尝试' })
    })
})

// 获取权限列表
router.post('/menus', (req, res) => {
    const { roleId } = req.body
    RoleModel.findOne({ _id: roleId }).then(role => {
        res.send({ status: 0, data: { menu: role.menus }, msg: '获取权限成功' })
    }).catch(error => {
        res.send({ status: 1, msg: '获取权限列表异常，请重新尝试' })
    })
})

// 获取学校列表 带分页的
router.post('/manage/school/list', (req, res) => {
    let page = req.body.page || 1;
    let size = req.body.size || 5;
    SchoolModel.find().then(schools => {
        let count = schools.length;
        SchoolModel.find().skip((page - 1) * parseInt(size)).limit(parseInt(size)).exec((err, data) => {
            res.send({ status: 0, data: { total: count, data }, msg: '获取学校成功' })
        })
    }).catch(err => {
        res.send({ status: 1, msg: '获取学校列表失败，请重新尝试' })
    })
})

// 获取所有学校列表
router.get('/manage/school/all', (req, res) => {
    SchoolModel.find().then(schools => {
        res.send({ status: 0, data: schools, msg: '获取所有学校列表成功' })
    }).catch(error => {
        res.send({ status: 1, msg: '获取所有学校列表异常' })
    })
})

// 添加学校
router.post('/manage/school/add', (req, res) => {
    const { schoolname } = req.body
    // SchoolModel.find({ schoolname }).then(school => {
    //     if (school.length) {
    //         res.send({ status: 1, msg: '学校已经存在' })
    //     } else {
    //         SchoolModel.create({ ...req.body }).then(school => {
    //             res.send({ status: 0, data: school })
    //         }).catch(error => {
    //             res.send({ status: 1, msg: '添加学校异常，请重新尝试' })
    //         })
    //     }
    // }).catch(error => {
    //     res.send({ status: 1, msg: '添加学校异常，请重新尝试' })
    // })

    SchoolModel.find({ schoolname }).then(school => {
        if (school.length) {
            res.send({ status: 1, msg: '学校已经存在' })
            return new Promise(() => { })
        } else {
            return SchoolModel.create({ ...req.body })
        }
    }).then(school => {
        res.send({ status: 0, data: school, msg: '添加学校成功' })
    }).catch(error => {
        res.send({ status: 1, msg: '添加学校异常，请重新尝试' })
    })
})

// 通过id查询学校
router.get('/manage/school/find', (req, res) => {
    const school = req.query;
    SchoolModel.findById({ _id: school._id }).then(data => {
        res.send({ status: 0, data, msg: '查找学校成功' })
    }).catch(error => {
        res.send({ status: 1, msg: '根据id找学校异常，请重新尝试' })
    })
})

// 更新学校
router.post('/manage/school/update', (req, res) => {
    const school = req.body;
    SchoolModel.findOneAndUpdate({ _id: school._id }, school)
        .then(oldSchool => {
            const data = Object.assign(oldSchool, school)
            res.send({ status: 0, data, msg: '更新学校成功' })
        }).catch(error => {
            res.send({ status: 1, msg: '更新异常，请重新尝试' })
        })

})

// 删除学校
router.post('/manage/school/delete', (req, res) => {
    const { schoolId } = req.body
    SchoolModel.deleteOne({ _id: schoolId })
        .then(doc => {
            res.send({ status: 0, msg: '删除学校成功' })
        }).catch(error => {
            res.send({ status: 1, msg: '删除学校信息异常，请稍后重试' })
        })
})

// 获取专业列表
router.post('/manage/major/list', (req, res) => {
    let page = req.body.page || 1
    let size = req.body.size || 5;
    MajorModel.find().then(majors => {
        let count = majors.length;
        MajorModel.find().skip((page - 1) * parseInt(size)).limit(parseInt(size)).exec((err, data) => {
            res.send({ status: 0, data: { total: count, data: data }, msg: '获取专业列表成功' })
        })
    }).catch(err => {
        res.send({ status: 1, msg: '获取专业列表失败，请重新尝试' })
    })
})

// 获取所有专业
router.get('/manage/major/all', (req, res) => {
    MajorModel.find().then(majors => {
        res.send({ status: 0, data: majors, msg: '获取所有专业成功' })
    }).catch(error => {
        res.send({ status: 1, msg: '获取所有专业列表失败，请重新尝试' })
    })
})

// 添加专业
router.post('/manage/major/add', (req, res) => {
    const { name } = req.body;
    MajorModel.findOne({ name }).then(major => {
        if (major) {
            res.send({ status: 1, msg: '专业已经存在' })
            return new Promise(() => { })
        } else {
            return MajorModel.create({ ...req.body })
        }
    }).then(data => {
        res.send({ status: 0, data, msg: '添加专业成功' })
    }).catch(error => {
        res.send({ status: 1, msg: '添加专业失败，请重新尝试' })
    })
})

// 根据id查询专业
router.get('/manage/major/find', (req, res) => {
    const major = req.query;
    MajorModel.findById({ _id: major._id }).then(data => {
        res.send({ status: 0, data, msg: '查找专业成功' })
    }).catch(error => {
        res.send({ status: 1, msg: '根据id找专业异常，请重新尝试' })
    })
})

// 更新专业
router.post('/manage/major/update', (req, res) => {
    const major = req.body;
    MajorModel.findOneAndUpdate({ _id: major._id }, major)
        .then(oldMajor => {
            const data = Object.assign(oldMajor, major)
            res.send({ status: 0, data, msg: '更新专业成功' })
        }).catch(error => {
            res.send({ status: 1, msg: '更新异常，请重新尝试' })
        })

})

// 删除专业
router.post('/manage/major/delete', (req, res) => {
    const { majorId } = req.body
    MajorModel.deleteOne({ _id: majorId })
        .then(data => {
            res.send({ status: 0, msg: '删除专业成功' })
        }).catch(error => {
            res.send({ status: 1, msg: '删除专业信息异常，请稍后重试' })
        })
})

// 获取全部班级
router.get('/manage/class/all', (req, res) => {
    ClassModel.find().then(data => {
        res.send({ status: 0, data, msg: '获取所有班级成功' })
    }).catch(error => {
        res, send({ status: 1, msg: '获取全部班级列表异常，请重新尝试' })
    })
})

// 获取班级列表
router.post('/manage/class/list', (req, res) => {
    let page = req.body.page || 1
    let size = req.body.size || 5;
    let searchMap = req.body.searchMap || {}
    let obj = {};
    searchMap.teacher_id ? obj["teacher_id"] = searchMap.teacher_id : obj;
    searchMap.manager_id ? obj["manager_id"] = searchMap.manager_id : obj;

    ClassModel.find(obj).then(classs => {
        let count = classs.length;
        ClassModel.find(obj).skip((page - 1) * parseInt(size)).limit(parseInt(size)).exec((err, data) => {
            res.send({ status: 0, data: { total: count, data: data }, msg: '获取班级列表成功' })
        })
    }).catch(err => {
        res.send({ status: 1, msg: '获取班级列表失败，请重新尝试' })
    })
})

//添加班级
router.post('/manage/class/add', (req, res) => {
    const { name } = req.body;
    ClassModel.findOne({ name }).then(data => {
        if (data) {
            res.send({ status: 1, msg: '此班级已经存在' })
            return new Promise(() => { })
        } else {
            return ClassModel.create({ ...req.body })
        }
    }).then(data => {
        res.send({ status: 0, data, msg: '添加班级成功' })
    }).catch(error => {
        res.send({ status: 1, msg: '添加班级失败，请重新尝试' })
    })
})

// 通过id查询班级
router.get('/manage/class/find', (req, res) => {
    const c = req.query;
    ClassModel.findById({ _id: c._id }).then(data => {
        res.send({ status: 0, data, msg: '查找班级成功' })
    }).catch(error => {
        res.send({ status: 1, msg: '根据id找班级异常，请重新尝试' })
    })
})

// 更新班级
router.post('/manage/class/update', (req, res) => {
    const c = req.body;
    ClassModel.findOneAndUpdate({ _id: c._id }, c)
        .then(oldClass => {
            const data = Object.assign(oldClass, c)
            res.send({ status: 0, data, msg: '更新班级成功' })
        }).catch(error => {
            res.send({ status: 1, msg: '更新班级异常，请重新尝试' })
        })

})

// 删除班级
router.post('/manage/class/delete', (req, res) => {
    const { classId } = req.body
    ClassModel.deleteOne({ _id: classId })
        .then(data => {
            res.send({ status: 0, msg: '删除班级成功' })
        }).catch(error => {
            res.send({ status: 1, msg: '删除班级信息异常，请稍后重试' })
        })
})

// 获取学生列表
router.post('/manage/student/list', (req, res) => {
    let page = req.body.page || 1
    let size = req.body.size || 5;
    let searchMap = req.body.searchMap;
    let obj = {};
    searchMap.name ? obj["name"] = searchMap.name : obj;
    searchMap.teacher_id ? obj["teacher_id"] = searchMap.teacher_id : obj;
    searchMap.manager_id ? obj["manager_id"] = searchMap.manager_id : obj;
    searchMap.direction ? obj["direction"] = searchMap.direction : obj;
    searchMap.class ? obj["class"] = searchMap.class : obj;

    StudentModel.find(obj).then(students => {
        let count = students.length;
        StudentModel.find(obj).skip((page - 1) * parseInt(size))
            .limit(parseInt(size)).exec((err, data) => {
                res.send({ status: 0, data: { total: count, data: data }, msg: '获取学生列表成功' })
            })
    }).catch(err => {
        res.send({ status: 1, msg: '获取学生列表失败，请重新尝试' })
    })
})

// 添加学生
router.post('/manage/student/add', (req, res) => {
    StudentModel.create({ ...req.body }).then(data => {
        res.send({ status: 0, data: data, msg: '添加学生成功' })
    }).catch(error => {
        res.send({ status: 1, msg: '添加学生信息异常，请重新尝试' })
    })
}),

    // 通过id查找学生
    router.get('/manage/student/find', (req, res) => {
        const student = req.query;
        StudentModel.findById({ _id: student._id }).then(data => {
            res.send({ status: 0, data, msg: '获取所有学生成功' })
        }).catch(error => {
            res.send({ status: 1, msg: '查找学生信息异常，请重新尝试' })
        })

    })

// 更新学生信息
router.post('/manage/student/update', (req, res) => {
    const student = req.body;
    StudentModel.findOneAndUpdate({ _id: student._id }, student)
        .then(oldStudent => {
            const data = Object.assign(oldStudent, student)
            res.send({ status: 0, data, msg: '更新学生信息成功' })
        }).catch(error => {
            res.send({ status: 1, msg: '更新学生信息异常，请重新尝试' })
        })
})

// 删除学生
router.post('/manage/student/delete', (req, res) => {
    const { studentId } = req.body;
    StudentModel.deleteOne({ _id: studentId })
        .then(doc => {
            res.send({ status: 0, msg: '删除学生成功' })
        }).catch(error => {
            res.send({ status: 1, msg: '删除学生信息异常，请重新尝试' })
        })
})

// 查询某一年的学员
router.post('/manage/student/date', (req, res) => {
    let { year } = req.body;
    year = year + '';
    StudentModel.aggregate([
        {
            $project: {
                year: { $substr: ['$admission_data', 0, 4] },
                month: { $substr: ['$admission_data', 5, 2] },
            }
        },
        { $match: { year } },
        { $group: { _id: "$month", count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
    ]).exec((err, data) => {
        return res.send({ status: 0, data })
    })
})

require('./file-upload')(router)
module.exports = router

