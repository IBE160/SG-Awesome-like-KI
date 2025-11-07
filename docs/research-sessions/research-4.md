# User Research Report: AI Study Buddy

**Date:** 2025-11-07
**Author:** Business Analyst Mary

## 1. Executive Summary

This report synthesizes initial user research for the "AI Study Buddy" application. The findings are based on an analysis of the project proposal and insights gathered from brainstorming sessions. The research identifies three core user personas and their primary "Jobs-to-be-Done." Key themes emerging from the research include the need for efficiency, alternative learning methods, motivational support, and flexible, on-the-go access. These insights should guide persona development, user journey mapping, and feature prioritization.

## 2. Research Goals

*   **Customer Discovery:** To understand the primary challenges and pain points of potential users.
*   **Persona Development:** To create representative personas of the target user segments.
*   **User Journey Mapping:** To inform the creation of user journeys that address user needs and goals.

## 3. Methodology

The insights in this report are a synthesis of qualitative data from the following sources:
*   Project Proposal for "AI Study Buddy."
*   Brainstorming Session 2: Focused on user problems and pain points for students with ADHD/dyslexia, busy parents, and ambitious students.
*   Brainstorming Session 5: Focused on defining a positive user experience by identifying and mitigating potential negative experiences.

## 4. Personas

### Persona 1: The Overwhelmed Student

*   **Name:** Alex
*   **Demographics:** 19-year-old university student.
*   **Background:** Diagnosed with ADHD and dyslexia. Finds traditional, text-heavy study methods exhausting and demotivating. Struggles with focus during long reading sessions and feels that the current educational system doesn't cater to their learning style.
*   **Goals & Motivations:** Wants to keep up with coursework without feeling constantly drained. Aims to find learning methods that are engaging, interactive, and play to their strengths. Motivated by a desire to prove that they can succeed academically whengiven the right tools.
*   **Pain Points & Frustrations:**
    *   Large blocks of text are intimidating and hard to process.
    *   Loses focus easily and gets frustrated.
    *   Feels a sense of inadequacy and demotivation from the constant struggle.
    *   Worries about falling behind in their studies.

### Persona 2: The Ambitious Achiever

*   **Name:** Ben
*   **Demographics:** 22-year-old graduate student.
*   **Background:** Highly motivated and aiming for top grades. Feels immense pressure to learn everything thoroughly to excel in exams. Spends a lot of time studying but is always looking for ways to be more efficient and effective.
*   **Goals & Motivations:** Wants to achieve a top grade in their class. Motivated by a desire to feel prepared, confident, and to secure a good job after graduation. Sees good grades as a validation of their effort and intelligence.
*   **Pain Points & Frustrations:**
    *   The overwhelming feeling of needing to know "everything."
    *   Difficulty in identifying the most critical information to focus on.
    *   Fear of missing a key concept that might appear on an exam.
    *   Wasting time on inefficient study methods.

### Persona 3: The Time-Strapped Parent

*   **Name:** Sarah
*   **Demographics:** 35-year-old parent pursuing a professional certification while working full-time.
*   **Background:** Juggles a demanding job, family responsibilities, and her studies. Has very limited and fragmented time for studying, often during commutes, lunch breaks, or late at night.
*   **Goals & Motivations:** Wants to pass her certification exam to advance her career. Motivated by providing a better future for her family and achieving personal growth. Needs to maximize every spare minute she has.
*   **Pain Points & Frustrations:**
    *   Extreme time scarcity.
    *   Difficulty finding contiguous blocks of time to study.
    *   Needs to be able to switch context quickly between work, family, and study.
    *   Forgetting what she studied previously due to long gaps between sessions.

## 5. Jobs-to-be-Done (JTBD)

Users are "hiring" the AI Study Buddy to perform these core jobs:

*   **When I'm facing a long and dense document,** help me quickly grasp the key concepts **so I can save time and stay focused.** (Applies to Alex, Ben, Sarah)
*   **When I need to learn a new topic,** present the information in an interactive and engaging way **so that I don't get bored or lose motivation.** (Applies to Alex)
*   **When I'm preparing for an exam,** help me test my knowledge and identify my weak spots **so I can feel confident and prepared.** (Applies to Ben)
*   **When I have a few spare minutes during my day,** help me make tangible progress on my studies **so I can balance my education with my other responsibilities.** (Applies to Sarah)

