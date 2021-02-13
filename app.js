const path = require('path');
const fs = require('fs');

const express = require('express');
const app = express();
const port = 80;

const multer = require('multer');
const bodyParser = require('body-parser');

const { loadDocx, saveAsDocxFile } = require('./docx-functions');

const fileFilter = (req, file, cb) => {
    if (file.originalname.includes('.docx')) {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

app.set('views', './');
app.set('view engine', 'ejs');

app.use(multer({ fileFilter: fileFilter }).single('docxUpload'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname)));

app.use((req, res, next) => {
    res.locals.viewSettings2 = false;
    res.locals.validFile = true;
    res.locals.docxAsHtml = '';
    res.locals.fileName = '';
    next();
})

app.get('/', (req, res, next) => {
    res.render('index');
});

app.post('/', (req, res, next) => {
    if (req.file !== undefined) {
        loadDocx(req.file.buffer)
            .then(convertedDocxFile => {
                res.render('index', {
                    docxAsHtml: convertedDocxFile,
                    viewSettings2: true,
                    fileName: req.file.originalname
                });
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
              });
    } else {
        res.render('index', {
            validFile: false,
        });
    }
});

app.post('/download', (req, res, next) => {
    saveAsDocxFile(req.body.dlAsDocx)
        .then((buffer) => {
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            if (req.body.newFilenameInput) {
                res.setHeader('Content-Disposition', 'attachment; filename=' + req.body.newFilenameInput.trim() + '.docx');
            } else {
                res.setHeader('Content-Disposition', 'attachment; filename=' + 'download.docx');
            }
            res.send(buffer);
            })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
            });
});

// Error handling
app.use((err, req, res, next) => {
    if (res.headersSent){
        return next(err);
    }
    res.status(500);
    res.render('error', {error: err})
});

app.listen(port);