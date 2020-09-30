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
    type: String
  },
  totalValue: {
    type: String
  },
  paidValue: {
    type: String
  },
  typePayment: {
    type: String
  },
  accesskey: {
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
    type: String
  },
  series: {
    type: String
  },
  number: {
    type: String
  },
  issuanceDate: {
    type: String
  },
  totalValueService: {
    type: String
  },
  icmsCalculationBasis: {
    type: String
  },
  icmsValue: {
    type: String
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