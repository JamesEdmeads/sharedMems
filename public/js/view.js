/*makes server requests to get all media associated with the user
  creates elements according for each pic to have;
    -associated audio
    -option to upload audio
    -option to record new audio
  on upload or record sends new data to server to be processed
*/


var seen = [];
var recorder;
var recording = false;
var reply;
var associatePic;

addEventListener('load', setUp);

//calls functions to setup the page correctly
function setUp() {

  ownerOptions();
  display();
  setUpAudio();
  reply = source('reply');

}

//if owner display button for them to continue to view story page
function ownerOptions()  {

  var owner = sessionStorage.getItem('owner');

  if(owner === 'true' || owner === 1) {
    var viewBut = source("viewButton");
    viewBut.style.display = "block";
    var view = source('view');
    event(view, 'click', view0);
  }

}

//re-directs to the view story page
function view0()  {

  window.location.href = "story.html";

}

//sends request to server to get the media associated with 
//the account
//on response - sends to functions to dynamically create 
//image and audio html to display correctly the items returned
//checks what has already been displayed to avoid duplication
function display()  {

  var send = new XMLHttpRequest();

  send.onreadystatechange = updatePage;
  send.open("GET", "display?", true);
  send.send();

  function updatePage()  {

    if(this.readyState === 4 && this.status === 200) {
      handleResponse(this.responseText);
    }
  }
}

//handles above server response, checking whether images have 
//already been processed so that each image appears only once
//but can have multiple audio files with it
function handleResponse(response) {
  
  if(response === "fail" || response === "isNull" || 
     response === "alreadyExists" || response === "fail") {
     fail();
  } else {
     var results = response.split("?");
     var node = source('image');

     for(var i = 1; i < results.length; i += 2) {
      var part = results[i].split("\.")[1];
      if(isVisual(part))  { 
        seen.push(results[i]);
        if(!done(results[i]))  {
          appendImage(node, results[i+1], results[i]);
        }
      } else if(isAudio(part)){ 
        appendMusic(node, results[i+1], results[i])
      }
    }   
  }
}

//pauses for a second to display message then re-directs to 
//the log in page
function sleep(ms) {

  return new Promise(resolve => setTimeout(resolve, ms));

}

async function fail() {

  reply.innerHTML = "Error, returning to log in";
  await sleep(1000);
  window.location.href = "index.html";

}

  

//creates image HTML for each image
function appendImage(node, next, current)  {

  var nLine = create("BR", "none", "none"); 
  node.appendChild(nLine);
  var image = createMedia("IMG", next, current, "image");
  node.appendChild(image);
  addMusicUpload(node);

}

//creates music HTML for each song associated with the image
function appendMusic(node, next, song)  {

  var name = create("LABEL", "audioName", "audio");
  var temp = song.split("/")[1];
  name.innerHTML = temp.split("\.")[0];
  node.appendChild(name);

  var b = create("BR", "none", "none");
  node.appendChild(b);

  var music = createMedia("AUDIO", next, song, "audio");
  node.appendChild(music);

  var br = create("BR", "none", "none");
  node.appendChild(br);

}

//creates form HTML to add new music to each image file
function addMusicUpload(node)  {

  var section = create("SECTION", "none", "addSection");
  var parent = node.lastChild.alt;

  addRecord(section, parent);

  var message = create("LABEL", "none", "audioUploadTag");
  message.innerHTML = "upload new audio for this picure:";
  section.appendChild(message);
  
  var form = create("FORM", "none", "musicForm");
  form.action = "/addMusic?0";
  form.enctype = "multipart/form-data";
  form.method = "post";

  var inputs = [];

  var input0 = createInput("musicUpload", "file", "upload", "none"); 
  inputs.push(input0);

  var input1 = createInput("assocPic", "text", "assocPic", "hidden"); 
  input1.value = parent;
  inputs.push(input1);

  var input2 = create("INPUT", "none", "buttons");
  input2.type = "submit";
  input2.value = "Upload";
  inputs.push(input2);

  for(var i = 0; i < inputs.length; i++)  {
    form.appendChild(inputs[i]);
  }

  section.appendChild(form);
  node.appendChild(section);

}

//adds new record button for each image
function addRecord(node, parent) {

  var button = create("BUTTON", "record", "buttons");
  button.innerHTML = "record story";
  event(button, 'click', getParentPic);
  node.appendChild(button);
  function getParentPic() {
    associatePic = parent;
    recordStart1();
  }

}

//sends new recorded audio to the server for processing
function send(blob) {

  var formData = getForm(blob);

  var send = new XMLHttpRequest();
  send.onreadystatechange = updatePage0;

  send.open("POST", "addstory?", true);
  send.send(formData);
    
  function updatePage0()  {  
    if(this.readyState === 4 && this.status === 200) {
      handleSendResponse(this.responseText);
    }
  }
}

//creates new form data with new audio blob and required 
//user info for correct database storage
function getForm(blob) {

  var formData = new FormData();
  var mediaName = associatePic.split("/")[1];
  var name = mediaName.split("\.")[0];  
  var num = time();

  formData.append("file", blob, name+num+"story.wav");
  formData.append("assocPic", associatePic);

  return formData;

}

//handles server response from blob upload
function handleSendResponse(response) {

  var success = false;
  var answer;

  switch(response) {
    case "alreadyExist": answer = "Already Exists"; break;
    case "failtypes": answer = "Unable to associate image with image"; break;
    case "success": success = true; break;
    default: answer = "error with upload";
  }
  if(!success) reply.innerHTML = answer;
  else
    window.location.href = "view.html";
}

//checks whether images have already been seen so they are not displayed
function done(current)  {

  var i;
  for(i = 0; i < seen.length-1; i++)  {
    if(seen[i] === current) return true;
  }
  return false;

}



