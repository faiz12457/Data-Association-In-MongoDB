import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "./models/user.js";
import { Post } from "./models/post.js";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
const saltrounds = 10;
const port = 3000;

const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
await mongoose.connect("mongodb://localhost:27017/userDB");

app.get("/", async (req, res) => {
  res.render("index");
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/profile", isLoggin, async (req, res) => {
  const { email } = req.user;
  const user = await User.findOne({ email }).populate("posts");

  res.render("profile", { user });
});

app.post("/post", isLoggin, async (req, res) => {
  const finduser = await User.findOne({ email: req.user.email });
  const { email, _id } = finduser;
  const { content } = req.body;

  const newPost = new Post({ postData: content, user: _id });
  await newPost.save();
  finduser.posts.push(newPost._id);
  await finduser.save();

  res.redirect("/profile");
});

app.post("/register", async (req, res) => {
  const { username, email, password, age } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    res.status(500).send("User with this email already exist");
  } else {
    const hashedPassword = await bcrypt.hash(password, saltrounds);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      age,
    });
    await newUser.save();
    const token = jwt.sign({ email, userId: newUser._id }, "thisisasecret");
    res.cookie("token", token);
    res.send("registered");
  }
});




app.get("/token", (req, res) => {
  const { token } = req.cookies;

  const decoded = jwt.verify(token, "thisisasecret");
  res.send(decoded);
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.send("Email or Password is invalid");
  }

  const match = await bcrypt.compare(password, user.password);
  if (match) {
    const token = jwt.sign({ email, userId: user._id }, "thisisasecret");
    res.cookie("token", token);

    res.status(200).redirect("/profile");
  } else {
    res.redirect("/login");
  }
});





app.get("/like/:id",isLoggin,async(req,res)=>{
    const {id}=req.params;
    
    const foundPost=await Post.findOne({_id:id});

    if(!foundPost) return res.send("Error");
   const {userId}=req.user;

    if(foundPost.likes.indexOf(userId)===-1){
        foundPost.likes.push(userId);
    }
    else{
            foundPost.likes.splice(foundPost.likes.indexOf(userId),1);
    }
  
  
    await foundPost.save();
    res.redirect("/profile")

})


app.listen(port, () => {
  console.log("Server is running on port 3000");
});

function isLoggin(req, res, next) {
  if (req.cookies.token == "") {
    return res.send("Your need to login");
  }

  const { token } = req.cookies;

  const decoded = jwt.verify(token, "thisisasecret");
  req.user = decoded;

  next();
}
