import 'dotenv/config';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';

const port = Number(process.env.PORT) || 5000;
const mongoUri = process.env.MONGODB_URI;

async function main() {
  if (!mongoUri) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    console.error('Missing JWT_SECRET');
    process.exit(1);
  }

  await connectDB(mongoUri);
  const app = createApp();

  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
