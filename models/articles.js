var db = require('./db.js');
const moment = require('moment');
const  ObjectId = require('mongodb').ObjectId;
const path = require('path');

//发表文章  入库
exports.postPublish = function (req,res,next) {
    let { title , content } = req.body,
        userid = req.session.userid,
        username = req.session.username;

    //根据用户id查询用户的头像
    db.find('userinfo',{"_id": ObjectId(userid)},function (err,result) {
        if (err) {
            throw err;
            return
        }
        //保存文章信息
        var file_name = path.basename(result[0].filePath);
        var doc = {
            title: title,
            content: content,
            userid: userid,
            username: username,
            file_name: file_name,
            create_time: moment().format('YYYY-MM-DD HH:mm:ss')
        }
        db.insertOne('articles',doc,function (err,result) {
            if (err) {
                res.json({
                    code: 500,
                    message: '发表文章失败',
                })
            }
            res.json({
                code:200,
                message:'发表文章成功'
            })

        })

    })

}

//获取文章
exports.getArticles = function (req,res,next) {
    if (req.query.id) {// 根据文章id进行查询
        console.log('aaa',req.query.id);
        db.find('articles',{'_id': ObjectId(req.query.id)},function (err,articles) {
            var articles = articles;
            //根据文章id查询所有评论
            db.find('comments',{'article_id': req.query.id},function (err,comments) {
                res.render('singleArticle',{
                    session: req.session,
                    articles: articles,
                    comments: comments
                })
            })

        })
    } else if (req.query.userid) { //根据用户id进行查询
        db.find('articles',{'userid': req.query.userid},function (err,articles) {
            res.render('myArticle',{
                session: req.session,
                articles: articles,
            })
        })

    }else {// 查询所有
        db.find('articles',{},function (err,result) {
            res.render('articles',{
                session: req.session,
                result: result
            })
        })

    }
}

//发表评论
exports.postComment = function (req,res,next) {
    console.log('comment',req.body)
    let { comment, article_id} = req.body,
        userid = req.session.userid,
        username = req.session.username;

    //查找该评论人的信息
    db.find('userinfo',{"_id": ObjectId(userid)},function (err,result) {
        if (err) {
            throw err;
            return
        }
        var file_name = path.basename(result[0].filePath);
        let doc = {
            comment: comment, //评论内容
            username: username, // 评论人
            userid: userid, // 评论人id
            create_time: moment().format('YYYY-MM-DD HH:mm:ss'),// 评论时间
            article_id: article_id, // 评论的文章id
            file_name: file_name // 评论人头像
        };
        //评论入库
        db.insertOne('comments',doc,function (err,result) {
            if (err) {
                res.json({
                    code: 500,
                    message: '发表评论失败'
                })
            }
            res.json({
                code: 200,
                message: '发表评论成功'
            })

        })
    })
}
