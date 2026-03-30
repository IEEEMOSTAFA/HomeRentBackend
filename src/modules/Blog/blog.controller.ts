import { Request, Response } from 'express';
import { BlogService } from './blog.service';
import httpStatus from 'http-status';

// const getAllPublishedBlogs = async (req: Request, res: Response) => {
//   try {
//     const page = parseInt(req.query.page as string) || 1;
//     const pageSize = parseInt(req.query.pageSize as string) || 10;

//     const result = await BlogService.getAllPublishedBlogs(page, pageSize);

//     res.status(httpStatus.OK).json({
//       success: true,
//       message: "Published blogs retrieved successfully",
//       ...result
//     });
//   } catch (error: any) {
//     res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//       success: false,
//       message: error.message || "Failed to fetch blogs"
//     });
//   }
// };




const getAllPublishedBlogs = async (req: Request, res: Response) => {
  try {
    const result = await BlogService.getAllPublishedBlogs(
      req.query.page as string ,
      req.query.pageSize as string
    );

    res.status(httpStatus.OK).json({
      success: true,
      message: "Published blogs retrieved successfully",
      ...result   
    });
  } catch (error: any) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to fetch blogs"
    });
  }
};
const getBlogBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const blog = await BlogService.getBlogBySlug(slug as string);

    if (!blog) {
      res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "Blog post not found"
      });
      return;
    }

    res.status(httpStatus.OK).json({
      success: true,
      message: "Blog retrieved successfully",
      data: blog
    });
  } catch (error: any) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to fetch blog"
    });
  }
};

export const BlogController = {
  getAllPublishedBlogs,
  getBlogBySlug
};