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

const esGcpAccountsClient = axios.create({
    baseURL: process.env.ES_GCP_ACCOUNTS_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }   
});

//Each AWS service instance will be treated as an artifact. The artifacts are stored in Elasticsearch
//so that they can be retrieved later when a user looks for an artifact. If an artifact cannot be found in
//Elasticsearch, a call will be made to AWS to retrieve the artifact.
const esAwsEc2Client = axios.create({
    baseURL: process.env.ES_EC2_INSTANCES_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
});

const esAwsS3Client = axios.create({
    baseURL: process.env.ES_S3_BUCKETS_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
});

const getDocumentFromResponse = (response) => {
    if(response.data.found){
        const awsAccount = response.data['_source'];
        return awsAccount;
    } else {
        return null;
    }
}

const getDocumentsFromResponse = (response) => {
    const documents = response.data.hits.hits;
    if (documents.length) {
        return documents.map(searchResult => searchResult["_source"]);
    }
    return documents;
}


//Methods to be consumed by other services/routes
module.exports = {
    postAccountDetails: (docId, requestBody) => {
        return esAwsAccountsClient.post('/_doc/' + docId, requestBody);
    },
    getAccountDetails: async () => {
        const response = await esAwsAccountsClient.get('/_search');
        return getDocumentsFromResponse(response);
    },
    getAccountDetail: async (accountId) => {
        const response = await esAwsAccountsClient.get(`/_doc/${accountId}`);
        return getDocumentFromResponse(response);
    },
    deleteAccount: async (accountId) => {
        await esAwsAccountsClient.delete(`/_doc/${accountId}`);
    },
    saveInstances: (accessKeyId, listOfInstances) => esAwsEc2Client.post('/_doc/' + accessKeyId, {listOfInstances}),
    saveGcpAccount: (accountId, gcpAccount) => esGcpAccountsClient.post(`/_doc/${accountId}`, gcpAccount),
    deleteGcpAccount: (accountId) => esGcpAccountsClient.delete(`/_doc/${accountId}`),
    getGcpAccount: async (accountId) => {
        const response = await esGcpAccountsClient.get(`/_doc/${accountId}`);
        return getDocumentFromResponse(response);
    },
    fetchGcpAccounts: async () => {
        const response = await esGcpAccountsClient.get('/_search');
        return getDocumentsFromResponse(response);
    }
}
