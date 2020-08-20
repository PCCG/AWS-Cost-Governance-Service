const router = require('express').Router();
const GcpAccount = require('../../models/gcp/GcpAccount')

router.post('/create-account', async (req, res) => {
  const gcpAccountCreds = req.body.credentials;
  const gcpAccount = new GcpAccount(gcpAccountCreds);
  try {
    const account = await gcpAccount.save();
    res.status(201).send(account);
  } catch (e) {
    console.log(e.message);
    res.status(400).send();
  }
})

router.get('/fetch-accounts', async (req, res) => {
  try {
    const listOfGcpAccounts = await GcpAccount.find();
    res.send(listOfGcpAccounts);
  } catch (e) {
    console.log(e.message);
    res.status(500).send();
  }
})

router.post('/delete-account', async (req, res) => {
  const accountId = req.body.accountId;
  try {
    await GcpAccount.findByIdAndDelete(accountId);
    res.send();
  } catch (e) {
    console.log(e.message);
    res.status(500).send();
  }
})

module.exports = router;
