const path = require('path');

const express = require('express');
const app = express();
const port = 5000;

const multer = require('multer');
const bodyParser = require('body-parser');

const { loadDocx, saveAsDocxFile } = require('./docx-functions');

app.set('views', './');
app.set('view engine', 'ejs');

app.use(multer().single('docxUpload'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res, next) => {
    res.render('index', {
        docxAsHtml: '',
        viewSection2: false
    });
});

app.post('/', (req, res, next) => {
    loadDocx(req.file.buffer)
        .then(convertedDocxFile => {
            res.render('index', {
                docxAsHtml: convertedDocxFile,
                viewSection2: true
            });
        })
        .catch(err => console.log(err));
});

app.listen(port);