const mongoose = require('mongoose')

const itemSchema = mongoose.Schema({
    nfce: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Nfce',
        require: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    itemName: {
        type: String
    },
    itemCode: {
        type: String
    },
    qtdItem: {
        type: Number
    },
    unItem: {
        type: String
    },
    itemValue: {
        type: Number
    }
})

itemSchema.pre('save', async function (next) {
    const item = this
    next()
})

const Item = mongoose.model('Item', itemSchema)

module.exports = Item;