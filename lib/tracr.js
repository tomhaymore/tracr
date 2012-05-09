// Initialize right rail
var rightRail = document.createElement('div');
var height = $(document).height();
rightRail.setAttribute('class','right_rail');
rightRail.setAttribute('height',height);
console.log(height);

// Add right rail to page
document.body.appendChild(rightRail);

$.get(chrome.extension.getURL('templates/right_rail_master.html'), function(template) {
    var view = {img:chrome.extension.getURL('img/icon.png')};
    var html = Mustache.to_html(template, view);
    console.log(html);
    $("div.right_rail").append(html);
});


// Add bubble to the top of the page.
var notification = document.createElement('div');
//console.log(bubbleDOM);
notification.setAttribute('class', 'tracr_notification');
document.body.appendChild(notification);

// Lets listen to mouseup DOM events.
document.addEventListener('mouseup', function (e) {
  var selection = window.getSelection().toString();
  if (selection.length > 0) {
    renderNotification(selection);
    //renderNotification(e.clientX, e.clientY, selection);
  } else {
  	console.log('nothing selected');
  	notification.style.visibility = 'hidden';
  }
}, false);


// Close the bubble when we click on the screen.
document.addEventListener('mousedown', function (e) {
  notification.style.visibility = 'hidden';
}, false);

// Move that bubble to the appropriate location.
function renderNotification(selection) {
	$.get(chrome.extension.getURL('templates/notification.html'), function(template) {
		var view = {selection:selection};
		var html = Mustache.to_html(template, view);
		console.log(html);
		$("div.tracr_notification").html(html).show();
		//$("div.right_rail").append(html);
	});
  //notification.innerHTML = selection;
 
  //var pos = $("div.right_rail").position()
  notification.style.visibility = 'visible';
  
   //$("div.notification").css("notification");
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.method == "getSelection")
      sendResponse({data: window.getSelection().toString()});
    else
      sendResponse({}); // snub them.
});

// below adapted from: http://stackoverflow.com/questions/4409378/text-selection-and-bubble-overlay-as-chrome-extension

