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
Object.defineProperty(exports, "__esModule", { value: true });
exports.funcionParaEnviarEmail = void 0;
const MAX_RETRIES = 3;
function sendEmail(emailData, retryCount = 0, API_KEY, titulo_curso, fecha_inicio) {
    return __awaiter(this, void 0, void 0, function* () {
        const requestData = {
            from: "info@certificados.donweb.com",
            to: emailData.correo,
            templateID: "643851c86fe769a160054def",
            subject: `Felicitaciones por completar el taller ${titulo_curso}`,
            substitutions: {
                nombre: emailData.nombre,
                apellido: emailData.apellido,
                id_curso: String(emailData.id_curso),
                correo: emailData.correo,
                titulo_curso: titulo_curso,
                fecha_taller: fecha_inicio
            },
        };
        try {
            const response = yield fetch("https://api.envialosimple.email/api/v1/mail/send", {
                method: 'POST',
                body: JSON.stringify(requestData),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`,
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }
        catch (e) {
            console.log("Error when sending email: ", e);
            if (retryCount < MAX_RETRIES) {
                console.log(`Retry attempt ${retryCount + 1} for ${emailData.correo}`);
                yield sendEmail(emailData, retryCount + 1, API_KEY, titulo_curso, fecha_inicio);
            }
            else {
                console.log(`Failed to send email to ${emailData.correo} after ${MAX_RETRIES} retries`);
            }
        }
    });
}
;
function funcionParaEnviarEmail(usuarios, titulo_curso, fecha_inicio, API_KEY) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sendEmails = usuarios === null || usuarios === void 0 ? void 0 : usuarios.map((usuario) => sendEmail(usuario, 0, API_KEY, titulo_curso, fecha_inicio));
            yield Promise.all(sendEmails);
        }
        catch (error) {
            console.error("Error sending emails:", error);
        }
    });
}
exports.funcionParaEnviarEmail = funcionParaEnviarEmail;
