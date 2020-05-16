var express = require('express');
var router = express.Router();
const path = require('path');


const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = new aws.S3({ accessKeyId: "AKIAQLVWHHZVLXYIF7PM", secretAccessKey: "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" });

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'amazonowebappilication',
        metadata: function(req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function(req, file, cb) {
            cb(null, Date.now().toString())
        }
    })
});


router.get('/', function(req, res) {
    res.render('index');
});

router.post('/upload', upload.single('image'), function(req, res) {
    res.send(req.file.location);
})


module.exports = router;