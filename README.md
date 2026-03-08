# EduFlow: A Modern Learning Management System

EduFlow is a scalable, premium Software-as-a-Service (SaaS) Learning Management System (LMS) designed to consolidate fragmented educational experiences into a singular, intuitive, and interactive ecosystem.

## Key Features

*   **Premium, Unified UI/UX**: Built with React and Tailwind CSS, featuring glassmorphism aesthetics and responsive design for a distraction-free learning environment.
*   **Native E-Commerce Integration**: Deep integration with Razorpay for secure, seamless, and instant checkout experiences.
*   **Automated Communication**: Utilizes Nodemailer for asynchronous lifecycle emails, ensuring users receive immediate welcome messages and purchase confirmations.
*   **Integrated Live Sessions**: Embeds Jitsi Meet directly via WebRTC, allowing instructors to host synchronous interactive video sessions without leaving the platform.
*   **Centralized Administrator Dashboard**: Provides robust oversight tools for user management, course orchestration, and revenue analytics.

## Technology Stack

*   **Frontend**: React, Vite, Tailwind CSS
*   **Backend**: Node.js, Express.js
*   **Database**: PostgreSQL / MySQL (Relational Schema)
*   **Third-Party Integrations**: Razorpay (Payments), Nodemailer (Email), Jitsi Meet (Video Conferencing)

## Installation and Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/chanu08/EduFlow-LMS.git
    cd EduFlow-LMS
    ```

2.  **Install global dependencies concurrently (if applicable to your local setup) or navigate to root/backend independently:**
    ```bash
    npm install
    cd backend && npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the `backend` directory and configure the following variables (example placeholders):
    ```env
    PORT=5000
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=yourpassword
    DB_NAME=eduflow
    JWT_SECRET=your_jwt_secret_key
    RAZORPAY_KEY_ID=your_razorpay_key
    RAZORPAY_KEY_SECRET=your_razorpay_secret
    SMTP_HOST=your_smtp_host
    SMTP_USER=your_email
    SMTP_PASS=your_email_password
    ```

4.  **Database Migration:**
    Execute the SQL schema to initialize the database structure.
    *(Instructions depend on the local SQL client configuration, e.g., importing `backend/schema.sql`)*

5.  **Run the Applications:**
    
    *Start the backend server:*
    ```bash
    cd backend
    npm start
    ```
    
    *Start the frontend development server:*
    ```bash
    # Open a new terminal window
    cd EduFlow-LMS
    npm run dev
    ```

## Development and Architecture Details

This project utilizes a RESTful API methodology, strict Role-Based Access Control (RBAC) via JSON Web Tokens (JWT), and stateful database relationships to securely manage users, course content, secure transactions, and access enrollments.

For comprehensive architectural strategies, systemic implementations, and performance analyses, refer to the included project documentation.
