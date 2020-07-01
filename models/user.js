var mongoose                =     require("mongoose"),
    passportLocalMongoose   =     require("passport-local-mongoose");


var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    isPaid: { type: Boolean, default: false }
});

UserSchema.plugin(passportLocalMongoose); // adds methods to user
module.exports = mongoose.model("User", UserSchema);