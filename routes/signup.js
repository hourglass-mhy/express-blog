var express = require('express');
var router = express.Router();
var model = require('../models/signup.js')

router.get('/signup', function(req, res, next) {
  res.render('signup',{
    session: req.session
  });
});

router.post('/signup',model.postSignup)

module.exports = router;