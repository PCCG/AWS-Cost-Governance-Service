const Schema = require('mongoose').Schema;
const Model = require('mongoose').model;

const AwsCollectionStatusSchema = new Schema({
    triggered: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true
    }
});

module.exports = Model('AwsCollectionStatus', AwsCollectionStatusSchema);