## 6. User Behavior Analysis

Based on the personas and JTBD, we can anticipate the following behaviors:

*   **Alex (The Overwhelmed Student):** Will likely use the summary and quiz features frequently to break down large texts. They will value features that make learning feel like a game and provide positive reinforcement. Usage may be in shorter, more frequent bursts to maintain focus.
*   **Ben (The Ambitious Achiever):** Will be a power user of the quiz feature, especially longer, more detailed quizzes. They will likely use the "upload learning goals" feature to ensure summaries and quizzes are tailored to their specific exam needs. They will value progress tracking and performance metrics.
*   **Sarah (The Time-Strapped Parent):** Will primarily use the app on a mobile device. Audio summaries would be a key feature for her commute. She will value features that allow her to quickly pick up where she left off and that save her history automatically.

## 7. Recommendations

Based on this research, the following recommendations should be considered during product development:

1.  **Prioritize Core Functionality:** The ability to generate high-quality, relevant summaries and quizzes from uploaded documents is the core value proposition and must be robust.
2.  **Focus on a Clean, Distraction-Free UI:** All three personas will benefit from a simple, intuitive interface that allows them to accomplish their primary job quickly and without friction.
3.  **Incorporate Motivational Elements:** Features like positive reinforcement in quizzes and progress tracking are not just "nice-to-haves"; they are critical for addressing the emotional pain points of users like Alex and Ben.
4.  **Design for Mobile-First and Interrupted Use:** To serve users like Sarah, the application must be mobile-responsive and automatically save progress, allowing for seamless transitions between short bursts of activity.
5.  **Enable User Control:** Features like allowing users to provide learning goals for summaries and choosing quiz length will empower users and increase the relevance of the generated content, satisfying the needs of users like Ben.

---

## 8. User Journey Maps

This section visualizes the journey for each key persona, highlighting their unique actions, thoughts, and feelings at each stage.

### Persona: Alex (The Overwhelmed Student)

*   **Stage 1: Discovery & Onboarding**
    *   **Actions:** Hears about the app from a friend or online -> Navigates to the app/downloads it -> Signs up with email and password.
    *   **Thoughts:** "This might actually help me study." "I hope this is easy to use."
    *   **Feelings:** Hopeful, a slight reduction in feeling overwhelmed.
    *   **Touchpoints:** Word of mouth, app store, sign-up page.
*   **Stage 2: Initial Setup & Upload**
    *   **Actions:** Logs in -> Chooses "Create Project" on the home page -> Navigates to a project-specific page -> Chooses "Upload Document" and/or "Upload Learning Goal" -> Uploads one or more documents.
    *   **Thoughts:** "This is easy and fast." "I can organize all my materials here." "It's great that it can combine information from multiple documents."
    *   **Feelings:** Efficient, organized, hopeful, relieved.
    *   **Touchpoints:** Home screen, "Create Project" button/flow, project page, upload interface, learning goals input.
*   **Stage 3: Generating & Reviewing Content**
    *   **Actions:** After uploading, presses "Create Quiz" or "Create Summary" -> If quiz, selects "Short" or "Long" -> App generates content -> Reviews summary or takes quiz (typed or multiple-choice answers).
    *   **Thoughts:** "This process is easy and fast." "The summary/quiz is a good way to get the most important information." "This helps me study the topic effectively."
    *   **Feelings:** Efficient, engaged, learning effectively, less overwhelmed.
    *   **Touchpoints:** "Create Quiz/Summary" buttons, quiz length selection, loading indicator, summary display, quiz interface, quiz feedback.
*   **Stage 4: Long-term Use & Progress Tracking**
    *   **Actions:** Revisits the app for new topics -> Accesses "History" to review past summaries and scores -> Retakes quizzes to improve.
    *   **Thoughts:** "This app is really helping me." "I can actually see what I've learned and where I've improved." "Studying doesn't feel like a chore anymore."
    *   **Feelings:** Confident, in control of his learning, motivated, less overwhelmed.
    *   **Touchpoints:** History/Dashboard, past quiz results, progress indicators.

