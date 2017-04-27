var express = require('express');
var router = express.Router();
var https = require('https');
var User = require('../models/users.js');
var mids = require('../mids');

router.get('/profile', mids.requiresLogin, function(req, res, next) {
  User.findById(req.session.userId)
    .exec(function(error, user) {
        if (error) {
            return next(error);
        } else {
            return res.render('profile', { 
                  name: user.name
                , email: user.email
            });
        }
    });
});

router.get('/signup', function(req, res, next) {
  res.render('signup');
});

router.post('/signup', function (req, res, next) {
  
    if (  req.body.name &&
          req.body.email &&
          req.body.password &&
          req.body.confirmPassword  ) {
              
        if (req.body.password !== req.body.confirmPassword) {
            var err = new Error("Passwords must match, try again!");
            err.status = 400;
            return next(err);
        } else {
            var userData = new User({
                  name: req.body.name
                , email: req.body.email
                , password: req.body.password
                , confirmPassword: req.body.confirmPassword
                , created_at: req.body.created_at
            });
            User.create(userData, function(error, user) {
               if (error) {
                   return next(error);
               } else {
                   req.session.userId = user._id;
                   return res.redirect('/profile');
               }
            });
        }
        
    } else {
        var err = new Error('All fields required');
        err.status = 400;
        return next(err);
    }
});

router.get('/login', function(req, res, next) {
    res.render('login');
});

router.post('/login', function(req, res, next) {
    if (req.body.email && req.body.password) {
        User.authenticate(req.body.email, req.body.password, function(error, user) {
           if (error || !user) {
               var err = new Error('Wrong email or password');
               err.status = 401;
               return next(err);
           } else {
               req.session.userId = user._id;
               return res.redirect('/profile');
           }
        });
    } else {
        var err = new Error('Email and password are required');
        err.status = 401;
        return next(err);
    }
});

router.get('/logout', function(req, res, next) {
    if (req.session) {
       req.session.destroy(function(err) {
           if (err) {
               return next(err);
           } else {
               return res.redirect('/');
           }
       });
    } 
});

router.get('/lookup', function(req, res){
  var word = req.query.search;
  var options = {
    host: 'od-api.oxforddictionaries.com',
    path: '/api/v1/entries/en/' + word + '/synonyms;antonyms',
    port: '443',
    headers: {
      'Accept': 'application/json',
      'app_id': 'd1dfedcf',
      'app_key': '70e31c22311c5376ebeaed1471cd86f2'
    }
  };
  var callback = function(response) {
    var str = '';
    response.on('data', function(chunk) {
      str += chunk;
    });
    response.on('end', function() {
      res.send(str);
    });
  };
  var request = https.request(options, callback);
  request.end();
});

router.get('/all', function(req, res){
  User.find({}, 'name email', function(err, users){
    if(err) {
      console.log(err);
    } else{
      res.render('all', {'users' : users});
    }
  });
});

router.get('/', function(req, res, next) {
  res.render('index');
});

module.exports = router;