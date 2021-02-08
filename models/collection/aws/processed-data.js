const Schema = require("mongoose").Schema;
const Model = require("mongoose").model;

const AwsCollectionProcessedDataSchema = new Schema({
	accountId: {
		required: true,
		type: String,
	},
	costReport: {
		required: true,
		type: Array,
	},
	collectionStatuses: [{ type: Schema.Types.ObjectId, ref: "AwsCollectionStatus" }],
});

module.exports = Model("AwsCurProcessedData", AwsCollectionProcessedDataSchema);
