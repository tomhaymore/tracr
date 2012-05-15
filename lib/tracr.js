localStorage['user_id'] = 1;
var label_template;
// Initialize right rail
var rightRail = document.createElement('div');
var height = $(document).height();
rightRail.setAttribute('class','right_rail');
rightRail.setAttribute('height',height);
console.log(height);

// Add right rail to page
document.body.appendChild(rightRail);

$.get(chrome.extension.getURL('templates/right_rail_master.html'), function(template) {
    var view = {img:chrome.extension.getURL('img/icon.png'),
    			topicsIcon:chrome.extension.getURL('img/beacon.png'),
    			exploreIcon:chrome.extension.getURL('img/compass.png'),
    			hotIcon:chrome.extension.getURL('img/hot.png')};
    var html = Mustache.to_html(template, view);
    console.log(html);
    $("div.right_rail").append(html);
});


// Add bubble to the top of the page.
var notification = document.createElement('div');
//console.log(bubbleDOM);
notification.setAttribute('class', 'tracr_notification');
document.body.appendChild(notification);

$(document).ready(function() {
	var params = {url:$(location).attr('href'),title:$("title").text()};
	$.get("http://127.0.0.1:8000/api/add_story",params,function(data) {
		if (data == "success") {
			console.log("Story successfully added");
		} else {
			console.log("Failed to add story or it already exists");
		}
	});
	$("a.tracr_concept_preview").live("click",function() {
		var conceptId = $(this).attr("id");
		renderPreview(conceptId);
	});
	$("a#tracr_dismiss").live("click",function() {
		$("#tracr_preview_iframe").hide();
		$("div.tracr_notification").hide();
		console.log("dismiss iframe");
		return false;
	});
	$("a#tracr_explore").click(function() {
		console.log("you're trying to explore");
		var pathname = $(location).attr('href');
		renderNotification(pathname,'url');
	});
	$("a#tracr_hot").click(function() {
		console.log("you're trying to check out what's hot");
		renderHotNotification();
	});
	$("a#tracr_my_topics").click(function() {
		console.log("You're trying to see your own topics");
		renderNotification(localStorage['user_id'],'user_topics');
	});
	$("a.tracr_concept").live("click",function() {
		var data = ({user_id:localStorage['user_id'],concept_id:$(this).attr('id')});
		console.log($(this).attr('id'));
		$.get("http://127.0.0.1:8000/api/add_topic",data,function(data) {
			if (data == "success") {
				$(this).hide();
				console.log('Added topic');
			} else {
				console.log('Failed to add topic');
			}
		});
		return false;
	});
});

// Lets listen to mouseup DOM events.
document.addEventListener('mouseup', function (e) {
  var selection = window.getSelection().toString();
  //selection = encodeURI(selection);
  console.log(selection)
  if (selection.length > 0) {
    renderNotification(selection,'text');
  } else {
  	console.log('nothing selected');
  	//notification.style.visibility = 'hidden';
  }
}, false);



// Close the bubble when we click on the screen.
// document.addEventListener('mousedown', function (e) {
//    notification.style.visibility = 'hidden';
// }, false);

function renderHotNotification() {
	$.get(chrome.extension.getURL('templates/notification.html'), function(template) {
		var view = {title:"Hot Topics",subtitle:"The latest and hottest topics on Tracr"};
		var html = Mustache.to_html(template,view);
		$("div.tracr_notification").html(html).show();
		var waitingMsg = "Getting the latest, hottest links right now.<img class='tracr_spinner' src='"+chrome.extension.getURL('img/spinner.gif')+"' />";
		console.log(waitingMsg);
		$("p.tracr_message").append(waitingMsg);
	});
	$.get("http://127.0.0.1:8000/api/get_hot_topics", function(data) {
		$.get(chrome.extension.getURL('templates/hot.html'), function(template) {
			$("p.tracr_message").hide();
			if (data == "no hot topics") {
				var view = {message:'No hot topics found'};
				var html = Mustache.to_html(template,view);
				$("div.tracr_concepts").append(html);
				console.log('no hot topics found');
			} else {
				$.each(data, function(key,val) {
					var view = {title:key,url:val};
					var html = Mustache.to_html(template,view);
					$("div.tracr_concepts").append(html);
					console.log('link appended');
				});
			}
		});
	});
}

