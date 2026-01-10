import type {Response, Request} from "express";
import dotenv from "dotenv"
import cors from "cors";
import * as mongoose from "mongoose";
import userRouter from "./routes/userRouter";
import galleryRouter from "./routes/galleryRouter";
import bodyParser from 'body-parser';
import addressRouter from "./routes/addressRouter";
import itemRouter from "./routes/itemRouter";
import orderRouter from "./routes/orderRouter";
import cartRouter from "./routes/cartRouter";
dotenv.config()

const MONGO_URI = process.env.MONGO_URL as string
const SERVER_PORT = process.env.SERVER_PORT

const express = require('express')
const app = express()

app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/mack-trading/api/v1/user", userRouter)
app.use("/mack-trading/api/v1/gallery", galleryRouter)
app.use("/mack-trading/api/v1/address", addressRouter)
app.use("/mack-trading/api/v1/item", itemRouter)
app.use("/mack-trading/api/v1/order", orderRouter)
// app.use("/mack-trading/api/v1/payment", paymentRouter)
app.use("/mack-trading/api/v1/cart", cartRouter)

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
