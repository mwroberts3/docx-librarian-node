const path = require('path');

const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

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
app.use(bodyParser.urlencoded({ 
    limit: '50mb',
    extended: false
}));
app.use(express.static(path.join(__dirname)));

app.use((req, res, next) => {
    res.locals.viewSettings2 = false;
    res.locals.validFile = true;
    res.locals.docxAsHtml = '';
    res.locals.fileName = '';
    res.locals.viewDocs = false;
    next();
});

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
            .catch(err => next(err));
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
        .catch(err => next(err));
});

app.get('/docs', (req, res, next) => {
    res.render('index', {
        viewDocs: true
    });
});

// Error handling
app.use((err, req, res, next) => {
    res.status(500).render('error', {error: err})
});

app.listen(port);