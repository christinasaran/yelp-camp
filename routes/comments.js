var express = require("express");
var router = express.Router({mergeParams: true}); //:id
var Campground = require("../models/campground");
var Comment = require("../models/comment");
const { route } = require("./campgrounds");
const { Router } = require("express");
const middleware = require("../middleware");

/**
 * COMMENT TOUTES
 */
router.get("/new", middleware.isLoggedIn, function (req, res) {
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", { campground: campground });
        }
    });

});

//create
router.post("/", middleware.isLoggedIn, function (req, res) {
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    console.log(err);
                } else {
                    // addd user and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username; //bc model is set up so
                    comment.save();

                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success", "Created a comment");
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

router.get("/:comment_id/edit", middleware.checkCommentOwnership,  function(req,res) {
    Comment.findById(req.params.comment_id, function(err, found){
        if (err){
            res.redirect("back");
        } else {
            res.render("comments/edit", {campground_id: req.params.id, comment: found});
        }
    })
});
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updated){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/"+ req.params.id);
        }
    });
});

router.delete( "/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err) {
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
});


module.exports = router;