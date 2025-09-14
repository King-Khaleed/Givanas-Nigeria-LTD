# Givanas Financial Audit Platform - Project Defense Guide

This document provides a comprehensive overview of the Givanas Nigeria LTD Financial Audit Platform. It is designed to help you understand the project's architecture, features, and underlying technologies to prepare for your project defense.

---

## 1. High-Level Project Overview

### What is this project?
This is a sophisticated, web-based platform designed to modernize and streamline the financial auditing process for **Givanas Nigeria LTD**. It replaces manual, time-consuming tasks with an intelligent, automated, and secure system.

### Who is it for?
The platform is designed for three distinct user roles:
1.  **Admins:** Superusers who manage the entire platform, including organizations and users.
2.  **Staff (Auditors):** The primary users who upload financial records, run AI analyses, and generate audit reports for their clients.
3.  **Clients:** End-users (customers of Givanas) who can view their records and the final reports generated for them, but have restricted, read-only access.

### What is its main purpose?
The core purpose is to leverage Artificial Intelligence to improve the speed, accuracy, and insightfulness of financial audits. It achieves this by:
-   **Automating Anomaly Detection:** Using AI to scan financial documents for irregularities.
-   **Centralizing Data:** Providing a single, secure place for all financial records and audit reports.
-   **Streamlining Reporting:** Enabling auditors to generate comprehensive reports (Executive Summaries, Risk Assessments, etc.) with the help of AI.

---

## 2. Core Technologies (The "How")

This project is built on a modern, robust technology stack.

| Component      | Technology                                    | Purpose                                                                                                                                      |
| :------------- | :-------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**  | **Next.js (with App Router)** & React         | Provides the foundation for a fast, server-rendered application. The App Router allows for cleaner code organization and better performance.     |
| **UI**         | **Tailwind CSS** & **ShadCN UI**                | Tailwind is a utility-first CSS framework for rapid styling. ShadCN provides a set of pre-built, accessible, and customizable UI components. |
| **Database**   | **Supabase (PostgreSQL)**                       | An open-source Firebase alternative. It provides the project's database, which stores all data (users, files, reports, etc.).              |
| **Auth**       | **Supabase Auth**                             | Manages user sign-up, sign-in, and role-based security.                                                                                      |
| **File Storage** | **Supabase Storage**                          | Securely stores all uploaded financial documents (PDFs, Excel files, etc.).                                                                |
| **Generative AI**| **Google AI (Gemini)** via **Genkit**           | **This is the core of the "intelligence".** Genkit is the framework used to create "flows" that call the Gemini AI model to analyze data. |
| **Deployment** | **Netlify**                                   | A platform for automatically building the code from GitHub and hosting the live website.                                                     |

---

## 3. Architecture & Data Flow

Understanding how data moves is key. Here's a typical workflow:

1.  **Upload:** A **Staff** member uploads a financial document (e.g., an Excel file) via the "Upload" page.
2.  **Storage:** The file is securely sent to **Supabase Storage**. A corresponding entry is created in the `financial_records` table in the **Supabase Database**, linking the file to the organization and marking its status as "pending".
3.  **AI Analysis (The Magic):**
    *   The application calls a **Genkit Flow** (e.g., `analyzeFinancialRecord`). This is a server-side function.
    *   The Genkit flow reads the file from Supabase Storage and sends its content, along with a specific prompt, to the **Google AI (Gemini) model**.
    *   The prompt instructs the AI to act like an auditor and identify anomalies, risks, and compliance issues, returning the results in a structured JSON format.
4.  **Update Database:** The structured JSON response from the AI is saved back into the `analysis_results` column of the `financial_records` table in the Supabase Database. The record's status is updated to "completed".
5.  **Display Results:** The user can now view the AI's findings on the "Analysis" page, which reads the results from the database and displays them in a user-friendly format (tables, charts, risk badges).

---

## 4. Page-by-Page Breakdown

### Public Pages
-   **Homepage (`/`):** The marketing and landing page for the platform.
-   **Login/Register (`/login`, `/register`):** Standard authentication pages managed by Supabase Auth.

### Admin Dashboard (`/admin/*`)
The admin has a global view of the entire platform.

-   **Dashboard (`/admin`):** Shows high-level platform statistics like total users, total organizations, and recent activities. All data is fetched live from the database.
-   **Organizations (`/admin/organizations`):** A table to view, create, edit, and delete organizations on the platform.
-   **Users (`/admin/users`):** A table to manage all users. Admins can invite new users, change roles, and assign them to organizations.
-   **Analytics (`/admin/analytics`):** Visual dashboards showing platform usage trends, such as user sign-ups over time and analysis statuses. This data is dynamic.
-   **Reports (`/admin/reports`):** A list of *all* reports generated across *all* organizations.
-   **Settings (`/admin/settings`):** A page to configure platform-wide settings, such as API keys for integrations.

### User/Staff Dashboard (`/dashboard/*`)
This is the main workspace for Staff and Clients.

-   **Dashboard (`/dashboard`):** A personalized overview showing recent uploads, analysis status, and shortcuts to generate reports for the user's specific organization.
-   **Upload (`/dashboard/upload`):** The drag-and-drop interface for uploading new financial records. This page is only accessible to **Staff**.
-   **Records (`/dashboard/records`):** A detailed table of all financial records for the user's organization. It shows file details, upload dates, and the current analysis status.
-   **Analysis (`/dashboard/analysis`):** The core results page. It displays the anomalies and risks identified by the AI in a clear, actionable format. Staff can change the status of a risk flag (e.g., from "New" to "Reviewed").
-   **Reports (`/dashboard/reports`):** The AI-powered report generator. **Staff** can select a report type (e.g., "Risk Assessment"), choose the relevant records, and the AI will generate a structured, downloadable report. **Clients** can only view reports generated for them.
-   **Profile (`/profile`):** A page for users to update their personal information.

---

## 5. How the AI Works: Genkit Flows

The "brains" of this application are the **Genkit flows** located in the `src/ai/flows/` directory.

-   **What is a flow?** A flow is a server-side TypeScript function (`'use server'`) that orchestrates a call to an AI model.
-   **Input & Output:** Each flow uses the **Zod** library to define a strict schema for its inputs and outputs. This is critical for ensuring the AI returns data in a predictable and usable format (a concept called "structured output").
-   **Example: `automated-anomaly-detection.ts`**
    1.  **Input:** It takes the file content (as a data URI), file name, and organization name.
    2.  **Prompt:** It uses a detailed prompt that tells the Gemini model: *"You are an AI financial audit assistant... analyze this file... identify anomalies... assess risk... return the output in this exact JSON format."*
    3.  **Output:** It forces the AI to return a JSON object containing a summary, a list of anomalies, compliance issues, and an overall risk level, which is then saved to the database.

The other flows (`generate-executive-summary.ts`, `generate-risk-assessment.ts`, etc.) work in a similar way, each with a specialized prompt and a structured output schema tailored to its specific task. This is the foundation of the application's AI capabilities.
