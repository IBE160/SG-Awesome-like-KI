# Technical Research: 

## 1. Technical Question

Supabase Integration Patterns:
       * Deep dive into efficient ways to integrate Next.js with Supabase for authentication, database interactions (PostgreSQL), and file storage.
       * Research best practices for structuring the Supabase database schema for hierarchical content (classes/modules/topics) and linking study materials and
         generated content.
       * Explore Supabase Row Level Security (RLS) for secure multi-user data access.

---

## 2. Project Context

This research is for a new greenfield project, the "AI Study Buddy," a web application designed to help students overcome information overload by generating summaries and quizzes from uploaded study materials (plain text and PDF). The project targets diverse user personas, including neurodiverse students, ambitious achievers, and time-strapped parents.

The technical context is a modern, serverless web application built with Next.js, Tailwind CSS, and Vercel for the frontend and serverless functions. Supabase is the chosen Backend-as-a-Service (BaaS) for handling the PostgreSQL database, user authentication, and file storage. The project is an MVP with a 4-week timeline and no budget, making the developer experience and efficient integration of these technologies critical. This research into Supabase integration patterns is a foundational step for the project's implementation.

---

## 3. Functional Requirements

*   **User Authentication:** The system must support user registration and login using email and password, managed by Supabase Auth. All other data operations must be tied to an authenticated user.
*   **Hierarchical Data Storage (PostgreSQL):** The database must support a hierarchical structure where a user can create `classes`, and each class can contain `class_sections` (e.g., topics, modules). It must store metadata for uploaded `study_materials` and link them to the correct user, class, and optionally, a class section. It must store `generated_content` (summaries, quizzes) and link it back to the user, class, and the source study materials. The schema must support many-to-many relationships to link a single piece of generated content to multiple source documents or class sections.
*   **File Management (Supabase Storage):** Authenticated users must be able to upload files (PDF, plain text) to a secure storage bucket. The system must provide a secure URL or path for the uploaded file that can be passed to a serverless function for AI processing.
*   **Data Security and Access Control (Row Level Security):** A user must only be able to access and modify their own data. All database queries for classes, materials, and generated content must be strictly scoped to the logged-in user's ID. The system must prevent users from accessing or modifying the data of other users.

---

## 4. Non-Functional Requirements

*   **Performance:**
    *   **End-to-End AI Generation:** The entire process, from file upload to displaying a generated summary or quiz, must complete within 30 seconds to maintain user engagement.
    *   **UI Responsiveness:** Database queries for fetching user data (classes, materials, etc.) should be highly optimized to ensure a fast and fluid user interface, which is critical for users who are time-strapped or easily distracted.
*   **Scalability:** The application architecture must be able to handle at least 100 concurrent users without significant performance degradation, as stated in the success criteria. The database schema and queries should be designed with this in mind.
*   **Reliability and Availability:** The application's availability is dependent on the uptime of Supabase and Vercel. The primary focus for the development team should be on robust error handling and providing clear feedback to the user in case of service disruptions.
*   **Security and Compliance:**
    *   **Data Isolation:** This is a critical requirement. The system must use Supabase's Row Level Security (RLS) to ensure that a user can only ever access their own data.
    *   **Privacy:** The application must be GDPR compliant, allowing users to control and delete their own data.
*   **Maintainability and Developer Experience:** Given the 4-week timeline and low backend expertise, the integration patterns must be simple, clear, and heavily leverage the Supabase client libraries to minimize complex custom code. The code should be well-organized to facilitate future development.

---

## 5. Technical Constraints

*   **Programming Language Preferences:** Primary development will utilize JavaScript/TypeScript for the Next.js frontend, and Python or Node.js for backend serverless functions (e.g., AI integration).
*   **Cloud Platform:** The application will be deployed on Vercel for the Next.js frontend and serverless functions, and Supabase will serve as the Backend-as-a-Service (BaaS) providing PostgreSQL, authentication, and file storage.
*   **Budget Constraints:** There is a strict "low to no budget" constraint. Spending will only occur if absolutely necessary to ensure the application's functionality. This necessitates a strong preference for free-tier services and open-source solutions.
*   **Team Expertise and Skills:** The development team has low backend expertise and does not possess advanced programming skills. This requires the adoption of technologies and integration patterns that prioritize ease of use, clear documentation, and a streamlined developer experience.
*   **Timeline and Urgency:** The project must be completed by December 5th, 2025, which translates to a tight 4-week development timeline. This emphasizes the need for rapid prototyping and efficient development cycles.
*   **Existing Technology Stack:** This is a new greenfield project, meaning there is no legacy system to integrate with. However, the chosen stack (Next.js, Supabase, Vercel) forms the foundational technical environment for all development.
*   **Open Source vs Commercial Requirements:** Due to budget limitations, there is a strong preference for open-source libraries and services that offer generous free tiers.
*   **Licensing Considerations:** All chosen technologies and libraries should have licenses compatible with a no-budget academic project.

