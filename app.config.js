import 'dotenv/config';

export default ({ config }) => ({
  // Hace un spread de la config que viene de app.json
  ...config,

  // Asegúrate de fusionar la sección "extra" actual (que contiene "eas.projectId")
  // con las variables que sacamos de process.env
  extra: {
    ...config.extra,
    API_URL: process.env.API_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  },
});
