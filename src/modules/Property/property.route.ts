// src/modules/property/property.route.ts
import express from "express";
import { PropertyController } from "./property.controller";

const router = express.Router();

// Public routes — কোনো auth লাগবে না
router.get("/", PropertyController.getAllProperties);       // GET /api/properties
router.get("/:id", PropertyController.getSingleProperty);  // GET /api/properties/:id

export const PropertyRoutes = router;

















// import { Router } from 'express';
// import PropertyController from './property.controller';

// const router = Router();

// router.get('/approved', PropertyController.getApprovedProperties);

// export default router;