var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = 3000;


var app = express();


app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));


mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });

//ROUTES

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with axios
    axios.get("http://www.echojs.com/").then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
  
      // Now, we grab every h2 within an article tag, and do the following:
      $("article h2").each(function(i, element) {
        // Save an empty result object
        var result = {};
  
        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
          .children("a")
          .text();
        result.link = $(this)
          .children("a")
          .attr("href");
  
       
        db.Article.create(result)
          .then(function(dbArticle) {
           
            console.log(dbArticle);
          })
          .catch(function(err) {
           
            console.log(err);
          });
      });
  
      
      res.send("Scrape Complete");
    });
  });
  

  app.get("/articles", function(req, res) {
    db.Article.find({})
    .then(function(dbArticle){
      res.json(dbArticle)
    })
    .catch(function(err) {
      res.json(err);
    });
  
    // TODO: Finish the route so it grabs all of the articles
  });
  
 
  app.get("/articles/:id", function(req, res) {
    db.Article.findOne({_id: req.params.id})
    .populate("note")
    .then(function(dbArticle){
      console.log(dbArticle);
      res.json(dbArticle)
    })
    .catch(function(err) {
      res.json(err);
    });
    

  });
  
  
  app.post("/articles/:id", function(req, res) {
  
    db.Note.create(req.body)
    .then(function(dbNote) {
   
      console.log(req.params.id);
      console.log(dbNote._id);
     
      return db.Article.findOneAndUpdate({_id : req.params.id }, { $set: {note: dbNote._id }}, { new: true });
    })
    .then(function(dbArticle) {
    
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
  
  
  });
 
  app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });
  