/*adapted from Dr Ian Holyer's server.js and server used for web project
  written by J.Edmeads and J.Valvoda.
  
  listens on both http and https to re-direct users to https address
  handles security, delivering of files and requests
*/



var http = require("http");
var https = require("https");
var formidable = require("formidable");
var fs = require("fs");
var fs0 = require('fs-extra');
var mkdir = require('mkdirp');
var OK = 200, NotFound = 404, BadType = 415, Error = 500;
var types, banned, parameters = "";
var dbFunction = require("./DB/db.js");
var validCookies = []

reDirectHTTP(8080);
startHTTPS(4430);

//creates simple HTTP server to re-direct requests
function reDirectHTTP(port) {

  var service = http.createServer(reDirect)
  service.listen(port, "localhost");

}

//re-directs HTTP requests to HTTPS address
function reDirect(request, response)  {

  response.writeHead(302, {'Location':'https://localhost:4430/index.html'});
  response.end();

}

//creates server and starts listening on port
function startHTTPS(port) {

  const options = {
    key: fs.readFileSync('key/server.key'),
    cert: fs.readFileSync('key/server.crt')
  }

  types = defineTypes();
  banned = [];
  banUpperCase("./public/", "");
  var service = https.createServer(options, handleRequest);
  service.listen(port, "localhost");
  var address = "https://localhost";
  if (port != 80) address = address + ":" + port;
  console.log("Server running at", address);

}
/////////////////////////Cookies///////////////////
function getCookie(request) {

  cookie = request.headers.cookie;
  return cookie;

}

//need to check if already has cookie before setting new one
function addCookie(newCookie, name0, owner0, associate0) {

  if(associate0 === null) {
    associate0 = name0;
  }

  var obj = {
    cookie : newCookie,
    name : name0,
    owner : owner0,
    associate : associate0,
  };

  validCookies.push(obj);

}

function getcookieObj(cook){

  for(var i = 0; i < validCookies.length; i++) {
    if(validCookies[i].cookie = cook) 
      return validCookies[i];
  }

  return "fail";

}

function cleanCookies() {

  //to run every few hours
  //setInterval(function, 60*60*1000 //will run every hour)

}

//need to scan for cookie then get the chosen value
function checkAllowed(cookie, value) {

  

  //puts allowed areas into cookie map

}

/////////////////////////////////////////////////////////

// Deals with requests to server. Checks allowed request then 
// directs to relevant function
function handleRequest(request, response) {
  
  var url = request.url.toLowerCase();
  var head = url.split("?");

  if (url.endsWith("/")) url = url + "index.html";
  var cookie = getCookie(request);
  if (cookie === "fail") {
    renderHTML("./public/view.html", response, type);
  }
  if (reject(cookie, url)) {
    return fail(response, NotFound, "URL access refused");
  }  
  if (isBanned(url)) {
    return fail(response, NotFound, "URL has been banned");
  }
  
  var type = findType(url, request);

  switch (head[0])  {
    case "/newuser" : newUser(head[1], head[2], head[3], response, type); break;
    case "/login" : login(head[1], head[2], response, type); break;
    case "/associate" : associate(cookie, head[1], response, type); break;
    case "/addassociate" : addAssoc(cookie, head[1], response, type); break;
    case "/display" : display(cookie, response, type); break;
    case "/addpic" : addVisual(cookie, request, response, type); break;
    case "/relations" : getRelations(cookie, response, type); break;
    case "/addstory": case "/addmusic":
      addAudio(cookie, request, response, type, head[0]); break;
    default: defaultReply(response, type, url);

  }

}

function addAssoc(cookie, assoc, response, type) {
  var person = getcookieObj(cookie);
  person.associate = assoc;
  var textTypeHeader = { "Content-Type": "text/plain" };
  response.writeHead(200, textTypeHeader);
  response.write("success");
  response.end()
}

//file copy in next two functions inspired by
//http://www.codediesel.com/nodejs/processing-file-uploads-in-node-js/

//although similarities in next two functions kept seperate to avoid
//long multiple condtional statements
//conversion to lowercase of names for security 

// adds an image to a user's profile
function addVisual(cookie, request, response, type)  {

  var name0;
  var form = new formidable.IncomingForm();
  var cookieObj = getcookieObj(cookie);
  var owner0 = cookieObj.associate;
  var creator = cookieObj.name;

  form.parse(request) 
  form.on('file', function(name, file)  {name0 = file.name;});
  form.on('end', complete);

  function complete(fields, files) {
    var tempPath = this.openedFiles[0].path;
    var fileName = this.openedFiles[0].name;
    var newPath = './files/'+owner0+"/"+fileName.toLowerCase(); 

    if(!checkVisual(name0)) execute("fail");
    else fs0.copy(tempPath, newPath, done);
 
    function done(err) {  
      if (err) console.error(err);
      else {
        var name1 = owner0+"/"+name0.toLowerCase();
        dbFunction.addMedia(name1, newPath, creator, owner0, null, execute); 
      }
    }

    function execute(result) {
      renderHTML("./public/view.html", response, type);
    }
  }
}

