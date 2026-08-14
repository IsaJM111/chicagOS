let highestZ = 100;

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
    document.getElementById("clouds").style.transform=`translate(${x*25}px,${y*15}px)`;
    document.getElementById("lake").style.transform=`translate(${x*6}px,${y*3}px)`;
});

//FILE SYSTEM OPEN AND MAIN CODE

var filesScreen = document.querySelector("#files")
var filesScreenClose = document.querySelector("#filesClose")
var filesScreenOpen = document.querySelector("#filesIcon")
var filesDockOpen = document.querySelector("#filesDockIcon")

filesScreenClose.addEventListener("click", function() {
  closeWindow(filesScreen);
  dockClose(filesDockIcon)
});
filesScreenOpen.addEventListener("click", function() {
  openWindow(filesScreen);
  dockOpen(filesDockIcon);
});
filesDockOpen.addEventListener("click", function() {
  openWindow(filesScreen);
  dockOpen(filesDockIcon);
});

let db = null;
let dbReady = false;

const dbRequest = indexedDB.open("chicagOS", 1);
dbRequest.onupgradeneeded = function(event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains("folders")) {
      db.createObjectStore("folders", {
        keyPath: "name"
      });
    }
    if (!db.objectStoreNames.contains("files")) {
        const fileStore = db.createObjectStore("files", {
            keyPath: "id",
            autoIncrement: true
        });
        fileStore.createIndex("folder", "folder", {
            unique: false
        });
    }
};

dbRequest.onsuccess = function(event) {
    db = event.target.result;
    dbReady = true;
    initializeFileSystem();
    updateNotes();
    loadSavedMusic();
    loadSavedGalleryPhotos();
};

const defaultFolders = [
  "Desktop",
  "Notes",
  "Paintings",
  "Pictures",
  "Downloads",
  "Music"
];

function initializeFileSystem() {
  const transaction = db.transaction(
    "folders",
    "readwrite"
  );
  const store = transaction.objectStore("folders");
  defaultFolders.forEach(function(folderName) {
    const request = store.get(folderName);
    request.onsuccess = function(event) {
      if (!event.target.result) {
        store.add({
          name: folderName,
          system: true
        });
      }
    };
  });
  transaction.oncomplete = function() {
    loadFolders();
  };
}

function saveFile(folder, name, content, callback) {
    const transaction = db.transaction("files","readwrite");
    const store = transaction.objectStore("files");
    const request = store.add({
        folder: folder,
        name: name,
        content: content,
        created: Date.now()
    });
    request.onsuccess = function(event) {
        const fileId = event.target.result;
        if (callback) {
          callback(fileId);
        }
    };
}

function getFiles(folder, callback) {
    if (!dbReady || !db) {return;}
    const transaction =db.transaction("files", "readonly");
    const store = transaction.objectStore("files");
    const index = store.index("folder");
    const request = index.getAll(folder);
    request.onsuccess = function() {
        callback(request.result);
    };
    request.onerror = function(event) {
        callback([]);
    };
}

function openFolder(folder, button) {
  const display = document.getElementById("fileDisplay");
  display.innerHTML = "";
  document.querySelectorAll(".folderbutton").forEach(function(folderButton) {
    folderButton.classList.remove("selected");
  });
  button.classList.add("selected");
  getFiles(folder, function(files) {
    files.forEach(function(file) {
      const fileButton =document.createElement("button");
      fileButton.className = "fileButton";
      fileButton.textContent = file.name;
      fileButton.ondblclick = function() {
        if (folder === "Notes") {
          createNote(file.content);
          openWindow(notesScreen);
        }
        if (folder === "Paintings") {
          loadPainting(file.id);
          openWindow(paintScreen);
        }
      };
      display.appendChild(fileButton);
    });
      if (files.length === 0) {
        display.textContent = "This folder is empty";
      }
  });
}

function deleteFile(id) {
  const transaction = db.transaction(
    "files",
    "readwrite"
  );
  const store = transaction.objectStore("files");
  store.delete(id);
  transaction.oncomplete = function() {
    loadFolders();
  };
  transaction.onerror = function(event) {
    return;
  };
}

function newFolder() {
  const folderName = prompt("Name the new folder.");
  if (!folderName) {
    return;
  }
  const transaction = db.transaction("folders", "readwrite");
  const store = transaction.objectStore("folders");
  const request = store.add({
    name: folderName,
    system: false
  });
  transaction.oncomplete = function() {loadFolders();};
}

