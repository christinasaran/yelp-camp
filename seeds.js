var mongoose    = require("mongoose"),
    Campground  = require("./models/campground"),
    Comment     = require("./models/comment");


var data = [
    {
        name: "Blossom Fields",
        image: "https://images.freeimages.com/images/large-previews/0cf/tulips-1-1377350.jpg",
        description: "this is a nice place to recharge your orange tendencies. What is Lorem Ipsum? Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.       Why do we use it? It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)." 
    },
    {
        name: "Mellow Mood Hut",
        image: "https://images.freeimages.com/images/large-previews/25a/pink-heart-of-stone-1316358.jpg",
        description: "this is a nice place to recharge your orange tendencies"
    },
    {
        name: "Lion Safari",
        image: "https://images.freeimages.com/images/large-previews/04c/lions-resting-1375568.jpg",
        description: "this is a nice place to recharge your orange tendencies"
    }
]

function seedDB() {
    //Remove all campgrounds
    Campground.remove({}, function (err) {
        if (err) {
            console.log(err);
        }
        console.log("remove camps.");
        //add the seeded campgrounds
        data.forEach(function (seed) {
            Campground.create(seed, function (err, campground) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("added:  " + campground);
                    Comment.create({
                        text: "Best place everywhere i went",
                        author: "Rick"
                    }, function(err, comment){
                            if(err){
                                console.log(err)
                            }else{
                                campground.comments.push(comment)
                                campground.save();
                                console.log("Created new comment  "+ comment);
                        }
                    });
                }
            });
        });
    });

}

module.exports = seedDB;
