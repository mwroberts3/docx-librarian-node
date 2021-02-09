const path = require('path');
const fs = require('fs');

const express = require('express');
const app = express();
const port = 5000;

const multer = require('multer');
const bodyParser = require('body-parser');

const { loadDocx, saveAsDocxFile } = require('./docx-functions');

const fileFilter = (req, file, cb) => {
    if (file.originalname.includes('docx')) {
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
                throw new Error(err);
            });
    } else {
        res.render('index', {
            validFile: false,
        });
    }
});

app.post('/download', (req, res, next) => {
    // console.log(req.body.dlAsDocx);
    saveAsDocxFile(req.body.dlAsDocx)
        .then((buffer) => {
            fs.writeFileSync(`${req.body.newFilenameInput}.docx`, buffer);

            // there's got to be a better way to not save the file on the server, but this works...
            setTimeout(() => {
                fs.unlink(`${req.body.newFilenameInput}.docx`, (err) => {
                    if (err) throw err;
                })
            }, 1000)

            res.download(`${req.body.newFilenameInput}.docx`);
            })
        .catch(err => {
            throw new Error(err);
        })
})

app.listen(port);