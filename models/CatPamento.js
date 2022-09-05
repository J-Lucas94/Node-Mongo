const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CatPagamento = new Schema({
    nome: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model("catpagamento", CatPagamento)