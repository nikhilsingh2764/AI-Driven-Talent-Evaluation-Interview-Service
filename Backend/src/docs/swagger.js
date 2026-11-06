import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import swaggerUi from "swagger-ui-express";

const dir = path.dirname(fileURLToPath(import.meta.url));
export const specPath = path.join(dir, "..", "..", "docs", "openapi.yaml");

export const loadSpec = (serverUrl) => {
    const spec = YAML.parse(fs.readFileSync(specPath, "utf8"));
    if (serverUrl) spec.servers = [{ url: `${serverUrl}/api/v1`, description: "This server" }];
    return spec;
};

/** Mounts Swagger UI at /api/docs and the raw spec at /api/docs.json (before Helmet: the UI needs inline scripts). */
export const mountSwagger = (app) => {
    app.get("/api/docs.json", (req, res) => res.json(loadSpec(`${req.protocol}://${req.get("host")}`)));
    app.use(
        "/api/docs",
        swaggerUi.serve,
        swaggerUi.setup(null, {
            swaggerUrl: "/api/docs.json",
            customSiteTitle: "AI Interview API docs",
            swaggerOptions: { persistAuthorization: true, withCredentials: true },
        }),
    );
};