function deleteFolder(folderName) {
  const transaction = db.transaction(
    "folders",
    "readwrite"
  );
  const store = transaction.objectStore("folders");
  const request = store.get(folderName);
  request.onsuccess = function(event) {
    const folder = event.target.result;
    if (!folder) {
      return;
    }
    if (folder.system) {
      newNotification("System folders cannot be deleted.");
      return;
    }
    store.delete(folderName);
    deleteFilesInFolder(folderName);
    transaction.oncomplete = function() {
      loadFolders();
    };
  };
}

function deleteFilesInFolder(folderName) {
  getFiles(folderName, function(files) {
    const transaction = db.transaction(
      "files",
      "readwrite"
    );
    const store = transaction.objectStore("files");
    files.forEach(function(file) {
      store.delete(file.id);
    });
  });
}

function loadFolders() {
    const folderContainer = document.getElementById("folderbuttons");
    if (!folderContainer) {return;}
    const transaction = db.transaction("folders", "readonly");
    const store = transaction.objectStore("folders");
    const request = store.getAll();
    request.onsuccess = function(event) {
      const folders = event.target.result;
      folderContainer.innerHTML = "";
      folders.forEach(function(folder) {
    const button = document.createElement("button");
    button.className = "folderbutton";
    button.textContent = folder.name;
    button.onclick = function() {
        openFolder(folder.name, button);
    };
    button.oncontextmenu = function(event) {
        event.preventDefault();
        selectedFolder = folder.name;
        showFolderMenu(
            event.clientX,
            event.clientY
        );
    };
    folderContainer.appendChild(button);
  });
    };
}

function showFolderMenu(x,y){
    let menu =document.getElementById("folderMenu");
    menu.style.left = x + "px";
    menu.style.top = y + "px";
    menu.style.display = "flex";
}

function hideFolderMenu(){
  document.getElementById("folderMenu").style.display = "none";
}

document.addEventListener("click",function(){
    hideFolderMenu();
});

function renameFolder(oldName) {
  const newName = prompt("Enter a new folder name:", oldName);
  if (!newName || newName === oldName) {
    return;
  }
  const transaction = db.transaction(
    "folders",
    "readwrite"
  ); 
  const store = transaction.objectStore("folders");
  const request = store.get(oldName);
  request.onsuccess = function(event) {
    const folder = event.target.result;
    if (!folder) {
      return;
    }
    if (folder.system) {
      newNotification("System folders cannot be renamed.");
      return;
    }
    const newFolderRequest = store.add({name: newName, system: false});
    newFolderRequest.onsuccess = function() {
      getFiles(oldName, function(files) {
        files.forEach(function(file) {
           const fileTransaction = db.transaction("files","readwrite");
           const fileStore = fileTransaction.objectStore("files");
           file.folder = newName;
           fileStore.put(file);
        });
      });
      store.delete(oldName);
      newNotification("Folder renamed.");
      loadFolders();
    };
    newFolderRequest.onerror =
    function() {
      newNotification("That folder already exists.");
    };
  };
}

document.getElementById("deleteFolderButton").onclick = function(){
  deleteFolder(selectedFolder);
  hideFolderMenu();
};
document.getElementById("renameFolderButton").onclick = function(){
  renameFolder(selectedFolder);
  hideFolderMenu();
};

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
    var currentTime =   new Date().toLocaleString();
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
dragElement(document.getElementById("terminal"));
dragElement(document.getElementById("files"));
dragElement(document.getElementById("music"));

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

// WINDOW GENERAL CODE

function openWindow(window,dockIcon){
  window.style.display = "block";
  if(dockIcon){
    dockIcon.classList.add("open");
  }
  highestZ++;
  window.style.zIndex=highestZ;
}

function closeWindow(window,dockIcon){
    window.style.display = "none";
    if(dockIcon){
        dockIcon.classList.remove("open");
    }
}

// WELCOME SCREEN OPEN

var welcomeScreen = document.querySelector("#welcome")
var welcomeScreenClose = document.querySelector("#welcomeClose")
var welcomeScreenOpen = document.querySelector("#welcomeOpen")

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
  dockClose(notesDockIcon)
});
notesScreenOpen.addEventListener("click", function() {
  openWindow(notesScreen);
  dockOpen(notesDockIcon);
});
notesDockOpen.addEventListener("click", function() {
  openWindow(notesScreen);
  dockOpen(notesDockIcon);
});

// MIND MAP APP OPEN

var mindMapScreen = document.querySelector("#mindMap")
var mindMapScreenClose = document.querySelector("#mindMapClose")
var mindMapScreenOpen = document.querySelector("#mapIcon")
var mapDockOpen = document.querySelector("#mapDockIcon")

mindMapScreenClose.addEventListener("click", function() {
  closeWindow(mindMapScreen);
  dockClose(mapDockIcon);
});
mindMapScreenOpen.addEventListener("click", function() {
  openWindow(mindMapScreen);
  dockOpen(mapDockIcon);
});
mapDockOpen.addEventListener("click", function() {
  openWindow(mindMapScreen);
  dockOpen(mapDockIcon);
});

