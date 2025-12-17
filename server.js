require('dotenv').config(); // ✅ MUST BE FIRST

console.log("🔥 Starting backend...");
console.log("PORT:", process.env.PORT);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log(
  "DATABASE_URL exists:",
  process.env.DATABASE_URL ? "✅" : "❌"
);

const app = require('./src/app');

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT} — NODE_ENV=${process.env.NODE_ENV}`);
});
