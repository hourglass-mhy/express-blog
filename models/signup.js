var db = require('./db.js');
var formidable = require('formidable');
var path = require('path');
var fs = require('fs');
var moment = require('moment');
var md5 = require('./md5.js'); // 这是一个函数

exports.postSignup = function (req,res,next) {
	var form = new formidable.IncomingForm();
    form.uploadDir = path.normalize( __dirname + '/../' + 'tmp');//文件保存的临时目录为当前项目下的tmp文件夹 使用../ 能够进行路径的回退
    form.keepExtensions = true; //使用文件的原扩展名
    form.parse(req, function(err, fields, files) {
        if (err) {
            throw err
            return
        }

        var filePath = ''; // 用户上传的图片原始路径
        if (files.portrait) {
            filePath = files.portrait.path;
        };
        var fileExtName = path.extname(files.portrait.name); // 文件拓展名

        //文件上传的限制
        var maxSize = 1*1024*1024;
        if (files.portrait.size > maxSize) { // 文件大小限制
            fs.unlink(filePath,function (err) {
                if (err) {
                    throw err
                    return;
                }
            })
            res.json({
                code: 500,
                message: '该图片大小超过1M，上传失败'
            })
        } else if ( ('.jpg.jpeg.png.gif').indexOf(fileExtName.toLowerCase()) === -1 ) { // 判断文件类型是否允许上传
            fs.unlink(filePath,function (err) {
                if (err) {
                    throw err
                    return;
                }
            })
            res.json({
                code: 500,
                message: '不支持该类型的文件'
            })
        } else {
            //文件移动的目标文件夹，不存在则创建目标文件夹
            var targetDir = path.normalize(__dirname + '/../' + 'public/images/portrait');
            if (!fs.existsSync(targetDir)) {
                fs.mkdir(targetDir);
            }
            //目标目录存在  临时文件更名 保存到目标文件目录对应的相册中
            var fileName = new Date().getTime() + fileExtName; //以当前时间戳对上传文件进行重命名
            var targetPath = targetDir + '/' + fileName; // 最终存放的完整路径
            fs.rename(filePath, targetPath,function (err) {
                if (err) {
                    throw err;
                    return
                }
                //文件更名成功
                // md5加密密码 - 使用多层md5进行加密，防止进行枚举破译
                var password = md5(md5(fields.password).substr(11,7) + md5('123456'));
                var doc = {
                    username: fields.username,
                    password: password,
                    filePath: targetPath,
                    create_time: moment().format('YYYY-MM-DD HH:mm:ss')
                };
                db.insertOne('userinfo',doc,function (err,result) {
                    if (err) {
                        throw err
                        return
                    }
                    //注册成功
                    res.json({
                        code: 200,
                        message: '注册成功'
                    });
                })
            })
        }

    });
}