
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false })

const mongoose = require('mongoose');

//引入模型
require('../models/Idea');
const Idea = mongoose.model('ideas');

const router = express.Router();


//导航守卫
const {ensureAuthenticated} = require('../helpers/auth');




//添加
router.get('/ideas/add',ensureAuthenticated,(req,res) => {
  res.render('ideas/add');
});

//查
router.get('/ideas',ensureAuthenticated,(req,res) => {
  //获取数据库的数据
  Idea.find({user:req.user.id})
    .sort({date:"desc"})
    .then((ideas) => {
      res.render('ideas/index',{
        ideas:ideas
      });
    })
});

//编辑 改

router.get('/ideas/edit/:id',ensureAuthenticated,(req,res) => {
  //可以获取到id,通过id获取到数据
  Idea.findOne({
    _id:req.params.id
  })
    .then(idea => {
      if(idea.user !== req.user.id){
        req.flash('error_msg',"非法操作");
        res.redirect('/ideas')
      }else{
        res.render('ideas/edit',{
          idea:idea
        });
      }

    })

});

router.put('/ideas/:id',urlencodedParser,(req,res) => {
  Idea.findOne({_id:req.params.id})
    .then((idea) => {
      idea.title = req.body.title;
      idea.details = req.body.details;
      idea.save()
        .then(() => {
          req.flash('success_msg',"数据编辑成功")
          res.redirect('/ideas/')
        })

    })
});




router.post('/ideas',urlencodedParser,(req,res) => {
  // 后端进行验证
  let errors = [];
  if(!req.body.title){
    errors.push({text:'请输入标题'})
  }
  if(!req.body.details){
    errors.push({text:'请输入详情'})
  }
  if(errors.length > 0){
    res.render('ideas/add',{
      title:req.body.title,
      details:req.body.details,
      errors:errors
    });
  }else{
    const newUser = {
      title:req.body.title,
      details:req.body.details,
      user:req.user.id
    }
    console.log(req)
    new Idea(newUser)
      .save()
      .then(function(){
        req.flash('success_msg',"数据添加成功")
        res.redirect('/ideas');
      })
  }

});

//实现删除
router.delete('/ideas/:id',(req,res) => {
  Idea.remove({
    _id:req.params.id
  })
    .then(() => {
      req.flash('success_msg',"数据删除成功")
      res.redirect('/ideas/');
    })
});

module.exports = router;
