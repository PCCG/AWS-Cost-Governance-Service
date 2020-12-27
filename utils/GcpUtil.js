// The required credentails are read from the Service Account key file
// The environment variable GOOGLE_APPLICATION_CREDENTIALS represents the
// path to the Service Account key file

// The util file acts as a single source of truth
// All Service Objects should originate from this file

const { BigQuery } = require("@google-cloud/bigquery");

module.exports = {
	createBigQuerySvcObj(credentails) {
		return new BigQuery(credentails);
	},
};
