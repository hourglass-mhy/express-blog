var express = require('express');
var router = express.Router();
var model = require('../models/articles.js')

//获取文章
router.get('/articles', model.getArticles);

//获取发表文章页面
router.get('/publish',function (req,res,next) {
    res.render('publish',{
        session: req.session
    });
})

//发表文章
router.post('/publish',model.postPublish)

//根据文章id 发表评论
router.post('/comment',model.postComment)

module.exports = router;
