# 🎗️ Givera

**Empowering Communities Through Transparent Fundraising**

Givera is a web-based fundraising platform that connects donors with verified fundraising campaigns. Users can create campaign requests, donate to approved campaigns, track donation history, receive donation certificates, and view fund utilization reports. Administrators review campaign requests, manage donations, monitor fundraising progress, and generate reports.

## ✨ Features

### Donor

* Register & Login
* Browse Campaigns
* View Campaign Details
* Donate to Campaigns
* View Donation History
* Receive Donation Certificates via Email
* Request New Campaigns
* Track Campaign Updates
* View Fund Utilization Reports
* Personal Dashboard & Analytics

### Admin

* Approve/Reject Campaign Requests
* Manage Campaigns
* Manage Users
* Monitor Donations
* Generate Reports
* Publish Campaign Updates
* View Analytics Dashboard

### AI Features

* AI Campaign Writer
* Donor Recommendation Engine
* Smart Chatbot

## 🛠️ Tech Stack

### Frontend

* React
* JavaScript
* Tailwind CSS

### Backend

* Django REST Framework

### Database

* SQLite3

### Other Tools

* JWT Authentication
* Cloudinary
* ReportLab
* SMTP Email Service

## 🚀 How to Run

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at:

```bash
http://localhost:5173
```

### Backend

Create virtual environment:

```bash
cd backend
python -m venv venv
```

Activate virtual environment:

```bash
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Apply migrations:

```bash
python manage.py migrate
```

Run server:

```bash
python manage.py runserver
```

Backend will run at:

```bash
http://localhost:8000
```

## 👥 Team

Developed as a Capstone Project for Software Engineering.
