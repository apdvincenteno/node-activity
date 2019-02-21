const mongoose = require("mongoose");

database = {}

mongoose.connect('mongodb://localhost:27017/Users', { useNewUrlParser: true })
    .then((db)=>{
        // console.log(db);
    })  
    .catch(err=> console.log("Could not connect to Mongodb", err))

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    phone: String,
    password: String
})

const User = mongoose.model("User", userSchema)

database.addUser = async user=>{
    const _user = new User(user)
    const result = await _user.save();
    console.log(result)
}

database.listUsers = async ()=>{
    const users = await User.find();
    console.log(users);
}

database.deleteUser = async phone=>{
    await User.deleteOne({phone}, (err, res)=>{
        if(err) console.log(err);
        console.log(res);
    })
}

database.findUser = phone=>{
    User.findOne({phone}).exec((err,res)=>{
        console.log(res);
    });
}

database.updateUser = (phone, data)=>{
    User.updateOne({phone},{$set:data}, (err, res)=>{
        console.log(res)
    })
}

// database.addUser({
//     firstName: "joseph",
//     phone: "12332112"
// })

// database.deleteUser(12332112);
// database.findUser("12332112");
// database.updateUser("12332112", {firstName: "Jefferson", phone: 123123123});
// database.listUsers()

module.exports = database;

