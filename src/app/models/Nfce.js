const mongoose = require('mongoose')

const nfceSchema = mongoose.Schema({
  url: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    require: true
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  }],
  totalItems: {
    type: Number
  },
  totalValue: {
    type: Number
  },
  paidValue: {
    type: Number
  },
  typePayment: {
    type: String
  },
  socialName: {
    type: String
  },
  cnpj: {
    type: String
  },
  stateRegistration: {
    type: String
  },
  uf: {
    type: String
  },
  operationDestination: {
    type: String
  },
  finalCostumer: {
    type: String
  },
  buyerPresence: {
    type: String
  },
  model: {
    type: Number
  },
  series: {
    type: Number
  },
  number: {
    type: Number
  },
  issuanceDate: {
    type: String
  },
  totalValueService: {
    type: Number
  },
  icmsCalculationBasis: {
    type: Number
  },
  icmsValue: {
    type: Number
  },
  protocol: {
    type: String
  }
})

nfceSchema.pre('save', async function (next) {
  const nfce = this
  next()
})

const Nfce = mongoose.model('NFCE', nfceSchema)

module.exports = Nfce;