//adds Audio to user's profile
function addAudio (cookie, request, response, type, reDirect) {

  var owner0, creator, associate, name0;
  var form = new formidable.IncomingForm();
  var cookieObj = getcookieObj(cookie);
  var owner0 = cookieObj.associate;
  var creator = cookieObj.name;

  form.parse(request);
  form.on('file', function(name, file){name0 = file.name;});
  form.on('field', function(name, value) {
    if(name === "assocPic") associate = value;
  });
  form.on('end', complete);

  function complete(fields, files) {
    var tempPath = this.openedFiles[0].path;
    var fileName = this.openedFiles[0].name.toLowerCase();
    var newPath = './files/'+owner0+"/"+fileName.toLowerCase(); 

    if(!checkAudio(name0)) execute("fail");
    else fs0.copy(tempPath, newPath, done);
  
    function done(err) {  
      if (err) console.error(err);
      else {
        var name1 = owner0+"/"+name0;
        dbFunction.addMedia(name1, newPath, creator, owner0, associate, execute); 
      }
    }

    function execute(result) {
      if(reDirect === "/addmusic") {
        renderHTML("./public/view.html", response, type);
      } else {
      var textTypeHeader = { "Content-Type": "text/plain" };
      response.writeHead(200, textTypeHeader);
      response.write(result);
      response.end()
      }
    }
  }
}

//below two functions check type of media to ensure that pictures
//are not stored as music and vice-versa. Checks carried out here
//to reduce database interactions
function checkVisual(name) {
  var check = name.split("\.")[1];
  if(check === 'jpg' || check === 'jpeg' || check === 'png') 
    return true;
  else return false;

}

function checkAudio(name)  {

  var check = name.split("\.")[1];
  if(check === 'wav' || check === 'mp3' || check === 'aac' || check === 'ogg')
    return true;
  else return false;
  
}

//gets user's associated people
function getRelations(cookie, response, type)  {

  var person = getcookieObj(cookie);
  dbFunction.getPersonAssociation(person.name, execute);

  function execute(result){
    var textTypeHeader = { "Content-Type": "text/plain" };
    response.writeHead(200, textTypeHeader);
    response.write(result);
    response.end();
  }
}

//gets media that belongs to user
function display(cookie, response, type)  {

  var person = getcookieObj(cookie);

  if(person === "fail") {
    execute("fail");
  }else {
    dbFunction.getMedia(person.associate, execute);
  }

  function execute(result){
    var textTypeHeader = { "Content-Type": "text/plain" };
    response.writeHead(200, textTypeHeader);
    response.write(result);
    response.end();
  }

}

//associates user with another person
function associate(cookie, owner, response, type)  {

  var current = getcookieObj(cookie);

  dbFunction.associate(current.name, owner, execute, addCookieAssociation, cookie);

  function execute(result) {
    var textTypeHeader = { "Content-Type": "text/plain" };
    response.writeHead(200, textTypeHeader);
    response.write(result);
    response.end();
  }

  function addCookieAssociation(cookie, owner) {
    var current = getcookieObj(cookie);
    current.associate = owner;
  }
}
 

//checks login details
function login(name, pw, response, type)  {

  dbFunction.checkUser(name, pw, execute, addCookie );

  function execute(result, newCookie) {
    var textTypeHeader = { "Content-Type": "text/plain" };
    response.writeHead(200, {
      'Set-Cookie': newCookie, textTypeHeader});
    response.write(result);
    response.end();
  }

}

//adds a new user to the database
function newUser(name, pw, owner, response, type)  {
  
  if(owner === "true") { mkdir('./files/'+name, fail); }

  function fail(err) { if(err) console.log(err); }

  dbFunction.addUser(name, pw, owner, execute, addCookie);

  function execute(result, newCookie) {
    var textTypeHeader = { "Content-Type": "text/plain" };
    response.writeHead(200, {
      'Set-Cookie': newCookie, textTypeHeader});
    response.write(result);
    response.end();
  }

}


////////////////////////////////////////////////////////////
//                          delivery                      //
////////////////////////////////////////////////////////////

  
// Loads the website if it is allowed
function defaultReply(response, type, url){ 

  var temp = url.split('/');
  if (type === null) return fail(response, BadType, "File type unsupported");
  var place = url.lastIndexOf(".");
  var bit = url.substring(place);
  if((checkVisual(bit) || checkAudio(bit)) && temp[1] !== 'image') { 
    var file = "."+url;
  }else{
    var file = "./public" + url;
  }
  renderHTML(file, response, type);

}

