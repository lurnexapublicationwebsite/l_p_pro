# Lurnexa Publications 📚🔬

[![Next.js](https://img.shields.io/badge/Next.js-16.x-black?style=flat-square&logo=next.dot.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue?style=flat-square&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![AWS](https://img.shields.io/badge/AWS-S3_%26_Cognito-orange?style=flat-square&logo=amazon-aws)](https://aws.amazon.com/)
[![License](https://img.shields.io/badge/License-ISC-green?style=flat-square)](LICENSE)

**Lurnexa Publications** is a modern, high-performance, and feature-rich Next.js platform designed specifically for academic and scientific journal publishing, textbook distribution, and editorial board operations.

The platform provides a seamless digital publishing system, standardizing paper presentation, metadata injection, and secure user workflow integrations while guaranteeing full compliance with global academic indexing standards (e.g., Google Scholar).

---

## 🌟 Key Features

### 1. 🎓 Scholarly & Academic Indexing (Google Scholar Ready)
* **Metadata Injection:** Automatically injects compliant Google Scholar meta tags (`citation_title`, `citation_author`, `citation_pdf_url`, `citation_publication_date`, etc.) inside the `<head>` of article page templates.
* **JSON-LD Schema:** Injects structured `ScholarlyArticle` Schema.org markup.
* **Automated PDF Generator:** Integrated Node.js pre-build script (`scripts/generate-missing-pdfs.js`) built with `pdfkit` that scans article records and automatically builds beautifully formatted, text-selectable academic PDFs if they are missing from public assets.
* **Dynamic Sitemaps & robots.txt:** Fully automated search engine discovery (via dynamic sitemap routing) and specialized crawler path permissions (`Googlebot` & `Googlebot-Scholar`).

### 2. 🔒 Enterprise Security & AWS Integrations
* **Cognito Authentication:** Full OpenID-compliant login, sign up, password recovery, and session validation using **Amazon Cognito Identity Pools**.
* **AWS S3 Integration:** Secure file upload and download services (via `@aws-sdk/client-s3` and presigned URLs) to manage editorial board media assets and manuscript submissions.
* **Role-Based Workflows:** Distinct logins and dashboard portals for authors, editors, and editorial staff.

### 3. 🎨 Premium UI/UX & Animations
* **Smooth Navigation:** Butter-smooth page transitions and momentum-based scrolling using **Lenis scroll** and **GSAP**.
* **Modern Aesthetic:** A sleek dark/light design system implemented via **Tailwind CSS v4** and customized glassmorphic, interactive bento layouts (`MagicBento.tsx`).
* **Micro-Animations:** Fluid, interactive animations built with **Framer Motion** and **Motion**.

### 4. 🗺️ Interactive Elements & Services
* **Maps Integration:** High-performance, reactive GIS mapping using `@vis.gl/react-google-maps`.
* **Editorial Board Management:** Fully automated editorial board profile rosters and profile card displays.

---

## 📂 Project Directory Structure

```text
l_p_pro/
├── app/                           # Next.js App Router root directory
│   ├── aboutus/                   # Company information and corporate goals
│   ├── Archive/                   # Archive for past issues and papers
│   ├── Articles/                  # Academic articles list and reader template pages
│   ├── api/                       # Next.js Serverless API endpoints
│   ├── author-guidelines/         # Guidelines and instructions for authors
│   ├── dashboard/                 # Secure author/editor management panel
│   ├── EditoralLogins/            # Back-office access portals for editors
│   ├── submityourarticle/         # Online manuscript submission intake forms
│   ├── globals.css                # Global CSS rules and Tailwind directives
│   ├── layout.tsx                 # Core global application layout
│   └── page.tsx                   # Interactive landing page
├── components/                    # Reusable React UI Components
│   ├── Home/                      # Landing page specific components (Hero, Vision, Leadership)
│   ├── ui/                        # Core Shadcn UI elements (Buttons, Inputs, Dialogs, dropdowns)
│   ├── LenisProvider.tsx          # Wrapper for smooth scrolling animations
│   └── MagicBento.tsx             # Interactive grid component for services/objectives
├── docs/                          # Developer and compliance documentation
│   └── google_scholar_integration.md # Scholar crawler checklist & Search Console guide
├── hooks/                         # Custom React hooks (state tracking, dimensions, theme)
├── lib/                           # Central configuration & core utility functions
│   ├── cognito.ts                 # AWS Cognito SDK initialization & Auth endpoints
│   ├── s3.ts                      # AWS S3 file upload/download stream handling
│   ├── data/                      # Local JSON/TS metadata lists (articles list)
│   └── utils.ts                   # Tailwind utility helpers (clsx, tailwind-merge)
├── public/                        # Static assets (images, logos, dynamically generated PDFs)
│   └── pdfs/                      # Destination directory for research papers
├── scripts/                       # Build tools and auxiliary tasks
│   └── generate-missing-pdfs.js   # Automated pre-build PDF compiler
├── amplify.yml                    # CI/CD deployment configuration for AWS Amplify
├── package.json                   # Project packages, scripts, and runtime engines
├── tailwind.config.ts             # Tailwind design theme definitions
└── tsconfig.json                  # Strict compilation rules for TypeScript
```

---

## 🛠️ Local Installation & Development

To set up and run **Lurnexa Publications** locally, follow these steps:

### Prerequisites
Make sure you have the following installed on your local machine:
* [Node.js](https://nodejs.org/) (v18.x or newer recommended)
* [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
* Git (to manage code push to GitHub)

### 1. Clone the Repository
```bash
git clone https://github.com/shanmukavenkat/l_P_pro.git
cd l_P_pro
```

### 2. Install Dependencies
Install all packages and workspace configurations:
```bash
npm install
# or
yarn install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory and add the following keys:
```env
# AWS Cognito Authentication Configuration
NEXT_PUBLIC_COGNITO_CLIENT_ID=your_cognito_client_id
NEXT_PUBLIC_COGNITO_REDIRECT_URI=http://localhost:3000/dashboard
NEXT_PUBLIC_LOGOUT_REDIRECT=http://localhost:3000/login

# AWS S3 Storage Service Credentials
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key

# Database Connection (If applicable)
DATABASE_URL=postgresql://user:password@localhost:5432/lurnexa

# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 4. Run the Development Server
```bash
npm run dev
# or
yarn dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to inspect the application.

---

## 🚀 Production Build & CI/CD Deployment

### Production Compilation
Before deploying the app, next compiles all source code. Our custom hook ensures PDFs are compiled as well:
```bash
npm run build
```
This executes `node scripts/generate-missing-pdfs.js` to compile any missing academic documents in the `public/pdfs/` directory first, followed by standard `next build`.

### AWS Amplify Hosting
The app is fully configured for deployment on **AWS Amplify**. The build specifications are defined in [amplify.yml](file:///c:/Users/kyle2/OneDrive/Desktop/LURNEXA%20PUBLICATIONS/l_p_pro/amplify.yml):
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

---

## 🔍 Google Scholar Inclusion Checklist

To ensure your papers are crawled successfully:
1. Ensure the article is added to [articles.ts](file:///c:/Users/kyle2/OneDrive/Desktop/LURNEXA%20PUBLICATIONS/l_p_pro/lib/data/articles.ts) with full and correct information.
2. Verify that `citation_title` and `citation_author` tags are loaded dynamically on the page source.
3. Validate that the compiled PDF is text-selectable (i.e. contains vector fonts and searchable text).
4. For detailed guidelines, refer to the [Google Scholar Integration Guide](file:///c:/Users/kyle2/OneDrive/Desktop/LURNEXA%20PUBLICATIONS/l_p_pro/docs/google_scholar_integration.md).

---

## 📜 License

This project is licensed under the **ISC License**. See the `package.json` file for authorization details.

---
*Developed with ❤️ by Lurnexa Academic Network & lurnexapublicationwebsite.*
