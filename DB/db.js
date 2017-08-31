/*database functions
  all functions check incoming parameters are not empty
  all use prepared statements to avoid sql injection
*/

"use strict";

var fs = require("fs");
var file = "DB/data.db"; 
var exists = fs.existsSync(file); 
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);
var scrypt = require("scrypt");
var scryptParameters = scrypt.paramsSync(0.1);

//Stops pictures being associated with another picture then adds
//media association
function addAssociation(name, associate, type, execute) {

  if(associate === undefined || associate === null) {
    execute("noassociate");
  } else {
    addMediaAssociation(associate, name, execute);
  }

}

//adds media association only between an audio file and picture file
function addMediaAssociation(visual, audio, execute)  {

  var type = audio.split('\.');

  if(visual === undefined || visual === null) {
    execute("noassociate");
  }

  else if(type[1] === 'jpg' || type[1] === 'png' || type[1] === 'jpeg') {
    execute("failtypes");
  } else {
    var ps0 = db.prepare("select * from mediaAssociate where visual = ? and audio = ?");
    try {
      ps0.get(visual, audio, check);
      ps0.finalize();
      function check(err, row) {
        if(row !== undefined) {
          execute("alreadyexists");
        } else {
          try{
            var ps1 = db.prepare("insert into mediaAssociate "
            +"(visual, audio) values (?,?)");
            try{
              ps1.run(visual, audio);
              ps1.finalize();
              execute("success");
            }catch(err){;
              execute("fail");
            }
          }catch(err){
            execute("fail");
          }
        }
      }
    } catch(err) {
      execute("fail");
    }
  }
}

//Solution adapted from: 
// https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
// Public Domain/MIT
function getNewCookie() {

    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    
}
  
  
//functions used by the server
module.exports = {

  //adds a new user to the database
  //uses Scrypt to store password as hash
  addUser: function(uName, pWord, owner, execute, addCookie)  {

    if(uName === undefined || uName === null) {
      execute("isNull", 0);
    }
    else{
   
      var ps = db.prepare("select * from person where uname = ?");

      try{
        ps.get(uName, check);
        ps.finalize();
        function check(err, row) {
          if(row != undefined) {
            execute("alreadyExists", 0);
          }
          else{
            var hash =  scrypt.kdfSync(pWord, scryptParameters);
            var ps1 = db.prepare("insert into person (uname, pword, owner)"
            +" values (?, ?, ?)");
            try {
              ps1.run(uName, hash.toString("hex"), owner); 
              ps1.finalize();
            }catch(err){
              execute("fail", 0);
            }
            var cookie = getNewCookie();
            addCookie(cookie, uName, owner, null);
            execute("success?"+owner, cookie);
          }
        }
      }catch(err){
        execute("fail", 0);
      }
    }

  },

  //checks whether a user exists and whether correct password
  //has been entered via Scrypt
  checkUser: function (userName, pWord, execute, addCookie)  {

    if(userName === undefined || userName === null) {
      execute("isNull");
    }
    else{
     
      var ps = db.prepare("select * from person where uname = ?");

      ps.get(userName, check);

      function check(err, row)  {
        try {
          var hash = scrypt.kdfSync(pWord, scryptParameters);
          if(scrypt.verifyKdfSync(hash, pWord) != true) { 
            execute("wrong", 0);
          }
          else{
            var cookie = getNewCookie();
            addCookie(cookie, userName, row.owner, null);
            execute("success?"+row.owner, cookie);
          }
        }catch(err){
          execute("fail", 0);
        }
      }
    }

  },

  //checks user exists, media not already associated then
  //adds association
  associate: function(userName, owner, execute, addCookieAssociation, cookie) {
    if(owner === undefined || owner === null) {
      execute("isNull");
    }
    else{
      var ps0 = db.prepare("select * from person where uname = ?");
      try {
        ps0.get(owner, check0);
        function check0(err, row) {
          if(row === undefined || row.uname !== owner) {
            execute("wrongUName");
          }
          else if(row.owner === 'false' || row.owner === 0) {
            execute("notOwner");
          }
          else {
            var ps1 = db.prepare("select * from personAssociate where "
            +"owner = ? and associate = ?");
            try {
              ps1.get(owner, userName, check1);
              function check1(err,row) {
                if(row !== undefined) {
                  execute("alreadyExists");;
                }
                else {
                  var ps2 = db.prepare("insert into personAssociate "
                  +"(owner, associate) values (?,?)");
                  try {
                    ps2.run(owner, userName);
                    ps2.finalize();
                    addCookieAssociation(cookie, owner);
                    execute("success");
                  }catch(err){
                    execute("fail");
                  }
                }
              }        
            }catch(err){
              execute("fail");
            } 
          }
        }
      }catch(err) {
        execute("fail");
      }
    }
  },

  //checks whether media already exists and if not adds to media table
  //checks then re-directs to media association
  addMedia: function(name, place, creator, owner, associate, execute)  {

    if((name === undefined || name === null) || place === undefined || 
      place === null || creator === undefined || creator === null || 
      owner === undefined || owner === null) {
      execute("isNull");
    }

    else{
      var ps0 = db.prepare("select * from media where name = ?");
      try {
        ps0.get(name, check);
        function check(err, row) {
          if(row !== undefined || row === null)  {
            var type = name.split('\.');
            addAssociation(name, associate, type[1], execute);
          }
          else{
            place = place.toLowerCase();
            name = name.toLowerCase();
            var ps1 = db.prepare("insert into media "
            +"(name, place, creator, owner) values (?,?,?,?)");
            try{
              ps1.run(name, place, creator, owner);
              ps1.finalize();
              if(associate !== null) {
                addMediaAssociation(associate, name, execute);
              }
              else {  execute("success");  }
            }catch(err){
              execute("fail");
            }
          }
        }
      }catch(err){
        execute("fail");
      }
    }
  },

  //returns media with each visual file followed by it's associated audio files
  //ensures by union all that rows also returned with no associate audio
  getMedia: function(name, execute)  {
    if(name === undefined || name === null) {
      execute("isNull");
    }
    else{
      var ps = db.prepare("select name, place, sName, sPlace from media join ("+
      "select name as sName, place as sPlace, visual as sVisual from "+
      "(select * from media inner join mediaAssociate on name = audio)) "+
      "where name = sVisual and owner = ? "+
      "union all "+
      "select name, place, null as sName , null as sPlace from media where owner = ? "+
      "and (name like ('%.jpg') or name like ('%.jpeg') or name like ('%.png')) order by name asc");

      try {
        ps.all(name, name, check);
        function check(err, rows) {
          if(rows === undefined || rows === null) {
            execute("notExist");
          } else {
            var result = "";
            rows.forEach(function(row) {
              result = result +"?"+row.name+"?"+row.place+"?"+row.sName+"?"+row.sPlace;
            });
            execute("success"+result);
          }
        }      
      }catch(err){
        execute("fail");
      }
    }
  },

  //checks whether there is an association and, if so, returns
  //this to the browser
  getPersonAssociation: function(name, execute)  {

    if(name === undefined || name === null) {
      execute("isNull");
    }
    else{

      var ps = db.prepare("select owner from personAssociate where "
      +"associate = ?"); 
    
      try{
        ps.all(name, check);
        function check(err, rows) {
          if(rows === undefined || rows === null) {
            execute("noAssociate");
          } else {
            var result = "";
            rows.forEach(function(row) {
              result = result + "?"+row.owner;
            });
            execute("success?"+result);
          }
        }
      }catch(err){
        execute("fail");
      }
    }
  }

}


