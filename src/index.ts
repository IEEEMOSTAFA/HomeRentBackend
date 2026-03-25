// import app from "./app";

import app from "./app";
// const app = express();

app.get("/", (req, res) => {
  res.send("API is running!");
});
// Export for Vercel serverless
export default app;