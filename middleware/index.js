//alll middleware
var Campground = require("../models/campground");
var Comment = require("../models/comment");

var middlewareObj = {};
middlewareObj.checkCampgroundOwnership = function (req, res, next) {

    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, function (err, campground) {
            if (err) {
                req.flash("error", "Does not exist");
                res.redirect("back");
            } else {
                //Mongoose Obj and String
                if (campground.author.id.equals(req.user._id)) { //login user is same
                   
                    next();
                } else {
                    req.flash("error", "You have no authorization ")
                    res.redirect("back");
                }
            }
        });
    } else { //not logged in
        req.flash("error", "You need to log in to do so");
        res.redirect("back");
    }


}

middlewareObj.checkCommentOwnership = function (req, res, next) {

    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function (err, comment) {
            if (err) {
                res.redirect("back");
            } else {
                //Mongoose Obj and String
                if (comment.author.id.equals(req.user._id)) { //login user is same
                    next();
                } else {
                    req.flash("error", "You need to have permission tgo do that");
                    res.redirect("back");
                }
            }
        });
    } else { //not logged in
        req.flash("error", "You need to login to do that");
        res.redirect("back");
    }

}

middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    
    if(req["headers"]["content-type"] === "application/json"){ //ajax error
        return res.send({ error: "login yo required"});
    }
    req.flash("error", "You need to login to do that");
    res.redirect("/login");
}
middlewareObj.isPaid = function (req, res, next) {
    if (req.user.isPaid) return next();

    req.flash("error", "Please pay registeration fee before continue ");
    res.redirect("/checkout");
}


module.exports = middlewareObj;