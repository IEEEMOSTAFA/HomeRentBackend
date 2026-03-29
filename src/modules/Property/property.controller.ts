// src/modules/property/property.controller.ts
import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { PropertyService } from "./property.service";

const getAllPropertiesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const filters = {
      city: req.query.city as string,
      area: req.query.area as string,
      type: req.query.type as string,
      availableFor: req.query.availableFor as string,
      minRent: req.query.minRent ? Number(req.query.minRent) : undefined,
      maxRent: req.query.maxRent ? Number(req.query.maxRent) : undefined,
      bedrooms: req.query.bedrooms ? Number(req.query.bedrooms) : undefined,
      search: req.query.search as string,
    };

    const result = await PropertyService.getAllProperties(page, pageSize, filters);

    res.status(httpStatus.OK).json({
      success: true,
      message: "Properties fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getSinglePropertyHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const propertyId = req.params.id;
    const property = await PropertyService.getSingleProperty(propertyId as string);

    res.status(httpStatus.OK).json({
      success: true,
      message: "Property fetched successfully",
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

export const PropertyController = {
  getAllProperties: getAllPropertiesHandler,
  getSingleProperty: getSinglePropertyHandler,
};





















// import { Request, Response } from 'express';
// import PropertyService from './property.service';

// class PropertyController {
//   async getApprovedProperties(req: Request, res: Response) {
//     try {
//       const properties = await PropertyService.getApprovedProperties();
//       res.status(200).json({ success: true, data: properties });
//     } catch (error) {
//       res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
//   }
// }

// export default new PropertyController();