// src/modules/property/property.service.ts
import { prisma } from "../../lib/prisma";

const getAllPropertiesFromDB = async (
  page: number = 1,
  pageSize: number = 10,
  filters: {
    city?: string;
    area?: string;
    type?: string;
    availableFor?: string;
    minRent?: number;
    maxRent?: number;
    bedrooms?: number;
    search?: string;
  } = {}
) => {
  const skip = (page - 1) * pageSize;

  const where: any = { status: "APPROVED" }; // শুধু approved property দেখাবে

  if (filters.city) where.city = { contains: filters.city, mode: "insensitive" };
  if (filters.area) where.area = { contains: filters.area, mode: "insensitive" };
  if (filters.type) where.type = filters.type;
  if (filters.availableFor) where.availableFor = filters.availableFor;
  if (filters.bedrooms) where.bedrooms = Number(filters.bedrooms);
  if (filters.minRent || filters.maxRent) {
    where.rentAmount = {};
    if (filters.minRent) where.rentAmount.gte = Number(filters.minRent);
    if (filters.maxRent) where.rentAmount.lte = Number(filters.maxRent);
  }
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { city: { contains: filters.search, mode: "insensitive" } },
      { area: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { publishedAt: "desc" },
      include: {
        owner: {
          select: { id: true, name: true, image: true },
        },
      },
    }),
    prisma.property.count({ where }),
  ]);

  return {
    data: properties,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

const getSinglePropertyFromDB = async (propertyId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId, status: "APPROVED" },
    include: {
      owner: {
        select: { id: true, name: true, image: true },
      },
      reviews: {
        where: { isVisible: true },
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!property) {
    throw new Error("Property not found");
  }

  // view count বাড়াবে
  await prisma.property.update({
    where: { id: propertyId },
    data: { views: { increment: 1 } },
  });

  return property;
};

export const PropertyService = {
  getAllProperties: getAllPropertiesFromDB,
  getSingleProperty: getSinglePropertyFromDB,
};





























// import prisma from '../../lib/prisma';
// import { PropertyStatus } from '@prisma/client';

// class PropertyService {
//   async getApprovedProperties() {
//     return await prisma.property.findMany({
//       where: { status: PropertyStatus.APPROVED },
//     });
//   }
// }

// export default new PropertyService();