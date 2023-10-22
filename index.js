require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const urlparser= require('url');
const {MongoClient} = require('mongodb')

//connecting to mongodb
const client = new MongoClient(process.env.db_url);
// specifying database
const db = client.db("urlshortner");
const urls= db.collection("urls");

// Basic Configuration
const port = process.env.PORT || 3000;

//middleware
app.use(cors());


//process.cwd() returns the current working directory,i.e. the directory from which you invoke the node command. 'cwd' is a method of global object process, returns a string value which is the current working directory of the Node.js process. whereas __dirname is the directory name of current script as a string value. __dirname is not actually a global but rather local to each module. (returns the directory name of the directory containing the JavaScript source code file)

//current working directory can be changed at runtime using process.chdir()

app.use('/public', express.static(`${process.cwd()}/public`)); //middleware

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


// express.urlencoded() is a built-in middleware function in Express. It parses incoming requests with URL-encoded payloads and is based on a body parser.parameter contains various properties like extended, inflate, limit, verify, etc.It returns an Object
//incoming urls are in the body of "req". to access body of req you have to use following middleware

app.use(express.urlencoded({extended:true}));

// Your first API endpoint
app.post('/api/shorturl', function(req,res) {
  console.log(req.body);
  const url = req.body.url;
  // checking if url is valid
  const dnslookup = dns.lookup(urlparser.parse(url).hostname,async (err, address) =>{
    if(!address){
      res.json({error:"invalid url"})
    }else{ // if url is valid save it in collection
      const urlcount = await urls.countDocuments({}); //need a number for short url, count it up by 1 each time. eg shorturl: 1 , shorturl: 2
      // create document in collection
      const urlDoc = {
        url,
      short_url : urlcount
      }
      const result = await urls.insertOne(urlDoc);
      console.log(result);
      res.json({ original_url: url ,
         short_url: urlcount  });
    }
  })

});
//When you visit /api/shorturl/<short_url>, you will be redirected to the original URL
app.get ("/api/shorturl/:short_url",async (req, res) => {
  const short_url = req.params.short_url; // grabbing short_url out of params
  const result = await urls.findOne({short_url: +shorturl});//getting original url based on short_url from our database
  res.redirect(urlDoc.url);


});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
