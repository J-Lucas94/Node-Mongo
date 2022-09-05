//Carregando os módulo
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')
require("../models/CatPamento")
const CatPagamento = mongoose.model('catpagamento')
require("../models/Pagamento")
const Pagamento = mongoose.model('pagamento')
require("../models/Usuario")
const Usuario = mongoose.model('usuario')
const passport = require('passport')
const { eAdmin } = require('../helpers/eAdmin')

router.get('/', eAdmin, (req, res) => {
    res.render("admin/index")
})

router.get('/login', (req, res) => {
    res.render("admin/login")
})

router.post('/login', (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/admin/",
        failureRedirect: "/admin/login",
        failureFlash: true
    })(req, res, next)
})

router.get('/logout', (req, res) => {
    

})

router.get('/usuarios', eAdmin, (req, res) => {
    Usuario.find().lean().then((usuario) => {
        res.render("admin/usuarios", { usuarios: usuario })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Usuário não encontrado!")
        res.redirect("/admin/usuarios")
    })
})

router.get('/vis-usuario/:id', eAdmin, (req, res) => {
    Usuario.findOne({ _id: req.params.id }).lean().then((usuario) => {
        res.render('admin/vis-usuario', { usuario: usuario })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Usuário não encontrado!")
        res.redirect("/admin/usuarios")
    })
})

router.get('/perfil', eAdmin, (req, res) => {
    Usuario.findOne({ _id: req.user._id }).lean().then((usuario) => {
        res.render('admin/perfil', { usuario: usuario })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Perfil não encontrado!")
        res.redirect("/admin/login")
    })
})

router.get('/edit-perfil', eAdmin, (req, res) => {
    Usuario.findOne({ _id: req.user._id }).lean().then((usuario) => {
        res.render("admin/edit-perfil", { usuario: usuario })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Perfil não encontrado!")
        res.redirect("/admin/")
    })
})

router.post("/update-perfil", eAdmin, (req, res) => {
    var dados_perfil = req.body
    var errors = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        errors.push({ error: "Necessário preencher o campo nome!" })
    }

    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        errors.push({ error: "Necessário preencher o campo E-mail!" })
    }

    if (errors.length > 0) {
        res.render("admin/edit-perfil", { errors: errors, usuario: dados_perfil })
    } else {
        Usuario.findOne({ _id: req.user._id }).then((usuario) => {
            usuario.nome = req.body.nome,
                usuario.email = req.body.email
            usuario.save().then(() => {
                req.flash("success_msg", "Perfil editado com ssucesso!")
                res.redirect("/admin/perfil")

            }).catch((erro) => {
                req.flash("error_msg", "Error: Perfil não encontrado!")
                res.redirect("/admin")
            })
        }).catch((erro) => {
            req.flash("error_msg", "Error: Perfil não encontrado!")
            res.redirect("/admin/login")
        })
    }
})

router.get("/edit-senha-perfil", eAdmin, (req, res)=>{
    Usuario.findOne({_id: req.user._id}).lean().then((usuario)=>{
        res.render("admin/edit-senha-perfil", {usuario: usuario})
    }).catch((erro)=>{
        req.flash("error_msg", "Error: Perfil não encontrado!")
            res.redirect("/admin/login")
    })
})

router.post("/update-senha-perfil", eAdmin, (req, res)=>{
    var dados_usuario = req.body
    var errors =[]
    
    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        errors.push({ error: "Erro: Necessário preencher o campo senha!" })
    }
    if (!req.body.rep_senha || typeof req.body.rep_senha == undefined || req.body.rep_senha == null) {
        errors.push({ error: "Erro: Necessário preencher o campo repetir senha!" })
    }
    if (req.body.senha != req.body.rep_senha) {
        errors.push({ error: "Erro: As senhas são diferentes!" })
    }
    if (req.body.senha.length < 6) {
        errors.push({ error: "Erro: Senha muito fraca!" })
    }

    if(errors.length > 0){
res.render("admin/edit-senha-perfil", {errors: errors, dados_usuario: dados_usuario})
    }else {
        Usuario.findOne({_id: req.user._id}).then((usuario)=>{
            usuario.senha = req.body.senha
            bcryptjs.genSalt(10, (erro, salt)=>{
                bcryptjs.hash(usuario.senha, salt, (erro, hash)=>{
                    if(erro){
                        req.flash("error_msg", "Error: Não foi possivel editar a senha, entre em contato com o adminstrador !")
                        res.redirect("/admin/perfil")
                    }else{
                        usuario.senha = hash
                        usuario.save().then(()=>{
                            req.flash("success_msg", "Senha Editada com sucesso !")
                        res.redirect("/admin/perfil")
                        }).catch((erro)=>{
                            req.flash("error_msg", "Error: Não foi possivel editar a senha, entre em contato com o adminstrador !")
                        res.redirect("/admin/perfil")
                        })
                    }
                })
            })
        }).catch((erro)=>{
            req.flash("error_msg", "Error: Perfil não encontrado!")
            res.redirect("/admin/login")
        })
    }
})




