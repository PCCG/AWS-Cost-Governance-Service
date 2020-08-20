const express = require('express');
const router = express.Router();
const esClient = require("../../services/rest/elasticSearchSvc");

//Map the object that houses account related information to a model.
router.post('/credentials/postAccount', async function(req, res) {
    if(req.body.credentials){
        const credentialsObj = req.body.credentials;
        const transactionData = await esClient.postAccountDetails(credentialsObj.accessKeyId, credentialsObj);
        res.status(transactionData.status).send(transactionData.statusText);
    } else {
        res.status(400).send("The request is missing the required credentials");
    }
})

router.get('/credentials/getAccounts', async function(req, res){
    const awsAccounts = await esClient.getAccountDetails()
    res.send(awsAccounts);
})

router.post('/credentials/deleteAccount', async (req, res) => {
    const accessKeyId = req.body.accessKeyId;
    await esClient.deleteAccount(accessKeyId);
    res.send();
})

module.exports = router;
