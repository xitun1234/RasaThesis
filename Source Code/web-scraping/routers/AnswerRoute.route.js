var express = require('express');
var router = express.Router();
var controller = require('../controllers/Answer.controller');


router.post('/SearchKeyword', controller.SearchKeyword);

router.post('/query', controller.QueryMongo);
router.get('/queryMongo&PhoneProperty=:PhoneProperty', controller.queryMongoProperty);
router.post('/actionYesNo', controller.ActionYesNo);
router.post('/actionWhat', controller.ActionWhat);
module.exports = router;