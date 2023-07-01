var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { superponerTextoEnImagen } from "./sharp.js";
import { funcionParaEnviarEmail } from "./envialoSimple.js";
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
export const getData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const curso = req.body.keys[0];
    const fetchPromise = yield fetchCustom(`https://certapps.donweb.com/items/Cursos/${curso}`, "GET", {}, "CURSO");
    console.log(fetchPromise);
    if (fetchPromise.ok) {
        const { id_curso, titulo_curso, fecha_inicio, plantilla, webinars } = fetchPromise.json.data;
        let plantillaCurso;
        let registrados = new Set();
        let dataRegistrados = [];
        let conjuntoCorreos = new Set();
        const fetchWebinars = webinars.map((webinarId) => __awaiter(void 0, void 0, void 0, function* () {
            const webinarsPromise = yield fetchCustom(`https://certapps.donweb.com/items/webinar/${webinarId}`, "GET", {}, "WEBINARS");
            if (webinarsPromise.ok) {
                const registradosIds = webinarsPromise.json.data.registrados;
                registradosIds.forEach((registradoId) => {
                    registrados.add(registradoId);
                });
            }
        }));
        yield Promise.all(fetchWebinars);
        console.log(fetchWebinars);
        console.log(Array.from(registrados));
        const fetchRegistrados = Array.from(registrados).map((registradoId) => __awaiter(void 0, void 0, void 0, function* () {
            const registradosPromise = yield fetchCustom(`https://certapps.donweb.com/items/registrado/${registradoId}`, "GET", {}, "REGISTRADOS");
            if (registradosPromise.ok) {
                const correo = registradosPromise.json.data.correo;
                if (!conjuntoCorreos.has(correo)) {
                    conjuntoCorreos.add(correo);
                    registradosPromise.json.data.id_curso = id_curso;
                    dataRegistrados.push(registradosPromise.json.data);
                }
            }
        }));
        yield Promise.all(fetchRegistrados);
        const imageUrl = `https://certapps.donweb.com/assets/${plantilla}`;
        try {
            plantillaCurso = yield fetchImage(imageUrl);
        }
        catch (error) {
            console.error("Error al obtener la imagen:", error);
        }
        res.status(200);
        res.send("Authorized request");
        superponerTextoEnImagen(id_curso, plantillaCurso, dataRegistrados)
            .then(() => {
            console.log("Imágenes superpuestas creadas con éxito.");
        })
            .catch((error) => {
            console.error("Error al crear las imágenes superpuestas:", error);
        });
        console.log("---------------------------------------------------------------------------------------------");
        console.log(titulo_curso);
        console.log(dataRegistrados);
        try {
            const envialoSimple = yield funcionParaEnviarEmail(dataRegistrados, titulo_curso, fecha_inicio, process.env.API_KEY);
        }
        catch (error) {
            console.log(error);
        }
    }
    else {
        res.status(500).send("Internal server error.");
    }
});
