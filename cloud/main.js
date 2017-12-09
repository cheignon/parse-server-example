

Parse.Cloud.define('pushForResponse', function(req, res) {

  var params = req.params;
  var player_id = params.player_id;
  var response = params.response;
  var firstname = params.user_name;
  var order_id = params.order_id;

  console.log('request : '+req);
  console.log('response : '+res);

  var title_en = '';
  var title_fr = '';
  var text_en = '';
  var text_fr = '';

  if(response == true){

     title_en = 'helpS Volunteers 👋';
     title_fr = 'helpS Volunteers 👋';

     text_en = firstname+' accept to do the job';
     text_fr = firstname+' a accepter votre demande';

  }else{

     
     title_en = 'helpS Volunteers 👋';
     title_fr = 'helpS Volunteers 👋';

     text_en = firstname+' has rejected your request';
     text_fr = firstname+' a refusé  votre demande';
  }

  console.log(title_fr);
  console.log(text_fr);

  var  datas  = {sender_id:player_id,type:'response',order:order_id,answere:response} ; 

  var message = { 
      app_id: process.env.ONE_SIGNAL_APP_ID,
      contents: {"en": text_en,"fr":text_fr},
      include_player_ids: [player_id],
      headings: {"en": title_en,"fr":title_fr},
      content_available: true,
      data : datas
      
  };
  sendNotification(message,res);

});

Parse.Cloud.define('pushForRequest', function(req, res) {

	// request has 2 parameters: params passed by the client and the authorized user 
  var params = req.params;
  var receiver = params.receiver;
  var sender_name = params.sender_name;
  var date = params.date;
  var job = params.job;

  // setup the content of notification if en and fr
  var text_en = sender_name+' needs an help on '+date+' for ' + job;
  var text_fr = sender_name+' a besoin d\'aide pour le '+date+' concernant '+job;

  // setup the title of notification if en and fr
  var title_en = 'helpS Volunteers needs you 👋';
  var title_fr = 'helpS Volunteers a besoin de vous 👋';

  // setup hidden infos
  var sender = params.sender;
  var job_id = params.job_id;
  var timestamp = params.timestamp;
  var order = params.order_id;
  var datas = { sender_id:sender, offer_id : job_id , date : timestamp , order_id : order, type: 'request' } ; 

	var message = { 
  		app_id: process.env.ONE_SIGNAL_APP_ID,
  		contents: {"en": text_en,"fr":text_fr},
  		include_player_ids: [receiver],
      headings: {"en": title_en,"fr":title_fr},
      content_available: true,
      data : datas
      
	};
	sendNotification(message,res);
});

var sendNotification = function(data, response) {
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
      response.success("success to send a notificaion");
    });
  });
  
  req.on('error', function(e) {
    console.log("ERROR:");
    console.log(e);
    response.error("failed to send notification");
  });

  console.log("DATA:");
  console.log(JSON.stringify(data));
  req.write(JSON.stringify(data));
  req.end();
};