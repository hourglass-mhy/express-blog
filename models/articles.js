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
    if (req.query.id) {// 根据文章id进行查询 - 查询评论 浏览量
        // 浏览量
        var pv = 0;

        db.find('articles',{'_id': ObjectId(req.query.id)},function (err,articles) {
            var articles = articles;
            //每次先去查询浏览量 再+1
            pv = articles[0].pv || 0;
            pv ++ ;
            articles[0].pv = pv;

            //同步数据  更新浏览量
            db.updateMany('articles',{'_id': ObjectId(req.query.id)},{$set:{'pv': pv}},function (err,result) {
                if (err) {
                    throw  err;
                    return
                }
                //根据文章id查询所有评论
                db.find('comments',{'article_id': req.query.id},{sortObj:{'create_time': -1}},function (err,comments) {
                    if (err) {
                        throw  err;
                        return
                    }
                    res.render('singleArticle',{
                        session: req.session,
                        articles: articles,
                        comments: comments
                    })

                })
            });
        })
    } else if (req.query.userid) { //根据用户id进行查询- 查询评论
        db.find('articles',{'userid': req.query.userid},{sortObj:{'create_time': -1}},function (err,articles) {
            var newArticles = articles.concat();

            db.find('comments',{},function (err,comments) {
                newArticles.forEach(article => {
                    var  comments_num = 0;
                    comments.forEach(comment => {
                        if (article._id == comment.article_id) {
                            comments_num ++;
                        }
                    })
                    article.comments_num = comments_num;
                });
                res.render('myArticle',{
                    session: req.session,
                    articles: newArticles
                })
            })
        })
    } else {// 查询所有 - 查询评论
        db.find('articles',{},{sortObj:{'create_time': -1}},function (err,articles) {
            var newArticles = articles.concat();
            db.find('comments',{},function (err,comments) {
                newArticles.forEach(article => {
                    var  comments_num = 0;
                    comments.forEach(comment => {
                        if (article._id == comment.article_id) {
                            comments_num ++;
                        }
                    })
                    article.comments_num = comments_num;
                });
                res.render('articles',{
                    session: req.session,
                    result: newArticles,
                })
            })
        })
    }
}

//发表评论
exports.postComment = function (req,res,next) {
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

//删除评论
exports.deleteComment = function (req,res,next) {
    var { comment_id }   = req.body
    db.deleteMany('comments',{'_id': ObjectId(comment_id)},function (err,result) {
        if (err) {
            throw err;
            return;
        }
        res.json({
            code: 200,
            message: '删除成功'
        })
    })
}

//删除文章
exports.deleteArticle = function (req,res,next) {
    var { article_id } = req.body;
    db.deleteMany('articles',{'_id': ObjectId(article_id)},function (err,result) {
        if (err) {
            throw err;
            return;
        }
        res.json({
            code: 200,
            message: '删除成功'
        })
    })
}