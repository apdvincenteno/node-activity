// request handlers


//dependencies
const _data = require('./data'); 
const helper = require('./helpers')
const url = require('url')
const config = require('./../config');
const helpers = require('./helpers');
const db = require("./database");


// Defined handlers
// 
var handlers = {};
/*
 *  HTML handlers
 *
 * 
 */

// Index Handlers
handlers.index = (data, callback)=>{
  //reject any request that isnt any GET method
  if(data.method == 'get'){
    // Read in the index template
    helpers.getTemplate('index', (err, str)=>{
      if(!err && str){
        callback(200, str, 'html');
      } else {
        callback(400, {Error: err})
      }
    })
  } else {
    callback(405, undefined,'html');
  };
};

handlers.users = (data, callback) =>{
  const acceptableMethods = ['post', 'get', 'put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._users[data.method](data, callback);
  }else{
    callback(405, {ERROR: "Method not allowed!"})
  }
}
handlers._users = {};


// Users

handlers.ping = (data, callback) =>{
  callback(200)
};
handlers._users.post = (data, callback) =>{
  //check that all required fields  are filled out
  const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length > "8" ? data.payload.phone.trim() : false;
  const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  
  if(firstName && lastName && phone && password){
    db.findUser(phone, (ret)=>{
      if(!ret.isThere){
        // hash the password
        const hashPassword = helper.hash(password);
        //create the user object
        const userObject = {
          'firstName' : firstName,
          'lastName'  : lastName,
          'phone'     : phone,
          'password'  : hashPassword
        }
        console.log("objectdata :",JSON.stringify(userObject))
        //store user object
        
        // _data.create('users', phone, userObject, (err)=>{
        //   if(!err){
        //     callback(200, {'data' : userObject})
        //   } else {
        //     console.log(err)
        //     callback(500, {'Error': 'Couldnt create new user'})
        //   }
        // });
        db.addUser(userObject, res=>{
          console.log(res);
          callback(200 ,res)
        });

      } else {
        callback(400, {'Error': 'A user that has phone number already exist'})
      }

    })
  }else{
    callback(404, {"Error": "Wrong / Missing fields required!"});
  }
}


// get data
handlers._users.get = (data, callback) =>{
  console.log('data--->  ----> :',JSON.stringify(data))
  const phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length > 0 ? data.queryStringObject.phone.trim() : false
  console.log("data :", JSON.stringify(phone) )

  if(phone){
    // Get token from the headers
          db.findUser(phone, (user)=>{
          console.log(user.data);
          callback(200 ,user.data);
        })
  } else {
          db.listUsers((user)=>{
            console.log(user);
            callback(200 ,user);
          })
  }
}


handlers._users.put = (data, callback) =>{
  // phone is required field
  const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length > 0 ? data.payload.phone.trim() : false
  
  //check for the option field
  const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  //error if phone invalid
  if(phone){
    // error if nothing sents to update
    if(firstName || lastName || password){
      // Get Token from headers
      const token =typeof(data.headers.token) == 'string' ? data.headers.token : false
       //  lookup for users

        db.updateUser(phone,{firstName, lastName, phone, password}, (res)=>{
          console.log(res);
          callback(200, res);
        })
    
    }else{
      callback(400, {'Error':'Missing fields to update required/ invalid'})
    }
  } else {
    callback(400, {'ERROR': 'Missing required field/Phone was invalid!'})
  }
}


handlers._users.delete = (data, callback)=>{
  // check for phone to be deleted
  const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length > 0 ? data.payload.phone.trim() : false
  // search the phone data
  if(phone){
    // Get Token from headers
    const token =typeof(data.headers.token) == 'string' ? data.headers.token : false     
      db.deleteUser(phone, (res)=>{
        console.log(res)
        callback(res);
      });
  } else {
    callback(400, {'Error' : 'Missing field Require!/ invalid Phone Number!'})
  }
}




module.exports = handlers
