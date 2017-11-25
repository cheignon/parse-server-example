// Example express application adding the parse-server module to expose Parse
// compatible API routes.
var OneSignalPushAdapter = require('parse-server-onesignal-push-adapter');
var oneSignalPushAdapter = new OneSignalPushAdapter({
  oneSignalAppId:process.env.ONE_SIGNAL_APP_ID,
  oneSignalApiKey:process.env.ONE_SIGNAL_APP_KEY
});
var stripe = require('stripe')(process.env.STRIPE_KEY);
var express = require('express');
var bodyParser = require("body-parser");
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');
var path = require('path');
var fs = require('fs')
var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}
var parse_url = process.env.SERVER_URL+process.env.PARSE_MOUNT;

var api = new ParseServer({
  push: {
    adapter: oneSignalPushAdapter
  },
  verifyUserEmails: true,
  appName: process.env.APP_NAME || "MyApp",
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  },
  // Environment where the user can confirm his e-mail address or reset his password (most likely the same as your 'serverURL')
  publicServerURL: parse_url,
  emailAdapter: {
    module: 'parse-server-simple-mailgun-adapter',
    options: {
      fromAddress: 'contact@helps-volunteers.com',
      domain: process.env.SMTP_SANDBOX_DOMAIN,
      apiKey: process.env.SMTP_SANDBOX_KEY,
    }
  },
  accountLockout: {
    duration: 5, // duration policy setting determines the number of minutes that a locked-out account remains locked out before automatically becoming unlocked. Set it to a value greater than 0 and less than 100000.
    threshold: 3, // threshold policy setting determines the number of failed sign-in attempts that will cause a user account to be locked. Set it to an integer value greater than 0 and less than 1000.
  },
  passwordPolicy: {
    validatorPattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/, // enforce password with at least 8 char with at least 1 lower case, 1 upper case and 1 digit
    //validatorCallback: (password) => { return validatePassword(password) }, 
    doNotAllowUsername: true, // optional setting to disallow username in passwords
    maxPasswordAge: 90, // optional setting in days for password expiry. Login fails if user does not reset the password within this period after signup/last reset. 
    resetTokenValidityDuration: 24*60*60, // expire after 24 hours
  }
});

var dashboard = new ParseDashboard({
  "apps": [
    {
      "serverURL": parse_url || "http://localhost:1337/parse",
      "appId": process.env.APP_ID || 'myAppId',
      "masterKey": process.env.MASTER_KEY || '',
      "appName": process.env.APP_NAME || "MyApp",
      "supportedPushLocales": ["en","fr"]
    }
  ],
  "users": [
    {
      "user":process.env.USER_ONE,
      "pass":process.env.PW_USER_ONE
    },
    {
      "user":process.env.USER_TWO,
      "pass":process.env.PW_USER_TWO
    }
  ],
  "useEncryptedPasswords": true,
  "trustProxy": 1,

});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);
app.use('/dashboard', dashboard);
// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});



var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
  console.log('helps-server running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);


function create_user (req, res) {

  console.log('create_user');

  var source_tripe = req.body.source;
  var user_email = req.body.email;

  if (!source_tripe) {
    res.status(400).json({ error: 'source is undefined' });
    return;
  }
  if (!user_email) {
    res.status(400).json({ error: 'email is undefined' });
    return;
  }
  stripe.customers.create({
    email:user_email,
    description: 'Customer '+user_email,
    source: source_tripe // obtained with Stripe.js
  }, function(err, customer) {
    // asynchronously called
    console.log('create' + customer);
    if (!customer) {
      console.log('failed to create a customer');
      res.status(500).json({ error: 'failed to create a customer' });
      return;
    }
    if (err) {
      console.log(err);
      res.status(500).json(err);
      return;
    }
    res.status(200).json(customer);
    
  });

};
// Stripe
app.post('/stripe/user', (req, res) => {

  console.log(req.body);
  var customer_id = req.body.customer_id;
  if(customer_id){
    stripe.customers.retrieve(
      customer_id,
      function(err, customer) {
        // asynchronously called

        console.log('retrieve' + customer);
        if (!customer) {
          create_user(req, res)
          return;
        }
        res.status(200).json(customer);
      });
    return;
  }
  create_user(req, res)
});

app.post('/stripe/ephemeral_keys', (req, res) => {

  var stripe_version = req.body.api_version;
  var customer_id = req.body.customer_id;
  
  console.log(req.body);
  
  if (!stripe_version) {
    res.status(400).json({ error: 'stripe_version is undefined' });
    return;
  }
  if (!customer_id) {
    res.status(400).json({ error: 'customer_id is undefined' });
    return;
  }

  // This function assumes that some previous middleware has determined the
  // correct customerId for the session and saved it on the request object.
  stripe.ephemeralKeys.create(
    {customer: customer_id},
    {stripe_version: stripe_version}
    ).then((key) => {
      res.status(200).json(key);
    }).catch((err) => {
      res.status(500).end();
    });
});



app.post('/stripe/subscriptions', (req, res) => {

  var customer_id = req.body.customer_id;
  var trial_timestamp = req.body.trial_timestamp;
  var subscription_id = req.body.subscription_id;
  var source_id = req.body.source_id;
  if (!trial_timestamp) {
    res.status(400).json({ error: 'trial_timestamp is undefined' });
    return;
  }
  if (!customer_id) {
    res.status(400).json({ error: 'customer_id is undefined' });
    return;
  }
  if (!subscription_id) {
    res.status(400).json({ error: 'subscription_id is undefined' });
    return;
  }
  if (!source_id) {
    res.status(400).json({ error: 'source_id is undefined' });
    return;
  }
  // This function assumes that some previous middleware has determined the
  // correct customerId for the session and saved it on the request object.
  
  stripe.subscriptions.create({
    customer: customer_id,
    items: [
    {
      plan: subscription_id,
    },
    ],
    trial_end: trial_timestamp,
    source:source_id,
  }, function(err, subscription) {
  // asynchronously called
    if(err){
      res.status(500).json(err);
      return;
    }
    res.status(200).json(subscription);
  });

});

app.post('/stripe/subscriptions/delete', (req, res) => {


  var subscription_id = req.body.subscription_id;
  if (!subscription_id) {
    res.status(400).json({ error: 'subscription_id is undefined' });
    return;
  }
  stripe.subscriptions.del(
  subscription_id,
    function(err, confirmation) {
      // asynchronously called
      if(err){
        res.status(500).json(err);
        return;
      }
      res.status(200).json(confirmation);

    });

});

app.post('/stripe/subscriptions/update', (req, res) => {


  var current_subscription_id = req.body.current_subscription_id;
  var new_subscription_id = req.body.new_subscription_id;
  if (!current_subscription_id) {
    res.status(400).json({ error: 'current_subscription_id is undefined' });
    return;
  }
  if (!new_subscription_id) {
    res.status(400).json({ error: 'new_subscription_id is undefined' });
    return;
  }
  stripe.subscriptions.retrieve(
  current_subscription_id,
  function(err, subscription) {
    // asynchronously called
    if(err){
      res.status(500).json(err);
      return;
    }
    var item_id = subscription.items.data[0].id;
    if(!item_id){
      res.status(404).json({ error: 'subscription not found' });
      return;
    }
    stripe.subscriptions.update(current_subscription_id, {
      items: [{
        id: item_id,
        plan: new_subscription_id,
      }],
    }, function(err, subscription) {
      // asynchronously called
      if(err){
        res.status(500).json(err);
        return;
      }
      res.status(200).json(subscription);
    });

  });

});

