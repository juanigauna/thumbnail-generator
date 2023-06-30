import express from 'express'
import multer from 'multer'
import { StatusCodes } from 'http-status-codes'
import thumbsupply from 'thumbsupply';
import fs from 'fs-extra'
import mime from 'mime-types'
import path from 'path'

const app = express();
const PORT = 6000 || process.env.PORT

const storageStrategy = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'storage')
    },
    filename: (req, file, cb) => {
        cb(null, `${path.parse(file.originalname).name}_${Date.now()}${path.parse(file.originalname).ext}`)
    }
})
const upload = multer({ storage: storageStrategy })

app.post('/thumbnail', [upload.single('file')], (req, res) => {
    if (req.file && !mime.lookup(req.file.originalname)) return res.status(StatusCodes.CONFLICT).json({
        message: 'Selecciona un archivo válido.'
    })


    thumbsupply.generateThumbnail(req.file.path).then(thumb => {
        fs.readFile(thumb).then(data => {
            res.contentType('image/png');
            return res.send(data)
        }).catch(err => res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err))
    })

})

app.listen(PORT)