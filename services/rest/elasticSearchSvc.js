const axios = require('axios');


//This client will handle all the account related calls. An account might comprise of the IAM user credentials,
//alias names and may contain configurations specific to the account. 
const esAwsAccountsClient = axios.create({
    baseURL: process.env.ES_AWS_ACCOUNTS_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
});


//Each AWS instance/service instance will be treated as an artifact. The artifacts are stored in Elasticsearch
//so that they can be retrieved later when a user searches for an artifact. If an artifact cannot be found in
//Elasticsearch, a call will be made to AWS to look for the artifact.
const esAwsEc2Client = axios.create({
    baseURL: process.env.ES_EC2_INSTANCES_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
});


//Methods to be consumed by other services/routes
module.exports = {
    postAccountDetails: (docId, requestBody) => {
        return esAwsAccountsClient.post('/_doc/' + docId, requestBody);
    },
    getAccountDetails: async () => {
        const response = await esAwsAccountsClient.get('/_search');
        const awsAccounts = response.data.hits.hits.map(searchResult => searchResult["_source"]);
        return awsAccounts;
    },
    getAccountDetail: async (accessId) => {
        const response = await esAwsAccountsClient.get('/_doc/' + accessId);
        if(response.data.found){
            const awsAccount = response.data['_source'];
            return awsAccount;
        } else {
            return null;
        }
    },
    saveInstances: (accessId, listOfInstances) => esAwsEc2Client.post('/_doc/' + accessId, {listOfInstances})
}