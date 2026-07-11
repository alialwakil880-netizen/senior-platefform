# PRD – Recommended & Final Tech Stack

## Overview
This document outlines the architecture and technology stack for the Senior Platform web application. This stack is optimized for rapid MVP development, scalability, built-in security, and low operational overhead.

---

## 1. Frontend Architecture

* **Framework:** Next.js (React)
* **Language:** TypeScript
* **Styling & UI:** Tailwind CSS + shadcn/ui
* **API State Management:** TanStack Query (`@tanstack/react-query`)
* **Forms & Validation:** React Hook Form + Zod

---

## 2. Backend Architecture (Backend-as-a-Service)

* **BaaS Provider:** Supabase (`@supabase/supabase-js` / Supabase Cloud)
* **Core Capabilities:**
  * **Authentication:** Teacher & Student auth flows (Email & Password, Password Reset, Session Management)
  * **Database:** Managed PostgreSQL Database with Row Level Security (RLS) policies
  * **Storage:** Cloud object storage (`videos/`, `pdfs/`, `thumbnails/`, `profile-images/`)
  * **Database API:** Auto-generated REST and GraphQL APIs via PostgREST
  * **Real-time:** Real-time database subscriptions (future use)
  * **Edge Functions:** Serverless functions for custom server-side workflows when needed

---

## 3. Database & Storage Schema Structure

### Database
* **Engine:** PostgreSQL (Managed by Supabase)
* **Access Control:** Row Level Security (RLS) policies enforcing teacher vs. student permissions.

### Storage Buckets & Folders
Supabase Storage structured into dedicated folders:
* `videos/` – Lecture and tutorial recordings
* `pdfs/` – Course notes, assignments, and supplementary materials
* `thumbnails/` – Video and course cover images
* `profile-images/` – User avatars for teachers and students

---

## 4. Authentication & Authorization

* **Provider:** Supabase Auth
* **Supported Methods:**
  * Email & Password signup / login
  * Password Reset emails & recovery flows
  * JWT-based Session Management integrated with Next.js App Router

---

## 5. Deployment & DevOps

| Layer | Technology / Service |
| :--- | :--- |
| **Frontend** | Vercel |
| **Backend & DB** | Supabase Cloud |

---

## 6. Summary Table

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js + TypeScript |
| **UI Design System** | Tailwind CSS + shadcn/ui |
| **Backend** | Supabase |
| **Database** | PostgreSQL (Supabase) |
| **Authentication** | Supabase Auth |
| **Storage** | Supabase Storage |
| **Deployment** | Vercel + Supabase Cloud |

---

## Why This Stack?
* **Velocity:** Rapid MVP rollout without managing custom backend server infrastructure.
* **All-in-One Core:** Unified authentication, relational database, object storage, and APIs out of the box.
* **Scalability:** Built on PostgreSQL and serverless infrastructure, scaling effortlessly from hundreds to thousands of concurrent students.
* **Cost Efficiency:** Significantly lower operational and engineering maintenance cost compared to managing custom FastAPI or Node.js server clusters.