function renderNotification(selection,type) {
	// add notification panel
	$.get(chrome.extension.getURL('templates/notification.html'), function(template) {
		if (type == "user_topics") {
			var view = {title:"My topics",subtitle:"Explore your favorite topics"};
		} else {
			var view = {title:"Tracr",subtitle:"Keep a live trace on what you're intereseted in"};
		}
		var html = Mustache.to_html(template,view);
		//console.log(html);
		$("div.tracr_notification").html(html).show();
		// add spinner gif while processing
		var waitingMsg = "Scouring the highlighted text for interesting concepts...please wait.<img class='tracr_spinner' src='"+chrome.extension.getURL('img/spinner.gif')+"' />";
		console.log(waitingMsg);
		//var msgContainer = $("p.tracr_message");
		//console.log(msgContainer);
		$("p.tracr_message").append(waitingMsg);
		//$("div.right_rail").append(html);
	});
	if (type == "text") {
		$.get("http://127.0.0.1:8000/api/get_concepts", {text:selection}, function(data) {
			
			var concepts = data;
			console.log(concepts);
			$.get(chrome.extension.getURL('templates/concept.html'), function(template) {
				$("p.tracr_message").hide();
				label_template = template;
				if (concepts == "no matches found") {
					var view = {label:"No topics found"};
					var html = Mustache.to_html(label_template,view);
					$("div.tracr_concepts").append(html);
					console.log('no matches found');
				} else {
					$.each(concepts, function(key,val) {
						var view = {label:key,id:val,plusImg:chrome.extension.getURL('img/plus.jpeg'),extImg:chrome.extension.getURL('img/external.png')};
						var html = Mustache.to_html(label_template,view);
						$("div.tracr_concepts").append(html);
						console.log('label appended');
					});
				}
			});
			
			console.log(label_template);
			
		});
	} else if (type == "url") {
		$.get("http://127.0.0.1:8000/api/get_concepts_from_url", {url:selection}, function(data) {
			
			var concepts = data;
			console.log(concepts);
			$.get(chrome.extension.getURL('templates/concept.html'), function(template) {
				$("p.tracr_message").hide();
				label_template = template;
				if (concepts == "no matches found") {
					var view = {label:"No topics found"};
					var html = Mustache.to_html(label_template,view);
					$("div.tracr_concepts").append(html);
					console.log('no matches found');
				} else {
					$.each(concepts, function(key,val) {
						var view = {label:key,id:val,plusImg:chrome.extension.getURL('img/plus.jpeg'),extImg:chrome.extension.getURL('img/external.png')};
						var html = Mustache.to_html(label_template,view);
						$("div.tracr_concepts").append(html);
						console.log('label appended');
					});
				}
			});
			
			console.log(label_template);
			
		});
	} else if (type == 'user_topics') {
		$.get("http://127.0.0.1:8000/api/get_user_topics", {user_id:selection}, function(data) {
			
			var concepts = data;
			console.log(concepts);
			$.get(chrome.extension.getURL('templates/my_concept.html'), function(template) {
				$("p.tracr_message").hide();
				if (concepts == "no matches found") {
					var view = {label:"No topics found"};
					var html = Mustache.to_html(template,view);
					$("div.tracr_concepts").append(html);
					console.log('no matches found');
				} else {
					$.each(concepts, function(key,val) {
						var view = {label:key,id:val,extImg:chrome.extension.getURL('img/external.png')};
						var html = Mustache.to_html(template,view);
						$("div.tracr_concepts").append(html);
						console.log('label appended');
					});
				}
			});
			
		});
	}
	
	notification.style.visibility = 'visible';
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.method == "getSelection")
      sendResponse({data: window.getSelection().toString()});
    else
      sendResponse({}); // snub them.
});

function renderPreview(concept_id) {
	ifrm = document.createElement("iframe");
	ifrm.setAttribute("src", "http://127.0.0.1:8000/api/preview?concept_id="+concept_id);
	ifrm.setAttribute("id","tracr_preview_iframe"); 
	ifrm.style.width = "50%"; 
	ifrm.style.height = "75%"; 
	document.body.appendChild(ifrm); 
}

