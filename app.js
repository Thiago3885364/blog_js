//Módulos
    const express = require('express');
    const bodyParser = require('body-parser');
    const handlebars = require('express-handlebars');
    const mongoose = require('mongoose');
    const path = require('path');
    const session = require('express-session');
    const flash = require('connect-flash');
    require('./models/Postagem');
    const Postagem = mongoose.model('postagens');
    require('./models/Categoria');
    const Categoria = mongoose.model('categorias');
//Váriaveis
    const app = express();
    const PORT = 8081;
    const admin = require('./routes/admin');
    const usuario = require('./routes/usuario');
    //const { rawListeners } = require('process');
//Configurações
    //Session
    app.use(session({
        secret: "blogapp",
        resave: true,
        saveUninitialized: true
    }));
    //Flash
    app.use(flash());
    //Middleware
    app.use((req, res, next)=>{
        res.locals.success_msg = req.flash('success_msg');
        res.locals.error_msg = req.flash('error_msg');
        next();
    });
    //BodyParser
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: true}));
    //Handlebars
        var handle = handlebars.create({defaultLayout: 'main'});
        app.engine('handlebars', handle.engine);
        app.set('view engine', 'handlebars');
        app.set('views',path.join(__dirname, 'views'));
    //Mongoose
    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://127.0.0.1/blogapp', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(()=>{
        console.log("Conectado com o mongoose!");
    }).catch((err)=>{
        console.log("Erro ao se conectar com mongoose! " + err);
    });
//Public
    app.use(express.static(path.join(__dirname, 'public')));
//Rotas
    app.use('/admin', admin);
    app.use('/usuarios', usuario);
    app.get('/', (req, res)=>{
        Postagem.find().populate({path:'categoria', strictPopulate: false}).lean().sort({data:'desc'}).then((postagens)=>{
            res.render('index', {postagens: postagens});
        }).catch((err)=>{
            req.flash('error_msg', "Houve um erro interno!");
            res.redirect('/404');
        });
    });
    app.use('/404', (req, res)=>{
        res.send("Houve um erro interno! Erro 404!");
    });
    app.get('/postagem/:slug', (req,res)=>{
        Postagem.findOne({slug: req.params.slug}).lean().then((postagens)=>{
            if(postagens){
                res.render('postagem/index', {postagens: postagens});
            }else{
                req.flash('error_msg', "Postagem não existente!");
                res.redirect('/');
            }
        }).catch((err)=>{
            console.log("Erro na rota de postagem slug: " + err);
            req.flash('error_msg', "Houve um erro interno!");
            res.redirect('/');
        });
    });
    app.get('/categorias', (req, res)=>{
        Categoria.find().lean().then((categorias)=>{
            res.render('categoria/index', {categorias: categorias});
        }).catch((err)=>{
            console.log('Erro nas categorias: ' + err);
            req.flash('error_msg', "Houve um erro interno!");
            res.redirect('/');
        });
    });
    app.get('/categorias/:slug', (req, res)=>{
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria)=>{
            if(categoria){
                Postagem.find({categoria: categoria._id}).lean().then((postagens)=>{
                    res.render('categoria/postagens', {postagens: postagens, categoria: categoria});
                }).catch((err)=>{
                    console.log("Erro ao listar postagens!");
                    req.flash('error_msg', "Erro ao listar postagem!");
                    res.redirect('/');
                });
            }else{
                req.flash('error_msg', "Categoria não existente!");
                res.redirect('/');
            }
        }).catch((err)=>{
            console.log("Erro em categorias: " + err);
            req.flash('error_msg', "Houve um erro interno!");
            res.redirect('/');
        });
    });
//Servidor
    app.listen(PORT, ()=>{
        console.log("Servidor iniciado!");
    });