let highestZ = 100;

/*
var selectedIcon = undefined
function selectIcon(notesIcon) {
  notesIcon.classList.add("selected");
  selectedIcon = notesIcon
} 
function deselectIcon(notesIcon) {
  notesIcon.classList.remove("selected");
  selectedIcon = undefined
}

function handleIconTap(notesIcon) {
  if (notesIcon.classList.contains("selected")) {
    deselectIcon(notesIcon);
  } else {
    selectIcon(notesIcon);
  }
}

notesIcon.addEventListener("click", function() {
  handleIconTap(notesIcon);
});
*/

//DYNAMIC BACKGROUND

const stars=document.getElementById("stars");
for(let i=0;i<120;i++){
    const star=document.createElement("div");
    star.className="star";
    star.style.left=Math.random()*100+"vw";
    star.style.top=Math.random()*65+"vh";
    star.style.animationDelay=Math.random()*5+"s";
    stars.appendChild(star);
}

document.addEventListener("mousemove",(e)=>{
    const x=(e.clientX/window.innerWidth-.5);
    const y=(e.clientY/window.innerHeight-.5);
    document.getElementById("clouds").style.transform=
    `translate(${x*25}px,${y*15}px)`;
    document.getElementById("skyline").style.transform=
    `translate(${x*12}px,${y*8}px)`;
    document.getElementById("lake").style.transform=
    `translate(${x*6}px,${y*3}px)`;
});

// SETTINGS APP OPEN AND MAIN CODE

document.getElementById("settingsButton").addEventListener("click",()=>{
  openWindow(document.getElementById("settings"));
});

document.getElementById("settingsClose").onclick=()=>{
  closeWindow(document.getElementById("settings"));
};

function setWallpaper(type){
    const background=
    document.getElementById("background");
    if(type==="classic"){
        background.style.backgroundImage=
        "url('https://images.squarespace-cdn.com/content/v1/55664553e4b0e48846329dc0/1513810378697-SE401H22HUNY98E30669/samples.jpg')";
        sky.style.display="none";
        clouds.style.display="none";
        skyline.style.display="none";
        lake.style.display="none";
        stars.style.display="none";
    }
    else{
        background.style.backgroundImage="none";
        sky.style.display="";
        clouds.style.display="";
        skyline.style.display="";
        lake.style.display="";
        stars.style.display="";
    }
}

document.querySelectorAll('input[name="wallpaper"]').forEach(button=>{
  button.addEventListener(
    "change",
    function(){
      setWallpaper(this.value);
      localStorage.setItem("wallpaper",this.value);
    }
  );
});

const savedWallpaper = localStorage.getItem("wallpaper") || "classic";
setWallpaper(savedWallpaper);
document.querySelector(
`input[value="${savedWallpaper}"]`
).checked=true;

const quotetoggle = document.getElementById('toggle');
const quote = document.getElementById('quotes');
quotetoggle.addEventListener('change', function() {
  if (this.checked) {
    quote.style.display = "block"
  } else {
    quote.style.display = "none"
  }
});

// Clock

function updateTime() {
    var currentTime = new Date().toLocaleString();
    var timeText = document.querySelector("#timeElement");
    timeText.innerHTML = currentTime;
}
setInterval(updateTime, 1000);

// Make the apps draggable

dragElement(document.getElementById("welcome"));
dragElement(document.getElementById("notes"));
dragElement(document.getElementById("mindMap"));
dragElement(document.getElementById("calculator"));
dragElement(document.getElementById("gallery"));
dragElement(document.getElementById("paint"));
dragElement(document.getElementById("browser"));
dragElement(document.getElementById("loadPaintWindow"));
dragElement(document.getElementById("settings"));
dragElement(document.getElementById("quotes"));

