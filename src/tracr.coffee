# Handles data sent via chrome.extension.sendRequest().
onRequest = (request, sender, callback) ->
	switch request.action
		when "getSelection"
			sendResponse data: window.getSelection().toString()
			
chrome.extension.onRequest.addListener onRequest