//Módulos
    const express = require('express');
    const mongoose = require('mongoose');
    require('../models/Categoria');
    require('../models/Postagem');
//Váriaveis
    const router = express.Router();
    const Categoria = mongoose.model('categorias');
    const Postagem = mongoose.model('postagens');
//Rotas
    router.get('/',(req, res)=>{
        res.render('admin/index');
    });
    router.get('/posts',(req, res)=>{
        res.send("Página de posts!");
    })
    router.get('/categorias',(req, res)=>{
        Categoria.find().lean().sort({data:'desc'}).then((categorias)=>{
            res.render('admin/categorias', {categorias:categorias});
        }).catch((err)=>{
            req.flash('msg_erro', "Erro ao listar categorias!");
            res.redirect('/admin');
        });
    });
    router.get('/categorias/add',(req, res)=>{
        res.render('admin/addcategorias');
    })
    router.post('/categorias/nova',(req, res)=>{
        let erros = [];
        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
            erros.push({texto: "Nome da postagem inválido!"});
        }
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            erros.push({texto:"Slug inválido!"});
        }
        if(req.body.nome.length < 3){
            erros.push({texto:"Nome da postagem curta!"});
        }
        if(req.body.slug < 3){
            erros.push({texto:"Slug da postagem curta!"});
        }
        if(erros.length > 0){
            res.render('admin/addcategorias', {erros:erros});
        }else{
            const novaCategoria = {
                nome: req.body.nome,
                slug: req.body.slug
            }
            req.flash('success_msg', "Categoria criada com sucesso!");
            res.redirect('/admin/categorias');
            new Categoria(novaCategoria).save().then(()=>{
                console.log("Categoria cadastrada com sucesso!");
            }).catch((err)=>{
                req.flash('error_msg', "Erro ao cadastrar categoria!")
                console.log("Erro ao cadastrar categoria! " + err);
                res.redirect('/admin');
            });
        }
    });
    router.get('/categorias/edit/:id', (req, res)=>{
        Categoria.findOne({_id:req.params.id}).lean().then((categorias)=>{
            res.render('admin/editcategorias', {categorias: categorias});
        }).catch((err)=>{
            req.flash('error_msg', "Essa categoria não existe");
            res.render('/admin/categorias');
        });
    });
    router.post('/categorias/edit', (req, res)=>{
        let erros = [];
        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
            erros.push({texto: "Edição: Nome da categoria inválido!"});
        }
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            erros.push({texto: "Edição: Slug da categoria inválido!"});
        }
        if(req.body.nome.length < 3){
            erros.push({texto: "Edição: Nome da categoria muito curto!"});
        }
        if(req.body.slug.length < 3){
            erros.push({texto: "Edição: Slug da categoria muito curto!"});
        }
        if(erros.length > 0){
            res.render('admin/editcategorias', {erros: erros});
        }else{
            Categoria.findOne({_id:req.body.id}).then((categoria)=>{
                categoria.nome = req.body.nome,
                categoria.slug = req.body.slug
                categoria.save().then(()=>{
                    req.flash('success_msg', "Categoria editada com sucesso!");
                    res.redirect('/admin/categorias');
                }).catch((err)=>{
                    req.flash('error_msg', "Houve erro ao editar categoria!");
                    res.redirect('/admin/categorias');
                });
            }).catch((err)=>{
                req.flash('error_msg', "Erro ao editar categoria!");
                res.redirect('/admin/categorias');
            });
        }
    });
    router.post('/categorias/deletar', (req, res)=>{
        Categoria.deleteOne({_id: req.body.id}).lean().then(()=>{
            req.flash('success_msg', "Categoria deletada com sucesso!");
            res.redirect('/admin/categorias');
        }).catch((err)=>{
            req.flash('error_msg', "Erro ao deletar categoria!");
            res.redirect('/admin/categorias');
        });
    });
    router.get('/postagens', (req, res)=>{
        Postagem.find().populate({path:'categoria', strictPopulate: false}).lean().sort({data:'desc'}).then((postagens)=>{
            res.render('admin/postagens', {postagens: postagens});
        }).catch((err)=>{
            req.flash('error_msg', "Erro ao listar postagens!");
            res.redirect('/admin/postagens');
        });
        //res.render('admin/postagens');
    });
    router.get('/postagens/add', (req, res)=>{
        Categoria.find().lean().then((categorias)=>{
            res.render('admin/addpostagens', {categorias: categorias});
        }).catch((err)=>{
            req.flash('error_msg', "Erro ao mostrar cadastro de postagens!");
            res.redirect('/admin/postagens');
        });
    });
    router.post('/postagens/nova', (req, res)=>{
        let erros = [];
        if(req.body.categoria == '0'){
            erros.push({texto: "Categoria inválida!"});
        }
        if(erros.length > 0){
            req.flash('error_msg', "Erro ao cadastrar postagem!");
            res.redirect('/admin/postagens');
        }else{
            const novaPostagem = {
                titulo: req.body.titulo,
                slug: req.body.slug,
                descricao: req.body.descricao,
                conteudo: req.body.conteudo,
                categoria: req.body.categoria
            };
            new Postagem(novaPostagem).save().then(()=>{
                req.flash('success_msg', "Postagem cadastrada com sucesso!");
                res.redirect('/admin/postagens');
            }).catch((err)=>{
                req.flash('error_msg', "Erro ao cadastrar postagem!");
                res.redirect('/admin/postagens');
            });
        }
    });
    router.get('/postagens/edit/:id', (req, res)=>{
        Postagem.findOne({_id:req.params.id}).lean().then((postagens)=>{
            Categoria.find().lean().then((categorias)=>{
                res.render('admin/editpostagens', {postagens: postagens, categorias: categorias});
            }).catch((err)=>{
                req.flash('error_msg', "Erro ao listar categorias!");
                res.redirect('/admin/postagens');
            })
        }).catch((err)=>{
            req.flash('error_msg', "Erro ao editar postagem!");
            res.render('/admin/postagens');
        });
    });
    router.post('/postagens/edit', (req, res)=>{
        let erros = [];
        if(req.body.titulo.length < 3 || req.body.slug.length < 3 || req.body.descricao.length < 3
            || req.body.conteudo.length < 3 || req.body.categoria.length < 0){
                erros.push({texto: "Os campos devem ter mais que 2 caracteres!"});
        }else{
            Postagem.findOne({_id: req.body.id}).then((postagens)=>{
                postagens.titulo = req.body.titulo,
                postagens.slug = req.body.slug,
                postagens.descricao = req.body.descricao,
                postagens.conteudo = req.body.conteudo,
                postagens.categoria = req.body.categoria
                postagens.save().then(()=>{
                    req.flash('success_msg', "Postagem editada com sucesso!");
                    res.redirect('/admin/postagens');
                }).catch((err)=>{
                    req.flash('error_msg', "Erro ao editar postagem!!");
                    res.redirect('/admin/postagens');
                });
            }).catch((err)=>{
                console.log(err);
                req.flash('error_msg', "Erro ao editar postagem!");
                res.redirect('/admin/postagens');
            });
        }
    });
    router.post('/postagens/deletar', (req, res)=>{
        Postagem.deleteOne({_id: req.body.id}).lean().then(()=>{
            req.flash('success_msg', "Postagem deletada com sucesso!");
            res.redirect('/admin/postagens');
        }).catch((err)=>{
            req.flash('error_msg', "Erro ao deletar postagem!");
            res.redirect('/admin/postagens');
        });
    });
//Exportando
    module.exports = router;