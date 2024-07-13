require('dotenv').config();
const express=require('express');
const expressLayout=require('express-ejs-layouts')
const methodOverride=require('method-override');
const cookieParser=require('cookie-parser')
const session=require('express-session')
const MongoStore=require('connect-mongo')
const bodyParser=require('body-parser')
const multer=require('multer')
const path = require('path');
const app=express();


app.use(express.static(path.join(__dirname, 'public')));
// app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


const connectDB=require('./server/config/db');
const { Store } = require('express-session');

//connect to DB
connectDB();

app.use(express.urlencoded({ extended: true })); // Add this line
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));



app.use(session({
    secret:process.env.JWT_SECRET,
    resave:false,
    saveUninitialized:true,
    store:MongoStore.create({
        mongoUrl:process.env.MONGODB_URI
    }),
}))








//templating engine
app.use(expressLayout);
app.set('layout','./layouts/main');

app.set('view engine','ejs');

const PORT=3000||process.env.PORT;

app.use('/',require('./server/Routers/main'))
app.use('/',require('./server/Routers/admin'))
app.listen(PORT,()=>{
    console.log(`${PORT} port is listening`);
})
