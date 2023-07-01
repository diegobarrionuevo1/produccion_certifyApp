var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import fs from "fs";
import { getData } from "./getData.js";
import { individualData } from "./individualData.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const HOSTNAME = process.env.HOSTNAME || '0.0.0.0';
app.use(cors());
app.use(express.json());
const getFile = (req, res, fileType) => {
    try {
        if (req.headers.authorization === process.env.AUTHORIZATION_CERT) {
            res.status(200);
            const { id_curso, nombreArchivo } = req.params;
            const filePath = path.join(__dirname, `files/${fileType}`, id_curso, nombreArchivo);
            if (!fs.existsSync(filePath)) {
                res.status(404).send("File not found");
                return;
            }
            res.sendFile(filePath);
        }
        else {
            res.status(403);
            res.send("Unauthorized");
        }
    }
    catch (error) {
        res.send("internal error: " + error);
        res.status(500);
    }
};
app.get("/files/jpg/:id_curso/:nombreArchivo", (req, res) => {
    getFile(req, res, "jpg");
});
app.get("/files/pdf/:id_curso/:nombreArchivo", (req, res) => {
    getFile(req, res, "pdf");
});
app.get("/files/rrss/:id_curso/:nombreArchivo", (req, res) => {
    getFile(req, res, "rrss");
});
app.get("/files/email/:id_curso/:nombreArchivo", (req, res) => {
    getFile(req, res, "email");
});
app.post("/crearcertificado", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.headers.authorization === process.env.AUTHORIZATION_CERT) {
            yield getData(req, res);
        }
        else {
            res.status(401);
            res.send("Unauthorized");
        }
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal server error.");
    }
}));
app.post("/certificadoIndividual", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.headers.authorization === process.env.AUTHORIZATION_CERT) {
            yield individualData(req, res);
            console.log(req.body);
        }
        else {
            res.status(401);
            res.send("Unauthorized");
        }
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal server error.");
    }
}));
app.listen(PORT, () => console.log(`Certify App listening on port ${PORT}!`));