// NOTES MAIN CODE

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
    noteInput.setAttribute(
      "data-placeholder",
      "Type your note here..."
    );
    noteInput.innerHTML = text;
    deleteButton.onclick = () => {
      note.remove();
    };
    saveButton.onclick = () => {
      saveNote(noteInput.innerHTML);
    };
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
  if (name === null) {
    return;
  }
  name = name.trim();
  if (name === "") {
    name = "Untitled";
  }
  saveFile("Notes", name, content, function() {
    newNotification("'" + name + "' saved successfully.");
    updateNotes();
  });
}

function updateNotes() {
  const list = document.getElementById("notesList");
  list.innerHTML = "";
  getFiles("Notes", function(notes) {
    notes.forEach(function(note) {
      const row = document.createElement("div");
      row.className = "saved-note-row";
      const button = document.createElement("button");
      button.className = "load-note-button";
      button.textContent = note.name;
      button.onclick = function() {
        loadNote(note);
      };
      const deleteButton = document.createElement("button");
      deleteButton.className = "delete-saved-note-button";
      deleteButton.textContent = "✕";
      deleteButton.onclick = function(event) {
        event.stopPropagation();
        deleteSavedNote(note.id);
      };
      row.appendChild(button);
      row.appendChild(deleteButton);
      list.appendChild(row);
    });
    if (notes.length === 0) {
      list.textContent = "No saved notes.";
    }
  });
}

function deleteSavedNote(id) {
  deleteFile(id);
  setTimeout(function() {updateNotes();}, 50);
}

function loadNote(note) {
  createNote(note.content);
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
  dockClose(calculatorDockIcon);
});
calculatorScreenOpen.addEventListener("click", function() {
  openWindow(calculatorScreen);
  dockOpen(calculatorDockIcon);
});
calculatorDockOpen.addEventListener("click", function() {
  openWindow(calculatorScreen);
  dockOpen(calculatorDockIcon);
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
    newNotification("You cannot delete the main idea.");
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
  dockClose(galleryDockIcon);
});
galleryScreenOpen.addEventListener("click", function() {
  openWindow(galleryScreen);
  dockOpen(galleryDockIcon);
});     
galleryDockOpen.addEventListener("click", function() {
  openWindow(galleryScreen);
  dockOpen(galleryDockIcon);
});     

const defaultGalleryPhotos = [
  {
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCM_d9SQ56xa8ccPT63FoBy0Jec32p7TRisgVzN3A0Qg&s=10",
    name: "Chicago"
  },
  {
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrYM8BBcsbNRMvCcrskAKW70lWv3N3CwlDNYAY6fsHUw&s=10",
    name: "Chicago"
  },
  {
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWshF1loKaYOPI7RpThNjeZWS-yZMysDUg8yvo5DzMwA&s=10",
    name: "Chicago"
  },
  {
    src: "https://i.redd.it/3enek456oxf31.jpg",
    name: "Chicago"
  },
  {
    src: "https://wallpapers.com/images/hd/dark-aesthetic-chicago-city-at-night-j8nbcohdzy6xytxj.jpg",
    name: "Chicago at Night"
  },
  {
    src: "https://static1.squarespace.com/static/57f96248d482e9a19e507a7e/5e62d0cb4cd4c7519bd3a3ca/5e62d0ee4cd4c7519bd3a59c/1726440655091/?format=1500w",
    name: "Chicago"
  },
  {
    src: "https://w0.peakpx.com/wallpaper/809/229/HD-wallpaper-cade-on-chicago-city-aesthetic-new-york-city-travel-city-new-york-summer.jpg",
    name: "Chicago Skyline"
  },
  {
    src: "https://www.shutterstock.com/image-photo/chicago-river-riverwalk-on-cloudy-600nw-2523321043.jpg",
    name: "Chicago Riverwalk"
  },
  {
    src: "https://i.redd.it/3wt8l37qtjg21.jpg",
    name: "Chicago"
  },
  {
    src: "https://external-preview.redd.it/theres-something-about-the-sheer-raw-grit-of-this-city-that-v0-6jPW7Kz-EnBW1CqYGJPYr8FBaJbeBDvXvnRHjA7GJXM.jpg?width=640&crop=smart&auto=webp&s=f7805154337e1af44dd7a8bdfd6c755d7f0bdc0b",
    name: "Chicago"
  },
  {
    src: "https://images.squarespace-cdn.com/content/v1/57f96248d482e9a19e507a7e/1583534580986-UWYK00A7M35D9MYNKJ6C/Photography+Point+North+Ave+Beach+Chicago+John+Hancock+Center+Sunset+City+Illinois+Chicago+Blue+Hour+Ice+Icebergs+Lake+Michigan+Skyline",
    name: "Chicago Skyline"
  },
  {
    src: "https://freechicagowalkingtours.com/wp-content/uploads/2017/04/el-train.jpg",
    name: "Chicago El Train"
  },
  {
    src: "https://imageio.forbes.com/i-forbesimg/media/lists/places/chicago-il_416x416.jpg?format=jpg&height=416&width=416&fit=bounds",
    name: "Chicago"
  }
];

