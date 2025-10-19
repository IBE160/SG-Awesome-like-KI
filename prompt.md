## Case Title
AI Study Buddy

## Background

Students have to process a lot of material in different formats and often do not have the time to get through all of it. This application helps students process large quantities of information such as slides, articles, and texts and compresses it into understandable formats with different learning opportunities.

## Purpose

AI Study Buddy is a simple and user-friendly web application designed to help overwhelmed students process study materials efficiently. It aims to make studying more fun and creative by providing different study methods.

## Target Users

The target users are students of all ages who are interested in using AI to study in more non-traditional and creative ways.

## Core Functionality

### Must Have (MVP)
- Feature 1: User registration and authentication (using Supabase Auth).
- Feature 2: Upload plain text and PDF files.
- Feature 3: Generate summaries and quizzes from the uploaded material.
- Feature 4: A hierarchical system of classes/modules and different topics where uploaded material and generated content is saved for later.

### Nice to Have (Optional Extensions)
- Feature 5: Support for more file types (Word, slides, images, CSV, Excel).
- Feature 6: Generate more content types like flashcards and mnemonics.
- Feature 7: Sharing functions to share quizzes/summaries with others.
- Feature 8: Ability to form groups with other users and chat with them. Status display (online/offline).
- Feature 9: Scoreboards for shared quizzes or group activities.
- Feature 10: Progress overview showing how much of the total workload the student has processed.
- Feature 11: Dark mode and different colour options.
- Feature 12: AI chat to ask questions about the material.
- Feature 13: Support for both Norwegian and English materials, including translation.


## Data Requirements

- Data entity 1: Users - name, email, managed by Supabase Auth.
- Data entity 2: Study material - metadata in the Supabase database, files stored in Supabase Storage.
- Data entity 3: Generated content - quizzes, summaries, linked to users and study material in the Supabase database.

## User Stories (Optional)

1. As a busy parent with a full-time job, I want to upload all the study material while I am on the go, so that I can study in between activities and when I have the time for it.
2. As a student with dyslexia and/or ADHD, I want to put boring or long text into the application, so that learning becomes more fun and adapted to my learning needs.
3. As a student aiming for good grades, I want to be able to test my knowledge and see my progress, so that I feel prepared for exams.

## Technology Stack

- **Frontend**: React with Next.js and a UI library like Material-UI or Tailwind CSS.
- **Backend**: Supabase as the Backend-as-a-Service (BaaS) platform. This will provide:
    - A managed **PostgreSQL** database.
    - **User Authentication** (including social logins).
    - **File Storage**.
    - **Auto-generated APIs** for database access.
- **AI Integration**: The Next.js frontend will communicate with a separate, lightweight serverless function (e.g., on Vercel or AWS Lambda) to handle the AI API calls to services like OpenAI or Claude. This keeps AI logic and API keys separate from the client-side application.

## Project Timeline (1.5 months)

- **Week 1**: Set up the Supabase project (database, auth, storage). Set up the Next.js frontend and connect to Supabase. Implement user authentication UI.
- **Week 2-3**: Build the UI for file uploading and content display. Implement file uploads to Supabase Storage.
- **Week 4-5**: Develop and deploy the serverless function for AI integration. Connect the frontend to the AI function to generate and display summaries and quizzes.
- **Week 6**: Implement the hierarchical system for saving content, conduct thorough testing, and prepare for deployment.

## Technical Constraints

- Must be a mobile-responsive web application.
- Authentication will be handled by Supabase Auth, which provides secure user management.
- File uploads will be managed through Supabase Storage, with policies to control file types and sizes.
- Must be able to process both Norwegian and English materials. Translation is a post-MVP feature.
- Must be able to save files and generated content in a structured manner using the Supabase database.

## Success Criteria

- **Criterion 1**: Users can create an account, log in, and manage their profile securely using Supabase Auth.
- **Criterion 2**: Users can upload a PDF or plain text file to Supabase Storage, and receive a summary or a quiz within 30 seconds.
- **Criterion 3**: Generated quizzes should contain at least 5 relevant questions based on the provided material.
- **Criterion 4**: The application should be able to handle at least 100 concurrent users without significant performance degradation.
- **Criterion 5**: User data and uploaded materials are stored securely in Supabase and are not accessible to other users without permission.
