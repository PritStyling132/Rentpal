import { z } from 'zod';

// Blog validation schema
export const blogSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().trim().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
  content: z.string().trim().min(1, "Content is required").max(50000, "Content must be less than 50,000 characters"),
  category: z.string().trim().min(1, "Category is required").max(100, "Category must be less than 100 characters"),
  image_url: z.string().url("Invalid URL format").optional().or(z.literal('')),
  reference_url: z.string().url("Invalid URL format").optional().or(z.literal('')),
  published: z.boolean(),
  tags: z.array(z.string().trim()).optional(),
  // SEO fields
  seo_title: z.string().trim().max(200, "SEO title must be less than 200 characters").optional().or(z.literal('')),
  meta_description: z.string().trim().max(500, "Meta description must be less than 500 characters").optional().or(z.literal('')),
  meta_keywords: z.string().trim().max(500, "Keywords must be less than 500 characters").optional().or(z.literal('')),
  og_image: z.string().url("Invalid OG image URL format").optional().or(z.literal('')),
  author_name: z.string().trim().max(100, "Author name must be less than 100 characters").optional().or(z.literal('')),
  reading_time: z.number().int().min(1, "Reading time must be at least 1 minute").max(1000, "Reading time too large").optional().nullable(),
});

// Influencer partner validation schema
export const influencerPartnerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  platform: z.string().trim().min(1, "Platform is required").max(50, "Platform must be less than 50 characters"),
  profile_url: z.string().url("Invalid URL format").optional().or(z.literal('')),
  avatar_url: z.string().url("Invalid avatar URL format"),
  followers_count: z.number().int().min(0, "Followers count must be positive").max(1000000000, "Followers count too large").optional(),
  display_order: z.number().int().min(0, "Display order must be positive"),
  active: z.boolean(),
});

// Top profile validation schema
export const topProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  avatar_url: z.string().url("Invalid avatar URL format"),
  streak: z.number().int().min(0, "Streak must be positive").max(10000, "Streak value too large"),
  display_order: z.number().int().min(0, "Display order must be positive"),
  active: z.boolean(),
});

// Terms and conditions validation schema
export const termsSchema = z.object({
  content: z.string().trim().min(1, "Content is required").max(100000, "Content must be less than 100,000 characters"),
});

// Banner validation schema
export const bannerSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  image_url: z.string().url("Invalid image URL format"),
  link_url: z.string().url("Invalid link URL format").optional().or(z.literal('')),
  display_order: z.number().int().min(0, "Display order must be positive"),
  active: z.boolean(),
});

// Ad validation schema
export const adSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  image_url: z.string().url("Invalid image URL format").optional().or(z.literal('')),
  video_url: z.string().url("Invalid video URL format").optional().or(z.literal('')),
  link_url: z.string().url("Invalid link URL format").optional().or(z.literal('')),
  display_duration: z.number().int().min(1, "Duration must be at least 1 second").max(60, "Duration must be less than 60 seconds"),
  active: z.boolean(),
});

// Coupon validation schema
export const couponSchema = z.object({
  code: z.string().trim().min(1, "Code is required").max(50, "Code must be less than 50 characters"),
  discount_percentage: z.number().int().min(0, "Percentage must be positive").max(100, "Percentage cannot exceed 100"),
  usage_limit: z.number().int().min(1, "Usage limit must be at least 1").optional(),
  valid_from: z.string().datetime(),
  valid_until: z.string().datetime().optional(),
  active: z.boolean(),
});

// Notification validation schema
export const notificationSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  message: z.string().trim().min(1, "Message is required").max(1000, "Message must be less than 1000 characters"),
  is_active: z.boolean(),
});
