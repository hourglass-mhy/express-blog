var db = require('./db.js');

exports.postSignin = function (req,res,next) {
    let {username,password } = req.body;
    //查询数据库 查看用户是否存在
    db.find('userinfo',{username: username},function (err,result) {
        if (err) {
            throw  err;
            return
        }
        if (result.length > 0 && username === result[0].username && password ===  result[0].password) {
            //将用户信息保存到session中
            req.session.username = result[0].username;
            req.session.userid = result[0]._id;

            res.json({
                code: 200,
                message: '登录成功',
                session: req.session,
                result: {
                    username: result[0].username
                }
            })
        } else {
            res.json({
                code: 400,
                session: req.session,
                message: '用户名或者密码不正确'
            })
        }
    })
}