# LegalNotice AI Reply Generator

An AI-powered web application that helps users generate highly accurate and professional legal replies to various types of legal notices. Built with a modern serverless architecture utilizing Next.js, Firebase, and Groq's lightning-fast inference API.

## Features

- ⚖️ **AI Legal Drafting**: Automatically generates contextual and formatted legal responses using **Google Gemma 4 E4B IT Assistant** (`google/gemma-4-E4B-it-assistant`) via Hugging Face with built-in statutory fallback.
- 🚀 **Deployment Ready**: Optimized for deployment on **Vercel** and **Firebase Hosting**.
- 🔒 **Secure Authentication**: Integrated Firebase Authentication for user accounts and secure sessions.
- ☁️ **Cloud Database**: User notices and drafts are securely stored in Firebase Firestore with strict, owner-only security rules.
- 🎨 **Modern UI/UX**: Built with Next.js, Tailwind CSS, and shadcn/ui for a highly responsive and accessible interface.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend/BaaS**: Firebase (Auth, Firestore, Hosting)
- **AI Provider**: Hugging Face Inference API — Google Gemma 4 E4B Assistant (`google/gemma-4-E4B-it-assistant`)
- **Hosting Platforms**: Vercel / Firebase Hosting
- **UI Components**: shadcn/ui (Radix UI)

## Getting Started

### Prerequisites
- Node.js 18+ installed
- A Firebase project with Authentication and Firestore enabled
- A [Groq API Key](https://console.groq.com/keys)

### Installation

1. **Clone the repository:**
   `ash
   git clone https://github.com/athukuriharini-cpu/LegalNoticeAIReplyGenerator.git
   cd LegalNoticeAIReplyGenerator
   `

2. **Install dependencies:**
   `ash
   npm install
   `

3. **Environment Setup:**
   Copy the example environment file and fill in your credentials.
   `ash
   cp .env.example .env.local
   `
   *Note: You must provide valid Firebase and Groq API keys in .env.local for the application to build and run correctly.*

4. **Run the development server:**
   `ash
   npm run dev
   `
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

This application is configured for Static HTML Export (output: 'export'), making it perfect for free-tier hosting on Firebase, Vercel, or Netlify.

### Deploying to Firebase Hosting
1. Install the Firebase CLI: 
pm install -g firebase-tools
2. Login to your Firebase account: irebase login
3. Initialize your project (if not done): irebase init hosting
4. Build the static files:
   `ash
   npm run build
   `
5. Deploy to production:
   `ash
   firebase deploy --only hosting
   `

## License

This project is open-source and available under the [MIT License](LICENSE).
