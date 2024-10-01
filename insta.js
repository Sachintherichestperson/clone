const express = require("express");
const app = express();
const http = require('http');
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server);
const path = require("path");
const cookieParser = require("cookie-parser");
const usermodel = require("./models/usermodel.js");
const photomodel = require("./models/photomodel");
const upload = require("./config/multer");
const session = require('express-session');
const jwt = require("jsonwebtoken");
const isloggedin = require("./middleware/isloggedin.js")

const jwt_secret = "Sachin"


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());

app.get("/", function(req, res){
    res.render("login")
})
app.post("/register/user",async function(req, res){
    try{
        let {username, password, email} = req.body;

        const newuser = await usermodel.create({
            username,
            email,
            password,
        })
        const token = jwt.sign({email: email}, jwt_secret)
        res.cookie("insta", token)
        res.redirect("/home")       
    }catch(err){
        console.log(err)
        res.redirect("/")
    }
})

app.get("/home", isloggedin, async (req, res) => {
    try {
        const user = await photomodel.find({})
        .populate({
            path: 'name',
            select: 'username'
        })
        console.log(user)
        res.render("front", {posts: user});
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching posts");
    }
});


app.get("/profile",isloggedin, async function(req, res) {
    const username = req.user.username;
    let user =  await usermodel
    .findOne({email: req.user.email})
    .populate({path: "profile",
        select: 'post'
    });
    res.render("profile", {posts: user.profile, user: req.user})
});


app.get("/upload",function(req, res){
    res.render("upload")
})

app.post("/upload/post",isloggedin, upload.single("post"),async function(req, res){
    try{
        let { caption } = req.body;
        console.log(req.body)

        const postphoto = await photomodel.create({
            post: req.file.buffer,
            caption,
            name: req.user._id
        })
        const user = await usermodel.findOne({ email: req.user.email});

        user.profile.push(postphoto._id)
        await user.save();
        res.redirect("/profile")
    }catch(err){
        res.send(err)
    }
})


app.get("/chat", function(req, res){
    res.render("chat")
})

server.listen(8800);
