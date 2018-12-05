
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false })

const mongoose = require('mongoose');

//引入模型
require('../models/User');
const User = mongoose.model('users');

const router = express.Router();

//用户的登陆和注册
router.get('/users/login',(req,res) => {
  res.render('users/login');
});

router.get('/users/register',(req,res) => {
  res.render('users/register');
});

router.post('/users/register',urlencodedParser,(req,res) => {
  let errors = [];
  console.log(req.body)
  if(req.body.password !== req.body.password2){
    errors.push({
      text:'两次的密码不一致'
    });
  }

  if(req.body.password.length < 4){
    errors.push({
      text:'密码的长度不能小于4位'
    });
  }

  if(errors.length > 0){
    res.render('users/register',{
      errors:errors,
      name:req.body.name,
      email:req.body.email,
      password:req.body.password,
      password2:req.body.password2,
    })
  }else{


    User.findOne({email:req.body.email})
      .then((user) => {
        if(user){
          req.flash('error_msg',"邮箱已经存在，请更换邮箱注册");
          res.redirect('/users/register')
        }else{
          const newUser = new User({
            name:req.body.name,
            email:req.body.email,
            password:req.body.password
          });
          //加密
          const saltRounds = 10;  //密码强度
          const myPlaintextPassword = req.body.password; //加密对象
          bcrypt.genSalt(saltRounds, (err, salt) => {
            bcrypt.hash(myPlaintextPassword, salt, (err, hash) => {
              if(err){
                throw err;
              }else{
                //hash是加密后的密码
                newUser.password = hash;
                newUser.save()
                  .then(()=>{
                    req.flash('success_msg',"注册成功");
                    res.redirect('/users/login')
                  })
                  .catch(() => {
                    req.flash('error_msg',"注册失败");
                    res.redirect('/users/register')
                  })
              }
            });
          });




        }
      })

  }



});

router.post('/users/login',urlencodedParser,(req,res,next) => {
  //使用passport进行登陆验证

  passport.authenticate('local', {
    successRedirect:'/ideas',
    failureRedirect: '/users/login',
    failureFlash:true
  })(req,res,next)



  // 查询数据库
  // User.findOne({email:req.body.email})
  //   .then((user) => {
  //     if(!user){
  //       req.flash('error_msg',"用户名不存在");
  //       res.redirect('/users/login');
  //       return ;
  //     }else{
  //     //  用户存在,密码验证
  //       bcrypt.compare(req.body.password,user.password, (err, isMatch) => {
  //         if(err){
  //           throw err;
  //         }else{
  //           console.log(isMatch)
  //           if(isMatch){
  //             req.flash('success_msg',"登陆成功");
  //             res.redirect('/ideas');
  //           }else{
  //             req.flash('error_msg',"密码错误");
  //             res.redirect('/users/login');
  //           }
  //         }
  //       });
  //     }
  //   })
});

router.get('/users/logout',(req,res) => {
  req.logout();
  req.flash('success_msg',"退出登陆成功");
  res.redirect('/users/login')
});

module.exports = router;
