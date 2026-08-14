import "dotenv/config";
import express from "express";
import cors from "cors";
import pdfRoutes from "./Routers/pdfRouters.js";
import { createCollection } from "./Services/createCollection.js";
import db from "./Config/db.js";
import chatRoutes from "./Routers/chatRouters.js";

const app=express();

db();

app.use(cors());
app.use(express.json())

app.use("/api",pdfRoutes);
app.use("/api",chatRoutes);

createCollection();

app.get("/",(req,res)=>{
    res.send("Hello World");
})

app.listen(3000,()=>{
    console.log(`Your app is running on http://localhost:3000`)
})