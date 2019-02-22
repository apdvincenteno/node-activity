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

database.addUser = async (user, cb)=>{
    const _user = new User(user)
    const result = await _user.save();
    cb(result);
}

database.listUsers = async (cb)=>{
    const users = await User.find();
    cb(users);
}

database.deleteUser = async (phone,cb)=>{
    await User.deleteOne({phone}, (err, res)=>{
        if(err) cb(err);
        cb(res);
    })
}

database.findUser = (phone,cb)=>{
    User.findOne({phone}).exec((err,res)=>{
        if(res==null) return cb({isThere: false, data: res});
        cb({isThere: true, data: res})
    });
}

database.updateUser = (phone, data, cb)=>{
    User.updateOne({phone},{$set:data}, (err, res)=>{
        cb(res)
    })
}

/// lists of tests///
// database.addUser({
//     firstName: "joseph",
//     phone: "12332112"
// })

// database.deleteUser(12332112);
// database.findUser("12332112");
// database.updateUser("12332112", {firstName: "Jefferson", phone: 123123123});
// database.listUsers()

module.exports = database;

