var db = require('./db.js');
var md5 = require('./md5.js')

exports.postSignin = function (req,res,next) {
    let {username,password } = req.body;
    //查询数据库 查看用户是否存在
    db.find('userinfo',{username: username},function (err,result) {
        if (err) {
            throw  err;
            return
        }
        if ( result.length == 0 ) { //用户不存在
            res.json({
                code: 2001,
                session: req.session,
                message: '用户不存在'
            });
            return
        } else if (result.length > 0 ) { //用户存在
            //MD5加密密码 和数据库中的密码进行比对
            var md5Password = md5(md5(password).substr(11,7) + md5('123456'));
            if (username === result[0].username && md5Password ===  result[0].password) { // 用户名和密码正确
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
            } else { // 密码不正确
                res.json({
                    code: 400,
                    session: req.session,
                    message: '用户名或者密码不正确'
                })
            }
        }
    })
}