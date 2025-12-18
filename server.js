require('dotenv').config();

const app = require('./src/app');

const PORT = process.env.PORT; // REQUIRED
const HOST = '0.0.0.0';

if (!PORT) {
  console.error('❌ PORT not provided by Railway');
  process.exit(1);
}

app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
