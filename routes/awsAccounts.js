const express = require('express');
const router = express.Router();
const esClient = require("../services/rest/elasticSearchSvc");

//The codebase makes use of the async/await pattern throughout. Making use of this pattern will make the codebase 
//look much cleaner and at the same time, error handling becomes much easier. Ideally, it makes sense to propagate
//all of the exceptions to the routes so that the appropriate error message can be sent down to the client.
router.post('/credentials/aws/postAccount', async function(req, res) {
    if(req.body.credentials){
        const credentialsObj = req.body.credentials;
        const transactionData = await esClient.postAccountDetails(credentialsObj.accessId, credentialsObj);
        res.status(transactionData.status).send(transactionData.statusText);
    } else {
        res.status(400).send("The request is missing the required credentials");
    }
})

router.get('/credentials/aws/getAccounts', async function(req, res){
    const awsAccounts = await esClient.getAccountDetails()
    res.send(awsAccounts);
})

module.exports = router;