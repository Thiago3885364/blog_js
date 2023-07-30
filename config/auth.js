const localStrategy = require('passport-local');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('../models/Usuario');
const Usuario = mongoose.model('usuarios');
module.exports = function(passport){
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'}, (email, senha, done)=>{
        Usuario.findOne({email: email}).lean().then((usuarios)=>{
            if(!usuarios){
                return done(null, false, {message: "Usuário inválido!"});
            }
            bcrypt.compare(senha, usuarios.senha, (erro, batem)=>{
                if(batem){
                    return done(null, usuarios);
                }else{
                    return done(null, false, {message: "Senha inválida!"});
                }
            });
        });
    }));
    passport.serializeUser((usuarios, done)=>{
        done(null, usuarios._id);
    });
    passport.deserializeUser((id, done)=>{
        Usuario.findOne({where: {id:id}}).then((usuarios)=>{
            done(null, usuarios);
        }).catch((err)=>{
            done(err, null);
        });
    });
}