router.get('/cad-usuario', eAdmin, (req, res) => {
    res.render("admin/cad-usuario")
})

router.post('/add-usuario', (req, res) => {
    var dados_usuario = req.body
    var errors = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        errors.push({ error: "Erro: Necessário preencher o campo nome!" })
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        errors.push({ error: "Erro: Necessário preencher o campo e-mail!" })
    }
    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        errors.push({ error: "Erro: Necessário preencher o campo senha!" })
    }
    if (!req.body.rep_senha || typeof req.body.rep_senha == undefined || req.body.rep_senha == null) {
        errors.push({ error: "Erro: Necessário preencher o campo repetir senha!" })
    }
    if (req.body.senha != req.body.rep_senha) {
        errors.push({ error: "Erro: As senhas são diferentes!" })
    }
    if (req.body.senha.length < 6) {
        errors.push({ error: "Erro: Senha muito fraca!" })
    }

    if (errors.length > 0) {
        res.render("admin/cad-usuario", { errors: errors, usuario: dados_usuario })
    } else {
        Usuario.findOne({ email: req.body.email }).then((usuario) => {
            if (usuario) {
                req.flash("error_msg", "E-mail já cadastrado!")
                res.redirect("/admin/cad-usuario")
            } else {
                const addUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcryptjs.genSalt(10, (erro, salt) => {
                    bcryptjs.hash(addUsuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash("error_msg", "Error: Não foi possível cadastrar, entre em contato com o administrador!")
                            res.redirect("/admin/cad-usuario")
                        } else {
                            addUsuario.senha = hash
                            addUsuario.save().then(() => {
                                req.flash("success_msg", "Usuário cadastrado com sucesso!")
                                res.redirect('/admin/usuarios')
                            }).catch((erro) => {
                                req.flash("error_msg", "Error: Usuário não foi cadastrado com sucesso!")
                                res.render("admin/cad-usuario")
                            })
                        }
                    })
                })
            }
        }).catch((erro) => {
            req.flash("error_msg", "Error: Não foi possível cadastrar, entre em contato com o administrador!")
            res.render("admin/usuarios")
        })
    }
})

//editar usuario
router.get('/edit-usuario/:id', eAdmin, (req, res) => {
    Usuario.findOne({ _id: req.params.id }).lean().then((usuario) => {
        res.render("admin/edit-usuario", { usuario: usuario })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Usuário não encontrado!")
        res.render("admin/usuarios")
    })
})

// Update

router.post("/update-usuario", eAdmin, (req, res) => {
    var dados_usuario = req.body
    var errors = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        errors.push({ error: "Erro: Necessário preencher o campo nome!" })
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        errors.push({ error: "Erro: Necessário preencher o campo e-mail!" })
    }

    if (errors.length > 0) {

        res.render("admin/edit-usuario", { errors: errors, usuario: dados_usuario })
    } else {
        Usuario.findOne({ _id: req.body._id }).then((usuario) => {
            usuario.nome = req.body.nome,
                usuario.email = req.body.email

            usuario.save().then(() => {
                req.flash("success_msg", "Usuário editado com sucesso")
                res.redirect("/admin/usuarios")
            }).catch((erro) => {
                req.flash("error_msg", "Error: Usuário não foi editado com sucesso")
                res.redirect("/admin/usuarios")
            })
        }).catch((erro) => {
            req.flash("error_msg", "Error: Usuário não encontrado")
            res.redirect("/admin/usuarios")
        })
    }

})