let customGalleryPhotos = [];
let galleryPhotos = [...defaultGalleryPhotos];
let currentPhoto = 0;

function loadSavedGalleryPhotos() {
  getFiles("Pictures", function(files) {
    files.forEach(function(file) {
      if (!file.content) {
        return;
      }
      if (!file.content.type || !file.content.type.startsWith("image/")) {
        return;
      }
      const imageURL = URL.createObjectURL(file.content);
      const photo = {
        src: imageURL,
        name: file.name,
        custom: true,
        fileId: file.id
      };
      customGalleryPhotos.push(photo);
      galleryPhotos.push(photo);
    });
    createThumbnails();
    showPhoto();
  });
}

function showPhoto() {
  const image = document.getElementById("galleryImage");
  const number = document.getElementById("galleryNumber");
  const name = document.getElementById("galleryPhotoName");
  if (!galleryPhotos.length) {
    return;
  }
  const photo = galleryPhotos[currentPhoto];
  image.src = photo.src;
  number.textContent = (currentPhoto + 1) + " / " + galleryPhotos.length;
  name.textContent = photo.name || "Untitled";
  updateThumbnails();
}

function nextPhoto() {
  if (galleryPhotos.length === 0) {
    return;
  }
  currentPhoto++;
  if (currentPhoto >= galleryPhotos.length) {
    currentPhoto = 0;
  }
  showPhoto();
}

function previousPhoto() {
  if (galleryPhotos.length === 0) {
    return;
  }
  currentPhoto--;
  if (currentPhoto < 0) {
    currentPhoto = galleryPhotos.length - 1;
  }
  showPhoto();
}

function createThumbnails() {
  const thumbnailContainer = document.getElementById("galleryThumbnails");
  thumbnailContainer.innerHTML = "";
  galleryPhotos.forEach((photo, index) => {
    const thumbnail = document.createElement("div");
    thumbnail.className = "galleryThumbnail";
    thumbnail.onclick = function () {
      currentPhoto = index;
      showPhoto();
    };
    const image = document.createElement("img");
    image.src = photo.src;
    image.alt = photo.name || "Gallery photo";
    thumbnail.appendChild(image);
    if (photo.custom === true) {
      const deleteButton = document.createElement("button");
      deleteButton.className = "deleteThumbnail";
      deleteButton.textContent = "x";
      deleteButton.onclick = function (event) {
        event.stopPropagation();
        deleteCustomPhoto(index);
      };
      thumbnail.appendChild(deleteButton);
    }
    thumbnailContainer.appendChild(thumbnail);
  });
  updateThumbnails();
}

function updateThumbnails() {
  const thumbnails = document.querySelectorAll(".galleryThumbnail");
  thumbnails.forEach((thumbnail, index) => {
    thumbnail.classList.remove("selected");
    if (index === currentPhoto) {
      thumbnail.classList.add("selected");
      thumbnail.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center"
      });
    }
  });
}

function scrollThumbnails(direction) {
  const container = document.getElementById("galleryThumbnails");
  container.scrollBy({
    left: direction * 250,
    behavior: "smooth"
  });
}

const photoUpload = document.getElementById("photoUpload");

photoUpload.addEventListener("change", function (event) {
  const files = Array.from(event.target.files);
  if (files.length === 0) {
    return;
  }
  files.forEach(function (file) {
    if (!file.type.startsWith("image/")) {
      return;
    }
    saveFile(
      "Pictures", file.name,file,function(fileId) {
        const imageURL = URL.createObjectURL(file);
        const newPhoto = {src: imageURL,name: file.name,custom: true,fileId: fileId};
        customGalleryPhotos.push(newPhoto);
        galleryPhotos.push(newPhoto);
        createThumbnails();
        currentPhoto = galleryPhotos.length - 1;
        showPhoto();
      }
    );
  });
  photoUpload.value = "";
});

