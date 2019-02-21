const mongoose = require("mongoose");

database = {}

mongoose.connect('mongodb://localhost:27017/Users', { useNewUrlParser: true })
    .then((db)=>{
        // console.log(db);
    })  
    .catch(err=> console.log("Could not connect to Mongodb", err))

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String
})

const User = mongoose.model("User", userSchema)

database.addUser = async user=>{
    const _user = new User({
        firstName: user.firstName,
        lastName: user.lastName
    })
    const result = await _user.save();
    console.log(result)
}

database.listUsers = async ()=>{
    const users = await User.find();
    console.log(users);
}

database.deleteUser = async phone=>{

}

// database.addUser = _addUser

database.listUsers()

module.exports = database;