---

## 6. Technology Options

This section outlines the key Supabase integration patterns that will be evaluated for the Next.js AI Study Buddy application.

### Option 1: Authentication Integration Patterns

*   **Client and Server-Side Authentication with `@supabase/ssr`:** Utilizing the `@supabase/ssr` package for robust cookie-based session management across Next.js Client Components, Server Components, Server Actions, and Route Handlers.
*   **Next.js Middleware for Route Protection:** Implementing middleware to check authentication status, protect routes, and manage redirects for authenticated/unauthenticated users.
*   **Server Actions for Auth Operations:** Handling user login, signup, and other authentication operations securely via Next.js Server Actions that interact with Supabase Auth functions.

### Option 2: Database Interaction Patterns

*   **Client-Side Fetching:** Direct interaction with the Supabase client library from Client Components for simple data fetching and mutations.
*   **Server-Side Fetching (React Server Components):** Fetching data directly within React Server Components for secure and efficient initial data loads.
*   **API Layer (Next.js Route Handlers):** Creating an abstraction layer using Next.js Route Handlers to encapsulate Supabase database interactions, providing a more secure and controlled API for client components.

### Option 3: Schema Design Patterns

*   **Hierarchical Content Structure:** Implementing parent-child relationships using foreign keys for `classes` and `class_sections` (e.g., `class_sections.class_id` referencing `classes.id`).
*   **Many-to-Many Relationships with Junction Tables:** Utilizing junction tables (e.g., `generated_content_materials`) to link `generated_content` to multiple `study_materials` and `class_sections`.
*   **User Ownership with `user_id` Foreign Keys:** Including a `user_id` column (foreign key to `auth.users(id)`) in all user-specific tables to establish data ownership.

### Option 4: Row Level Security (RLS) Policies

*   **Enable RLS on all User Data Tables:** Explicitly enabling RLS for every table that stores user-specific data.
*   **Granular Policies per Operation:** Defining separate RLS policies for `SELECT`, `INSERT`, `UPDATE`, and `DELETE` operations on each table.
*   **`auth.uid()` for User Data Isolation:** Implementing policies that restrict access based on the authenticated user's ID (`auth.uid()`) matching the `user_id` column in the table.
*   **`WITH CHECK` for Write Operations:** Using `WITH CHECK` in `INSERT` and `UPDATE` policies to ensure that new or modified data is always associated with the correct authenticated user.

---

## 7. Technology Profiles

### Option 4: Row Level Security (RLS) Policies

**Overview:**
*   **What is it and what problem does it solve?** Row Level Security (RLS) in PostgreSQL (and thus Supabase) provides fine-grained access control at the database row level. It ensures that users can only access and manipulate data that they are authorized to see or modify, based on policies defined directly within the database. For the AI Study Buddy, RLS is critical for enforcing data isolation, ensuring that each user's classes, study materials, and generated content remain private and inaccessible to other users.
*   **Maturity level:** Highly mature. RLS is a standard and robust feature of PostgreSQL.
*   **Community size and activity:** Large and active, as it pertains to PostgreSQL security and Supabase best practices.
*   **Maintenance status and release cadence:** RLS is a core feature of PostgreSQL and is actively maintained. Supabase leverages and supports this functionality.

