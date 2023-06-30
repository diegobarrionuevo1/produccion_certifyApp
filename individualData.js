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
exports.individualData = void 0;
const sharp_1 = require("./sharp");
const envialoSimple_1 = require("./envialoSimple");
const fetchCustom = (url, method, body, which) => {
    const requestOptions = {
        method: method,
        headers: {
            "Content-Type": "application/json",
            Authorization: `${process.env.AUTHORIZATION_DIRECTUS}`,
        },
    };
    if (method !== "GET") {
        requestOptions.body = JSON.stringify(body);
    }
    return fetch(url, requestOptions)
        .then((response) => __awaiter(void 0, void 0, void 0, function* () {
        const result = {
            ok: response.ok,
            status: response.status,
            message: response.statusText,
            json: yield response.json(),
        };
        if (!response.ok) {
            throw new Error("Request failed with status " +
                response.status +
                `IN ACQUISITION OF ${which}`);
        }
        return result;
    }))
        .catch((err) => {
        throw { message: err.message, status: err.status || 500 };
    });
};
const fetchImage = (url) => __awaiter(void 0, void 0, void 0, function* () {
    const requestOptions = {
        method: "GET",
        headers: {
            Authorization: `${process.env.AUTHORIZATION_DIRECTUS}`,
        },
    };
    const response = yield fetch(url, requestOptions);
    if (!response.ok) {
        throw new Error(`fetchImage Request failed with status ${response.status}`);
    }
    const arrayBuffer = yield response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(buffer, typeof buffer);
    return buffer;
});
const individualData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const individualRegistrant = req.body.keys[0];
    const fetchPromise = yield fetchCustom(`https://certapps.donweb.com/items/registrado/${individualRegistrant}`, "GET", {}, "Registrado");
    console.log(fetchPromise);
    if (fetchPromise.ok) {
        const { id_webinar } = fetchPromise.json.data;
        let plantillaCurso;
        const webinarsPromise = yield fetchCustom(`https://certapps.donweb.com/items/webinar/${id_webinar}`, "GET", {}, "WEBINAR individual");
        console.log(webinarsPromise.json.data);
        const { id_curso } = webinarsPromise.json.data;
        console.log(id_curso);
        const cursoPromise = yield fetchCustom(`https://certapps.donweb.com/items/Cursos/${id_curso}`, "GET", {}, "CURSO aca");
        if (cursoPromise.ok) {
            const { id_curso, titulo_curso, fecha_inicio, plantilla } = cursoPromise.json.data;
            const imageUrl = `https://certapps.donweb.com/assets/${plantilla}`;
            try {
                plantillaCurso = yield fetchImage(imageUrl);
            }
            catch (error) {
                console.error("Error al obtener la imagen:", error);
            }
            res.status(200);
            res.send("Authorized request");
            let correo = fetchPromise.json.data.correo;
            fetchPromise.json.data.id_curso = id_curso;
            let persona = [fetchPromise.json.data];
            (0, sharp_1.superponerTextoEnImagen)(id_curso, plantillaCurso, persona)
                .then(() => {
                console.log("Imágenes superpuestas creadas con éxito.");
            })
                .catch((error) => {
                console.error("Error al crear las imágenes superpuestas:", error);
            });
            console.log("---------------------------------------------------------------------------------------------");
            console.log(titulo_curso);
            console.log(persona);
            try {
                const envialoSimple = yield (0, envialoSimple_1.funcionParaEnviarEmail)(persona, titulo_curso, fecha_inicio, process.env.API_KEY);
            }
            catch (error) {
                console.log(error);
            }
        }
        else {
            res.status(500).send("Internal server error.");
        }
    }
});
exports.individualData = individualData;
