export const httpCorsOptions = {
  origin: process.env.CORS_ORIGIN,
  methods: process.env.CORS_METHODS,
  preflightContinue: process.env.CORS_PREFLIGHT === 'true' ? true : false,
  optionsSuccessStatus: parseInt(process.env.CORS_SUSS_STATUS!),
};

export const websocketsCorsOptions = {
  origin: process.env.CORS_ORIGIN,
};
