import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const faviconSvg = `<svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="180" height="180" rx="36" fill="#2563EB"/>
<text x="90" y="115" font-family="sans-serif" font-size="80" font-weight="bold" fill="white" text-anchor="middle">VB</text>
</svg>`;

app.get("/favicon.ico", (req, res) => {
  res.type("image/svg+xml");
  res.send(faviconSvg);
});

app.get("/favicon.svg", (req, res) => {
  res.type("image/svg+xml");
  res.send(faviconSvg);
});

app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VendorBridge API</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
</head>
<body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f3f4f6;">
  <div style="text-align: center; background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <h1 style="color: #2563EB; margin-bottom: 0.5rem;">VendorBridge API</h1>
    <p style="color: #4B5563; margin: 0;">The API server is running successfully.</p>
  </div>
</body>
</html>`);
});

app.use("/api", router);

export default app;
