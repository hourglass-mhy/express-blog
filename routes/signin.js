var express = require('express');
var router = express.Router();
var model = require('../models/signin.js')

//获取登陆页面
router.get('/signin', function(req, res, next) {
  res.render('signin',{
    session: req.session
  });
});

//登陆提交
router.post('/signin',model.postSignin)

//登出
router.get('/signout',function (req,res,next) {
  req.session.username = null;
  req.session.userid = null;
  res.json({
    code: 200,
    session: req.session,
    message: '登出成功'
  })
})

module.exports = router;