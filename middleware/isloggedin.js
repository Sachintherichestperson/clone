const jwt = require("jsonwebtoken");
const userModels = require("../models/usermodel");

module.exports = async function (req, res, next) {
    if(!req.cookies.insta){
        req.flash("error", "you need to be logged in");
        return res.redirect("/")
    }
    try{
        let decoded = jwt.verify(req.cookies.insta, "Sachin");
        let user = await userModels
        .findOne({email: decoded.email})
        .select("-password");
        req.user = user;
        next()
    } catch(error){
        req.flash("error", "something went wrong.");
        res.redirect("/")
    }
}