function deleteCustomPhoto(index) {
  const photo = galleryPhotos[index];
  if (!photo || photo.custom !== true) {
    return;
  }
  const confirmed = confirm("Delete this photo?");
  if (!confirmed) {
    return;
  }
  customGalleryPhotos =
    customGalleryPhotos.filter(
      function (photoItem) {
        return photoItem.src !== photo.src;
      }
    );
  localStorage.setItem(
    "customGalleryPhotos",
    JSON.stringify(customGalleryPhotos)
  );
  galleryPhotos.splice(index, 1);
  if (currentPhoto >= galleryPhotos.length) {
    currentPhoto = galleryPhotos.length - 1;
  }
  if (currentPhoto < 0) {
    currentPhoto = 0;
  }
  createThumbnails();
  showPhoto();
}

function showGalleryGrid() {
  const viewer = document.querySelector(".galleryViewer");
  const info = document.querySelector(".galleryInfo");
  const thumbnails = document.querySelector(".thumbnailContainer");
  const toolbar = document.querySelector(".galleryToolbar");
  const grid = document.getElementById("galleryGrid");
  const gridPhotos = document.getElementById("galleryGridPhotos");
  viewer.style.display = "none";
  info.style.display = "none";
  thumbnails.style.display = "none";
  toolbar.style.display = "none";
  grid.style.display = "flex";
  gridPhotos.innerHTML = "";
  galleryPhotos.forEach(function (photo, index) {
    const item = document.createElement("div");
    item.className ="galleryGridItem";
    const image = document.createElement("img");
    image.src = photo.src;
    image.alt = photo.name || "Gallery photo";
    image.onclick = function () {
      currentPhoto = index;
      showGallerySlideshow();
    };
    item.appendChild(image);
    const title =document.createElement("span");
    title.textContent =photo.name || "Untitled";
    item.appendChild(title);
    gridPhotos.appendChild(item);
  });
}

function showGallerySlideshow() {
  const viewer = document.querySelector(".galleryViewer");
  const info = document.querySelector(".galleryInfo");
  const thumbnails = document.querySelector(".thumbnailContainer");
  const toolbar = document.querySelector(".galleryToolbar");
  const grid = document.getElementById("galleryGrid");
  viewer.style.display = "flex";
  info.style.display = "block";
  thumbnails.style.display = "flex";
  toolbar.style.display = "flex";
  grid.style.display = "none";
  showPhoto();
}

document.addEventListener("keydown", function (event) {
  if (
    event.target.tagName === "INPUT" ||
    event.target.tagName === "TEXTAREA"
  ) {
    return;
  }
  const gallery =document.getElementById("gallery");
  if (
    gallery.style.display === "none" ||
    !gallery.style.display
  ) {
    return;
  }
  if (event.key === "ArrowRight") {
    nextPhoto();
  }
  if (event.key === "ArrowLeft") {
    previousPhoto();
  }
});

createThumbnails();
showPhoto();

// PAINT APP OPEN

var paintScreen = document.querySelector("#paint")
var paintScreenClose = document.querySelector("#paintClose")
var paintScreenOpen = document.querySelector("#paintIcon")
var loadPaint = document.querySelector("#loadPaintWindow")
var paintDockOpen = document.querySelector("#paintDockIcon")

