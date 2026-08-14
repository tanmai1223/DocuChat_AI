import { Router } from "express";
import { postQuery, uploadPDF } from "../Controllers/pdfControllers.js";
import upload from "../Middleware/multer.js";
const pdfRoutes=Router();

pdfRoutes.post("/upload",upload.single("file"),uploadPDF);
pdfRoutes.post("/query",postQuery);

export default pdfRoutes;