router.get('/del-usuario/:id', eAdmin, (req, res) => {
    Usuario.deleteOne({ _id: req.params.id }).then(() => {
        req.flash("success_msg", "Usuario apagado com sucesso")
        res.redirect("/admin/usuarios")
    }).catch((erro) => {
        req.flash("error_msg", "Error: Usuário não foi Apagado com sucesso")
        res.redirect("/admin/usuarios")
    })
})




router.get('/cat-pagamentos', eAdmin, (req, res) => {
    CatPagamento.find().lean().then((catpagamento) => {
        res.render("admin/cat-pagamentos", { catpagamento: catpagamento })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Categoria de pagamento não foi encontrado!")
        res.render("admin/cat-pagamentos")
    })

})

router.get('/vis-cat-pagamento/:id', eAdmin, (req, res) => {
    CatPagamento.findOne({ _id: req.params.id }).lean().then((catpagamento) => {
        res.render("admin/vis-cat-pagamento", { catpagamento: catpagamento })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Categoria de pagamento não foi encontrado!")
        res.render("admin/cat-pagamentos")
    })
})

router.get('/cad-cat-pagamentos', eAdmin, (req, res) => {
    res.render("admin/cad-cat-pagamento")
})

router.get('/cad-cat-pagamento', eAdmin, (req, res) => {
    res.render("admin/cad-cat-pagamento")
})

router.post('/add-cat-pagamento', eAdmin, (req, res) => {
    var errors = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        errors.push({ error: "Necessario preencher o campo nome !" })
    }

    if (errors.length > 0) {

        res.render("admin/cad-cat-pagamento", { errors: errors })
    } else {
        const addCatpagamento = {
            nome: req.body.nome,
        }

        new CatPagamento(addCatpagamento).save().then(() => {
            req.flash("success_msg", "Categoria de pagamento cadastrado com sucesso!")
            res.redirect('/admin/cat-pagamentos')
        }).catch((erro) => {
            req.flash("error_msg", "Error: Categoria de pagamento não foi cadastrada!")
        })
    }


})

router.get('/edit-cat-pagamento/:id', eAdmin, (req, res) => {
    CatPagamento.findOne({ _id: req.params.id }).lean().then((catpagamento) => {
        res.render("admin/edit-cat-pagamento", { catpagamento: catpagamento })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Categoria de pagamento não foi econtrado!")
        res.redirect("admin/cat-pagamentos")
    })

})

router.post('/update-cat-pagamento', eAdmin, (req, res) => {
    CatPagamento.findOne({ _id: req.body.id }).then((catpagamento) => {
        catpagamento.nome = req.body.nome
        catpagamento.save().then(() => {
            req.flash("success_msg", "Categoria de pagamento Editada com Sucesso!")
            res.redirect("/admin/cat-pagamentos")
        }).catch((erro) => {
            req.flash("error_msg", "Error: Categoria de pagamento não Editada!")
            res.redirect("/admin/cat-pagamentos")
        })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Categoria de pagamento não foi econtrado!")
        res.redirect("/admin/cat-pagamentos")
    })
})

router.get('/del-cat-pagamento/:id', eAdmin, (req, res) => {
    CatPagamento.deleteOne({ _id: req.params.id }).then(() => {
        req.flash("success_msg", "Categoria de pagamento Apagada com Sucesso!")
        res.redirect("/admin/cat-pagamentos")
    }).catch((error) => {
        req.flash("error_msg", "Error: Categoria de pagamento não foi Apagada!")
        res.redirect("/admin/cat-pagamentos")
    })
})





router.get('/pagamentos', eAdmin, (req, res) => {
    Pagamento.find().populate("catpagamento").lean().then((pagamentos) => {
        res.render("admin/pagamentos", { pagamentos: pagamentos })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Pagamento não foi encontrado!")
        res.render("admin/pagamentos")
    })

})





router.get('/vis-pagamento/:id', eAdmin, (req, res) => {
    Pagamento.findOne({ _id: req.params.id }).populate("catpagamento").lean().then((pagamento) => {
        res.render("admin/vis-pagamento", { pagamento: pagamento })
    }).catch((erro) => {
        req.flash("error_msg", "Error: Pagamento não foi encontrado!")
        res.render("admin/pagamentos")
    })
})