paintScreenClose.addEventListener("click", function() {
  closeWindow(paintScreen);
  closeWindow(loadPaint);
  dockClose(paintDockIcon);
});
paintScreenOpen.addEventListener("click", function() {
  openWindow(paintScreen);
  dockOpen(paintDockIcon);
});
paintDockOpen.addEventListener("click", function() {
  openWindow(paintScreen);
  dockOpen(paintDockIcon);
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
    if (name === null) {
        return;
    }
    name = name.trim();
    if (name === "") {
        name = "Untitled";
    }
    const image = canvas.toDataURL("image/png");
    saveFile("Paintings", name, image, function(fileId) {
        newNotification(
            "'" + name + "' saved successfully."
        );
        loadCanvas();
    });
}

function loadCanvas() {
    const list = document.getElementById("paintingList");
    list.innerHTML = "";
    getFiles("Paintings", function(paintings) {
        paintings.forEach(function(painting) {
            const button = document.createElement("button");
            button.textContent = painting.name;
            button.classList.add("load-painting-button");
            button.onclick = function() {
                loadPainting(painting.id);
                closeWindow(
                    document.getElementById(
                        "loadPaintWindow"
                    )
                );
            };
            list.appendChild(button);
        });
        if (paintings.length === 0) {
            list.textContent = "No saved paintings.";
        }
        const loadWindow = document.getElementById("loadPaintWindow");
        if (loadWindow.style.display === "none") {
            openWindow(loadWindow);
        } else {
            closeWindow(loadWindow);
        }
    });
}

function loadPainting(id) {
    getFiles("Paintings", function(paintings) {
        const painting = paintings.find(function(file) {
            return file.id === id;
        });
        if (!painting) {
            return;
        }
        const image = new Image();
        image.onload = function() {
            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );
            ctx.drawImage(
                image,
                0,
                0,
                canvas.width,
                canvas.height
            );
        };
        image.src = painting.content;
    });
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
  dockClose(browserDockIcon);
});
browserScreenOpen.addEventListener("click", function() {
  openWindow(browserScreen);
  dockOpen(browserDockIcon);
});
browserDockOpen.addEventListener("click", function() {
  openWindow(browserScreen);
  dockOpen(browserDockIcon);
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

// TERMINAL APP OPEN

var terminalScreen = document.querySelector("#terminal")
var terminalScreenClose = document.querySelector("#terminalClose")
var terminalScreenOpen = document.querySelector("#terminalIcon")
var terminalDockOpen = document.querySelector("#terminalDockIcon")

terminalScreenClose.addEventListener("click", function() {
  closeWindow(terminalScreen);
  dockClose(terminalDockIcon)
});
terminalScreenOpen.addEventListener("click", function() {
  openWindow(terminalScreen);
  dockOpen(terminalDockIcon);
});
terminalDockOpen.addEventListener("click", function() {
  openWindow(terminalScreen);
  dockOpen(terminalDockIcon);
});

// TERMINAL APP MAIN CODE

function printTerminal(text){
    const output = document.getElementById("terminalOutput");
    output.innerHTML +="<br>"+text;
    output.scrollTop =output.scrollHeight;
}

function typeTerminal(text,speed=25){
  const output = document.getElementById("terminalOutput");
  let line =document.createElement("div");
  output.appendChild(line);
  let i=0;
  function type(){
    if(i<text.length){
      line.innerHTML += text.charAt(i);
      i++;
      output.scrollTop = output.scrollHeight;
      setTimeout(type,speed);
    }
  }
  type();
}

function runCommand(command){
    command = command.toLowerCase();
    if(command==="help"){
        printTerminal(
        "Commands:<br>"+
        "help<br>"+
        "clear<br>"+
        "ls<br>"+
        "date<br>"+
        "time<br>"+
        "about<br>"+
        "open (app)<br>"+
        "close (app)<br>"
        );
    }
    else if(command==="clear"){
      document.getElementById("terminalOutput").innerHTML="";
    }
    else if(command==="date"){
      typeTerminal(new Date().toDateString());
    }
    else if(command==="time"){
      typeTerminal(new Date().toLocaleTimeString());
    }
    else if(command==="about"){
      typeTerminal("chicagOS Version 1.0");
    }
    else if(command==="ls"){
      printTerminal("Notes<br>"+"Mind Map<br>"+"Calculator<br>"+"Gallery<br>"+"Paint<br>"+"Browser<br>"+"Files<br>");
    }
    else if(command==="open notes"){
      openWindow(notes);
      dockOpen(notesDockIcon);
      typeTerminal("Notes opened");
    }
    else if(command==="open mind map"){
      openWindow(mindMap);
      dockOpen(mapDockIcon);
      typeTerminal("Mind Map opened")
    }
    else if(command==="open calculator"){
      openWindow(calculatorScreen);
      dockOpen(calculatorDockIcon);
      typeTerminal("Calculator opened");
    }
    else if(command==="open paint"){
      openWindow(paint);
      dockOpen(paintDockIcon);
      typeTerminal("Paint opened");
    }
    else if(command==="open gallery"){
      openWindow(galleryScreen);
      dockOpen(galleryDockIcon);
      typeTerminal("galleryOpened");
    }
    else if(command==="open browser"){
      openWindow(browser);
      dockOpen(browserDockIcon);
      typeTerminal("Browser opened");
    }
    else if(command==="open files"){
      openWindow(files);
      dockOpen(filesDockIcon);
      typeTerminal("Files opened");
    }
    else if(command==="open music"){
      openWindow(music);
      dockOpen(musicDockIcon);
      typeTerminal("Music opened");
    }
    else if(command==="close notes"){
      closeWindow(notes);
      dockClose(notesDockIcon)
      typeTerminal("Notes closed");
    }
    else if(command==="close mind map"){
      closeWindow(mindMap);
      dockClose(mapDockIcon);
      typeTerminal("Mind Map closed");
    }
    else if(command==="close calculator"){
      closeWindow(calculatorScreen);
      dockClose(calculatorDockIcon);
      typeTerminal("Calculator closed");
    }
    else if(command==="close paint"){
      closeWindow(paint);
      dockClose(paintDockIcon);
      typeTerminal("Paint closed");
    }
    else if(command==="close gallery"){
      closeWindow(galleryScreen);
      dockClose(galleryDockIcon);
      typeTerminal("Gallery closed");
    }
    else if(command==="close browser"){
      closeWindow(browser);
      dockClose(browserDockIcon);
      typeTerminal("Browser closed");
    }
    else if(command==="close files"){
      closeWindow(files);
      dockClose(filesDockIcon);
      typeTerminal("Files closed");
    }
    else if(command==="close music"){
      closeWindow(music);
      dockClose(musicDockIcon);
      typeTerminal("Music closed");
    }
    else if(command==="close terminal", "terminate", "goodbye"){
      closeWindow(terminalScreen);
      dockClose(terminalDockIcon);
    }
    else{
      printTerminal("Unknown command.");
    }
}

const terminalInput =document.getElementById("terminalInput");
terminalInput.addEventListener("keydown",function(e){
  if(e.key==="Enter"){
    const command = this.value;
    printTerminal("> "+command);
    runCommand(command);
    this.value="";
  }
});

// MUSIC APP OPEN

var musicScreen = document.querySelector("#music");
var musicScreenClose = document.querySelector("#musicClose");
var musicScreenOpen = document.querySelector("#musicIcon");
var musicDockOpen = document.querySelector("#musicDockIcon");

dragElement(document.getElementById("music"));

musicScreenClose.addEventListener("click", function () {
    closeWindow(musicScreen);
    dockClose(musicDockOpen);
});

musicScreenOpen.addEventListener("click", function () {
    openWindow(musicScreen);
    dockOpen(musicDockOpen);
});

musicDockOpen.addEventListener("click", function () {
    openWindow(musicScreen);
    dockOpen(musicDockOpen);
});

// MUSIC PLAYER

const audioPlayer = document.getElementById("audioPlayer");
const playlist = document.getElementById("playlist");
const musicPicker = document.getElementById("musicPicker");
const addMusicButton = document.getElementById("addMusicButton");
const playPauseButton = document.getElementById("playPause");
const nextButton = document.getElementById("nextSong");
const previousButton = document.getElementById("previousSong");
const progressBar = document.getElementById("progressBar");
const volumeSlider = document.getElementById("volumeSlider");
const songTitle = document.getElementById("songTitle");
const songArtist = document.getElementById("songArtist");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const art = document.getElementById("albumArt");

let songs = [];
let currentSong = 0;

function loadSavedMusic() {
  getFiles("Music", function(files) {
    songs = [];
    files.forEach(function(file) {
      if (!file.content) {
        return;
      }
      if (!file.content.type || !file.content.type.startsWith("audio/")) {
        return;
      }
      songs.push({
        name: file.name,
        file: file.content
      });
    });
    updateMusicLibrary();
  });
}

addMusicButton.onclick = function () {
    musicPicker.click();
};

musicPicker.addEventListener("change", function () {
  for (const file of this.files) {
    saveFile("Music",file.name,file,function(fileId) {
      songs.push({
        name: file.name,
        file: file
      });
      updateMusicLibrary();
    });
  }
  this.value = "";
});

function updateMusicLibrary() {
    playlist.innerHTML = "";
    songs.forEach(function (song, index) {
        const button = document.createElement("button");
        button.className = "songButton";
        button.textContent = song.name;
        button.onclick = function () {
            loadSong(index);
        };
        playlist.appendChild(button);
    });
}

function loadSong(index) {
    currentSong = index;
    audioPlayer.src = URL.createObjectURL(songs[index].file);
    songTitle.textContent = songs[index].name;
    songArtist.textContent = "Local File";
    document.querySelectorAll(".songButton").forEach(function (button) {
        button.classList.remove("active");
    });
    playlist.children[index].classList.add("active");
    audioPlayer.play();
    playPauseButton.textContent = "⏸";
}

playPauseButton.onclick = function () {
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseButton.textContent = "⏸";
        art.classList.add("albumartt");
    } else {
        audioPlayer.pause();
        playPauseButton.textContent = "▶";
        art.classList.remove("albumartt");
    }
};

nextButton.onclick = function () {
    if (songs.length === 0) return;
    currentSong++;
    if (currentSong >= songs.length) {
        currentSong = 0;
    }
    loadSong(currentSong);
};

previousButton.onclick = function () {
    if (songs.length === 0) return;
    currentSong--;
    if (currentSong < 0) {
        currentSong = songs.length - 1;
    }
    loadSong(currentSong);
};

volumeSlider.oninput = function () {
    audioPlayer.volume = this.value;
};

audioPlayer.onended = function () {
    nextButton.click();
};

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return minutes + ":" + String(secs).padStart(2, "0");
}

