require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT} — NODE_ENV=${process.env.NODE_ENV}`);
});
