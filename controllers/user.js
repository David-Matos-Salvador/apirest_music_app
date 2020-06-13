const fs = require('fs');
const path=require('path');
const bcrypt = require('bcrypt');
const User = require('../models/user')
const jwt = require('../service/jwt');
function pruebas(req,res){
    res.send({
        message:'Probando una accion del controlador de  usuarios del api rest  Con nodejs y mongodb'
    });
};
function saveUser(req,res){
    const user  = new User();
    const params =req.body;
    user.name = params.name;
    user.surname = params.surname;
    user.email = params.email.toLowerCase();
    user.role = 'ROLE_ADMIN';
    user.image = 'null';

    if(params.password){
        //encryptar contraseña  y guarda datos 
        bcrypt.hash(params.password,10,function(err,hash){
            user.password=hash;
            
            if(user.name!=null && user.surname!=null && user.email!=null ){
                   //guardar usuario                                                              
                user.save((err,userStored)=>{
                    if(err){
                        res.status(500).send({  message:'Error al guardar el usuario'});
                    }
                    else{
                        if (!userStored) {
                            res.status(404).send({ message:'No se ha registrado el Usuario' });
                            
                        } else {
                            res.send({user: userStored});
                        }
                    }
                })
            }else{
                res.send({
                    message:'Rellena todos los campos'
                })
            }
        
        })
    }else{
        res.send({
            message:'Introduce la constraseña'
        });
    }

}

function loginUser(req,res){
     const params = req.body;

     let email = params.email;
     let password = params.password;

     User.findOne({email: email.toLowerCase()},(err,user)=>{
         if (err) {
            res.status(500).send({ message:'Error en  la peticion'})
             
         } else {
             if(!user){
                res.status(404).send({ message:'El usuario no existe'})
             }else{
                bcrypt.compare(password,user.password,(err,check)=>{
                    if (check) {
                        //devolvoremos los datos del usuario logueado
                        if (params.gethash) {
                            //devolver un token de jwt
                            res.status(200).send({
                                token:jwt.createToken(user)
                            });

                        } else {
                             res.status(200).send({ user})
                        }

                    } else {
                    res.status(404).send({ message:'No ingreso correctamente la contraseña '+ err})
                    }
                })
             }  
             
         }
     })

}

function updateUser(req,res){
    var userId=req.params.id;
    var update=req.body;
    if(userId!=req.user.sub){
       return res.status(500).send({ message:'No tienes permiso para actualizar este usuario'});
    }

    User.findByIdAndUpdate(userId,update,(err,userUpdate)=>{
        if(err){
            res.status(500).send({ message:'Error al actualizar el usuario'});
        }else{
            if (!userUpdate) {
                res.status(404).send({ message:'No se ha podido actualizar el  usuario'});
            } else {
                res.status(200).send({ user:userUpdate});
            }
        }
    });

}

function uploadImage(req,res){
var userId = req.params.id;
var file_name='No subido ...';

if (req.files) {
    var file_path=req.files.image.path;
    console.log(file_path);
    var file_split=file_path.split('\\');
    var file_name=file_split[2];
    var ext_split= file_name.split('\.');
    var file_ext=ext_split[1];
    if (file_ext == 'png' || file_ext=='jpg' || file_ext=='gif') {
        User.findByIdAndUpdate(userId,{image:file_name},(err,imgUpdate)=>{
            if (!imgUpdate) {
                res.status(404).send({
                    message:'No se ha podido actualizar la imagen'
                })
                
            } else {
                res.status(200).send({image:file_name,user:imgUpdate})
            }
        })
    } else {
        res.status(404).send({
            message:'extension de archivo no valido'
        })
    }

    
} else {
    res.status(200).send({
        message:'No has subido ninguna imagen'
    })
}
}

function getImageFile(req,res){
    var imageFile=req.params.imageFile;
    var path_file='./upload/users/'+imageFile;
    if(fs.existsSync(path_file)){
        res.sendFile(path.resolve(path_file));

    }else{
        res.status(200).send({message:'No existe la Imagen :c'});
    }
}
module.exports ={pruebas, saveUser, loginUser,updateUser,uploadImage,getImageFile};