audioPlayer.addEventListener("loadedmetadata", function () {
  totalTime.textContent = formatTime(audioPlayer.duration);
});

audioPlayer.addEventListener("timeupdate", function () {
  currentTime.textContent = formatTime(audioPlayer.currentTime);
  if (audioPlayer.duration) {
    progressBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  }
});

progressBar.oninput = function () { 
  if (audioPlayer.duration) {
    audioPlayer.currentTime = (this.value / 100) * audioPlayer.duration;
  }
};

// NOTIFICATION CENTER CODE

var notifications = document.querySelector("#notificationCenter")
var notifScreenClose = document.querySelector("#notificationClose")
notifScreenClose.addEventListener("click", function() {
  closeWindow(notifications);
});

function newNotification(notificationMessage) {
  const notifs = document.getElementById("notificationCenter");
  const notifText = document.getElementById("notificationText");
  const timebar =  document.querySelector(".timerbar");
  if (!notifs || !notifText || !timebar) {
    return;
  }
  notifText.innerHTML = "";
  notifs.style.display = "flex";
  notifText.textContent = notificationMessage;
  setTimeout(function() {closeWindow(notifs);}, 5000);
  timebar.classList.add("notifTime");
}

// CALENDAR

const clock = document.getElementById("timeElement");
const calendarPopup = document.getElementById("calendarPopup");
const calendarDays = document.getElementById("calendarDays");
const calendarMonthYear = document.getElementById("calendarMonthYear");
const calendarPrev = document.getElementById("calendarPrev");
const calendarNext = document.getElementById("calendarNext");
const calendarToday = document.getElementById("calendarToday");

