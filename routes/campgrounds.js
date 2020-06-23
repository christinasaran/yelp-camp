var express = require("express");
var router = express.Router();

const Campground = require("../models/campground");
const middleware = require("../middleware"); //require automaticall gets index

router.get("/", function (req, res) {
    console.log(req.user);
    Campground.find({}, function (err, allCampgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", { campgrounds: allCampgrounds });
        }
    });
});

//error message to login in middleware index
router.post("/", middleware.isLoggedIn , function (req, res) {
    //store data in arry
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;

    var author = {
        id: req.user._id,
        username: req.user.username,
    };
    var newCampground = { name: name, price: price, image: image, description: desc, author };

    //campgrounds.push(newCampground);
    //no longer array
    Campground.create(newCampground, function (err, newCreated) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/campgrounds"); //runs this again
        }
    });
});

router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("campgrounds/new");
});

router.get("/:id", function (req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/show", { campground: foundCampground });
        }
    });
});

//EDIT
router.get("/:id/edit", middleware.checkCampgroundOwnership, function (req, res) {

    Campground.findById(req.params.id, function (err, campground) {
        res.render("campgrounds/edit", { campground: campground }); //views
    });
});

router.put("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, updated) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//Delete  ASYNC TO COMMENTS TO DELETE.
router.delete("/:id", middleware.checkCampgroundOwnership, async (req, res) => {
    try {
        let foundCampground = await Campground.findById(req.params.id);
        await foundCampground.remove();
        res.redirect("/campgrounds");
    } catch (error) {
        res.redirect("/campgrounds");
    }
});





module.exports = router;