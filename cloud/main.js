
Parse.Cloud.define('hello', function(req, res) {

	// request has 2 parameters: params passed by the client and the authorized user 
	var params = req.params;
	var receiver = params.receiver;
  var sender_name = params.sender_name;
  var date = params.date;
  var job = params.job;

  var text_en = sender_name+' needs an help on '+date+' for ' + job;
  var text_fr = sender_name+' a besoin de d\'aide pour le '+date+' concernant '+job;

	var message = { 
  		app_id: process.env.ONE_SIGNAL_APP_ID,
  		contents: {"en": text_en,"fr":text_fr},
  		include_player_ids: [receiver],
      
	};
	sendNotification(message);
});

var sendNotification = function(data) {
  var headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Authorization": "Basic "+process.env.ONE_SIGNAL_APP_KEY
  };
  
  var options = {
    host: "onesignal.com",
    port: 443,
    path: "/api/v1/notifications",
    method: "POST",
    headers: headers
  };
  
  var https = require('https');
  var req = https.request(options, function(res) {  
    res.on('data', function(data) {
      console.log("Response:");
      console.log(JSON.parse(data));
    });
  });
  
  req.on('error', function(e) {
    console.log("ERROR:");
    console.log(e);
  });
  
  req.write(JSON.stringify(data));
  req.end();
};