const express = require('express');
const session = require('express-session');
const app = express();
const path = require('path');
const port = 3000;
const fs = require('fs');
const bcrypt = require('bcrypt');
var bodyParser = require('body-parser') //To help read form data.
app.use(bodyParser.urlencoded({
  extended: false
}));

const MongoClient = require('mongodb').MongoClient;
// had to URL encode the password bc it contained an '@' - VB
const url = "mongodb+srv://barnev:.mUNYTL8Ga.6q2%40@cluster0.pacdp.mongodb.net/lab5?retryWrites=true&w=majority";
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.static(path.join(__dirname, './luna/dist/luna')));
app.use(session({secret: "ssshhhhh"}));

var sess;

// TO DO: Change this to API stuff
app.get('/api/articles', (req, res) => {
  // Get all Articles
  	MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("luna");
      dbo.collection("Articles").find().toArray(function(err, result) {
        console.log( result );
        let articlesData = JSON.stringify( result );
        fs.writeFileSync( 'luna/src/assets/json/learn.json', articlesData );
  			db.close();
        // res.send(result);
      });
    });
	res.sendFile(path.join(__dirname + '/luna/src/assets/json/learn.json'));
});

app.get("/getButtonsData", function (req, res) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("luna");
    // const categorySet = new Set();
    dbo.collection("Articles").distinct('category').then(function(arr) {
      console.log(arr);
      res.send(arr);
    });
    db.close();
  });
});

app.get("/getArticlesData", function (req, res) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("luna");
    dbo.collection("Articles").find().toArray(function(err, result) {
      res.json(result);
      db.close();
    });
  });
});

app.get("/getArticlesDataCategory/category/:category", function (req, res) {
  console.log( req.params );
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("luna");
    dbo.collection("Articles").find({category: req.params.category}).toArray(function(err, result) {
      res.json(result);
      db.close();
    });
  });
});




app.post('/infopost', function (req, res) {
  const MongoClient = require("mongodb").MongoClient;
  const url = "mongodb+srv://barnev:.mUNYTL8Ga.6q2%40@cluster0.pacdp.mongodb.net/luna?retryWrites=true&w=majority";
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  MongoClient.connect(url, function(err, db) {
    var dbo = db.db("luna");
    var collection = dbo.collection("Cycle Tracking");
    var ids =req.body.id;
    var username =req.body.username;
    var startdate= req.body.startdate;
    var periodlength= req.body.periodlength;
    var cyclelength =req.body.cyclelength;
    var mood =req.body.mood;
    var sleep =req.body.sleep;
    var symptom=req.body.symptom;
    notes=req.body.notes;
    var data = {
      "id":ids,
      "username":username,
      "startdate": startdate,
      "periodlength":periodlength,
      "cyclelength":cyclelength,
      "mood":req.body.mood,
      "sleep":req.body.sleep,
      "notes":req.body.notes,
      "symptom":symptom
  }
  dbo.collection('Cycle Tracking').insertOne(data,function(err, collection){
    if (err) throw err;
    console.log("Record inserted Successfully");
});
  });
});


app.get('/trackerCSV', function(req, res){
	const mongodb = require("mongodb").MongoClient;
	const fastcsv = require("fast-csv");
	const ws = fs.createWriteStream("cycle_tracking2.csv");
	const url = "mongodb+srv://barnev:.mUNYTL8Ga.6q2%40@cluster0.pacdp.mongodb.net/luna?retryWrites=true&w=majority";

	mongodb.connect(
		url,
		(err, client) => {
		if (err) throw err;
		client
			.db("luna").collection("Cycle Tracking").find({},{projection:{_id:0}}).toArray((err, data) => {
			if (err) throw err;
			console.log(data);
			fastcsv
				.write(data, { headers: true })
				.on("finish", function() {
				console.log("cycle_tracking.csv created successfully!");
				res.send("CSV Successfully Downloaded.")
				})
				.pipe(ws);

			client.close();
			});
		}
	);
});

app.get('/trackerimage', function(req,res){
  var htmlBegin = " <! DOCTYPE html ><html ><head ><h1>Mood and Sleep Trends During Cycle</h1><br><br><div id='image1'><img src='../../assets/images/moodduringcycle.png'></div><br><div id='image2'><img src='../../assets/images/sleepquality.png' width:5px></div><style > body { background-color:#ebebeb;text-align:center;";
  var htmlEnd = ";} h1{font-size-20px;text-align:center;} img{width:500px}; </ style > </ head ><body ><form method='Post'> <input type='submit' method='GET' value='Redirect' action='http://localhost:3000/'></form> </ body > </ html >";
  res.send(htmlBegin+htmlEnd)
});

app.post("/add_user", function(req, res) {

  MongoClient.connect(url, function(err, db) {
    var dbo = db.db("luna");
    var name = req.body.name;
    var email = req.body.email;
    var psw = req.body.psw;
    var age = req.body.age;
    var current_date = new Date();
  
    // Hash password before storing in database

    // Generate Salt
    const salt = bcrypt.genSaltSync(10);

    // Hash Password
    const hash = bcrypt.hashSync(psw, salt);

    var data = {
      "email": email,
      "password": hash,
      "full_name": name,
      "age" : age,
      "join_date" : current_date
    }

    dbo.collection('Users').insertOne(data, function(err, collection){
      if (err) throw err;
      console.log("New user inserted successfully!");
    });
  });
});

app.post("/validate", function(req, res) {

  MongoClient.connect(url, function(err, db) {
    var dbo = db.db("luna");
    var email = req.body.email;
    var psw = req.body.psw;

    dbo.collection('Users').find({"email": email}).toArray(function(err, docs) {
      var hash = docs[0]['password'];
      const isValidPass = bcrypt.compareSync(psw, hash);
      if (isValidPass) {
        console.log("User successfully logged in!");
        sess = req.session;
        sess.email = email;
      }
      else {
        console.log("Incorrect password, login attempt unsuccessful.");
      }
      
    });
  });
});

app.get("/getEmail", function(req, res) {
  if (req.session.email) {
    res.send(req.session.email);
  } 
  else {
    res.send("No Login");
  }
});

// Source: https://codeforgeek.com/manage-session-using-node-js-express-4/

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect('/');
  });
});

app.listen(port, () => console.log(`Application listening on port ${port}!`))
