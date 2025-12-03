import type {Response, Request} from "express";
import dotenv from "dotenv"
import * as mongoose from "mongoose";
dotenv.config()

const MONGO_URI = process.env.MONGO_URL as string
const SERVER_PORT = process.env.SERVER_PORT

const express = require('express')
const app = express()

app.get('/', (req:Request, res:Response) => {
    res.send('BackEnd Running...')
})

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('DB Connected')
    })
    .catch((error) => {
        console.log(`DB Connection Error: ${error}`)
        process.exit(1)
    })

app.listen(SERVER_PORT, () => {
    console.log(`Mack Trading Backend Start with port ${SERVER_PORT}`)
})
