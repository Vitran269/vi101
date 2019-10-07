var express = require("express");
var mongodb = require("mongodb");
var monk = require("monk");
var app = express();
var router = express.Router();
var cors = require("cors")
var bodyParser = require("body-parser")
var urlencodedParser = bodyParser.urlencoded({extended:false})
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}))
app.use(cors())
// app.get("/hello",function(req,res){
//     res.send("<font color=red>HELLO</font>")
// })
var db = monk("mongodb://vidb:abc123456@cluster0-shard-00-00-aukte.gcp.mongodb.net:27017,cluster0-shard-00-01-aukte.gcp.mongodb.net:27017,cluster0-shard-00-02-aukte.gcp.mongodb.net:27017/vidb?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority")
app.use(function(req,res,next){
    req.db = db;
    next();
})
// app.use(function(req,res,next) {
//     res.header("Access-Control-Allow-Origin",'*');
//     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//     res.header('Access-Control-Allow-Headers', 'Content-Type');
//     next();
// })



app.get('/users',function (req,res) {
    req.db.collection('users').find({},{'limit':100000000},function(e,docs){
        res.json(docs);
        
        
    });
});

app.delete('users/:id',function(req,res){
    req.db.collection('users').find({_id:req.params.id},function(err,docs){
        console.log(req.params.id);
        
        if (docs.length > 0){
            req.db.collection('users').remove({_id: req.params.id},function(e,data){
                if(e) throw e ;
                res.json({"delete":"successful"})
            })
            
        }
        else {
                res.json({"delete":"fail"})
        }
    })
})
app.post ('/register',function(req,res){
    req.db.collection('users').find({username : req.body.username}, function(e,docs){
        if (docs.length === 0) {
            req.db.collection('users').insert(req.body, function(e,docs){
                res.json({"registration" : "successful"})
            })
        }
        else {
            res.json({"registration" : "failed"})
        }
    })
})
app.post('/login',function(req,res){
    console.log(req.body);
    
    req.db.collection('users').find({username : req.body.username, password : req.body.password}, function(err,docs){
        if (docs.length == 0 ){
            res.json({"authorize" :  false})
        }
        else {
            res.json ({"authorize": true})
        }
    })
})
app.put('users',function(req,res){
    if (req.body.user){
        req.db.collection('users').find({username:req.body.user.username},function(err,docs){
            if (docs.length > 0){
                res.json({"Update" :"Username conflict"})
            }
            else {
                req.db.collection('users').update({_id:req.body.user.id},{
                    username : req.body.user.username,
                    password : req.body.user.password
                },
                    function(e,result){
                        res.json({"update":"successful"})
                    }
                )
            }
        })
    }
})
app.listen(5000);