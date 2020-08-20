const Schema = require('mongoose').Schema;
const Model = require('mongoose').model;

const gcpAccountSchema = new Schema({
  aliasName: {
    type: String,
    required: true,
    unique: true
  },
  cloudStorageBucket : {
    type: String,
    required: true,
    unique: true
  },
  billingReportPrefix : {
    type: String,
    required: false
  },
  serviceAccountKeyFile : {
    type: Object,
    required: true
  },
  pollingInterval: {
    type: Number
  }
})

const GcpAccount = Model('GcpAccount', gcpAccountSchema)

module.exports = GcpAccount;
