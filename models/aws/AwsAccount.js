const Schema = require('mongoose').Schema;
const Model = require('mongoose').model;

const AwsAccountSchema = new Schema({
    accessKeyId: {
        type: String,
        required: true,
        unique: true
    },
    secretAccessKey: {
        type: String,
        required: true,
        unique: true
    },
    aliasName: {
        type: String,
        required: true
    },
    pollingInterval: {
        required: true,
        type: Number
    },
    reportName: {
        type: String,
        required: true
    },
    s3Bucket: {
        type: String,
        required: true
    },
    reportPrefix: {
        type: String
    }
});

const AwsAccountModel = Model('AwsAccount', AwsAccountSchema);

module.exports = AwsAccountModel;