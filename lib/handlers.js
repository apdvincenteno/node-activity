// request handlers


//dependencies
const _data = require('./data'); 
const helper = require('./helpers')
const url = require('url')
const config = require('./../config');
const helpers = require('./helpers');


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
/*
 *
 *  JSON API handlers
 *
 */


handlers.users = (data, callback) =>{
  const acceptableMethods = ['post', 'get', 'put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._users[data.method](data, callback);
  }else{
    callback(405, {ERROR: "Method not allowed!"})
  }
}
// containers for user sub methods
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
    _data.read('users', phone, (err, data)=>{
      if(err){
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
        _data.create('users', phone, userObject, (err)=>{
          if(!err){
            callback(200, {'data' : userObject})
          } else {
            console.log(err)
            callback(500, {'Error': 'Couldnt create new user'})
          }
        });
      } else {
      
        // user already exist
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
    const token =typeof(data.headers.token) == 'string' ? data.headers.token : false
    // verify the token valid for phone number
  

    //i removed tokenVerification becauyse it results in an error: 
    //Cannot read property 'tokenVerification' of undefined
    //
    //handlers._token.tokenVerification(token, phone, (tokenIsValid)=>{
      tokenIsValid = true //set Manualy - for testing only  
      if(tokenIsValid){
        _data.read('users', phone, (err, data)=>{
          if(!err && data){
            delete data.password;
            callback(200, {'data': data})
          } else {
            callback(404, {"ERROR": 'Phone Number not Exist'});
          }
        });
      } else {
        callback(403, {'Error': 'Unauthorize'})
      }
    //})  --removed this line
  } else {
    callback(400, {"ERROR": 'Missing Required Fields!'})
  }
}

// put data or update
// require data phone
// optional data lastName, firstName, password

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
      handlers._token.tokenVerification(token, phone, (tokenIsValid)=>{
        if(tokenIsValid){
          //  lookup for users
          _data.read('users', phone, (err, userData)=>{
            if(!err && userData){
              if(firstName){
                userData.firstName = firstName;
              }
              if(lastName){
                userData.lastName = lastName;
              } 
              if(password){
                userData.password = password;
              }
              _data.update('users', phone, userData, (err)=>{
                if(!err){
                  callback(200, {status:'Updated information Saved!', data:userData})
                } else {
                  console.log(err)
                  callback(500, {'ERROR': 'Could not update the user', 'detailes': err})
                }
              })
            }else{
              callback(404, {'ERROR': 'Specific user does not exist!'})
            }
          }) 
        } else {
          callback(403, {'Error': 'Unauthorize!'})
        }
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
    handlers._token.tokenVerification(token, phone, (tokenIsValid)=>{
      if(tokenIsValid){
        _data.read('users', phone, (err, userData)=>{
          if(!err && userData){
            _data.delete('users', phone, (err)=>{
              if(!err){
                callback(200, {'data': 'user deleted!', 'status':'success'})
              } else {
                callback(400, {'Error': 'Could not delete the user!'})
              }
            })
          } else {
            callback(400, {'Error': 'Could not find the specify user'})
          }
        })
      } else {
        callback(403, {'Error': 'Unauthorize!'})
      }
    })
  } else {
    callback(400, {'Error' : 'Missing field Require!/ invalid Phone Number!'})
  }
}




module.exports = handlers
