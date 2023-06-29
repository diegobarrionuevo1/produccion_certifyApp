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
exports.superponerTextoEnImagen = void 0;
const sharp_1 = __importDefault(require("sharp"));
const fs_1 = __importDefault(require("fs"));
const pdfkit_1 = __importDefault(require("pdfkit"));
function superponerTextoEnImagen(id_curso, imagenPlantilla, personas) {
    return __awaiter(this, void 0, void 0, function* () {
        const imagenOriginal = (0, sharp_1.default)(imagenPlantilla);
        const metadata = yield imagenOriginal.metadata();
        const capaTextoBase = (nombre, apellido) => {
            return Buffer.from(`<svg>
      <text x="-2" y="30" font-size="45" fill="black">  ${nombre} ${apellido}  </text>
    </svg>`);
        };
        for (const persona of personas) {
            const { nombre, apellido, correo } = persona;
            let pdf = new pdfkit_1.default({
                size: [1123, 794],
                margins: { top: 1, left: 1, bottom: 1, right: 1 },
            });
            const capaTexto = capaTextoBase(nombre, apellido);
            const imagenSuperpuesta = yield imagenOriginal
                .clone()
                .composite([{ input: capaTexto }])
                .toBuffer();
            const copiaImagenSuperpuesta = Buffer.from(imagenSuperpuesta);
            const nombreArchivo = `${id_curso}_${correo.toLowerCase()}.jpg`;
            const rutaImagenSalida = `files/jpg/${id_curso}/${nombreArchivo}`;
            if (!fs_1.default.existsSync(`files/jpg/${id_curso}`)) {
                fs_1.default.mkdirSync(`files/jpg/${id_curso}`);
            }
            fs_1.default.writeFileSync(rutaImagenSalida, imagenSuperpuesta);
            pdf.image(rutaImagenSalida, {
                fit: [pdf.page.width, pdf.page.height],
                align: "right",
                valign: "center",
            });
            const nombrePDF = `${id_curso}_${correo.toLowerCase()}.pdf`;
            const rutaPDF = `files/pdf/${id_curso}/${nombrePDF}`;
            if (!fs_1.default.existsSync(`files/pdf/${id_curso}`)) {
                fs_1.default.mkdirSync(`files/pdf/${id_curso}`);
            }
            pdf.pipe(fs_1.default.createWriteStream(rutaPDF));
            pdf.end();
            const imagenFondoTransparente = Buffer.from(`<svg width="1200" height="627" xmlns="http://www.w3.org/2000/svg"></svg>`);
            const imagenPrincipal = (0, sharp_1.default)(rutaImagenSalida);
            const imagenEmail = yield imagenPrincipal
                .clone()
                .resize(600, null)
                .toBuffer();
            const rutaImagenEmail = `files/email/${id_curso}/${nombreArchivo}`;
            if (!fs_1.default.existsSync(`files/email/${id_curso}`)) {
                fs_1.default.mkdirSync(`files/email/${id_curso}`);
            }
            fs_1.default.writeFileSync(rutaImagenEmail, imagenEmail);
            const imagenPrincipalRedimensionada = yield imagenPrincipal
                .clone()
                .resize(null, 627)
                .toBuffer();
            const imagenRrss = yield (0, sharp_1.default)(imagenFondoTransparente)
                .composite([
                {
                    input: imagenPrincipalRedimensionada,
                    top: 0,
                    left: 157,
                },
            ])
                .toBuffer();
            const rutaImagenRrss = `files/rrss/${id_curso}/${nombreArchivo}`;
            if (!fs_1.default.existsSync(`files/rrss/${id_curso}`)) {
                fs_1.default.mkdirSync(`files/rrss/${id_curso}`);
            }
            fs_1.default.writeFileSync(rutaImagenRrss, imagenRrss);
        }
    });
}
exports.superponerTextoEnImagen = superponerTextoEnImagen;
