var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    flash    = require("connect-flash"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment"),
    User = require("./models/user"),
    seedDB = require("./seeds");

var commentRoutes = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes = require("./routes/index");

mongoose.connect("mongodb://localhost/yelp_camp", { useNewUrlParser: true, useUnifiedTopology: true });
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.set("view engine", "ejs");

//seedDB();

app.use(require("express-session")({ //cookies and session
    secret: "Brownie",
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); //from passportlocalmongoose in models/user
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) { //goes to every!!!
    //res.locals is avaial in current template
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});
app.use(indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes); //sebd oarams
app.use("/campgrounds", campgroundRoutes);

//process.env.PORT  heroku
app.listen(3000, function () {
    console.log("YelpCamp Server started...");
});


/**
 *
 *       //Campground pre-hook
    const Comment = require('./comment');
    campgroundSchema.pre("remove",async function(){
       await Comment.deleteMany({
          _id:{
             $in:this.comments
          }
       });
    });

    //Delete/destroy Campground
    router.delete("/:id",async(req,res)=>{
      try {
        let foundCampground = await Campground.findById(req.params.id);
        await foundCampground.remove();
        res.redirect("/campgrounds");
      } catch (error) {
        res.redirect("/campgrounds");
      }
    })
 */