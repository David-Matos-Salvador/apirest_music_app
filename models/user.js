var mongoose =require('mongoose');
var Schema= mongoose.Schema;

var useSchema= Schema({
    name:String,
    surname:String,
    email:String,
    password:String,
    role:String,
    image:String
});
module.exports = mongoose.model('User',useSchema);