//Carregando os módulos
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express();
const admin = require("./routes/admin")
const path = require("path")
const mongoose = require('mongoose')
const session= require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
require("./config/auth")(passport)


//Configurações 
//Sessão
app.use(session({
    secret: 'lucas',
    resave: true,
    saveUninitialized: true    
}))
app.use(passport.initialize())
app.use(passport.session())
//Flash

app.use(flash())

//Middleware
app.use((req, res, next)=>{
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null
    next()
})

//Body Parser
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

//Handlebars
app.engine('handlebars', handlebars.engine({defaultLayout: "main"}))
app.set("view engine", 'handlebars')

//Conexão com banco de dados

mongoose.connect('mongodb://localhost/produtos',{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log("Sucesso")
}).catch((erro)=>{
    console.log("Erro conexão não realizada" + erro)
})

//Arquivos estáticos
app.use(express.static(path.join(__dirname, "public")))

//Rotas
app.use('/admin', admin)

//Iniciar o servidor
const PORT = 8080;
app.listen(PORT,() =>{
    console.log("Servidor iniciado!");
})