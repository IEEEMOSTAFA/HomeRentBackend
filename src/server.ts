
import "dotenv/config";
import app from "./app";
import { prisma } from "./lib/prisma";


const PORT = process.env.PORT || 5000;

async function main() {
  try {
    await prisma.$connect();
    console.log(" Database connected");

    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(" Server failed to start", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();

// import app from "../src/app";














































// import app from './app';
// import config from './config';

// async function main() {
//   try {
//     app.listen(config.port, () => {
//       console.log(`Example app listening on port <%= config.port %>`);
//     });
//   } catch (err) {
//     console.log(err);
//   }
// }

// main();

