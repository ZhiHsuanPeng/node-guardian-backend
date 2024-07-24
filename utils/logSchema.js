const Joi = require('joi');

const schema = Joi.object({
  accessToken: Joi.string().required(),
  level: Joi.string().required(),
  errMessage: Joi.string().required(),
  err: Joi.string().required(),
  filteredReqObj: Joi.object({
    headers: Joi.array().items(Joi.string()),
    userAgent: Joi.string(),
    accept: Joi.string(),
    method: Joi.string()
      .valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD')
      .required(),
    protocol: Joi.string().valid('http', 'https').required(),
    requestIp: Joi.string(),
    host: Joi.string().required(),
    originalUrl: Joi.string().required(),
    port: Joi.string(),
    fullUrl: Joi.string().required(),
  }).required(),
  code: Joi.string().required(),
  timestamp: Joi.number().required(),
  processArgs: Joi.array().items(Joi.string()).required(),
  processPid: Joi.number().required(),
  deviceInfo: Joi.object({
    ua: Joi.string().required(),
    browser: Joi.object().required(),
    engine: Joi.object().required(),
    os: Joi.object().required(),
    device: Joi.object().required(),
    cpu: Joi.object().required(),
  }).required(),
  serverIp: Joi.string().required(),
  publicIp: Joi.object().required(),
});

module.exports = schema;
