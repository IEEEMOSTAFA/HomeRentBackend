// import "dotenv/config";
// import { PrismaPg } from '@prisma/adapter-pg'
// import { PrismaClient } from '../../generated/prisma'

// const connectionString = `<%= process.env.DATABASE_URL %>`

// const adapter = new PrismaPg({ connectionString })
// const prisma = new PrismaClient({ adapter })

// export { prisma }











import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

if (!globalForPrisma.prisma) {
  const connectionString = `${process.env.DATABASE_URL}`
  const adapter = new PrismaPg({ connectionString })
  globalForPrisma.prisma = new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma