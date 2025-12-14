# 🚀 Library Management System - Setup Guide

## 📋 Requirements

### **Software Requirements**
- Node.js (v16 or higher)
- npm (comes with Node.js)
- MongoDB (v5.0 or higher)
- Git (optional, for cloning)

### **Hardware Requirements**
- Minimum 4GB RAM
- 2GB free disk space
- Modern web browser (Chrome, Firefox, Edge, Safari)

## 🛠️ Installation Steps

### **1. Install Prerequisites**

#### **Windows**
1. Download and install Node.js from [https://nodejs.org](https://nodejs.org)
2. Install MongoDB Community Edition from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
3. Make sure MongoDB service is running

#### **Mac/Linux**
```bash
# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
sudo apt-get install -y mongodb
sudo systemctl start mongod
sudo systemctl enable mongod
```

### **2. Set Up the Project**

#### **Option A: Clone from GitHub (if available)**
```bash
git clone https://github.com/your-repo/library-management-system.git
cd library-management-system
```

#### **Option B: Use the provided files**
1. Extract the LibraryManagementSystem folder from the provided files
2. Open terminal/command prompt and navigate to the folder:
   ```bash
   cd path/to/LibraryManagementSystem
   ```

### **3. Install Backend Dependencies**
```bash
npm install
```

### **4. Install Frontend Dependencies**
```bash
cd client
npm install
cd ..
```

### **5. Configure Environment Variables**

1. Copy the `.env.example` file to `.env` (if not already provided)
2. Edit the `.env` file with your configuration:

```env
# Database configuration
MONGODB_URI=mongodb://localhost:27017/library_management
JWT_SECRET=your_strong_jwt_secret_key_here
JWT_EXPIRE=30d

# Stripe payment configuration (get these from Stripe dashboard)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLIC_KEY=your_stripe_public_key

# Admin credentials (change these in production)
ADMIN_EMAIL=admin@library.com
ADMIN_PASSWORD=admin123

# Application settings
NODE_ENV=development
PORT=5000

# Library information
LIBRARY_NAME=Your Library Name
LIBRARY_ADDRESS=Your Library Address
LIBRARY_PHONE=Your Library Phone
LIBRARY_EMAIL=Your Library Email

# Membership settings
STANDARD_MEMBERSHIP_FEE=50
PREMIUM_MEMBERSHIP_FEE=100
MEMBERSHIP_DURATION_DAYS=365
MAX_BOOKS_PER_MEMBER=5
MAX_BORROW_DAYS=14

# Fine settings
DAILY_FINE_AMOUNT=1
MAX_FINE_AMOUNT=50
FINE_GRACE_PERIOD_DAYS=3

# Notification settings
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_SMS_NOTIFICATIONS=false
```

### **6. Create Required Directories**
```bash
mkdir -p public/uploads
mkdir -p public/img/books
mkdir -p public/img/users
mkdir -p public/reports
```

## 🚀 Running the Application

### **Development Mode (Recommended for Testing)**
```bash
npm run dev
```

This will:
1. Start the backend server on port 5000
2. Start the frontend development server on port 3000
3. Automatically open the application in your browser

### **Production Mode**
```bash
# Build the frontend
cd client
npm run build
cd ..

# Start the server
npm start
```

The application will be available at `http://localhost:5000`

## 📝 First Time Setup

### **1. Create Admin User**
After starting the application for the first time:

1. Register as a regular user
2. Manually update your role to 'admin' in the MongoDB database:
   ```bash
   # Connect to MongoDB
   mongosh

   # Update user role
   use library_management
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```

### **2. Add Sample Data (Optional)**
You can add sample books and members to test the system:

```javascript
// Sample book data to add via API or directly to MongoDB
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "9780743273565",
  "publisher": "Scribner",
  "publicationYear": 1925,
  "genre": ["Fiction", "Classic"],
  "description": "A story of wealth, love, and the American Dream in the 1920s.",
  "totalCopies": 5,
  "availableCopies": 5,
  "price": 12.99,
  "format": "Paperback",
  "pages": 180
}
```

## 🌐 Accessing the Application

- **Frontend**: `http://localhost:5000` (production) or `http://localhost:3000` (development)
- **Backend API**: `http://localhost:5000/api`
- **MongoDB**: `mongodb://localhost:27017`

## 📋 Default Credentials

After setup, you can use these credentials to test:

### **Admin User**
- Email: `admin@library.com`
- Password: `admin123`

### **Regular User**
- Register with any email and password

## 🔧 Common Issues and Solutions

### **1. MongoDB Connection Issues**
**Error**: `MongoDB connection error`
**Solution**:
- Make sure MongoDB service is running
- Check the connection string in `.env`
- Try `mongodb://127.0.0.1:27017/library_management` instead of `localhost`

### **2. Port Already in Use**
**Error**: `Port 5000 already in use`
**Solution**:
- Change the port in `.env` to something else (e.g., `PORT=5001`)
- Or kill the process using the port:
  ```bash
  # Linux/Mac
  sudo lsof -i :5000
  kill -9 <PID>

  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```

### **3. Node Modules Installation Issues**
**Error**: `npm install` fails
**Solution**:
- Delete `node_modules` and `package-lock.json`
- Run `npm cache clean --force`
- Try `npm install` again
- If still failing, try `npm install --legacy-peer-deps`

### **4. CORS Issues**
**Error**: CORS-related errors in browser console
**Solution**:
- Make sure the frontend proxy is set correctly in `client/package.json`
- Ensure the backend has CORS middleware enabled (it should be in `server.js`)

## 📈 Deployment Options

### **1. Local Deployment**
Follow the steps above to run on your local machine.

### **2. Cloud Deployment (Heroku)**
1. Create a Heroku account
2. Install Heroku CLI
3. Create a new Heroku app
4. Add MongoDB add-on (e.g., MongoDB Atlas)
5. Set up environment variables in Heroku settings
6. Push your code to Heroku

### **3. Docker Deployment**
1. Create a Dockerfile (provided in the project)
2. Build the Docker image:
   ```bash
   docker build -t library-management-system .
   ```
3. Run the container:
   ```bash
   docker run -p 5000:5000 -d library-management-system
   ```

## 🎯 Testing the System

### **1. User Registration and Login**
- Register a new user
- Login with the credentials
- Verify profile information

### **2. Book Management**
- Add new books (admin/librarian)
- Search for books
- View book details

### **3. Member Management**
- View member list (admin/librarian)
- Update member information
- Check membership status

### **4. Transaction Processing**
- Borrow books
- Return books
- Check overdue books
- Calculate fines

### **5. Payment Processing**
- Make membership payments
- Pay fines
- View payment history

### **6. Reporting**
- Generate daily/monthly reports
- Check overdue books
- View financial summaries

## 📚 Documentation

- **README.md**: Overview of the system
- **SETUP_GUIDE.md**: This installation guide
- **API Documentation**: Available at `/api-docs` when running (if Swagger is configured)

## 🆘 Support

For any issues or questions:
- Check the troubleshooting section above
- Review the error messages carefully
- Consult the documentation
- Contact support if you have a commercial license

---

**Congratulations!** Your Library Management System is now ready to use. 🎉

The system provides a complete solution for managing libraries of all sizes, with professional features for book management, member tracking, transactions, payments, and reporting.
