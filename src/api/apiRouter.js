import { Router } from "express";
import restApi from "./rest/restApi.js";
import swaggerUi from "swagger-ui-express"; 
import YAML from "yamljs";

const router = Router();
const swaggerDocument = YAML.load("./docs/openapi.yaml");

router.use("/", restApi);

router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

router.get("/health-check", (req, res, next) => {       // aggiunta endpoint di health-check
    res.status(200).json("Server is alive");
});



export default router;
