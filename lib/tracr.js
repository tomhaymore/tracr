// Initialize right rail
var rightRail = document.createElement('div');
var height = $(document).height();
rightRail.setAttribute('class','right_rail');
rightRail.setAttribute('height',height);
console.log(height);

// Add right rail to page
document.body.appendChild(rightRail);

$.get('templates/right_rail_master.html', function(template) {
    var view = {name:'whatever'};
    var html = Mustache.to_html(template, view);
    rightRail.append(html);
});



// Add bubble to the top of the page.
var bubbleDOM = document.createElement('div');
//console.log(bubbleDOM);
bubbleDOM.setAttribute('class', 'selection_bubble');
document.body.appendChild(bubbleDOM);

// Lets listen to mouseup DOM events.
document.addEventListener('mouseup', function (e) {
  var selection = window.getSelection().toString();
  if (selection.length > 0) {
    renderBubble(e.clientX, e.clientY, selection);
  }
}, false);


// Close the bubble when we click on the screen.
document.addEventListener('mousedown', function (e) {
  bubbleDOM.style.visibility = 'hidden';
}, false);

// Move that bubble to the appropriate location.
function renderBubble(mouseX, mouseY, selection) {
  bubbleDOM.innerHTML = selection;
  bubbleDOM.style.top = mouseY + 'px';
  bubbleDOM.style.left = mouseX + 'px';
  bubbleDOM.style.visibility = 'visible';
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.method == "getSelection")
      sendResponse({data: window.getSelection().toString()});
    else
      sendResponse({}); // snub them.
});

// below adapted from: http://stackoverflow.com/questions/4409378/text-selection-and-bubble-overlay-as-chrome-extension

