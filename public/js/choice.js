/*re-directing page to view or update story for owners
  for non-owners asks server who they are associated with
  and offers users choice on whose story to update
*/

addEventListener('load', setUp);

//sends message to server to get associations for user
function send()  {

  var send = new XMLHttpRequest();
  send.onreadystatechange = updatePage;
  send.open("GET", "relations?");
  send.send();

  function updatePage()  {
    if(this.readyState === 4 && this.status === 200) {
      var response = this.responseText;
      var response0 = response.split("?");
      switch(response0[0]) {
        case "success": success(response);break;
        case "fail": 
        case "noAssociate" :  
        default : error(response0[0]);break;
      }
    }
  }
}


//if owner re-directs to view of story 
//if not owner displays the stories user is allowed to contribute to
function success(list)  {

  var owner = sessionStorage.getItem('owner');
  if(owner === "true") {
    window.location.href = "view.html";
  } else {
    var response = list.split("?");
    var res = source('fail');
    res.innerHTML = "Select Person's story to update"
    var ul = create("UL", "none", "none");
    for (var i = 1; i < response.length; i++)  {
      if(response[i] !== "") {
        var li = create("LI", "none", "list");
        event(li, 'click', add0);
        li.innerHTML = response[i];
        ul.appendChild(li);
      }
    }
    res.appendChild(ul);
  }

}

//adds send association to server
function add0()  {
  var choice = this.textContext || this.innerText;
  var send = new XMLHttpRequest();

  send.onreadystatechange = updatePage;
  send.open("GET", "addAssociate?"+choice);
  send.send();

  function updatePage()  {
    if(this.readyState === 4 && this.status === 200) {
      var response = this.responseText;
      var response0 = response.split("?");
      if(response0[0] === "success")
        window.location.href = "view.html";
      else 
        window.location.href = "choice.html";
    }
  }
  
}

//handles fails
function fail(error)  {

  var reply = source('fail');
  switch(error) {
    case "noAssociate": reply.innerHTML = "no one is connected to your account."+
    " Please add connection"; break;
    case "fail": reply.innerHTML = "unable to get connection, please try again";
      break;
    case "isNull": default:
      goBack(reply);
  }
}

//pauses for a second to display message then re-directs to 
//the log in page
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function goBack(reply) {
  reply.innerHTML = "unable to read your name, returning to log in";
  await sleep(1000);
  window.location.href = "index.html";
}
  

function viewStory() { 

  window.location.href = "story.html";

}

//re-directs to add to a story
function add() {

  window.location.href = "intropage.html";

}

//initial set up function. Determines whether user is the owner
//of the story or a contributor and changes the options accordingly
function setUp(){
  console.log(document.cookie);
  var update = source("update");
  var view = source("view");
  var add0 = source("add");

  event(update, 'click', send);
  event(view, 'click', viewStory);
  event(add0, 'click', add);

  var owner = sessionStorage.getItem('owner');
  console.log(owner);
  if(owner === "false" || owner === 0) {
    add0.style.display = "block";
  }
  else {
    view.style.display = "block";
  }
    

}
