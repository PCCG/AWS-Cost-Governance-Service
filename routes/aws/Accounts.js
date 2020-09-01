const express = require('express');
const router = express.Router();
const esClient = require("../../services/rest/elasticSearchSvc");

const AwsAccount = require("../../models/aws/AwsAccount");

//Map the object that houses account related information to a model.
router.post('/credentials/postAccount', async function(req, res) {
    try {
        if(req.body.account){
            const credentialsObj = req.body.account;
            const awsAccount = new AwsAccount(credentialsObj);
            await awsAccount.save();
            await esClient.postAccountDetails(awsAccount._id, credentialsObj);
            res.status(201).send();
        } else {
            res.status(400).send("The request is missing the required credentials");
        }
    } catch (e) {
        console.log(e);
        res.status(500).send(e.message);
    }
})

router.get('/credentials/getAccounts', async function(req, res){
    try {
        const listOfAwsAccounts = await AwsAccount.find();
        res.send(listOfAwsAccounts);
    } catch (e) {
        res.stauts(500).send(e.message);
    }
})

router.post('/credentials/deleteAccount', async (req, res) => {
    try {
        const accountId = req.body.accountId;
        await AwsAccount.findByIdAndDelete(accountId);
        await esClient.deleteAccount(accountId);
        res.send();
    } catch (e) {
        res.status(500).send(e.message);
    }
})

module.exports = router;
