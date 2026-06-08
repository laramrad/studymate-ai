# StudyMate AI

StudyMate AI is a full-stack academic assistant web application built with **React** and **Laravel**.  
The platform helps students manage courses, upload study materials, use AI-assisted study tools, generate quizzes and flashcards, track deadlines, and create study plans from one dashboard.

GitHub Repository: https://github.com/laramrad/studymate-ai.git

---

## Table of Contents

- [Project Overview](#project-overview)
- [Main Features](#main-features)
- [User Roles](#user-roles)
- [Subscription Plans](#subscription-plans)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Requirements Before Running](#requirements-before-running)
- [How to Open the Website on Localhost](#how-to-open-the-website-on-localhost)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [How to Use the Website](#how-to-use-the-website)
- [Important Localhost URLs](#important-localhost-urls)
- [Common Problems and Fixes](#common-problems-and-fixes)
- [Notes](#notes)

---

## Project Overview

StudyMate AI is designed for university students who need one organized platform for studying.  
Instead of keeping courses, uploaded files, quizzes, flashcards, deadlines, and study plans in different places, StudyMate AI combines them into one modern dashboard.

The system contains:

- Student dashboard
- Admin dashboard
- Authentication system
- Course management
- Material upload system
- AI assistant page
- Quiz generator
- Flashcard generator
- Deadline tracker
- Study planner
- Profile management
- Subscription plan system
- Fake billing system for testing

---

## Main Features

### 1. Authentication

Users can:

- Register a new account
- Choose Free or Paid plan during registration
- Login
- Logout
- Stay logged in until logout
- Access protected dashboard pages only when authenticated

The system saves the login token in local storage and uses it when calling the Laravel API.

---

### 2. Landing Page

The landing page includes:

- Project introduction
- Main platform features
- Student workflow explanation
- Subscription plans section
- Admin monitoring section
- Dynamic buttons based on login status

If the user is **not logged in**, the landing page shows:

- Login
- Register
- Get Started

If the user **is already logged in**, the landing page shows:

- Go to Dashboard
- Manage Plan

---

### 3. Dashboard

The student dashboard displays an overview of:

- Courses count
- Materials count
- Quizzes count
- Average quiz score
- Flashcards count
- Active deadlines
- Completed deadlines
- Study plan progress
- Upcoming deadlines

---

### 4. Courses

Students can:

- Create courses
- View courses
- Open course details
- Delete courses

Each course can be linked with materials, deadlines, quizzes, flashcards, and study plans.

---

### 5. Materials

Students can:

- Upload study materials
- Link materials to courses
- View uploaded material details
- Delete materials
- Use uploaded material as the base for AI tools

Supported file idea:

- PDF
- TXT
- DOC / DOCX depending on backend handling

---

### 6. AI Assistant

Students can:

- Ask questions related to uploaded study materials
- View AI chat history
- Receive study explanations

The AI feature is prepared for OpenAI integration.  
If no paid OpenAI API key is available, the project can still use fallback/testing responses depending on the current implementation.

---

### 7. Smart Summary

Students can generate or view smart summaries from uploaded material content.

---

### 8. Quiz Generator

Students can:

- Generate quizzes from materials
- Choose generation controls
- Answer quiz questions
- View quiz score
- Track quiz performance

---

### 9. Flashcards

Students can:

- Generate flashcards
- Review flashcards
- Flip cards interactively
- Link flashcards to a material/course structure

---

### 10. Study Planner

Students can:

- Create a study plan
- Select a course
- Choose an exam date from a calendar button
- Set available study hours per day
- Select difficulty
- Add notes
- Generate a structured study plan
- Delete study plans

---

### 11. Deadlines

Students can:

- Add academic deadlines
- Select a course
- Choose a due date from a calendar button
- Set type such as Assignment, Exam, Project, Presentation, Quiz, or Other
- Set priority
- Mark deadlines as completed
- Delete deadlines

---

### 12. Search and Filters

The system includes search/filter enhancements in selected pages to help users quickly find their data.

---

### 13. Profile Page

Users can:

- View account information
- Update name and email
- Change password
- View current subscription plan
- Upgrade or downgrade plan
- View fake billing preview

---

### 14. Subscription Plan System

The project includes a testing subscription system with two plans:

#### Free Plan

The Free Plan is for testing and basic usage.

Suggested limitations:

- Maximum 2 courses
- Maximum 3 uploaded materials
- Maximum 5 generated quizzes
- Maximum 30 flashcards
- Maximum 5 deadlines
- Maximum 2 study plans

#### Paid Plan

The Paid Plan is for full access.

Paid plan benefits:

- Unlimited courses
- Unlimited uploaded materials
- Unlimited quizzes
- Unlimited flashcards
- Unlimited deadlines
- Unlimited study plans
- Priority AI study tools
- Fake billing information for testing

---

### 15. Fake Billing System

The billing system is for project testing only.

When upgrading to the Paid Plan, the system can collect test billing information such as:

- Cardholder name
- Billing email
- Card number
- Expiry date
- CVC

Important:

- No real payment is processed.
- This is only a test billing system.
- The system should not store full card number or CVC.
- It may store safe test information such as billing name, billing email, and last four digits.

---

### 16. Admin Panel

Admins can view and monitor platform data.

Admin dashboard includes:

- Total students
- Total courses
- Total materials
- Total quizzes
- Total flashcards
- Total deadlines
- Recent materials
- Recent quizzes
- System summary

Admin pages include:

- Admin Dashboard
- Students
- All Courses
- All Materials
- All Quizzes
- All Deadlines

---

### 17. UI Enhancements

The project includes:

- Dark mode
- Light mode
- Theme toggle button
- Colorful professional UI
- Sidebar navigation
- Mobile sidebar support
- Footer copyright
- Updated icons using lucide-react
- Landing page pricing section
- Protected dashboard layout

---

## User Roles

### Student

A student can:

- Manage courses
- Upload materials
- Generate quizzes
- Generate flashcards
- Use AI assistant
- Create deadlines
- Create study plans
- Manage profile
- Manage subscription plan

### Admin

An admin can:

- Access admin dashboard
- View platform statistics
- Monitor students
- Monitor courses
- Monitor materials
- Monitor quizzes
- Monitor deadlines

---

## Technologies Used

### Frontend

- React
- Vite
- React Router DOM
- Axios
- Tailwind CSS
- Lucide React icons

### Backend

- Laravel
- Laravel Sanctum
- PHP
- REST API
- MySQL for local development

### Database

- MySQL locally through XAMPP / phpMyAdmin

---

## Project Structure

The repository contains two main folders:

```text
studymate-ai/
  backend/
    app/
    bootstrap/
    config/
    database/
    public/
    routes/
    storage/
    composer.json
    .env.example

  frontend/
    src/
      layouts/
      pages/
      services/
    package.json
    vite.config.js
```

---

## Requirements Before Running

Before opening the project, install:

1. Git
2. PHP
3. Composer
4. Node.js
5. npm
6. XAMPP or another MySQL server
7. VS Code or another code editor

Recommended local tools:

- XAMPP for Apache/MySQL
- phpMyAdmin for database management
- PowerShell or Terminal
- Browser such as Chrome

---

## How to Open the Website on Localhost

Follow these steps after cloning from GitHub.

---

## 1. Clone the Project

Open PowerShell or terminal and run:

```bash
cd C:\Users\User\Desktop
git clone https://github.com/laramrad/studymate-ai.git
cd studymate-ai
```

This will download the project from GitHub.

---

## Backend Setup

### 2. Open Backend Folder

```bash
cd backend
```

---

### 3. Install Laravel Dependencies

Run:

```bash
composer install
```

---

### 4. Create Environment File

Copy `.env.example` and create a new `.env` file:

```bash
copy .env.example .env
```

If the command does not work, manually duplicate `.env.example` and rename the copy to:

```text
.env
```

---

### 5. Generate Laravel App Key

Run:

```bash
php artisan key:generate
```

---

### 6. Create Database

Open XAMPP and start:

- Apache
- MySQL

Then open:

```text
http://localhost/phpmyadmin
```

Create a new database named:

```text
studymate_ai
```

---

### 7. Configure Backend `.env`

Open:

```text
backend/.env
```

Make sure the database settings look like this:

```env
APP_NAME="StudyMate AI"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=studymate_ai
DB_USERNAME=root
DB_PASSWORD=

FILESYSTEM_DISK=public

SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
```

After generating the app key, `APP_KEY` should be filled automatically.

If your MySQL has a password, put it in:

```env
DB_PASSWORD=your_password
```

---

### 8. Run Migrations

Run:

```bash
php artisan migrate
```

This creates all database tables.

---

### 9. Create Storage Link

Run:

```bash
php artisan storage:link
```

This allows uploaded files to be accessible from the public folder.

---

### 10. Clear Cache

Run:

```bash
php artisan optimize:clear
```

---

### 11. Start Laravel Backend Server

Run:

```bash
php artisan serve
```

The backend should run on:

```text
http://127.0.0.1:8000
```

Test the backend API by opening:

```text
http://127.0.0.1:8000/api/test
```

Expected result:

```json
{
  "message": "StudyMate AI API is working."
}
```

Keep this backend terminal open.

---

## Frontend Setup

Open a new terminal window.

### 12. Go to Frontend Folder

```bash
cd C:\Users\User\Desktop\studymate-ai\frontend
```

---

### 13. Install Frontend Dependencies

Run:

```bash
npm install
```

---

### 14. Start React Frontend

Run:

```bash
npm run dev
```

The frontend should run on:

```text
http://localhost:5173
```

Open this link in your browser.

---

## How to Use the Website

### First Time

1. Open:

```text
http://localhost:5173
```

2. Click **Get Started** or **Register**.
3. Create a student account.
4. Choose a plan:
   - Free Plan
   - Paid Plan
5. Login automatically or login manually.
6. Start using the dashboard.

---

### Student Flow

Recommended testing order:

1. Register student
2. Login
3. Create course
4. Upload material
5. Open material details
6. Ask AI
7. Generate quiz
8. Generate flashcards
9. Add deadline
10. Generate study plan
11. Update profile
12. Upgrade or downgrade subscription plan
13. Logout

---

### Admin Flow

If an admin user exists in the database:

1. Login with admin account
2. Open admin dashboard
3. View students
4. View all courses
5. View all materials
6. View all quizzes
7. View all deadlines

If no admin account exists, create one manually in the database by updating the `role` column of a user to:

```text
admin
```

---

## Important Localhost URLs

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://127.0.0.1:8000
```

API test:

```text
http://127.0.0.1:8000/api/test
```

phpMyAdmin:

```text
http://localhost/phpmyadmin
```

---

## Common Problems and Fixes

### Problem: Backend does not start

Run:

```bash
composer install
php artisan optimize:clear
php artisan serve
```

---

### Problem: Database error

Check:

1. XAMPP MySQL is running
2. Database exists in phpMyAdmin
3. `.env` has correct DB name
4. Run migration again:

```bash
php artisan migrate
```

---

### Problem: Frontend cannot connect to backend

Make sure backend is running on:

```text
http://127.0.0.1:8000
```

Check:

```text
frontend/src/services/api.js
```

It should point to:

```text
http://127.0.0.1:8000/api
```

---

### Problem: CORS error

In backend:

```text
config/cors.php
```

Make sure local frontend is allowed:

```php
'allowed_origins' => [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
],
```

Then run:

```bash
php artisan optimize:clear
php artisan serve
```

---

### Problem: Uploaded files do not open

Run:

```bash
php artisan storage:link
```

---

### Problem: npm command not found

Install Node.js from:

```text
https://nodejs.org
```

Then reopen terminal and try:

```bash
npm install
npm run dev
```

---

### Problem: composer command not found

Install Composer from:

```text
https://getcomposer.org
```

Then reopen terminal and try:

```bash
composer install
```

---

### Problem: Login redirects strangely with browser back button

The project uses protected routes and `replace: true` navigation to reduce this problem.  
If needed, clear browser local storage:

```text
DevTools → Application → Local Storage → Clear
```

Then login again.

---

## Notes

- This project is intended for academic/senior project use.
- The billing system is only for testing and demonstration.
- No real payment is processed.
- AI features may require a paid OpenAI API key if real OpenAI responses are enabled.
- The project can still be tested without a paid API key depending on fallback logic.
- Free/Paid subscription restrictions are part of the project logic and can be enhanced further.

---

## Author

StudyMate AI  
Senior Project Web Application
