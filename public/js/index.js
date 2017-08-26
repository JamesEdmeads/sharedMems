/* js for the first page. Completes login and signs up new users
   displaying output for failed attempts
   Also loads user into session id and whether they own the story
*/

"use strict"

addEventListener('load', setUp);

//for new users
//sends details to server to update database and deals with outcomes
function newSignUp()  {

  var name = source("name").value;
  var pw = source("pw").value;
  var owner = source("own").checked;

  var send = new XMLHttpRequest();

  send.onreadystatechange = updatePage;
  send.open("GET", "newUser?"+name+"?"+pw+"?"+owner, true);
  send.send();

  function updatePage()  {

    if(this.readyState === 4 && this.status === 200) {
      handleResponse(this.responseText);
    }
  }
}

function handleResponse(res) {

  var response = res.split("?");
  var reply = source('response');
  console.log(response);
  switch(response[0])  {
    case "fail": reply.innerHTML = "failed: please try again";break;
    case "success": newUser(response[1]);break;
    case "alreadyExists": reply.innerHTML
         = "user already exists. Choose a new username";break;
    default: window.location.href = "index.html";
  }
}

//sets session storage details for logged in new user
function newUser(owner)  {

  sessionStorage.setItem('owner', owner);
  window.location.href = "/intropage.html";

}

//for existing users
//sends request to server to check log in details
function login()  {

  var name = source('eUser').value;
  var pw = source('ePw').value;
  var send = new XMLHttpRequest();
  send.onreadystatechange = updatePage;
  send.open("GET", "login?"+name+"?"+pw, true);
  send.send();

  function updatePage()  {
    if(this.readyState === 4 && this.status === 200)  {
      handleLoginResponse(this.responseText);
    }
  }
}

function handleLoginResponse(res)  {

  var response = res.split("?");
  var reply = source('response');
  switch(response[0])  {
    case "wrong": redo(); break;
    case "success" : loggedIn(response[1]); break;
    case "fail": reply.innerHTML = "please try again";break;
    default: window.location.href = "index.html";
  }
}

//sets session storage for log-in details and re-directs
//if user is owner sets associate to owner's details so that
//files uploaded will record the owner as the contributor 
function loggedIn(owner)  {
  sessionStorage.setItem('owner', owner);
  window.location.href = "choice.html";

}

//displays error message for wrong log-in
function redo() {

  var response = source('response');
  response.innerHTML = "wrong password - please re-enter";

}

//below functions display options depending on user selection
function show()  {

  var newUser = source('newUser0');
  newUser.style.display = "block";

  var exist = source('existUser');
  exist.style.display = "none";

}

function show0()  {

  var newUser = source('newUser0');
  newUser.style.display = "none";

  var exist = source('existUser');
  exist.style.display = "block";

}

function resetLogin() {
  sessionStorage.clear();
}

function remove() {

  this.parentNode.parentNode.style.display = 'none';

}

//initial set up function : adds event listeners
function setUp()  {
  console.log(document.cookie)
  var formSend = source('formSend');
  var newUser = source('newUser');
  var login0 = source('login');
  var send = source('send');
  var close = source('x');

  event(formSend, 'click', newSignUp);
  event(newUser, 'click', show);
  event(login0, 'click', show0);
  event(send, 'click', login);
  event(close, 'click', remove);

}