### Persona: Ben (The Ambitious Achiever)

*   **Stage 1: Discovery & Onboarding**
    *   **Actions:** Hears about the app from a friend or online -> Navigates to the app -> Signs up with email and password.
    *   **Thoughts:** "I hear this can make studying more efficient. I need to see if it's powerful enough for my needs."
    *   **Feelings:** Curious, skeptical, hopeful for a competitive edge.
    *   **Touchpoints:** Word of mouth, app store, sign-up page.
*   **Stage 2: Initial Test & Quality Assessment**
    *   **Actions:** Logs in -> Creates a project and topic -> Uploads a complex document and meticulously inputs learning goals -> Generates a summary and a *long* quiz -> Reads the summary carefully, cross-referencing it with his learning goals to ensure all critical information is present.
    *   **Thoughts:** "Is this summary comprehensive enough?" "Are these quiz questions challenging and relevant?"
    *   **Feelings:** Critical, analytical, hopeful but cautious.
    *   **Touchpoints:** Project/Topic creation, document upload, learning goals input, summary generation, long quiz generation, summary review, quiz interface, original document.
*   **Stage 3: Intensive Exam Preparation & Performance Tracking**
    *   **Actions:** Regularly reviews past quiz results to identify weak topics -> Revisits summaries for those topics -> Takes new quizzes to solidify knowledge.
    *   **Thoughts:** "This app is a game-changer for my exam prep." "I can clearly see my progress and where I need to focus."
    *   **Feelings:** Confident, efficient, focused, empowered.
    *   **Touchpoints:** Quiz history, progress dashboard, summary review, new quiz generation.
*   **Stage 4: Exam Success & Continued Mastery**
    *   **Actions:** After his exam, deletes documents from the completed project or starts a new project for his next course.
    *   **Thoughts:** "This app was a key part of my success." "Time to set up my next project."
    *   **Feelings:** Successful, accomplished, loyal to the app.
    *   **Touchpoints:** Project management features (delete, create new), home page with project list.

### Persona: Sarah (The Time-Strapped Parent)

*   **Stage 1: Discovery & Onboarding**
    *   **Actions:** Hears about the app from a friend or online -> Navigates to the app on her phone -> Signs up with email and password.
    *   **Thoughts:** "I need something I can use in short bursts. I hope this is it."
    *   **Feelings:** Hopeful, but worried about another time-consuming app.
    *   **Touchpoints:** Word of mouth, app store, sign-up page.
*   **Stage 2: First Use: On-the-Go Setup**
    *   **Actions:** Logs in on her phone -> Quickly creates a project and topic -> Uploads a document from her cloud storage during a coffee break.
    *   **Thoughts:** "This is so easy and simple." "I can actually do this quickly during my break."
    *   **Feelings:** Relieved, efficient, productive.
    *   **Touchpoints:** Mobile app interface, "Create Project/Topic" flow, mobile upload interface.
*   **Stage 3: Fragmented Learning & Quick Consumption**
    *   **Actions:** Accesses the app during her commute -> Listens to an audio summary -> Takes a quick, short quiz while waiting for an appointment.
    *   **Thoughts:** "This is so fast and convenient." "The audio summary is a lifesaver." "I can actually learn while doing other things."
    *   **Feelings:** Productive, efficient, less stressed about falling behind.
    *   **Touchpoints:** Mobile app interface, topic selection, "Listen to Summary" button, summary length options, short quiz interface.
*   **Stage 4: Balancing Life & Learning: Sustained Progress**
    *   **Actions:** As her exam approaches, dedicates more focused time -> Takes longer quizzes and reads detailed summaries -> Reviews past quiz results to pinpoint weak areas.
    *   **Thoughts:** "I'm actually going to be ready for this exam." "This app has made it possible to study despite my crazy schedule."
    *   **Feelings:** Confident, prepared, proud of her progress.
    *   **Touchpoints:** Longer quizzes, detailed summaries, quiz history, progress tracking.