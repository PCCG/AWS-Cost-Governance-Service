module.exports = {
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