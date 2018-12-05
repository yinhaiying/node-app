const express = require('express');
const exphbs  = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override')
const mongoose = require('mongoose');

const session = require('express-session');
const flash = require('connect-flash');

const idea = require('./routes/ideas');
const users = require('./routes/users');

const path = require('path');

const passport = require('passport')
require('./config/passport')(passport);



const db = require('./config/database')
mongoose.connect(db.mongoURL)
  .then(function(){
    console.log('连接成功')
  })
  .catch(function(){
    console.log('连接失败')
  });

//引入模型
require('./models/Idea');
const Idea = mongoose.model('ideas');

const app = express();

//使用静态文件
app.use(express.static(path.join(__dirname,'public')));


//使用中间件
app.use(methodOverride('_method'));

//使用session和connect-flash中间件
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

//使用passport中间件
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

//设置flash，这样的话在任何地方都可以使用

app.use((req,res,next) => {
  //res.locals.xxx定义全局变量
  //使用req.flash传递信息，flash是配合redirect一起使用的，一般在跳转前使用
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();

})


//handlebars 中间件
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));

app.set('view engine', 'handlebars');

//配置路由

app.get('/',(req,res) => {
  const title = "大家好，我是海因斯坦"
  res.render('index',{
    title:title
  });
});

app.get('/about',(req,res) => {
  res.render('about');
});


//使用idea routes
//这里的/表示根目录，之后的router.get(/idea)都是在这个根目录下进行组合的
app.use('/',idea);
app.use('/',users);



const port =process.env.PORT || 5000;
app.listen(port,() => {
  console.log('server starts at http://localhost:'+port);
})