function dragElement(element) {

  var initialX = 0;
  var initialY = 0;
  var currentX = 0;
  var currentY = 0;
  if (document.getElementById(element.id + "header")) {
    document.getElementById(element.id + "header").onmousedown = startDragging;
  } else {
    const dragHandle = document.querySelector("#" + element.id + "header") || element;
    dragHandle.onmousedown = startDragging;
  }
  function startDragging(e) {
    e = e || window.event;
    e.preventDefault();
    initialX = e.clientX;
    initialY = e.clientY;
    document.onmouseup = stopDragging;
    document.onmousemove = dragElement;
  }
  function dragElement(e) {
    e = e || window.event;
    e.preventDefault();
    currentX = initialX - e.clientX;
    currentY = initialY - e.clientY;
    initialX = e.clientX;
    initialY = e.clientY;
    element.style.top = (element.offsetTop - currentY) + "px";
    element.style.left = (element.offsetLeft - currentX) + "px";
  }

  function stopDragging() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// WELCOME SCREEN OPEN

var welcomeScreen = document.querySelector("#welcome")
var welcomeScreenClose = document.querySelector("#welcomeClose")
var welcomeScreenOpen = document.querySelector("#welcomeOpen")

function closeWindow(element) {
  element.style.display = "none"
}

function openWindow(element){
    if(document.body.contains(element)){
        element.style.display="block";
    }
}

welcomeScreenClose.addEventListener("click", function() {
  closeWindow(welcomeScreen);
});
welcomeScreenOpen.addEventListener("click", function() {
  openWindow(welcomeScreen);
});

// NOTES APP OPEN

var notesScreen = document.querySelector("#notes")
var notesScreenClose = document.querySelector("#notesClose")
var notesScreenOpen = document.querySelector("#notesIcon")
var notesDockOpen = document.querySelector("#notesDockIcon")

notesScreenClose.addEventListener("click", function() {
  closeWindow(notesScreen);
});
notesScreenOpen.addEventListener("click", function() {
  openWindow(notesScreen);
});
notesDockOpen.addEventListener("click", function() {
  openWindow(notesScreen);
});

// MIND MAP APP OPEN

var mindMapScreen = document.querySelector("#mindMap")
var mindMapScreenClose = document.querySelector("#mindMapClose")
var mindMapScreenOpen = document.querySelector("#mapIcon")
var mapDockOpen = document.querySelector("#mapDockIcon")

mindMapScreenClose.addEventListener("click", function() {
  closeWindow(mindMapScreen);
});
mindMapScreenOpen.addEventListener("click", function() {
  openWindow(mindMapScreen);
});
mapDockOpen.addEventListener("click", function() {
  openWindow(mindMapScreen);
});

// NOTES MAiN CODE

const notesContainer = document.querySelector("#notesContainer");
const notesContainerNew = document.querySelector("#newNote");

function createNote(text = "") {
  const note = document.createElement("div");
  note.classList.add("note");
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-note");
  deleteButton.textContent = "✕";
  deleteButton.style.marginTop = "8px";
  const saveButton = document.createElement("button");
  saveButton.className = "save-note";
  saveButton.style.marginTop = "8px";
  saveButton.textContent = "💾";
  const noteInput = document.createElement("div");
  noteInput.classList.add("note-input");
  noteInput.contentEditable = "true";
  noteInput.setAttribute("data-placeholder","Type your note here...");
  noteInput.innerHTML = text;
  deleteButton.onclick = () => note.remove();
  saveButton.onclick = () => {saveNote(noteInput.innerHTML);};
  note.appendChild(deleteButton);
  note.appendChild(noteInput);
  note.appendChild(saveButton);
  notesContainer.appendChild(note);
  noteInput.focus();
}

notesContainerNew.addEventListener("click", () => {
  createNote();
});

function saveNote(content) {
    let name = prompt("Name this note:");
    if(name === null) return;
    name = name.trim();
    if(name === "")
        name = "Untitled";
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes.push({name: name, content: content});
    localStorage.setItem("notes", JSON.stringify(notes));
    updateNotes();
}

function updateNotes() {
  const notes = JSON.parse(localStorage.getItem("notes")) || [];
  const list = document.getElementById("notesList");
  list.innerHTML = "";
  notes.forEach((note, index) => {
    const row = document.createElement("div");
    row.className = "saved-note-row";
    const button = document.createElement("button");
    button.className = "load-note-button";
    button.textContent = note.name;
    button.onclick = () => {loadNote(index);};
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-saved-note-button";
    deleteButton.textContent = "✕";
    deleteButton.onclick = (e) => {
      e.stopPropagation();
      deleteSavedNote(index);
    };
    row.appendChild(button);
    row.appendChild(deleteButton);
    list.appendChild(row);
  });
}

function deleteSavedNote(index){
  const notes = JSON.parse(localStorage.getItem("notes")) || [];
  notes.splice(index, 1);
  localStorage.setItem("notes", JSON.stringify(notes));
  updateNotes();
}

function loadNote(index){
  const notes = JSON.parse(localStorage.getItem("notes")) || [];
  createNote(notes[index].content);
}

createNote();
updateNotes();

// CALC APP OPEN

var calculatorScreen = document.querySelector("#calculator")
var calculatorScreenClose = document.querySelector("#calculatorClose")
var calculatorScreenOpen = document.querySelector("#calculatorIcon")
var calculatorDockOpen = document.querySelector("#calculatorDockIcon")

calculatorScreenClose.addEventListener("click", function() {
  closeWindow(calculatorScreen);
});
calculatorScreenOpen.addEventListener("click", function() {
  openWindow(calculatorScreen);
});
calculatorDockOpen.addEventListener("click", function() {
  openWindow(calculatorScreen);
});

// CALC APP MAIN CODE

function calculator(value) {
  let display = document.getElementById("calculatorDisplay");
  if (display.innerHTML === "0" || display.innerHTML === "Error") {
    display.innerHTML = value;
  } else {display.innerHTML += value;
  }
}

function clearCalculator() {
  document.getElementById("calculatorDisplay").innerHTML = "";
}

function deleteCalculator() {
  let display = document.getElementById("calculatorDisplay");
  display.innerHTML = display.innerHTML.slice(0, -1);
}

function calculate() {
  let display = document.getElementById("calculatorDisplay");
  try {
    display.innerHTML = eval(display.innerHTML);
  } catch (error) {
    display.innerHTML = "Error";
  }
}

// MIND MAP APP MAIN CODE

let selectedNodeId = 0;
let nextNodeId = 1;
let zoom = 1;
const MIN_ZOOM = 0.45;
const MAX_ZOOM = 3;
const mindMapArea = document.getElementById("mindMapArea");
const mindMapCanvas = document.getElementById("mindMapCanvas");

mindMapArea.addEventListener("wheel", function(e){
    e.preventDefault();
    if(e.deltaY < 0){
        zoom += 0.1;
    }else{
        zoom -= 0.1;
    }
    zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
    mindMapCanvas.style.transform =
        `scale(${zoom})`;
},{passive:false});

const nodes = {
  0: {
    id: 0,
    parent: null,
    children: [],
    x: 350,
    y: 220
  }
};

function selectNode(id) {
  selectedNodeId = id;
  document.querySelectorAll(".mind-node").forEach(node => {
    node.classList.remove("selected");
  });
  document.getElementById("node-" + id).classList.add("selected");
}

function addChildNode() {
  const parent = nodes[selectedNodeId];
  if (!parent) return;
  const newId = nextNodeId;
  nextNodeId++;
  const childNumber = parent.children.length;
  const verticalSpacing = 105;
  const horizontalSpacing = 160;
  let newX = parent.x + horizontalSpacing;
  let newY = parent.y + (childNumber * verticalSpacing);
  if (parent.children.length > 0) {
    newY = parent.y + ((childNumber - parent.children.length / 2) * verticalSpacing);
  }
  nodes[newId] = {
    id: newId,
    parent: selectedNodeId,
    children: [],
    x: newX,
    y: newY
  };
  parent.children.push(newId);
  const newNode = document.createElement("div");
  newNode.className = "mind-node";
  newNode.id = "node-" + newId;
  newNode.dataset.id = newId;
  newNode.style.left = newX + "px";
  newNode.style.top = newY + "px";
  newNode.innerHTML = 
  `<input type="text" value="New Idea"
    onclick="event.stopPropagation()">`;
  newNode.onclick = function() {
    selectNode(newId);
  };
  document.getElementById("mindMapCanvas").appendChild(newNode);
  rearrangeChildren(0);
  drawMindMapLines();
  selectNode(newId);
  makeNodeDraggable(newNode, newId);
}

function rearrangeChildren(parentId) {
  const parent = nodes[parentId];
  if (!parent) return;
  const spacing = 105;
  const childIds = parent.children;
  const startY = parent.y - ((childIds.length - 1) * spacing) / 2;
  childIds.forEach((childId, index) => {
    const child = nodes[childId];
    if (!child) return;
    child.x = parent.x + 230;
    child.y = startY + index * spacing;
    const element = document.getElementById("node-" + childId);
    if (element) {
      element.style.left = child.x + "px";
      element.style.top = child.y + "px";
    }
    rearrangeChildren(childId);
  });
}

function drawMindMapLines() {
  const svg = document.getElementById("mindMapLines");
  svg.innerHTML = "";
  Object.values(nodes).forEach(node => {
    if (node.parent === null) return;
    const parentElement = document.getElementById("node-" + node.parent);
    const childElement = document.getElementById("node-" + node.id);
    if (!parentElement || !childElement) return;
    const startX = parentElement.offsetLeft + parentElement.offsetWidth;
    const startY = parentElement.offsetTop + parentElement.offsetHeight / 2;
    const endX = childElement.offsetLeft;
    const endY = childElement.offsetTop + childElement.offsetHeight / 2;
    const line = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    line.setAttribute("x1", startX);
    line.setAttribute("y1", startY);
    line.setAttribute("x2", endX);
    line.setAttribute("y2", endY);
    line.setAttribute("stroke", "#173f91");
    line.setAttribute("stroke-width", "3");
    svg.appendChild(line);
  });
}

function deleteSelectedNode() {
  if (selectedNodeId === 0) {
    alert("You cannot delete the main idea.");
    return;
  }
  deleteNodeAndChildren(selectedNodeId);
  rearrangeChildren(0);
  selectedNodeId = 0;
  selectNode(0);
  drawMindMapLines();
}

function deleteNodeAndChildren(id) {
  const node = nodes[id];
  node.children.forEach(childId => {
    deleteNodeAndChildren(childId);
  });
  const parent = nodes[node.parent];
  parent.children = parent.children.filter(childId => childId !== id);
  document.getElementById("node-" + id).remove();
  delete nodes[id];
  rearrangeChildren(parent.id);
}

function clearAllNodes() {
  Object.keys(nodes).forEach(id => {
    if (id != 0) {
      document.getElementById("node-" + id).remove();
      delete nodes[id];
    }
  });
  nodes[0].children = [];
  selectedNodeId = 0;
  selectNode(0);
  drawMindMapLines();
}

function makeNodeDraggable(element, id) {
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;
  element.addEventListener("mousedown", function(e){
    if(e.target.tagName === "INPUT") return;
    dragging = true;
    offsetX = e.clientX - nodes[id].x;
    offsetY = e.clientY - nodes[id].y;
    selectNode(id);
    e.preventDefault();
  });
  document.addEventListener("mousemove", function(e){
    if(!dragging) return;
    nodes[id].x = e.clientX - offsetX;
    nodes[id].y = e.clientY - offsetY;
    element.style.left = nodes[id].x + "px";
    element.style.top = nodes[id].y + "px";
    drawMindMapLines();
  });
  document.addEventListener("mouseup", function(){dragging = false;});
}

selectNode(0);
makeNodeDraggable(document.getElementById("node-0"), 0);
drawMindMapLines();

// GALLERY APP OPEN & MAIN CODE

var galleryScreen = document.querySelector("#gallery")
var galleryScreenClose = document.querySelector("#galleryClose")
var galleryScreenOpen = document.querySelector("#galleryIcon")
var galleryDockOpen = document.querySelector("#galleryDockIcon")

galleryScreenClose.addEventListener("click", function() {
  closeWindow(galleryScreen);
});
galleryScreenOpen.addEventListener("click", function() {
  openWindow(galleryScreen);
});     
galleryDockOpen.addEventListener("click", function() {
  openWindow(galleryScreen);
});     

const galleryPhotos = [
  { src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCM_d9SQ56xa8ccPT63FoBy0Jec32p7TRisgVzN3A0Qg&s=10" },
  { src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrYM8BBcsbNRMvCcrskAKW70lWv3N3CwlDNYAY6fsHUw&s=10" },
  { src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWshF1loKaYOPI7RpThNjeZWS-yZMysDUg8yvo5DzMwA&s=10" },
  { src: "https://i.redd.it/3enek456oxf31.jpg"},
  { src: "https://wallpapers.com/images/hd/dark-aesthetic-chicago-city-at-night-j8nbcohdzy6xytxj.jpg"}, 
  { src: "https://static1.squarespace.com/static/57f96248d482e9a19e507a7e/5e62d0cb4cd4c7519bd3a3ca/5e62d0ee4cd4c7519bd3a59c/1726440655091/?format=1500w"},
  { src: "https://w0.peakpx.com/wallpaper/809/229/HD-wallpaper-cade-on-chicago-city-aesthetic-new-york-city-travel-city-new-york-summer.jpg"},
  { src: "https://www.shutterstock.com/image-photo/chicago-river-riverwalk-on-cloudy-600nw-2523321043.jpg"},
  { src: "https://i.redd.it/3wt8l37qtjg21.jpg"},
  { src: "https://external-preview.redd.it/theres-something-about-the-sheer-raw-grit-of-this-city-that-v0-6jPW7Kz-EnBW1CqYGJPYr8FBaJbeBDvXvnRHjA7GJXM.jpg?width=640&crop=smart&auto=webp&s=f7805154337e1af44dd7a8bdfd6c755d7f0bdc0b"},
  { src: "https://images.squarespace-cdn.com/content/v1/57f96248d482e9a19e507a7e/1583534580986-UWYK00A7M35D9MYNKJ6C/Photography+Point+North+Ave+Beach+Chicago+John+Hancock+Center+Sunset+City+Illinois+Chicago+Blue+Hour+Ice+Icebergs+Lake+Michigan+Skyline"},
  { src: "https://freechicagowalkingtours.com/wp-content/uploads/2017/04/el-train.jpg"},
  { src: "https://imageio.forbes.com/i-forbesimg/media/lists/places/chicago-il_416x416.jpg?format=jpg&height=416&width=416&fit=bounds"}
];

let currentPhoto = 0;

function showPhoto() {
  const image = document.getElementById("galleryImage");
  const number = document.getElementById("galleryNumber");
  image.src = galleryPhotos[currentPhoto].src;
  number.textContent = (currentPhoto + 1) + " / " + galleryPhotos.length;
}

function nextPhoto() {
  currentPhoto++;
  if (currentPhoto >= galleryPhotos.length) {
    currentPhoto = 0;}
  showPhoto();
}

function previousPhoto() {
  currentPhoto--;
  if (currentPhoto < 0) {
    currentPhoto = galleryPhotos.length - 1;}
  showPhoto();
}

// PAINT APP OPEN

var paintScreen = document.querySelector("#paint")
var paintScreenClose = document.querySelector("#paintClose")
var paintScreenOpen = document.querySelector("#paintIcon")
var loadPaint = document.querySelector("#loadPaintWindow")
var paintDockOpen = document.querySelector("#paintDockIcon")

paintScreenClose.addEventListener("click", function() {
  closeWindow(paintScreen);
  closeWindow(loadPaint);
});
paintScreenOpen.addEventListener("click", function() {
  openWindow(paintScreen);
});
paintDockOpen.addEventListener("click", function() {
  openWindow(paintScreen);
});

// PAINT APP MAIN CODE

const canvas = document.getElementById("paintCanvas");
const ctx = canvas.getContext("2d");
let painting = false;
let erasing = false;

function toggleEraser() {
   if (erasing === false) {
    erasing = true; 
    eraserButton.style.backgroundColor = "rgba(100, 100, 200, 0.5)";
   } else {
    erasing = false;
    eraserButton.style.backgroundColor = "";
   };
};

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mouseup", stopDraw);
canvas.addEventListener("mouseleave", stopDraw);
canvas.addEventListener("mousemove", draw);

function startDraw(e) {
  painting = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
};

function stopDraw() {
  painting = false;
};

function draw(e) {
  if (!painting) return;
  if (erasing === true) {
    ctx.strokeStyle = "white";
  } else {
    ctx.strokeStyle = document.getElementById("colorPicker").value;
  };
  ctx.lineWidth = document.getElementById("brushSize").value;
  ctx.lineCap = "round";
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
};

const picker = document.getElementById("colorPicker");
const button = document.getElementById("colorButton");

function updatePicker(){
  button.style.boxShadow = `0 0 20px ${picker.value}55, 0 6px 15px rgba(0,0,0,.15), inset 0 1px rgba(255,255,255,.45)`;
  button.style.borderColor = picker.value;
}

picker.addEventListener("input",updatePicker);
updatePicker();

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

function saveCanvas() {
    let name = prompt("Enter a name for your painting:");
    if (name === null) return;
    name = name.trim();
    if (name === "") {
        name = "Untitled";
    }
    const image = canvas.toDataURL("image/png");
    const paintings =
        JSON.parse(localStorage.getItem("paintings")) || [];
    paintings.push({
        name: name,
        image: image
    });
    localStorage.setItem(
        "paintings",
        JSON.stringify(paintings)
    );
}

function loadCanvas() {
    const paintings =
        JSON.parse(localStorage.getItem("paintings")) || [];
    const list = document.getElementById("paintingList");
    list.innerHTML = "";
    paintings.forEach((painting,index)=>{
        const button = document.createElement("button");
        button.textContent = painting.name;
        button.classList.add("load-painting-button");
        button.onclick = ()=>{
            loadPainting(index);
            closeWindow(document.getElementById("loadPaintWindow"));
        };
        list.appendChild(button);
    });
    if (document.getElementById("loadPaintWindow").style.display === "none") {
        openWindow(document.getElementById("loadPaintWindow"));
    } else {
        closeWindow(document.getElementById("loadPaintWindow"));
    }
};

function loadPainting(index){
    const paintings =
        JSON.parse(localStorage.getItem("paintings"));
    const image = new Image();
    image.onload = function(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(image,0,0);
    };
    image.src = paintings[index].image;
}

// QUOTES MAIN CODE

const quotes = [
  "'I miss everything about Chicago, except January and February.' —Gary Cole",
  "'Chicago is an October sort of city even in spring.' —Nelson Algren",
  "'My first day in Chicago... I knew I belonged here.' —Oprah Winfrey",
  "'Chicago is the city that works.' —Richard J. Daley",
  "'It is wonderful to be here in the great state of Chicago.' —Dan Quayle",
  "'Blessed are the people of Chicago, and blessed are the strangers in their midst.' —James Parton",
  "'Id rather be a lamppost in Chicago than a millionare in any other city.' —William A. Hulbert"
];

function cycleQuotes() {
  const quoteElement = document.getElementById("quotes");
  const currentQuote = quoteElement.textContent;
  let nextQuoteIndex = quotes.indexOf(currentQuote) + 1;
  if (nextQuoteIndex >= quotes.length) {
    nextQuoteIndex = 0;
  }
  quoteElement.textContent = quotes[nextQuoteIndex];
}
setInterval(cycleQuotes, 50000);

// BROWSER APP OPEN

var browserScreen = document.querySelector("#browser")
var browserScreenClose = document.querySelector("#browserClose")
var browserScreenOpen = document.querySelector("#browserIcon")
var browserDockOpen = document.querySelector("#browserDockIcon")

browserScreenClose.addEventListener("click", function() {
  closeWindow(browserScreen);
});
browserScreenOpen.addEventListener("click", function() {
  openWindow(browserScreen);
});
browserDockOpen.addEventListener("click", function() {
  openWindow(browserScreen);
});

// BROWSER APP MAIN CODE

const browserFrame = document.getElementById("browserFrame");
const browserHome = document.getElementById("browserHome");
const browserURL = document.getElementById("browserURL");
let browserHistory = JSON.parse(localStorage.getItem("browserHistory")) || [];
let currentHistory = -1;

document.querySelectorAll(".browserShortcut")
.forEach(shortcut=>{
    shortcut.onclick=function(){
        browserURL.value=this.dataset.url;
        goWebsite();
    };
});

browserURL.addEventListener("keydown",function(e){
  if(e.key==="Enter"){goWebsite();}
});

let loadTimeout;

function goWebsite(){
    let text = browserURL.value.trim();
    if(text==="") return;
    let url;
    if(text.includes(".")){
        if(!text.startsWith("http")){
            url="https://"+text;
        } else {
            url=text;
        }
    } else  {
        url=
        "https://www.google.com/search?q="+
        encodeURIComponent(text);
    }
    browserFrame.src=url;
    browserFrame.style.display="block";
    browserHome.style.display="none";
    browserHistory.push(url);
    currentHistory=
    browserHistory.length-1;
    localStorage.setItem(
        "browserHistory",
        JSON.stringify(browserHistory)
    );
    updateBrowserHistory();
    browserBlocked.style.display="none";
    clearTimeout(loadTimeout);
    loadTimeout=setTimeout(function(){
        browserFrame.style.display="none";
        browserBlocked.style.display="block";
    },3000);
    document.getElementById("openExternally")
    .onclick=function(){
    window.open(browserFrame.src,"_blank");
  };
}

browserFrame.onload=function(){
    clearTimeout(loadTimeout);
};

function updateBrowserHistory() {
  browserHistory.slice().reverse().slice(0,8).forEach(url => {
    const item = document.createElement("div");
    item.className="historyItem";
    item.textContent = url;
    item.onclick = function() {
      browserURL.value = url;
      goWebsite();
    };
  });
}

document.getElementById("homeButton")
.onclick=function(){
    browserFrame.style.display="none";
    browserHome.style.display="block";
};

document.getElementById("refreshButton")
.onclick=function(){
    browserFrame.src = browserFrame.src;
};

document.getElementById("backButton")
.onclick=function(){
    if(currentHistory>0){
        currentHistory--;
        browserFrame.src=
        browserHistory[currentHistory];
        browserURL.value=
        browserHistory[currentHistory];
    }
};

document.getElementById("forwardButton")
.onclick=function(){
    if(currentHistory<
        browserHistory.length-1){
        currentHistory++;
        browserFrame.src=
        browserHistory[currentHistory];
        browserURL.value=
        browserHistory[currentHistory];
    }
};

updateBrowserHistory();

document.querySelectorAll(
".window,.paintwindow,.autoWindow"
).forEach(window=>{
    window.addEventListener("mousedown",()=>{
        highestZ++;
        window.style.zIndex=highestZ;
    });
});

//COMMENT JUST FOR FUN
