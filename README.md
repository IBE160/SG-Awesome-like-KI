This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Follow these steps to get your local development environment set up.

1.  **Install JavaScript Dependencies:**
    Open a terminal in the project root and run the following command to install the necessary packages:
    ```bash
    npm install
    ```

2.  **Verify Python Installation:**
    This project uses a Python Flask server for PDF parsing. Ensure Python 3 is installed on your system. You can check by running:
    ```bash
    python3 --version
    # or
    python --version
    ```
    If Python 3 is not installed, please download and install it from [python.org](https://www.python.org/).

3.  **Install Python Dependencies:**
    Once Python is set up, install the required Python packages for the PDF parser:
    ```bash
    npm run install-pdf-parser-deps
    ```

4.  **Set Up Environment Variables:**
    This project requires API keys to connect to Supabase and Google Gemini.
    - First, copy the example environment file to a new local file:
      ```bash
      cp .env.example .env.local
      ```
      (On Windows PowerShell, use `copy .env.example .env.local`)
    - Next, open the newly created `.env.local` file in your code editor.
    - Fill in the values for each variable. You will need to get these keys from your Supabase and Google AI Studio dashboards.

3.  **Run the Development Server:**
    Once your environment variables are set, you can start the development server:
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