**Technical Characteristics:**
*   **Architecture and design philosophy:** RLS policies are SQL expressions that are evaluated for every database operation (SELECT, INSERT, UPDATE, DELETE). If a policy evaluates to `FALSE`, the operation is denied for that specific row, effectively filtering or blocking access.
*   **Core features and capabilities:**
    *   **Explicit Enablement:** RLS must be explicitly enabled for each table (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`).
    *   **Policy Definition:** Policies are created using `CREATE POLICY` statements, specifying the table, operation (e.g., `FOR SELECT`, `FOR INSERT`), target roles (`TO authenticated`), and a `USING` clause (for `SELECT`/`DELETE`) or `WITH CHECK` clause (for `INSERT`/`UPDATE`) that defines the access condition.
    *   **`auth.uid()` Function:** The `auth.uid()` function, provided by Supabase, is crucial for RLS. It returns the UUID of the currently authenticated user, allowing policies to restrict access to rows where `user_id = auth.uid()`.
    *   **Granular Control:** Separate policies can be defined for different operations (SELECT, INSERT, UPDATE, DELETE) and for different roles or conditions.
*   **Performance characteristics:** RLS is enforced at the database level, which is generally efficient. However, complex RLS policies can introduce a slight overhead, so policies should be as simple and optimized as possible.
*   **Scalability approach:** RLS scales well as policies are applied directly by the database engine. It avoids the need for complex application-level authorization logic, which can become a bottleneck.
*   **Integration capabilities:** Seamlessly integrates with Supabase Auth and the PostgreSQL database. The Supabase client libraries automatically pass the user's JWT, allowing `auth.uid()` to function correctly.

**Developer Experience:**
*   **Learning curve:** Moderate. Understanding SQL policy syntax and the `auth.uid()` function is key. Supabase provides clear examples and documentation.
*   **Documentation quality:** High. Supabase and PostgreSQL documentation cover RLS extensively.
*   **Tooling ecosystem:** Supabase Studio allows for easy management and testing of RLS policies. SQL migration files are used to version-control RLS policy definitions.
*   **Testing support:** Critical for RLS. Supabase Studio allows impersonating users to test policies. Automated testing with `supabase test db` and pgTap is recommended for robust validation.
*   **Debugging capabilities:** Debugging RLS involves carefully reviewing policy definitions, checking `auth.uid()` values, and using Supabase Studio's SQL editor to test queries under different user contexts.

**Operations:**
*   **Deployment complexity:** Low. RLS policies are part of the database schema and are deployed via migration files.
*   **Monitoring and observability:** Supabase provides database activity logs. Monitoring for unauthorized access attempts can be implemented.
*   **Operational overhead:** Low. Once policies are defined and tested, RLS operates automatically at the database level, significantly reducing application-level authorization code.
*   **Cloud provider support:** RLS is a PostgreSQL feature, supported by any PostgreSQL hosting.
*   **Container/K8s compatibility:** N/A for RLS itself.

**Ecosystem:**
*   **Available libraries and plugins:** N/A directly, as RLS is a database feature.
*   **Third-party integrations:** RLS enhances the security of any application integrating with PostgreSQL.
*   **Commercial support options:** Supabase offers commercial support.
*   **Training and educational resources:** Abundant resources for PostgreSQL security and RLS.

**Community and Adoption:**
*   **GitHub stars/contributors:** Widely adopted for secure multi-tenant applications using Supabase and PostgreSQL.
*   **Production usage examples:** Essential for many SaaS applications to ensure data privacy.
*   **Case studies from similar use cases:** Numerous examples of secure applications built with Supabase leveraging RLS.
*   **Community support channels:** Active on GitHub, Discord, and other developer forums.
*   **Job market demand:** High demand for database security and RLS expertise.

**Costs:**
*   RLS is a feature of PostgreSQL and has no direct cost. Supabase PostgreSQL is included in the free tier.

---

## 8. Comparative Analysis

## 8. Comparative Analysis

This comparative analysis evaluates the identified Supabase integration patterns against key dimensions, considering the project's functional and non-functional requirements, as well as its constraints (timeline, budget, team expertise).

| Dimension               | Authentication Patterns (`@supabase/ssr`, Middleware, Server Actions) | Database Interaction Patterns (Client, Server, Route Handlers) | Schema Design Patterns (Hierarchical, Junction, User ID) | RLS Policies (Enable, Granular, `auth.uid()`, `WITH CHECK`) |
| :---------------------- | :------------------------------------------------------------------ | :------------------------------------------------------------- | :------------------------------------------------------- | :---------------------------------------------------------- |
| **Meets Requirements**  | High (Covers all auth needs, secure)                                | High (Flexible, covers all CRUD needs)                         | High (Supports hierarchical content, relationships)      | High (Critical for data isolation)                          |
| **Performance**         | High (Efficient session management, server-side auth)               | Medium-High (Optimized with RSCs, Route Handlers)              | High (Optimized with proper indexing)                    | Medium-High (Efficient at DB level, minor overhead)         |
| **Complexity**          | Medium (Requires understanding of Next.js environments)             | Medium (Varies by pattern, Route Handlers add abstraction)     | Medium (Requires SQL/DB design knowledge)                | Medium (Requires SQL policy syntax)                         |
| **Developer Experience**| High (Good docs, `@supabase/ssr` simplifies)                        | High (Flexible, good tooling)                                  | High (Supabase Studio, `typegen`)                        | Medium (Requires careful testing)                           |
| **Security**            | High (Secure cookies, server-side operations)                       | High (Server-side patterns enhance security)                   | High (Foreign keys, data integrity)                      | Critical (Core for multi-tenancy)                           |
| **Maintainability**     | High (Modular, well-documented)                                     | High (Modular, can be abstracted)                              | High (Migrations, clear relationships)                   | High (Centralized in DB, version-controlled)                |
| **Learning Curve**      | Moderate                                                            | Low-Moderate                                                   | Moderate                                                 | Moderate                                                    |
| **Cost**                | Low (Free tier sufficient)                                          | Low (Free tier sufficient)                                     | Low (No direct cost)                                     | Low (No direct cost)                                        |
| **Risk**                | Low (Mature, well-supported)                                        | Low (Mature, well-supported)                                   | Low (Standard DB practices)                              | Low (Standard DB feature, if implemented correctly)         |



---

## 9. Weighted Analysis

## 9. Weighted Analysis

**Decision Priorities:**
1.  Cost efficiency
2.  Operational simplicity
3.  Team expertise match

Based on these priorities, here is a weighted analysis of the Supabase integration patterns:

*   **Authentication Patterns (`@supabase/ssr`, Middleware, Server Actions):**
    *   **Cost Efficiency:** High. Supabase Auth is part of the free tier, and the `@supabase/ssr` package is open-source. The patterns leverage existing infrastructure without additional cost.
    *   **Operational Simplicity:** High. Supabase manages the authentication service, and the integration patterns are well-documented, reducing operational overhead. Next.js Middleware and Server Actions centralize logic.
    *   **Team Expertise Match:** High. While there's a moderate learning curve for Next.js-specific patterns, the extensive documentation and community support for Supabase and Next.js make it accessible for a team with low backend expertise.

*   **Database Interaction Patterns (Client, Server, Route Handlers):**
    *   **Cost Efficiency:** High. Supabase PostgreSQL is included in the free tier. The choice of interaction pattern doesn't incur additional direct costs.
    *   **Operational Simplicity:** High. Supabase manages the database. Using client libraries directly or abstracting with Route Handlers keeps the operational model simple. Route Handlers can centralize complex logic.
    *   **Team Expertise Match:** High. The Supabase client library is straightforward. While Route Handlers add a layer, they are still within the Next.js framework, which the team is familiar with. Server Components simplify data fetching without complex API routes.

*   **Schema Design Patterns (Hierarchical, Junction, User ID):**
    *   **Cost Efficiency:** High. Schema design itself has no direct cost. Supabase PostgreSQL is free for the MVP.
    *   **Operational Simplicity:** High. Supabase Studio provides a visual interface, and managing schema through migrations is a standard, well-understood process. Clear relationships simplify data management.
    *   **Team Expertise Match:** Medium-High. While relational database concepts require some learning, the visual tools and clear documentation from Supabase make it manageable for a team with low backend expertise. The patterns are standard and widely used.

*   **RLS Policies (Enable, Granular, `auth.uid()`, `WITH CHECK`):**
    *   **Cost Efficiency:** High. RLS is a native PostgreSQL feature and incurs no direct cost within Supabase.
    *   **Operational Simplicity:** High. Once defined, RLS policies are enforced automatically by the database, significantly reducing application-level authorization logic and simplifying operations.
    *   **Team Expertise Match:** Medium. Understanding SQL policy syntax and the `auth.uid()` function requires some learning. However, the critical importance of RLS for security and the clear examples provided by Supabase make it a necessary and achievable skill for the team.

**Conclusion:** All identified Supabase integration patterns align well with the project's priorities of cost efficiency, operational simplicity, and team expertise match. They leverage Supabase's managed services and Next.js's capabilities to provide robust solutions within the project's constraints. The learning curve for schema design and RLS policies is manageable with the available documentation and tooling, and the benefits in terms of security and data integrity are substantial.

---

## 10. Use Case Fit

{{use_case_fit}}

---

## 11. Real-World Evidence

{{real_world_evidence}}

---

## 12. Architecture Pattern Analysis

{{architecture_pattern_analysis}}

---

## 13. Recommendations

## 13. Recommendations

Based on the comprehensive analysis of Supabase integration patterns and their fit with the AI Study Buddy project's requirements and constraints, the following recommendations are provided.

### Top Recommendation: Adopt a Secure, Server-Centric Integration Model

The primary recommendation is to adopt a secure, server-centric integration model that leverages the full capabilities of Supabase and Next.js. This involves a combination of the identified best-practice patterns, as they are not mutually exclusive but rather complementary components of a robust architecture.

**1. Authentication: Use `@supabase/ssr` with Middleware and Server Actions**
*   **Rationale:** This is the most secure and modern approach for handling authentication in a Next.js App Router application. It aligns perfectly with the "security first" requirement and provides a solid foundation for all other data interactions.
*   **Key Benefits:** Secure cookie-based session management, server-side route protection, and streamlined auth logic.
*   **Risks and Mitigation:** The main risk is the learning curve and potential "gotchas" with the `@supabase/ssr` package. Mitigation involves closely following the official Supabase documentation and community examples.

**2. Database Interactions: Prioritize Server-Side Operations**
*   **Rationale:** To maximize security and performance while minimizing client-side complexity, prioritize server-side database interactions.
*   **Implementation:**
    *   **For Data Fetching:** Use **React Server Components (RSCs)** to fetch data directly from Supabase on the server. This is secure and efficient for initial page loads.
    *   **For Data Mutations (Writes):** Use **Next.js Route Handlers** or **Server Actions** to create a secure API layer for all `INSERT`, `UPDATE`, and `DELETE` operations. This prevents direct client-to-database writes and allows for server-side validation.
    *   **For Simple, Non-Sensitive Reads:** Use **Client-Side Fetching** sparingly, only for non-sensitive data or when real-time updates are needed, and always backed by strong RLS policies.
*   **Key Benefits:** Enhanced security, improved performance for initial loads, and centralized data logic.

**3. Schema Design: Implement a Relational, User-Centric Model**
*   **Rationale:** A well-structured relational schema is essential for data integrity and for the effective implementation of RLS.
*   **Implementation:**
    *   Implement the **hierarchical structure** (`classes` -> `class_sections`) with foreign keys.
    *   Use a **junction table** for the many-to-many relationship between `generated_content` and `study_materials`.
    *   Ensure every user-specific table has a `user_id` column linked to `auth.users(id)`.
*   **Key Benefits:** Data integrity, query efficiency, and the necessary foundation for RLS.

**4. Row Level Security (RLS): Make it a Day-One Priority**
*   **Rationale:** RLS is the most critical security feature for this multi-user application. It is non-negotiable for ensuring data privacy.
*   **Implementation:**
    *   **Enable RLS on all tables** containing user data from the very beginning of development.
    *   Create **granular policies** for `SELECT`, `INSERT`, `UPDATE`, and `DELETE` on each table, using `auth.uid() = user_id` as the primary condition.
    *   Use the `WITH CHECK` option for all write policies.
    *   **Rigorously test** all RLS policies by impersonating different users in Supabase Studio.
*   **Key Benefits:** Foundational security, data isolation, and compliance with privacy requirements.

### Implementation Roadmap

1.  **Phase 1: Setup and Authentication (Week 1)**
    *   Set up the Supabase project and Next.js application.
    *   Implement the authentication flow using `@supabase/ssr`, including login, signup, and route protection with middleware.
2.  **Phase 2: Schema and RLS (Week 1-2)**
    *   Define the database schema in SQL migration files.
    *   Implement and test the RLS policies for all tables.
3.  **Phase 3: Database Interactions (Week 2-3)**
    *   Build out the data interaction logic, prioritizing server-side fetching (RSC) and a secure API layer (Route Handlers/Server Actions) for mutations.
4.  **Phase 4: Feature Integration (Week 3-4)**
    *   Integrate the file storage and AI generation features, using the established secure data interaction patterns.

### Risk Mitigation

*   **Authentication Complexity:** Dedicate focused time to understanding and implementing the `@supabase/ssr` package correctly at the start of the project.
*   **RLS Misconfiguration:** Treat RLS as a core feature, not an afterthought. Use Supabase's testing tools to validate policies thoroughly.
*   **Performance Bottlenecks:** Follow performance best practices from the start (e.g., proper indexing, efficient queries). Use server-side patterns to reduce client-side load.

---

## 14. Architecture Decision Record

## 14. Architecture Decision Record

```markdown
# ADR-002: Supabase Integration Patterns for Next.js

## Status

Accepted

## Context

The "AI Study Buddy" project requires a secure, efficient, and maintainable way to integrate the Next.js frontend with the Supabase backend (PostgreSQL, Auth, Storage). The project has a tight 4-week timeline, a no-budget constraint, and a team with low backend expertise. This decision record outlines the chosen patterns for authentication, database interaction, schema design, and security to ensure a robust and scalable architecture.

## Decision Drivers

*   **Security:** Ensuring strict data isolation between users is a critical, non-negotiable requirement.
*   **Developer Experience:** The chosen patterns must be accessible to a team with low backend expertise, with clear documentation and a streamlined workflow.
*   **Performance:** The application must be responsive, with efficient data fetching and a fast user interface.
*   **Cost Efficiency:** All patterns must be achievable within the free tiers of Supabase and Vercel.
*   **Maintainability:** The architecture should be modular and easy to understand for future development.

## Considered Options

*   **Authentication:** Investigated client-side vs. server-side authentication, with a focus on the modern `@supabase/ssr` package for Next.js App Router.
*   **Database Interaction:** Considered direct client-side fetching, server-side fetching in React Server Components (RSCs), and creating an API layer with Next.js Route Handlers/Server Actions.
*   **Schema Design:** Evaluated standard relational database patterns for hierarchical content and many-to-many relationships.
*   **Security:** Focused on Row Level Security (RLS) as the primary mechanism for data isolation.

## Decision

We will adopt a **secure, server-centric integration model** that combines the following best-practice patterns:

1.  **Authentication:** We will use the **`@supabase/ssr` package** for cookie-based session management, **Next.js Middleware** for route protection, and **Server Actions** for secure auth operations.
2.  **Database Interaction:** We will prioritize **server-side data fetching in RSCs** for initial page loads and a **secure API layer using Route Handlers or Server Actions** for all data mutations. Client-side fetching will be used sparingly for non-sensitive data.
3.  **Schema Design:** We will implement a **relational schema** with foreign keys for hierarchical data, a **junction table** for many-to-many relationships, and a `user_id` column in all user-specific tables.
4.  **Row Level Security (RLS):** We will **enable RLS on all user data tables from day one**, with granular policies based on `auth.uid() = user_id` and `WITH CHECK` options for all write operations.

## Consequences

**Positive:**

*   **High Security:** This model provides multiple layers of security, from server-side authentication to database-level RLS, ensuring robust data isolation.
*   **Excellent Developer Experience:** Leverages the latest features of Next.js and Supabase, with clear documentation and a streamlined workflow that is accessible to the team.
*   **Good Performance:** Prioritizing server-side data fetching improves initial load times and UI responsiveness.
*   **Cost-Effective:** All recommended patterns are fully supported by the free tiers of Supabase and Vercel.
*   **High Maintainability:** The modular and server-centric approach leads to a clean and maintainable codebase.

**Negative:**

*   **Moderate Learning Curve:** The team will need to invest time upfront to understand the nuances of the `@supabase/ssr` package, Next.js Middleware, and RLS policy syntax.

**Neutral:**

*   This approach establishes a strong architectural foundation that can be extended with more advanced features in the future.

## Implementation Notes

*   Development should start with the authentication and RLS implementation, as they are foundational to the application's security.
*   All schema changes must be managed through version-controlled SQL migration files.
*   Rigorous testing of RLS policies by impersonating different users is mandatory.

## References

*   [Supabase Next.js Documentation](https://supabase.com/docs/guides/auth/server-side/nextjs)
*   [Next.js App Router Documentation](https://nextjs.org/docs/app)
```
