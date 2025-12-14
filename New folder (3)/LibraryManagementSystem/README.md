# Professional Library Management System

A complete, commercial-grade library management system built with Node.js, Express, MongoDB, and React.

## 🚀 Features

### **Backend Features**
- **Authentication System**: JWT-based authentication with role-based access control (Admin, Librarian, Member)
- **Book Management**: Comprehensive CRUD operations for books with search and filtering
- **Member Management**: User profiles, membership status tracking, and management
- **Transaction System**: Book borrowing, returning, renewing, and reservation tracking
- **Payment Integration**: Stripe payment processing for membership fees, fines, and book purchases
- **Reporting System**: Advanced reporting with PDF generation for daily/monthly transactions, overdue books, popular books, and financial summaries
- **Admin Dashboard**: Comprehensive statistics, system settings, and user management

### **Frontend Features**
- **Responsive Design**: Mobile-friendly interface using Bootstrap and React
- **Role-Based UI**: Different interfaces for admins, librarians, and members
- **Real-time Updates**: Live data updates and notifications
- **Advanced Search**: Full-text search for books and members
- **Interactive Charts**: Visual data representation using Chart.js
- **Form Validation**: Comprehensive form validation with Formik and Yup

## 📁 Project Structure

```
LibraryManagementSystem/
├── server.js                  # Main server entry point
├── package.json               # Backend dependencies
├── .env                       # Environment variables
├── models/                    # MongoDB models
│   ├── User.js                # User model with authentication
│   ├── Book.js                # Book model with search indexing
│   ├── Transaction.js         # Transaction model with fine calculation
│   ├── Payment.js             # Payment model with Stripe integration
│   └── Report.js              # Report model with PDF generation
├── controllers/               # Business logic
│   ├── authController.js      # Authentication logic
│   ├── bookController.js      # Book management logic
│   ├── memberController.js    # Member management logic
│   ├── transactionController.js # Transaction logic
│   ├── paymentController.js   # Payment processing logic
│   ├── reportController.js    # Report generation logic
│   └── adminController.js     # Admin dashboard logic
├── routes/                    # API routes
│   ├── auth.js                # Authentication routes
│   ├── books.js               # Book routes
│   ├── members.js             # Member routes
│   ├── transactions.js        # Transaction routes
│   ├── payments.js            # Payment routes
│   ├── reports.js             # Report routes
│   └── admin.js               # Admin routes
├── middleware/                # Express middleware
│   └── auth.js                # Authentication middleware
├── utils/                     # Utility functions
│   ├── appError.js            # Custom error handling
│   └── catchAsync.js          # Async error handling
└── client/                    # React frontend
    ├── package.json           # Frontend dependencies
    ├── public/                # Static assets
    └── src/                   # React source code
        ├── components/        # React components
        │   ├── auth/          # Authentication components
        │   ├── books/         # Book management components
        │   ├── members/       # Member management components
        │   ├── transactions/  # Transaction components
        │   ├── payments/      # Payment components
        │   ├── reports/       # Report components
        │   ├── admin/         # Admin dashboard components
        │   ├── user/          # User profile components
        │   └── common/        # Shared components
        ├── App.js             # Main application
        ├── index.js           # Entry point
        └── App.css            # Global styles
```

## 🛠️ Technical Stack

### **Backend**
- **Node.js** with **Express.js** framework
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **Stripe API** for payment processing
- **PDFKit** for report generation
- **Sharp** for image processing
- **Multer** for file uploads

### **Frontend**
- **React.js** with functional components and hooks
- **React Router** for navigation
- **Bootstrap** and **React-Bootstrap** for UI components
- **Formik** and **Yup** for form validation
- **Axios** for API calls
- **Chart.js** and **React-Chartjs-2** for data visualization
- **React-Toastify** for notifications
- **React-Icons** for iconography

## 🔧 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/library-management-system.git
   cd library-management-system
   ```

2. **Install backend dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env`
   - Configure MongoDB connection, JWT secret, and Stripe keys

4. **Install frontend dependencies**:
   ```bash
   cd client
   npm install
   ```

5. **Run the application**:
   ```bash
   # From root directory
   npm run dev  # Runs both backend and frontend
   ```

## 📋 Key Features for Commercial Use

### **1. Role-Based Access Control**
- **Admin**: Full system access, user management, reporting, and settings
- **Librarian**: Book and member management, transaction processing
- **Member**: Personal profile, book browsing, and transaction history

### **2. Advanced Book Management**
- ISBN-based unique identification
- Comprehensive metadata (title, author, genre, publisher, etc.)
- Cover image uploads with automatic resizing
- Availability tracking and location management
- Full-text search capabilities

### **3. Member Management**
- Membership status tracking (active, expired, suspended)
- Membership ID generation
- Profile management with photo uploads
- Transaction history and fine tracking

### **4. Transaction System**
- Book borrowing with due date calculation
- Return processing with fine calculation ($1/day)
- Renewal functionality
- Reservation system
- Overdue tracking and notifications

### **5. Payment Integration**
- Stripe payment processing
- Membership fee payments
- Fine payments
- Book purchase payments
- Payment history and receipts

### **6. Reporting System**
- Daily/Monthly transaction reports
- Overdue books reports with fine calculations
- Popular books analysis
- Financial summaries with revenue breakdown
- PDF report generation and download

### **7. Admin Dashboard**
- Comprehensive system statistics
- User management and permissions
- System settings configuration
- Audit logging
- Database backup functionality

## 💰 Commercial Features

### **1. Subscription Model Ready**
- Built-in membership management
- Recurring payment support via Stripe
- Membership expiry tracking
- Automated renewal reminders

### **2. Multi-Library Support**
- Configurable library settings
- Custom branding options
- Scalable architecture for multiple branches

### **3. Advanced Analytics**
- Usage statistics and trends
- Popular book analysis
- Member engagement metrics
- Financial performance tracking

### **4. Security Features**
- JWT authentication with token expiration
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CSRF protection

### **5. Deployment Ready**
- Production-ready configuration
- Environment variable support
- Heroku deployment compatible
- Docker support (Dockerfile included)

## 🎯 Target Market

- Public libraries
- University/college libraries
- School libraries
- Private book collections
- Corporate libraries
- Research institutions

## 📈 Business Model

1. **One-time Purchase**: Sell the complete system with source code
2. **Subscription Model**: Monthly/annual licensing with updates and support
3. **Custom Development**: Offer customization services for specific library needs
4. **Hosted Solution**: Provide cloud-hosted version with SaaS pricing

## 🚀 Getting Started

To start using the Library Management System:

1. Install the required dependencies
2. Configure your MongoDB connection
3. Set up Stripe for payment processing
4. Customize the system settings
5. Add your library's book collection
6. Start managing your library professionally!

## 📝 License

This software is designed for commercial use. Contact us for licensing options and customization services.

---

**Professional Library Management System** - The complete solution for modern library management!