let calendarDate = new Date();
let selectedDate = new Date();

function renderCalendar() {
    calendarDays.innerHTML = "";
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const monthName = calendarDate.toLocaleString("default", {
        month: "long"
    });
    calendarMonthYear.textContent = monthName + " " + year;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        empty.className = "calendarDay empty";
        calendarDays.appendChild(empty);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const button = document.createElement("button");
        button.className = "calendarDay";
        button.textContent = day;
        const thisDate = new Date(
            year,
            month,
            day
        );
        const now = new Date();
        if (
            thisDate.getFullYear() === now.getFullYear() &&
            thisDate.getMonth() === now.getMonth() &&
            thisDate.getDate() === now.getDate()
        ) {
            button.classList.add("today");
        }
        if (
            thisDate.getFullYear() === selectedDate.getFullYear() &&
            thisDate.getMonth() === selectedDate.getMonth() &&
            thisDate.getDate() === selectedDate.getDate()
        ) {
            button.classList.add("selected");
        }
        button.onclick = function () {
            selectedDate = thisDate;
            renderCalendar();
        };
        calendarDays.appendChild(button);
    }
}

clock.addEventListener("click", function(event) {
    event.stopPropagation();
    calendarPopup.classList.toggle("show");
    if (calendarPopup.classList.contains("show")) {
        const rect = clock.getBoundingClientRect();
        calendarPopup.style.right = "5px";
        calendarPopup.style.bottom = (window.innerHeight - rect.top + 10) + "px";
        calendarDate = new Date();
        renderCalendar();
    }
});

calendarPrev.addEventListener("click", function(event) {
    event.stopPropagation();
    calendarDate.setMonth(
        calendarDate.getMonth() - 1
    );
    renderCalendar();
});

calendarNext.addEventListener("click", function(event) {
    event.stopPropagation();
    calendarDate.setMonth(
        calendarDate.getMonth() + 1
    );
    renderCalendar();
});

calendarToday.addEventListener("click", function(event) {
    event.stopPropagation();
    const today = new Date();
    calendarDate = new Date(today);
    selectedDate = new Date(today);
    renderCalendar();
});

//GENERAL FUNCTIONS

document.querySelectorAll(
".window,.paintwindow,.autoWindow"
).forEach(window=>{
    window.addEventListener("mousedown",()=>{
        highestZ++;
        window.style.zIndex=highestZ;
    });
});

function dockOpen(dock){
    dock.classList.add("open");
}

function dockClose(dock){
    dock.classList.remove("open");
}

let selectedAppIcon = null;
const icons = document.querySelectorAll(".appicon");
icons.forEach(icon => {
  icon.addEventListener("contextmenu", function(event) {
    event.preventDefault();
    selectedAppIcon = icon;
    showAppMenu(event.pageX, event.pageY);
  });
});

function showAppMenu(x, y) {
  const menu = document.getElementById("appIconMenu");
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  menu.style.display = "flex";
}

function hideAppIcon() {
  if (selectedAppIcon) {
    selectedAppIcon.style.display = "none";
  }
  hideAppMenu();
}

document.addEventListener("click",function(){
  hideAppMenu();
});

function hideAppMenu() {
  document.getElementById("appIconMenu").style.display = "none";
}
//COMMENT JUST FOR FUN
