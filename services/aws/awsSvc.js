module.exports = {
  //This method acts as a middleware and validates the request payload. If the request payload is missing the
  //required credentials, then the middleware does not pass on the request to a route for further processing.
  //However, if the request payload contains the credentials, the middleware then appends the service object
  //to the "response" object. The service object is utilized by methods that are defined in the service layer.
    validateIfAwsCredsPresent: (req, res, next, createServiceObject) => {
        const iamUserAccessKeyId = req.body.accessKeyId;
        const iamUserSecretAccessKey = req.body.secretAccessKey;
        const badRequestMessage = "The IAM user credentials aren't defined as part of the request payload.";
        if(!iamUserAccessKeyId || !iamUserSecretAccessKey){
            console.error(badRequestMessage);
            res.status(400).send(badRequestMessage);
            return;
        }
        res.locals.serviceObject = createServiceObject(iamUserAccessKeyId, iamUserSecretAccessKey);
        next();
    }
}
