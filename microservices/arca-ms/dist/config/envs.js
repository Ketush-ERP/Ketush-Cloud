"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envs = void 0;
require("dotenv/config");
const joi = require("joi");
const envsSchema = joi
    .object({
    PORT: joi.number().required(),
    NATS_SERVERS: joi.array().items(joi.string().required()),
    CERT_PATH: joi.string().required(),
    PRIVATE_KEY_PATH: joi.string().required(),
    TA_FILES_PATH: joi.string().required(),
    CUIT: joi.number().required(),
    PROD: joi.boolean(),
    WSDL_WSAA_HOM: joi.string().required(),
    WSDL_WSAA_PROD: joi.string().required(),
    WSDL_WSFEX_HOM: joi.string().required(),
    WSDL_WSFEX_PROD: joi.string().required(),
    WSDL_WSFE_HOM: joi.string().required(),
    WSDL_WSFE_PROD: joi.string().required(),
})
    .unknown(true);
const { error, value } = envsSchema.validate({
    ...process.env,
    NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});
if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}
const envVars = value;
exports.envs = {
    port: envVars.PORT,
    natsServers: envVars.NATS_SERVERS,
    certPath: envVars.CERT_PATH,
    privateKeyPath: envVars.PRIVATE_KEY_PATH,
    taFilesPath: envVars.TA_FILES_PATH,
    cuit: envVars.CUIT,
    prod: envVars.PROD,
    wsaaWsdlHomo: envVars.WSDL_WSAA_HOM,
    wsaaWsdlProd: envVars.WSDL_WSAA_PROD,
    wsfexWsdlHomo: envVars.WSDL_WSFEX_HOM,
    wsfexWsdlProd: envVars.WSDL_WSFEX_PROD,
    wsfeWsdlHomo: envVars.WSDL_WSFE_HOM,
    wsfeWsdlProd: envVars.WSDL_WSFE_PROD,
};
//# sourceMappingURL=envs.js.map