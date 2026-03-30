// src/modules/Blog/blog.service.ts
import { prisma } from "../../lib/prisma";
import { 
  parsePagination, 
  formatPaginatedResult 
} from "../../shared/pagination";

const getAllPublishedBlogs = async (
  page?: number | string,
  pageSize?: number | string
) => {
  const { page: currentPage, limit, skip } = parsePagination(page, pageSize);

  const [blogs, total] = await Promise.all([
    prisma.blogPost.findMany({
      where: { 
        isPublished: true 
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        tags: true,
        publishedAt: true,
        author: {
          select: {
            name: true,
            image: true
          }
        }
      },
      orderBy: { 
        publishedAt: "desc" 
      },
      skip,
      take: limit,
    }),
    prisma.blogPost.count({
      where: { isPublished: true }
    })
  ]);

  return formatPaginatedResult(blogs, total, currentPage, limit);
};

const getBlogBySlug = async (slug: string) => {
  return await prisma.blogPost.findUnique({
    where: { 
      slug,
      isPublished: true 
    },
    include: {
      author: {
        select: {
          name: true,
          image: true,
          email: true
        }
      }
    }
  });
};

export const BlogService = {
  getAllPublishedBlogs,
  getBlogBySlug
};