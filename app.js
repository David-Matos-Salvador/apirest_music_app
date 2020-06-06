const express = require('express');
const  app =express();

//setting

//cargar rutas
//user
const user_router=require('./router/user');
//artist
const Artist_router=require('./router/artist');
//album
const Album_router=require('./router/album');
//song
const Song_router = require('./router/song');

app.use(express.urlencoded({extended:false}));
app.use(express.json());

//configurar cabeceras http

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
  
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization,X-API-KEY,Access-Control-Allow-Request-Method"
    ); 
    res.header(
      "Access-Control-Allow-Methods",
      "PUT, GET, POST, DELETE, OPTIONS"
    );
    res.header(
        "Allow",
        "PUT, GET, POST, DELETE, OPTIONS"
      );
    next();
  });

//rutas bases 
app.use('/api',user_router);
app.use('/api',Artist_router);
app.use('/api',Album_router);
app.use('/api',Song_router);
app.get('/prueba',(req,res)=>{
    res.status(200).send({message:'Bienvenidos al Curso de Victor Robles'});
})

module.exports=app;
