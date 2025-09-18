import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  DATABASE_URL: string;
  NATS_SERVERS: string[];

  CERT_PATH: string;
  PRIVATE_KEY_PATH: string;
  TA_FILES_PATH: string;
  CUIT: number;
  PROD: boolean;

  WSDL_WSAA_HOM: string;
  WSDL_WSAA_PROD: string;
  WSDL_WSFEX_HOM: string;
  WSDL_WSFEX_PROD: string;
  WSDL_WSFE_HOM: string;
  WSDL_WSFE_PROD: string;
}

const envsSchema = joi
  .object<EnvVars>({
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

const envVars: EnvVars = value;

export const envs = {
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
