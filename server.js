require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT; // ❗ NO fallback
if (!PORT) {
  console.error("❌ PORT not provided by Railway");
  process.exit(1);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});

