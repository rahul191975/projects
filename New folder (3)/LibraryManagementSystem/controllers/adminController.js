const User = require('../models/User');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');
const Payment = require('../models/Payment');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getDashboardStats = catchAsync(async (req, res, next) => {
  // Only admins can access dashboard stats
  if (req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startOfYear = new Date(currentDate.getFullYear(), 0, 1);

  // Calculate statistics
  const [
    totalBooks,
    totalMembers,
    totalTransactions,
    totalPayments,
    monthlyTransactions,
    yearlyTransactions,
    monthlyPayments,
    yearlyPayments,
    overdueTransactions,
    activeMemberships,
    expiredMemberships
  ] = await Promise.all([
    Book.countDocuments(),
    User.countDocuments({ role: 'member' }),
    Transaction.countDocuments(),
    Payment.countDocuments(),
    Transaction.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Transaction.countDocuments({ createdAt: { $gte: startOfYear } }),
    Payment.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Payment.countDocuments({ createdAt: { $gte: startOfYear } }),
    Transaction.countDocuments({
      status: 'active',
      dueDate: { $lt: currentDate },
      transactionType: 'borrow'
    }),
    User.countDocuments({
      role: 'member',
      membershipStatus: 'active',
      membershipExpiry: { $gt: currentDate }
    }),
    User.countDocuments({
      role: 'member',
      membershipStatus: 'expired',
      membershipExpiry: { $lt: currentDate }
    })
  ]);

  // Calculate revenue statistics
  const revenueStats = await Payment.aggregate([
    {
      $match: {
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        monthlyRevenue: {
          $sum: {
            $cond: [{ $gte: ['$createdAt', startOfMonth] }, '$amount', 0]
          }
        },
        yearlyRevenue: {
          $sum: {
            $cond: [{ $gte: ['$createdAt', startOfYear] }, '$amount', 0]
          }
        }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      statistics: {
        books: {
          total: totalBooks
        },
        members: {
          total: totalMembers,
          active: activeMemberships,
          expired: expiredMemberships
        },
        transactions: {
          total: totalTransactions,
          monthly: monthlyTransactions,
          yearly: yearlyTransactions,
          overdue: overdueTransactions
        },
        payments: {
          total: totalPayments,
          monthly: monthlyPayments,
          yearly: yearlyPayments,
          totalRevenue: revenueStats[0]?.totalRevenue || 0,
          monthlyRevenue: revenueStats[0]?.monthlyRevenue || 0,
          yearlyRevenue: revenueStats[0]?.yearlyRevenue || 0
        }
      }
    }
  });
});

exports.getSystemSettings = catchAsync(async (req, res, next) => {
  // Only admins can access system settings
  if (req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  // In a real application, these would be stored in the database
  const systemSettings = {
    libraryName: process.env.LIBRARY_NAME || 'Library Management System',
    libraryAddress: process.env.LIBRARY_ADDRESS || '123 Library Street, Book City',
    libraryPhone: process.env.LIBRARY_PHONE || '+1 (555) 123-4567',
    libraryEmail: process.env.LIBRARY_EMAIL || 'info@library.com',
    membershipSettings: {
      standardMembershipFee: parseFloat(process.env.STANDARD_MEMBERSHIP_FEE) || 50,
      premiumMembershipFee: parseFloat(process.env.PREMIUM_MEMBERSHIP_FEE) || 100,
      membershipDurationDays: parseInt(process.env.MEMBERSHIP_DURATION_DAYS) || 365,
      maxBooksPerMember: parseInt(process.env.MAX_BOOKS_PER_MEMBER) || 5,
      maxBorrowDays: parseInt(process.env.MAX_BORROW_DAYS) || 14
    },
    fineSettings: {
      dailyFineAmount: parseFloat(process.env.DAILY_FINE_AMOUNT) || 1,
      maxFineAmount: parseFloat(process.env.MAX_FINE_AMOUNT) || 50,
      fineGracePeriodDays: parseInt(process.env.FINE_GRACE_PERIOD_DAYS) || 3
    },
    notificationSettings: {
      overdueReminderDays: [1, 3, 7, 14],
      membershipExpiryReminderDays: [7, 14, 30],
      enableEmailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
      enableSMSNotifications: process.env.ENABLE_SMS_NOTIFICATIONS === 'true'
    }
  };

  res.status(200).json({
    status: 'success',
    data: {
      settings: systemSettings
    }
  });
});

exports.updateSystemSettings = catchAsync(async (req, res, next) => {
  // Only admins can update system settings
  if (req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  const { settings } = req.body;

  // In a real application, you would update these in the database
  // For this demo, we'll just return success

  res.status(200).json({
    status: 'success',
    message: 'System settings updated successfully',
    data: {
      settings
    }
  });
});

exports.createAdminUser = catchAsync(async (req, res, next) => {
  // Only admins can create other admin users
  if (req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  const { name, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User with this email already exists', 400));
  }

  // Create new admin user
  const newUser = await User.create({
    name,
    email,
    password,
    role: role || 'librarian'
  });

  // Remove password from output
  newUser.password = undefined;

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser
    }
  });
});

exports.getAllAdminUsers = catchAsync(async (req, res, next) => {
  // Only admins can view admin users
  if (req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  const adminUsers = await User.find({
    role: { $in: ['admin', 'librarian'] }
  }).select('-password -__v');

  res.status(200).json({
    status: 'success',
    results: adminUsers.length,
    data: {
      users: adminUsers
    }
  });
});

exports.getAuditLog = catchAsync(async (req, res, next) => {
  // Only admins can view audit logs
  if (req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  // Filtering options
  const { userId, actionType, startDate, endDate, limit = 50 } = req.query;

  // Build query
  const query = {};

  if (userId) query.userId = userId;
  if (actionType) query.actionType = actionType;
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }

  // In a real application, you would query the audit log collection
  // For this demo, we'll return a mock response

  const auditLog = [
    {
      _id: '1',
      userId: req.user._id,
      userName: req.user.name,
      actionType: 'login',
      description: 'User logged in to the system',
      timestamp: new Date(),
      ipAddress: '192.168.1.1'
    },
    {
      _id: '2',
      userId: req.user._id,
      userName: req.user.name,
      actionType: 'create_book',
      description: 'Added a new book to the library',
      timestamp: new Date(Date.now() - 3600000),
      ipAddress: '192.168.1.1'
    }
  ];

  res.status(200).json({
    status: 'success',
    results: auditLog.length,
    data: {
      auditLog
    }
  });
});

exports.getDatabaseBackup = catchAsync(async (req, res, next) => {
  // Only admins can create database backups
  if (req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  // In a real application, you would create a database backup
  // For this demo, we'll return a mock response

  res.status(200).json({
    status: 'success',
    message: 'Database backup initiated successfully',
    data: {
      backupId: 'backup_' + Date.now(),
      status: 'processing',
      timestamp: new Date()
    }
  });
});
