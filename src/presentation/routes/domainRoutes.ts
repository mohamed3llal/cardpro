import { Router } from "express";
import { DomainController } from "../controllers/DomainController";

export function createDomainRoutes(domainController: DomainController): Router {
  const router = Router();

  // Public endpoints
  router.get("/", (req, res, next) =>
    domainController.getAllDomains(req, res, next)
  );

  router.get("/:domainKey", (req, res, next) =>
    domainController.getDomainByKey(req, res, next)
  );

  return router;
}
