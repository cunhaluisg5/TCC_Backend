const mongoose = require('mongoose')

const nfceSchema = mongoose.Schema({
    link: {
        type: String,
        required: true,
        trim: false
    },
    date: {
        type: Date,
        required: true
    }
})

nfceSchema.pre('save', async function (next) {
    const nfce = this
    next()
})

const Nfce = mongoose.model('NFCE', nfceSchema)

module.exports = Nfce;