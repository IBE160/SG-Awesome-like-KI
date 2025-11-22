# AI Study Buddy - High-Level Architecture

## 1. High-Level System Design

This document outlines the high-level architecture for the AI Study Buddy project, a web application designed to help students process study materials efficiently. The architecture is based on a modern, scalable, and secure technology stack.

### 1.1. System Diagram

```
[User] --> [Next.js Frontend (Vercel)]
   |
   | (HTTPS, API Calls)
   v
[Supabase Backend (BaaS)]
   |
   | (Database, Auth, Storage)
   v
[PostgreSQL Database]
   |
   | (RLS Policies)
   v
[User Data]

[Next.js Frontend (Vercel)] --> [Vercel Function]
   |
   | (API Call)
   v
[Claude AI Model]

[Next.js Frontend (Vercel)] --> [Cloud-based AI Service for PDF Parsing]
```

### 1.2. Component Interaction

*   **User:** Interacts with the application through the Next.js frontend deployed on Vercel.
*   **Next.js Frontend:** The frontend is a single-page application built with React and Next.js, styled with Tailwind CSS. It communicates with the Supabase backend for data, authentication, and storage, and with the Vercel Function for AI-powered features.
*   **Supabase Backend (BaaS):** Provides the backend infrastructure, including a PostgreSQL database, user authentication, and file storage.
*   **Vercel Function:** A serverless function deployed on Vercel that acts as a secure intermediary between the frontend and the Claude AI model. This prevents exposing the AI model's API key on the client-side.
*   **Claude AI Model:** The AI model from Anthropic used for generating summaries and quizzes.
*   **Cloud-based AI Service for PDF Parsing:** A service like Google Cloud Vision AI will be used for robust PDF parsing to handle complex layouts.

## 2. Database Schema

The database will be implemented in Supabase (PostgreSQL). The schema is designed to support a hierarchical content organization and the relationships between study materials and generated content.

### 2.1. Tables

*   **`users`**: Managed by Supabase Auth. Contains user information.
*   **`classes`**: Represents a class the student is taking.
    *   `id` (uuid, primary key)
    *   `name` (text, not null)
    *   `user_id` (uuid, foreign key to `auth.users`)
*   **`class_sections`**: Represents a topic or chapter within a class.
    *   `id` (uuid, primary key)
    *   `name` (text, not null)
    *   `class_id` (uuid, foreign key to `classes`)
*   **`study_materials`**: Represents an uploaded file.
    *   `id` (uuid, primary key)
    *   `file_name` (text, not null)
    *   `storage_path` (text, not null)
    *   `class_id` (uuid, foreign key to `classes`)
    *   `class_section_id` (uuid, foreign key to `class_sections`)
*   **`generated_content`**: Represents a summary, quiz, etc.
    *   `id` (uuid, primary key)
    *   `type` (text, not null, e.g., 'summary', 'quiz')
    *   `content` (jsonb, not null)
    *   `class_id` (uuid, foreign key to `classes`)

### 2.2. Junction Tables

*   **`generated_content_materials`**: Manages the many-to-many relationship between generated content and study materials.
    *   `generated_content_id` (uuid, foreign key to `generated_content`)
    *   `study_material_id` (uuid, foreign key to `study_materials`)
*   **`generated_content_sections`**: Manages the many-to-many relationship between generated content and class sections.
    *   `generated_content_id` (uuid, foreign key to `generated_content`)
    *   `class_section_id` (uuid, foreign key to `class_sections`)

## 3. API Design

The Next.js frontend will communicate with the backend using API Routes or Route Handlers. The API will be designed to be RESTful and secure.

### 3.1. Main API Endpoints

*   **`POST /api/auth/register`**: Registers a new user.
*   **`POST /api/auth/login`**: Logs in a user.
*   **`POST /api/auth/logout`**: Logs out a user.
*   **`GET /api/classes`**: Retrieves all classes for the logged-in user.
*   **`POST /api/classes`**: Creates a new class.
*   **`PUT /api/classes/{id}`**: Updates a class.
*   **`DELETE /api/classes/{id}`**: Deletes a class.
*   **`GET /api/classes/{id}/sections`**: Retrieves all sections for a class.
*   **`POST /api/classes/{id}/sections`**: Creates a new section.
*   **`PUT /api/sections/{id}`**: Updates a section.
*   **`DELETE /api/sections/{id}`**: Deletes a section.
*   **`POST /api/upload`**: Uploads a new study material.
*   **`POST /api/generate`**: Triggers the generation of content (summary or quiz) via the Vercel Function.

## 4. Authentication and Authorization

*   **Authentication:** User authentication will be handled by Supabase Auth using email and password. The `@supabase/ssr` library will be used for secure, cookie-based session management on the server-side.
*   **Authorization:** Row Level Security (RLS) will be enabled on all user data tables in Supabase to ensure strict data isolation. Each user will only be able to access their own data.

## 5. File Handling

*   **File Upload:** The Next.js frontend will handle file uploads, with a strict file size limit implemented on the client-side. Files will be uploaded to Supabase Storage.
*   **PDF Parsing:** For PDF files, a Vercel Function will be triggered after upload. This function will use a cloud-based AI service (e.g., Google Cloud Vision AI) to parse the PDF and extract the text content.

## 6. Scalability and Performance

*   **Scalability:** The serverless nature of Next.js on Vercel and Supabase allows for automatic scaling to handle varying loads.
*   **Performance:**
    *   **Frontend:** The Next.js application will be optimized for fast page loads and a responsive user experience.
    *   **Backend:** Supabase provides a performant PostgreSQL database. Database queries will be optimized to ensure fast data retrieval.
    *   **AI Integration:** The Vercel Function for AI integration will be designed to be efficient and handle requests asynchronously to avoid blocking the frontend.
    *   **Concurrency:** The architecture is designed to handle at least 100 concurrent users for the MVP.
