var express = require("express");
var router = express.Router();

const Campground = require("../models/campground");
let { checkCampgroundOwnership, isLoggedIn, isPaid } = require("../middleware"); //require automaticall gets index
var NodeGeocoder = require('node-geocoder');

var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};

var geocoder = NodeGeocoder(options);


router.use(isLoggedIn, isPaid);

router.get("/", function (req, res) {
    console.log(req.user);

    if (req.query.paid) {
        //local variable, handel by partial
        res.locals.success = "payment success, welcome to YelpCamp";
    }
    Campground.find({}, function (err, allCampgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", { campgrounds: allCampgrounds });
        }
    });
});

//error message to login in middleware index
//CREATE - add new campground to DB
router.post("/", isLoggedIn, function (req, res) {
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        var newCampground = { name: name, price: price, image: image, description: desc, author: author, location: location, lat: lat, lng: lng };
        // Create a new campground and save to DB
        Campground.create(newCampground, function (err, newlyCreated) {
            if (err) {
                console.log(err);
            } else {
                //redirect back to campgrounds page
                console.log(newlyCreated);
                res.redirect("/campgrounds");
            }
        });
    });
});


router.get("/new", isLoggedIn, function (req, res) {
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
router.get("/:id/edit", checkCampgroundOwnership, function (req, res) {

    Campground.findById(req.params.id, function (err, campground) {
        res.render("campgrounds/edit", { campground: campground }); //views
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", checkCampgroundOwnership, function (req, res) {
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;

        Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, campground) {
            if (err) {
                req.flash("error", err.message);
                res.redirect("back");
            } else {
                req.flash("success", "Successfully Updated!");
                res.redirect("/campgrounds/" + campground._id);
            }
        });
    });
});


//Delete  ASYNC TO COMMENTS TO DELETE.
router.delete("/:id", checkCampgroundOwnership, async (req, res) => {
    try {
        let foundCampground = await Campground.findById(req.params.id);
        await foundCampground.remove();
        res.redirect("/campgrounds");
    } catch (error) {
        res.redirect("/campgrounds");
    }
});





module.exports = router;