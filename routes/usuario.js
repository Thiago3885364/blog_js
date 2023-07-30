const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Usuario');
const Usuario = mongoose.model('usuarios');
const bcrypt = require('bcryptjs');
const passport = require('passport');
router.get('/registro', (req, res)=>{
    res.render('usuarios/registro');
});
router.post('/registro', (req, res)=>{
    let erros = [];
    if(req.body.nome.length < 4 || req.body.email.length < 4 || req.body.senha.length < 4 || req.body.senha2.length < 4){
        erros.push({texto: "Todos os campos devem ter no minímo 4 caracteres!"});
    }
    if(req.body.senha != req.body.senha2){
        erros.push({texto: "Senhas diferentes!"});
    }
    if(erros.length > 0){
        res.render('/usuarios/registro', {erros: erros});
    }else{
        Usuario.findOne({email: req.body.email}).lean().then((usuarios)=>{
            if(usuarios){
                req.flash('error_msg', "Este e-mail já está cadastrado!");
                res.redirect('/usuarios/registro');
            }else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                });
                bcrypt.genSalt(10, (erro, salt)=>{
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash)=>{
                        if(erro){
                            req.flash('error_msg', "Erro ao cadastrar usuário!");
                            res.redirect('/');
                        }
                        novoUsuario.senha = hash;
                        novoUsuario.save().then(()=>{
                            req.flash('success_msg', "Usuário cadastrado com sucesso!");
                            res.redirect('/');
                        }).catch((err)=>{
                            console.log("Erro no salvamento de usuarios: " + err);
                            req.flash('error_msg', "Houve um erro interno!");
                            res.redirect('/usuarios/registro');
                        });
                    });
                });
            }
        });
    }
});
router.get('/login', (req, res)=>{
    res.render('usuarios/login');
});
router.post('/login', (req, res, next)=>{
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req, res, next);
});
module.exports = router;