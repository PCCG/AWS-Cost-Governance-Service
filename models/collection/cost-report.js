const Schema = require("mongoose").Schema;
const Model = require("mongoose").model;

const CostReportSchema = new Schema({
	accountId: {
		required: true,
		type: String,
	},
	costReport: {
		required: true,
		type: Array,
	},
	collectionStatuses: [{ type: Schema.Types.ObjectId, ref: "CollectionStatus" }],
});

module.exports = Model("CostReport", CostReportSchema);
