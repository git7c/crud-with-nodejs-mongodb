const express = require('express');
const mongodDB = require('mongodb');
const MongoClient = mongodDB.MongoClient;
const app = express();
const twig = require('twig');
const bodyParser = require('body-parser');
// MONGODB URL
const db_url = "mongodb://localhost:27017/";

// VARIABLE DECLARED 
let dbConnection;
let post_id;
let isValid_obj_id;

// USE BODY-PARSER MIDDLEWARE
app.use(bodyParser.urlencoded({extended:false}));

// SET OUR VIEW ENGINE AND VIEWS
app.set('view engine', 'html');
app.engine('html', twig.__express);
app.set('views','views');

// HOME PAGE
app.get('/', (req, res) => {
    // GET ALL POSTS FORM DATABASE
    dbConnection.collection("posts").find().sort({insert_date:-1}).toArray((err, posts) => {
        if (err) throw err;
        res.render('home',{
            posts:posts
        });
    }); 
});

// INSERT POST
app.post('/', (req, res) => {
    dbConnection.collection('posts').insertOne({...req.body,insert_date:new Date()}).then(result => {
        res.redirect('/');
    }).catch(err => {
        console.log(err);
        res.redirect('/');
    });
});

// EDIT POST
app.get('/edit/:id', (req, res) => {
    post_id = req.params.id;
    isValid_obj_id = mongodDB.ObjectID.isValid(post_id);
    // CHECK IS OBJECT ID VALID ?
    if(isValid_obj_id === false){
        // IF INVALID OBJ ID
        res.redirect('/');
    }
    else{
        // GET POST BY ID
        dbConnection.collection("posts").findOne({_id:mongodDB.ObjectID(post_id)},(err,post) => {
            if (err) throw err;
            if(!post){
                res.redirect('/');
            }
            else{
                // RENDER EDIT VIEW WITH POST DATA
                res.render('edit',{
                    post:post
                });
            }    
        });
    }   
});

// UPDATE POST
app.post('/edit/:id', (req,res) => {
    post_id = req.params.id;
    // UPDATE POST BY ID 
    dbConnection.collection("posts").updateOne({_id:mongodDB.ObjectID(post_id)}, {$set:req.body}, (err, result) => {
        if (err) throw err;
        res.redirect('/');

    });
});

// DELETE POST
app.get('/delete/:id', (req, res) => {
    isValid_obj_id = mongodDB.ObjectID.isValid(req.params.id);
    if(isValid_obj_id === false){
        res.redirect('/');
    }
    else{
        // DELETE POST BY ID
        dbConnection.collection("posts").deleteOne({_id:mongodDB.ObjectID(req.params.id)},(err, deletePost) => {
            if (err) throw err;
            res.redirect('/');
        });
    }
});

// MAKE DATABASE CONNECTION
MongoClient.connect(db_url, {useNewUrlParser: true}, (err, db) => {
    if (err) throw err;
    // SET DATABASE
    dbConnection = db.db('mongo_crud');
    // Run our app if the database is successfully connected.
    app.listen(3000);
});
