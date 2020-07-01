var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
const { isLoggedIn } = require("../middleware");

// Set your secret key. Remember to switch to your live secret key in production!
//process.env.STRIPE_SECRET_KEY
const stripe = require('stripe')('sk_test_51Gz34qD977Qb42kzlOO4uhTVPsPIMJOHxbhp0AbPwxwPqeemJT3WW5qZhPnm2DQM3GKngxc9fwZKjYWzfGNZPdJ100OVhjQEfX');


router.get("/", function (req, res) {
    res.render("landing");
});


/**
 * AUTH ROUTES
 */
router.get("/register", function (req, res) {
    res.render("register");
});
router.post("/register", function (req, res) {
    var newUser = new User({ username: req.body.username });
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function () {
            req.flash("success", "Welcome! " + user.username); //database or...req.body.username
            res.redirect("/checkout");
        });
    });
});

/**
 * LOGIN
 */
router.get("/login", function (req, res) {
    res.render("login");
});
//passport.local pkg middleware
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }),
    function (req, res) {


    });

router.get("/logout", function (req, res) {
    req.logout();

    req.flash("success", "Logged you out");
    res.redirect("/campgrounds");
});


// const paymentIntent = await stripe.paymentIntents.create({
//     amount: 1099,
//     currency: 'cad',
//     // Verify your integration in this guide by including this parameter
//     metadata: { integration_check: 'accept_a_payment' },
// });



//this is just to the one user. and removed async
router.get("/checkout", isLoggedIn, (req, res) => {
    //try {
        // const paymentIntent = await stripe.paymentIntents.create({
        //     amount: 2000,
        //     currency: '
        //     // Verify your integration in this guide by including this parameter
        //     metadata: { integration_check: 'accept_a_payment' },
        // });
        // const { client_secret } = paymentIntent;
        if (req.user.isPaid) {
            req.flash('success', 'Your account is already paid');
            return res.redirect('/campgrounds');
        }
        res.render("checkout", { amount: 20 });
    // } catch (err) {
    //     req.flash("error", err.message);
    //     res.redirect("back");
    // }
});

router.post("/pay", isLoggedIn, async (req, res) => {
    const { paymentMethodId, items, currency } = req.body;
    //here also lol amount
    const amount = 2000;

    try {
        // Create new PaymentIntent with a PaymentMethod ID from the client.
        const intent = await stripe.paymentIntents.create({
            amount,
            currency,
            payment_method: paymentMethodId,
            error_on_requires_action: true,
            confirm: true
        });

        console.log("💰 Payment received!");
        //models -> user updated and we are logged in
        req.user.isPaid = true;
        await req.user.save();

        // The payment is complete and the money has been moved
        // You can add any post-payment code here (e.g. shipping, fulfillment, etc)

        // Send the client secret to the client to use in the demo - send to frontend
        res.send({ clientSecret: intent.client_secret });
    } catch (e) {
        // Handle "hard declines" e.g. insufficient funds, expired card, card authentication etc
        // See https://stripe.com/docs/declines/codes for more
        if (e.code === "authentication_required") {
            res.send({
                error:
                    "This card requires authentication in order to proceeded. Please use a different card."
            });
        } else {
            res.send({ error: e.message });
        }
    }
});

// function isLoggedIn(req, res, next) {
//     if (req.isAuthenticated()) {
//         return next();
//     }
//     res.redirect("/login");
// }

module.exports = router;