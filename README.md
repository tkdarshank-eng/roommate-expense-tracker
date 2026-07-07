# 🏠 Roommate Expense Tracker

A modern Full Stack MERN application that helps roommates manage shared expenses efficiently. The application allows a leader to manage expenses and roommates, while other roommates can track pending payments and pay using a QR Code.

---

# 🌐 Live Demo

🔗 https://roommate-expense-tracker-roan.vercel.app

---

# ✨ Features

## 👑 Leader Features

- Create Leader Account
- Login Authentication
- Add New Expenses
- Delete Expenses
- Manage Roommates
- Change Roommate Password
- Update Pending Amounts
- Add Individual Charges
- View Complete Expense History

---

## 👤 Roommate Features

- Secure Login
- View Personal Expenses
- View Pending Amount
- QR Code Payment
- Google Pay / UPI Payment Support
- Expense History
- Logout

---

# 🛠 Tech Stack

### Frontend

- React.js
- React Router
- Axios
- CSS3

### Backend

- Node.js
- Express.js

### Database

- MongoDB Atlas
- Mongoose

### Deployment

- Vercel (Frontend)
- Render (Backend)

---

# 📸 Application Screenshots

## 🔐 Leader Login

![Leader Login](screenshots/leaderLogin.png)

Leader can securely login to manage expenses and roommates.

---

## 👑 Create Leader Account

![Create Leader Account](screenshots/CreateLogin.png)

Create a new leader account for a roommate group.

---

## 💰 Add Expense

![Add Expense](screenshots/addExpense.png)

Leader can add expenses by entering title, amount and selecting who paid.

---

## 📋 View Expenses

![View Expenses](screenshots/viewExpenses.png)

Displays all recorded expenses with delete option.

---

## 👥 Manage Roommates

![Manage Roommates](screenshots/manageRoommates.png)

Leader can

- Add roommates
- Delete roommates
- Change passwords
- Manage pending balances
- Add additional charges

---

## 💳 Pending Amount Management

![Pending Amount](screenshots/pendingAmount.png)

Leader can monitor and update every roommate's pending balance.

---

## 📊 Roommate Dashboard

![Roommate Dashboard](screenshots/nonLeaderPending.png)

Each roommate can

- View pending balance
- View expense history
- Track payments

---

## 📱 QR Code Payment

![QR Payment](screenshots/nonLeaderQRCode.png)

Roommates can instantly pay their pending amount using Google Pay / UPI QR Code.

---

# 📂 Project Structure

```
roommate-expense-tracker
│
├── backend
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── server.js
│
├── frontend
│   ├── src
│   ├── pages
│   ├── components
│
├── screenshots
│
└── README.md
```

---

# ⚙ Installation

## Clone Repository

```bash
git clone https://github.com/tkdarshank-eng/roommate-expense-tracker.git
```

---

## Backend Setup

```bash
cd backend
npm install
npm start
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

# Environment Variables

Create a `.env` file inside the backend folder.

```env
MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
PORT=5000
```

---

# Future Improvements

- Payment Verification
- Monthly Reports
- Expense Categories
- Notifications
- Email Alerts
- Charts & Analytics
- Dark/Light Theme
- Mobile App

---

# 👨‍💻 Developer

**T K Darshan Kumar**

Information Science & Engineering

East Point College of Engineering and Technology

---

# ⭐ Support

If you like this project,

⭐ Star this repository

🍴 Fork it

🛠 Contribute to improve it

---

## 📄 License

This project is developed for learning, portfolio, and educational purposes.