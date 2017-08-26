/* page that allows non-owner user to associate with new accounts
   also for new owners to set up their own stories
   sets session storage for associates so that it can be 
   recorded who added audio*/

"use strict"

addEventListener('load', setUp);

//sends request to server to associate user with an account
//directs responses to functions to deal with 
function associate() {

  var userOwner = source('ownerName').value;
  var send = new XMLHttpRequest();

  send.onreadystatechange = updatePage;
  send.open("GET", "associate?"+userOwner);
  send.send();

  function updatePage()  {

    if(this.readyState === 4 && this.status === 200) {
      var response = this.responseText;
      var response = response.split("?");
      switch(response[0])  {
        case "success": showStory(userOwner);break;
        case "wrongUName": case "alreadyExists":
        case "fail": default: fail(response[0]); 
      } 
    }
  }

}

//deals with all failed associations
function fail(code)  {
  var show = source('fail');
  var reply;
  switch(code) {
    case "wrongUName": 
      reply = "unknown user: please re-enter"; break;
    case "alreadyExists": 
      reply = "already linked to this person's story. Click continue";
      addContinue(); 
      break;
    case "fail": 
      reply = "unble to link. Please try again"; break;
    case "notOwner":
      reply = "selected person does not have a story, please select again";
      break;
    default: 
      reply = "please try again";
  }

  show.innerHTML = reply;

}

//creates continue button to add when user tries to add an
//association to an account they are already connected to
function addContinue()  {

  var button = createInput("none", "button", "none", "buttons");
  button.value = "continue";
  event(button, 'click', addShow);
  var cont = document.getElementById('cont');
  cont.appendChild(button);

}

//gets values from page to re-direct user to their story page
function addShow() {

  var userOwner = source('ownerName').value;
  showStory(userOwner);

}

//sets session storage for the associate then re-directs to story page
function showStory(name)  {

  window.location.href = "view.html";

}

//for new owners, adds text and a continue button
function newOwner()  {

  var div = source("newOwner");

  var p = create("P", "none", "none");
  p.innerHTML = "To start recording your story click continue";
  div.appendChild(p);

  var cont = createInput("contId", "button", "none", "buttons");
  cont.value = "continue";
  event(cont,'click', go);
  div.appendChild(cont);

}

//re-directs to the story page
function go() {

  window.location.href = "view.html";

}

//changes options depending on whether user is the story owner or not
function setUp()  {

  var owner = sessionStorage.getItem('owner');
  var ownerGo = source('oNameGo')
  event(ownerGo, 'click', associate);

  if(owner==="false") {
    var rel = source('rel');
    rel.style.display = "block";
  } 
  else {
    newOwner();
  }


}