router.get('/cad-pagamento', eAdmin, (req, res) => {
    CatPagamento.find().lean().then((catpagamento) => {
        res.render("admin/cad-pagamento", { catpagamentos: catpagamento })
    }).catch((erro) => {
        req.flash("error_msg", "Error: O formulário cadastrar pagamento não pode ser carregado")
        res.redirect("/admin/pagamentos")
    })

})

router.post('/add-pagamento', eAdmin, (req, res) => {
    var dados_pagamento = req.body
    var errors = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        errors.push({ error: "Necessario preencher o campo nome" })
    }

    if (!req.body.valor || typeof req.body.valor == undefined || req.body.valor == null) {
        errors.push({ error: "Necessario preencher o campo valor" })
    }

    if (!req.body.catpagamento || typeof req.body.catpagamento == undefined || req.body.catpagamento == null) {
        errors.push({ error: "Necessário preencher o campo categoria de pagamento" })
    }

    if (errors.length > 0) {
        CatPagamento.find().lean().then((catpagamento) => {
            res.render("admin/cad-pagamento", { errors: errors, pagamento: dados_pagamento, catpagamentos: catpagamento })
        })
    } else {
        const addPagamento = {
            nome: req.body.nome,
            valor: req.body.valor,
            catpagamento: req.body.catpagamento

        }

        new Pagamento(addPagamento).save().then(() => {
            req.flash("success_msg", "Pagamento cadastrado com sucesso!")
            res.redirect('/admin/pagamentos')

        }).catch((erro) => {
            req.flash("error_msg", "Error: Pagamento não foi cadastrado")
            res.redirect('/admin/cad-pagamento')
        })
    }

})

router.get('/edit-pagamento/:id', (req, res) => {
    Pagamento.findOne({ _id: req.params.id }).lean().populate("catpagamento").then((pagamento) => {
        CatPagamento.find().lean().then((catpagamentos) => {
            res.render("admin/edit-pagamento", { pagamento: pagamento, catpagamentos: catpagamentos })
        }).catch((erro) => {
            req.flash("error_msg", "Error: Não foi possível carregar as categorias de pagamentos!")
            res.redirect('/admin/pagamentos')
        })


    }).catch((erro) => {
        req.flash("error_msg", "Error: Não é possível carregar o formulário editar pagamento!")
        res.redirect('/admin/pagamentos')
    })
})

router.post('/update-pagamento', eAdmin, (req, res) => {
    var dados_pagamento = req.body
    var errors = []
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        errors.push({ error: "Necessário preencher o campo nome" })
    }
    if (!req.body.valor || typeof req.body.valor == undefined || req.body.valor == null) {
        errors.push({ error: "Necessário preencher o campo valor" })
    }
    if (!req.body.catpagamento || typeof req.body.catpagamento == undefined || req.body.catpagamento == null) {
        errors.push({ error: "Necessário preencher o campo categoria de pagamento" })
    }

    if (errors.length > 0) {
        CatPagamento.find().lean().then((catpagamento) => {
            res.render("admin/edit-pagamento", { errors: errors, pagamento: dados_pagamento, catpagamentos: catpagamento })
        })
    } else {
        Pagamento.findOne({ _id: req.body._id }).then((pagamento) => {
            pagamento.nome = req.body.nome,
                pagamento.valor = req.body.valor,
                pagamento.catpagamento = req.body.catpagamento

            pagamento.save().then(() => {
                req.flash("success_msg", "Pagamento editado com sucesso!")
                res.redirect('/admin/pagamentos')
            }).catch((erro) => {
                errors.push({ error: "Error: Pagamento não foi editado com sucesso!" })
                CatPagamento.find().then((catpagamento) => {
                    res.render("admin/edit-pagamento", { errors: errors, pagamento: dados_pagamento, catpagamentos: catpagamento })
                })
            })

        }).catch((erro) => {
            req.flash("error_msg", "Error: Pagamento não encontrado!")
            res.redirect('/admin/pagamentos')
        })
    }
})


router.get('/del-pagamento/:id', eAdmin, (req, res) => {
    Pagamento.deleteOne({ _id: req.params.id }).then(() => {
        req.flash("success_msg", "Pagamento apagado com sucesso!")
        res.redirect('/admin/pagamentos')
    }).catch((erro) => {
        req.flash("error_msg", "Error: Pagamento não apagado!")
        res.redirect('/admin/pagamentos')
    })
})




//Exportar o módulo de rotas
module.exports = router