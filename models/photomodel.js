const mongoose = require("mongoose");
 
mongoose.connect("mongodb://localhost:27017/Instagram");

const postSchema = mongoose.Schema({
    post: Buffer,
    caption: String,
    name: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
})

module.exports = mongoose.model("post", postSchema)