// Delivers the website
function renderHTML(file, response, type){

  fs.readFile(file, ready);
  function ready(err, content) { 
    deliver(response, type, err, content); 
  }

}

// Deliver the file that has been read in to the browser.
function deliver(response, type, err, content) {

  if (err) {
    return fail(response, NotFound, "File not found");
  }
  var typeHeader = { "Content-Type": type };
  response.writeHead(OK, typeHeader);
  response.write(content);
  response.end();

}

// Give a minimal failure response to the browser
function fail(response, code, text) {

  var textTypeHeader = { "Content-Type": "text/plain" };
  response.writeHead(code, textTypeHeader);
  response.write(text, "utf8");
  response.end();

}

////////////////////////////////////////////////////////////
//                        types                           //
////////////////////////////////////////////////////////////

// Handles browsers which can not deal with xhtm+xml
function findType(url, request) {

  var header = request.headers.accept;
  var accepts = header.split(",");
  var extension;
  var ntype = "application/xhtml+xml";
  var otype = "text/html";

  if (accepts.indexOf(otype) >= 0){

    if (accepts.indexOf(ntype) >= 0){
        var dot = url.lastIndexOf(".");
        extension = url.substring(dot + 1);
    }else{ extension = "html"; }

  }else{

    var dot = url.lastIndexOf(".");
    extension = url.substring(dot + 1);

  }

  if (types[extension] === undefined) {
    return "text/html"
  } else {
    return types[extension];
  }

}


// Addapted to the types used by website
function defineTypes() {

    var types = {
        html : "text/html",
        xhtml : "application/xhtml+xml",
        css  : "text/css",
        js   : "application/javascript",
        png  : "image/png",
        gif  : "image/gif",    // for images copied unchanged
        jpeg : "image/jpeg",   // for images copied unchanged
        jpg  : "image/jpeg",   // for images copied unchanged
        svg  : "image/svg+xml",
        json : "application/json",
        pdf  : "application/pdf",
        txt  : "text/plain",
        ttf  : "application/x-font-ttf",
        woff : "application/font-woff",
        aac  : "audio/aac",
        mp3  : "audio/mpeg",
        wav  : "audio/wav",
        mp4  : "video/mp4",
        webm : "video/webm",
        ico  : "image/x-icon", // just for favicon.ico
        xhtml: undefined,      // non-standard, use .html
        htm  : undefined,      // non-standard, use .html
        rar  : undefined,      // non-standard, platform dependent, use .zip
        doc  : undefined,      // non-standard, platform dependent, use .pdf
        docx : undefined,      // non-standard, platform dependent, use .pdf
    }
  return types;

}



////////////////////////////////////////////////////////////
//                         security                       //
////////////////////////////////////////////////////////////


function banUpperCase(root, folder) {

  var folderBit = 1 << 14;
  var names = fs.readdirSync(root + folder);
  for (var i=0; i<names.length; i++) {
    var name = names[i];
    var file = folder + "/" + name;
    if (name != name.toLowerCase()) banned.push(file.toLowerCase());
    var mode = fs.statSync(root + file).mode;
    if ((mode & folderBit) === 0) continue;
    banUpperCase(root, file);
  }
}


// Checks if string is a valid ascii, adapted from:
// https://stackoverflow.com/questions/14313183/javascript-regex-how-do-i-check-if-the-string-is-ascii-only
function isValid(str){
  if(typeof(str)!=='string'){
    return false;
  }
  for(var i=0;i<str.length;i++){
    if(str.charCodeAt(i)>127){
        return false;
    }
  }
  return true;
}


// URL checking, rejects illegal/invalid/empty URLs, rejects attempts to
//access files not owned by user, rejects access to anything outside 
//public domain other than own files
function reject(cookie, url) {
  var rejectable = ["/./", "/../", "//", "key", "DB", "server.js"];

  var urlpart = url.split("/");

  for(var i = 0; i < urlpart.length; i++) {
    if(urlpart[i] === "files") {
      var person = getcookieObj(cookie);
      if(person.associate != urlpart[i+1])      
        return true;
    }
  }

  if(!isValid(url) || url.length > 2000 || url[0] != "/")
    return true;


  for (var i=0; i<rejectable.length; i++) {
    if (url.indexOf(rejectable[i]) !== -1)
        return true    
  }

  return false;

}


// Forbids any resources which shouldn't be delivered to the browser.
function isBanned(url) {

  for (var i  =0; i<banned.length; i++) {
    var b = banned[i];
    if (url.startsWith(b)) return true;
  }
  return false;

}


