# Givanas Nigeria LTD - Professional Financial Audit Platform

This is a Next.js application built with Firebase Studio, designed to streamline the financial audit process with AI-powered analysis, secure data management, and insightful reporting.

## Features

- **Seamless Record Upload**: Upload financial records in PDF, Excel, or CSV formats.
- **AI-Powered Analysis**: Automatically detect anomalies, identify risks, and ensure compliance.
- **Comprehensive Reporting**: Generate detailed audit reports, executive summaries, and risk assessments.
- **Role-Based Access Control**: Securely manage access for admins, staff, and clients.
- **Dynamic Dashboards**: Visualize financial health and track key metrics in real-time.

## Tech Stack

- **Framework**: Next.js (with App Router)
- **UI**: React, ShadCN UI, Tailwind CSS
- **Generative AI**: Google AI (via Genkit)
- **Database & Auth**: Supabase
- **Deployment**: Netlify

---

## Getting Started

To get this project running locally, follow these steps:

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <project-directory>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root of your project by copying the example file:

```bash
cp .env.example .env.local
```

Now, fill in the values in `.env.local` with your credentials from Supabase and Google AI.

-   **Supabase**: Find your URL and `anon` key in your Supabase project's "API Settings".
-   **`SUPABASE_SERVICE_ROLE_KEY`**: Find this in the same "API Settings" section. **Keep this key secret!**
-   **`GOOGLE_API_KEY`**: Get this from the [Google AI Studio](https://makersuite.google.com/app/apikey).

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.

---

## Deploying to Netlify

This project is configured for easy deployment to Netlify.

### 1. Push to GitHub

Commit your code and push it to a new GitHub repository.

### 2. Create a Netlify Site

1.  Log in to Netlify and select **"Add new site" -> "Import an existing project"**.
2.  Connect to GitHub and choose your repository.
3.  Netlify will automatically detect the build settings from the `netlify.toml` file.

### 3. Configure Environment Variables in Netlify

Before deploying, you must add your environment variables to Netlify's build settings:

1.  Go to your new site's **"Site configuration" -> "Build & deploy" -> "Environment"**.
2.  Click **"Edit variables"** and add the same key-value pairs from your `.env.local` file:
    -   `NEXT_PUBLIC_SUPABASE_URL`
    -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    -   `SUPABASE_SERVICE_ROLE_KEY`
    -   `GOOGLE_API_KEY`

### 4. Trigger Deployment

Once the variables are set, go to the "Deploys" tab and trigger a new deploy. Netlify will build and deploy your application.
