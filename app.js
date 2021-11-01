//jshint esversion:6
require('dotenv').config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const md5 = require("md5");
const bcrypt = require("bcrypt");

const saltRounds = 10;

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/userDB");


// ******************************* LEVEL 2 Security - Encryption ***************************** //
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]}); // used for LEVEL 2 security 

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});



// ******************************* LEVEL 1 Security - Registration & Login ***************************** //
/*
app.post("/register", function(req, res){
    const newUser = new User({
        email: req.body.username,
        password: md5(req.body.password) // ******************************* LEVEL 3 Security - Hashing (md5 hash function) ***************************** //
    });
    newUser.save(function(err){
        if(!err){
            res.render("secrets");
        }
        else{
            console.log(err);
        }
    });
});


app.post("/login", function(req, res){
    const username = req.body.username;
    const password = md5(req.body.password);

    User.findOne({email: username}, function(err, foundUser){
        if(err){
            console.log(err);
        }
        else{
            if(foundUser){
                if(foundUser.password === password){
                    res.render("secrets");
                }
            }
        }
    });
}); 
*/




// ******************************* LEVEL 4 Security - Salting And Hashing (bcrypt hash function) ***************************** //
app.post("/register", function(req, res){

    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        const newUser = new User({
            email: req.body.username,
            password: hash
        });
        newUser.save(function(err){
            if(!err){
                res.render("secrets");
            }
            else{
                console.log(err);
            }
        });
    });
});


app.post("/login", function(req, res){
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, function(err, foundUser){
        if(err){
            console.log(err);
        }
        else{
            if(foundUser){
                bcrypt.compare(password, foundUser.password, function(err, result) {
                    // result == true
                    if(result === true){
                        res.render("secrets");
                    }
                });
            }
        }
    });
}); 



app.listen(3000, function(){
    console.log("Server started on port 3000");
});


