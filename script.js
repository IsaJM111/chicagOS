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

// Welcome Screen

var welcomeScreen = document.querySelector("#welcome")
var welcomeScreenClose = document.querySelector("#welcomeClose")
var welcomeScreenOpen = document.querySelector("#welcomeOpen")

function closeWindow(element) {
  element.style.display = "none"
}
function openWindow(element) {
  element.style.display = "block"
}

welcomeScreenClose.addEventListener("click", function() {
  closeWindow(welcomeScreen);
});
welcomeScreenOpen.addEventListener("click", function() {
  openWindow(welcomeScreen);
});

// Notes app open

var notesScreen = document.querySelector("#notes")
var notesScreenClose = document.querySelector("#notesClose")
var notesScreenOpen = document.querySelector("#notesIcon")

function closeWindow(element) {
  element.style.display = "none"
}
function openWindow(element) {
  element.style.display = "block"
}
notesScreenClose.addEventListener("click", function() {
  closeWindow(notesScreen);
});
notesScreenOpen.addEventListener("click", function() {
  openWindow(notesScreen);
});

// Mind Map app open

var mindMapScreen = document.querySelector("#mindMap")
var mindMapScreenClose = document.querySelector("#mindMapClose")
var mindMapScreenOpen = document.querySelector("#mapIcon")

function closeWindow(element) {
  element.style.display = "none"
}
function openWindow(element) {
  element.style.display = "block"
}
mindMapScreenClose.addEventListener("click", function() {
  closeWindow(mindMapScreen);
});
mindMapScreenOpen.addEventListener("click", function() {
  openWindow(mindMapScreen);
});

// Notes main code

const notesContainer = document.querySelector("#notesContainer");
const notesContainerNew = document.querySelector("#newNote");

function createNote() {
  const note = document.createElement("div");
  note.classList.add("note");
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-note");
  deleteButton.textContent = "X";
  deleteButton.setAttribute("aria-label", "Delete note");
  const noteInput = document.createElement("div");
  noteInput.classList.add("note-input");
  noteInput.contentEditable = "true";
  noteInput.setAttribute("data-placeholder", "Type your note here...");
  deleteButton.addEventListener("click", () => {
    note.remove();
  });
  note.appendChild(deleteButton);
  note.appendChild(noteInput);
  notesContainer.appendChild(note);
  noteInput.focus();
}

notesContainerNew.addEventListener("click", () => {
  notesContainer.style.display = "flex";
  createNote();
});

// Calc app open

var calculatorScreen = document.querySelector("#calculator")
var calculatorScreenClose = document.querySelector("#calculatorClose")
var calculatorScreenOpen = document.querySelector("#calculatorIcon")

calculatorScreenClose.addEventListener("click", function() {
  closeWindow(calculatorScreen);
});
calculatorScreenOpen.addEventListener("click", function() {
  openWindow(calculatorScreen);
});

// Calc app main code

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

// MIND MAPP APP MAIN CODE

let selectedNodeId = 0;
let nextNodeId = 1;

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
  document.getElementById("mindMapArea").appendChild(newNode);
  rearrangeChildren(selectedNodeId);
  drawMindMapLines();
  selectNode(newId);
}

function rearrangeChildren(parentId) {
  const parent = nodes[parentId];
  const childIds = parent.children;
  const spacing = 105;
  const startY = parent.y - ((childIds.length - 1) * spacing) / 2;
  childIds.forEach((childId, index) => {
    const child = nodes[childId];
    child.x = parent.x + 230;
    child.y = startY + (index * spacing);
    const childElement = document.getElementById("node-" + childId);
    childElement.style.left = child.x + "px";
    childElement.style.top = child.y + "px";
    rearrangeChildren(childId);
  });
  drawMindMapLines();
}

function drawMindMapLines() {
  const svg = document.getElementById("mindMapLines");
  svg.innerHTML = "";
  Object.values(nodes).forEach(node => {
    if (node.parent === null) return;
    const parent = nodes[node.parent];
    const startX = parent.x + 150;
    const startY = parent.y + 28;
    const endX = node.x;
    const endY = node.y + 28;
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
  console.log(
    "Node:", node.id,
    "Parent:", node.parent,
    "Parent exists:", nodes[node.parent]
  );
}

function deleteSelectedNode() {
  if (selectedNodeId === 0) {
    alert("You cannot delete the main idea.");
    return;
  }
  deleteNodeAndChildren(selectedNodeId);
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

selectNode(0);

// GALLERY APP OPEN & MAIN CODE

var galleryScreen = document.querySelector("#gallery")
var galleryScreenClose = document.querySelector("#galleryClose")
var galleryScreenOpen = document.querySelector("#galleryIcon")

galleryScreenClose.addEventListener("click", function() {
  closeWindow(galleryScreen);
});
galleryScreenOpen.addEventListener("click", function() {
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

function closeWindow(element) {
  element.style.display = "none"
}
function openWindow(element) {
  element.style.display = "block"
}

paintScreenClose.addEventListener("click", function() {
  closeWindow(paintScreen);
});
paintScreenOpen.addEventListener("click", function() {
  openWindow(paintScreen);
});

// PAINT APP MAIN CODE

const canvas = document.getElementById("paintCanvas");
const ctx = canvas.getContext("2d");
let painting = false;

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
