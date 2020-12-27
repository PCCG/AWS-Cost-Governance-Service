const GcpAccount = require("../../models/gcp/GcpAccount");

module.exports = {
	//This method acts as a middleware and validates the request payload. If the request payload is missing the
	//required credentials, then the middleware does not pass on the request to a route for further processing.
	//However, if the request payload contains the credentials, the middleware then appends the service object
	//to the "response" object. The service object is utilized by methods that are defined in the service layer.
	validateIfAccountIdPresent: async (req, res, next, createServiceObject) => {
		const accountId = req.body.accountId;
		const badRequestMessage = "The Account ID isn't defined as part of the request payload.";
		if (!accountId) {
			console.error(badRequestMessage);
			res.status(400).send(badRequestMessage);
			return;
		}
		const gcpAccount = await GcpAccount.findById(accountId);
		res.locals.serviceObject = createServiceObject({
			projectId: gcpAccount.projectId,
			credentials: { client_email: gcpAccount.clientEmail, private_key: gcpAccount.privateKey.replace(new RegExp("\\\\n", "g"), "\n") },
		});
		next();
	},
};
