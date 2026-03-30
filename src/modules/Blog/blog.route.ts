import express from 'express';
import { BlogController } from './blog.controller';

const router = express.Router();

// ================= PUBLIC BLOG ROUTES =================
router.get('/', BlogController.getAllPublishedBlogs);           // GET /api/blog?page=1&pageSize=10
router.get('/:slug', BlogController.getBlogBySlug);             // GET /api/blog/best-flat-chattogram-2026

export const BlogRoutes = router;