"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const getData_1 = require("./getData");
const individualData_1 = require("./individualData");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const HOSTNAME = process.env.HOSTNAME || '0.0.0.0';
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const getFile = (req, res, fileType) => {
    try {
        if (req.headers.authorization === process.env.AUTHORIZATION_CERT) {
            res.status(200);
            const { id_curso, nombreArchivo } = req.params;
            const filePath = path_1.default.join(__dirname, `files/${fileType}`, id_curso, nombreArchivo);
            if (!fs_1.default.existsSync(filePath)) {
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
            yield (0, getData_1.getData)(req, res);
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
            yield (0, individualData_1.individualData)(req, res);
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
