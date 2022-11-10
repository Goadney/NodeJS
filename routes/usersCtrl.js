//Imports 
var bcrypt = require('bcrypt');
var jwtUtils = require('../utils/jwt.utils');
var models = require ('../models');
var asyncLib = require ('async');
//const
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
// Routes 
module.exports = {


    
// REGISTER *------------------------------------------------------------------------------------------------------------------------------*
    register: function(req, res){ 
        
        //Params 
        var email = req.body.email;
        var username = req.body.username;
        var password = req.body.password;
        var bio = req.body.bio;
        
        if (email ==null || username == null || password == null) {
            return res.status(400).json({'error': 'il manque des paramtres'});
        }
        
        //verifier la longueur des pseudo mail etc TODO
        if (username.lenth >= 13 || username.lenth <= 4) {
            return res.status(400).json({'error': 'Le pseudo doit faire entre 4 et 13 caractères'});

         }
        if(!EMAIL_REGEX.test(email)){ 
            return res.status(400).json({'error': 'l\'email n\'est pas valide'});
        }
        if(!PASSWORD_REGEX.test(password)){ 
            return res.status(400).json({'error': ' Min 8 char, une maj une min, un digit'});
        }
        
        // l'utilisateur existe?
        asyncLib
        models.User.findOne({ 
            attributes: ['email'],
            where: { email: email }
        })
        .then(function(userFound){
            if (!userFound) { 
                bcrypt.hash(password, 5, function(err, bcryptedPassword){ 
                var newUser = models.User.create({
                    email: email,
                    username: username,
                    password: bcryptedPassword,
                    bio: bio,
                    isAdmin : 0
                })
                .then(function(newUser){ 
                    return res.status(201).json({
                        'userId': newUser.id
                    })
                .catch(function(err){ 
                    return res.status(500).json({'error': 'L\'utilisateur n\'a pas pu être crée.'});
                })
                })

                });

            } else { 
                return res.status(409).json({'error': 'l\'utilisateur existe déjà'});
            }

        })
        .catch(function(err){ 
            return res.status(500).json({'error': 'impossible de vérifier l\'utilisateur'});

        })
    },



// LOGIN *------------------------------------------------------------------------------------------------------------------------------*
    login: function(req, res){

        //params 
        var email= req.body.email;
        var password= req.body.password;
        if (email ==null || password == null) {
            return res.status(400).json({'error': 'il manque des paramtres'});
        }

        models.User.findOne({
            
            where: { email: email}
        })
        .then(function(userFound){
            if(userFound){
                bcrypt.compare(password,userFound.password , function(errBycrypt, resBycrypt){ 
                    if(resBycrypt) { 
                        return res.status(200).json({ 
                            'userId': userFound.id,
                            'token': jwtUtils.generateTokenForUser(userFound)
                        });
                    } else { 
                        return res.status(403).json({'error': 'mot de passe invalide'});
                    }
                })

            } else { return res.status(404).json({'error':'l\'utilisateur n\'existe pas dans la bd'});
        }
        })
        .catch(function(err){ 
            return res.status(500).json({'error':'impossible de vérifier si l\'utilisateur existe'});
        })
        
    

        

    },
    getUserProfile: function(req,res){ 
        //recup le header 
        var headerAuth = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);
        
        if(userId <0) { 
            return res.status(400).json({'error':'wrong token or expirate (1h)'});
        }

        models.User.findOne({ 
            attributes: ['id','email','username','bio'],
            where: {id: userId}
        })
        .then(function(user){ 
            if (user) { 
                res.status(201).json(user);
            }else {
                res.status(404).json({'error':'utilisateur introuvable'});
            }
        
        })
        .catch(function(err){ 
            res.status(500).jsoon({'error':'cannot fetch user'});
        });
    },

    userUpdate: function(req,res){ 
        
        var headerAuth  = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);    
        // Params
        var bio = req.body.bio;

        asyncLib.waterfall([
            function(done) {
              models.User.findOne({
                attributes: ['id', 'bio'],
                where: { id: userId }
              }).then(function (userFound) {
                done(null, userFound);
              })
              .catch(function(err) {
                return res.status(500).json({ 'error': 'unable to verify user' });
              });
            },
            function(userFound, done) {
              if(userFound) {
                userFound.update({
                  bio: (bio ? bio : userFound.bio)
                }).then(function() {
                  done(userFound);
                }).catch(function(err) {
                  res.status(500).json({ 'error': 'cannot update user' });
                });
              } else {
                res.status(404).json({ 'error': 'user not found' });
              }
            },
          ], function(userFound) {
            if (userFound) {
              return res.status(201).json(userFound);
            } else {
              return res.status(500).json({ 'error': 'cannot update user profile' });
            }
          });
    }
    

}
