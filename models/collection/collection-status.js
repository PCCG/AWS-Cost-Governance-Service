const Schema = require("mongoose").Schema;
const Model = require("mongoose").model;

const CollectionStatusSchema = new Schema({
	collectionStatus: {
		type: String,
		enum: ["success", "failed"],
		default: "success",
	},
	accountId: {
		type: String,
		required: true,
	},
	timestamp: {
		type: Date,
		required: true,
	},
	// Do we really need to display the number of records processed ?
	// number_of_records: {
	//     type: Number
	// }
});

module.exports = Model("CollectionStatus", CollectionStatusSchema);
