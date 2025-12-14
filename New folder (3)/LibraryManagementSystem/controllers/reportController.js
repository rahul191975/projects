const Report = require('../models/Report');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Payment = require('../models/Payment');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generateDailyTransactionsReport = catchAsync(async (req, res, next) => {
  // Only admins and librarians can generate reports
  if (req.user.role !== 'admin' && req.user.role !== 'librarian') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  const date = req.query.date ? new Date(req.query.date) : new Date();
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));

  // Get daily transactions
  const transactions = await Transaction.find({
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  })
  .populate('book', 'title author isbn')
  .populate('member', 'name email membershipId')
  .populate('processedBy', 'name email');

  // Generate report data
  const reportData = {
    date: startOfDay.toISOString().split('T')[0],
    totalTransactions: transactions.length,
    transactionsByType: {},
    transactions: transactions.map(t => ({
      id: t._id,
      book: t.book.title,
      member: t.member.name,
      type: t.transactionType,
      status: t.status,
      processedBy: t.processedBy.name
    }))
  };

  // Calculate transactions by type
  transactions.forEach(t => {
    reportData.transactionsByType[t.transactionType] =
      (reportData.transactionsByType[t.transactionType] || 0) + 1;
  });

  // Create report record
  const report = await Report.create({
    reportType: 'daily_transactions',
    generatedBy: req.user._id,
    startDate: startOfDay,
    endDate: endOfDay,
    data: reportData,
    status: 'completed'
  });

  res.status(201).json({
    status: 'success',
    data: {
      report
    }
  });
});

exports.generateMonthlyTransactionsReport = catchAsync(async (req, res, next) => {
  // Only admins and librarians can generate reports
  if (req.user.role !== 'admin' && req.user.role !== 'librarian') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  const year = req.query.year || new Date().getFullYear();
  const month = req.query.month || new Date().getMonth();

  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

  // Get monthly transactions
  const transactions = await Transaction.find({
    createdAt: { $gte: startOfMonth, $lte: endOfMonth }
  })
  .populate('book', 'title author')
  .populate('member', 'name membershipId');

  // Generate report data
  const reportData = {
    month: startOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' }),
    totalTransactions: transactions.length,
    transactionsByType: {},
    transactionsByDay: {},
    popularBooks: {},
    activeMembers: new Set()
  };

  // Process transactions
  transactions.forEach(t => {
    // Transactions by type
    reportData.transactionsByType[t.transactionType] =
      (reportData.transactionsByType[t.transactionType] || 0) + 1;

    // Transactions by day
    const day = new Date(t.createdAt).toISOString().split('T')[0];
    reportData.transactionsByDay[day] = (reportData.transactionsByDay[day] || 0) + 1;

    // Popular books
    if (t.book) {
      const bookKey = `${t.book.title} by ${t.book.author}`;
      reportData.popularBooks[bookKey] = (reportData.popularBooks[bookKey] || 0) + 1;
    }

    // Active members
    if (t.member) {
      reportData.activeMembers.add(t.member._id.toString());
    }
  });

  // Convert sets to arrays and sort
  reportData.popularBooks = Object.entries(reportData.popularBooks)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  reportData.activeMembersCount = reportData.activeMembers.size;

  // Create report record
  const report = await Report.create({
    reportType: 'monthly_transactions',
    generatedBy: req.user._id,
    startDate: startOfMonth,
    endDate: endOfMonth,
    data: reportData,
    status: 'completed'
  });

  res.status(201).json({
    status: 'success',
    data: {
      report
    }
  });
});

exports.generateOverdueBooksReport = catchAsync(async (req, res, next) => {
  // Only admins and librarians can generate reports
  if (req.user.role !== 'admin' && req.user.role !== 'librarian') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  const currentDate = new Date();

  // Get overdue transactions
  const overdueTransactions = await Transaction.find({
    status: 'active',
    dueDate: { $lt: currentDate },
    transactionType: 'borrow'
  })
  .populate('book', 'title author isbn')
  .populate('member', 'name email membershipId phone');

  // Generate report data
  const reportData = {
    generatedAt: currentDate.toISOString(),
    totalOverdue: overdueTransactions.length,
    totalFines: overdueTransactions.reduce((sum, t) => sum + (t.fineAmount || 0), 0),
    overdueByMember: {},
    overdueBooks: overdueTransactions.map(t => ({
      book: t.book.title,
      author: t.book.author,
      isbn: t.book.isbn,
      member: t.member.name,
      membershipId: t.member.membershipId,
      dueDate: t.dueDate,
      daysOverdue: Math.ceil((currentDate - new Date(t.dueDate)) / (1000 * 60 * 60 * 24)),
      fineAmount: t.fineAmount || 0,
      memberPhone: t.member.phone
    }))
  };

  // Calculate overdue books by member
  overdueTransactions.forEach(t => {
    const memberKey = `${t.member.name} (${t.member.membershipId})`;
    reportData.overdueByMember[memberKey] = (reportData.overdueByMember[memberKey] || 0) + 1;
  });

  // Create report record
  const report = await Report.create({
    reportType: 'overdue_books',
    generatedBy: req.user._id,
    data: reportData,
    status: 'completed'
  });

  res.status(201).json({
    status: 'success',
    data: {
      report
    }
  });
});

exports.generatePopularBooksReport = catchAsync(async (req, res, next) => {
  // Only admins and librarians can generate reports
  if (req.user.role !== 'admin' && req.user.role !== 'librarian') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  const timeRange = req.query.timeRange || 'all';
  let startDate;

  const currentDate = new Date();

  switch (timeRange) {
    case 'week':
      startDate = new Date(currentDate);
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(currentDate);
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'year':
      startDate = new Date(currentDate);
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate = new Date(0); // All time
  }

  // Get popular books based on transactions
  const popularBooks = await Transaction.aggregate([
    {
      $match: {
        transactionType: 'borrow',
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$book',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 20
    },
    {
      $lookup: {
        from: 'books',
        localField: '_id',
        foreignField: '_id',
        as: 'book'
      }
    },
    {
      $unwind: '$book'
    },
    {
      $project: {
        title: '$book.title',
        author: '$book.author',
        isbn: '$book.isbn',
        genre: '$book.genre',
        borrowCount: '$count'
      }
    }
  ]);

  // Generate report data
  const reportData = {
    timeRange,
    startDate: startDate.toISOString(),
    endDate: currentDate.toISOString(),
    popularBooks,
    totalBooksBorrowed: popularBooks.reduce((sum, book) => sum + book.borrowCount, 0)
  };

  // Create report record
  const report = await Report.create({
    reportType: 'popular_books',
    generatedBy: req.user._id,
    startDate,
    endDate: currentDate,
    data: reportData,
    status: 'completed'
  });

  res.status(201).json({
    status: 'success',
    data: {
      report
    }
  });
});

exports.generateFinancialSummaryReport = catchAsync(async (req, res, next) => {
  // Only admins and librarians can generate reports
  if (req.user.role !== 'admin' && req.user.role !== 'librarian') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  const timeRange = req.query.timeRange || 'month';
  let startDate, endDate = new Date();

  switch (timeRange) {
    case 'week':
      startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(endDate.getFullYear(), 0, 1);
      break;
    case 'quarter':
      const currentMonth = endDate.getMonth();
      const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
      startDate = new Date(endDate.getFullYear(), quarterStartMonth, 1);
      break;
    default:
      startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  }

  // Get financial data
  const [payments, membershipPayments, finePayments, bookSales] = await Promise.all([
    Payment.find({
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'completed'
    }),
    Payment.find({
      createdAt: { $gte: startDate, $lte: endDate },
      paymentType: 'membership_fee',
      status: 'completed'
    }),
    Payment.find({
      createdAt: { $gte: startDate, $lte: endDate },
      paymentType: 'fine',
      status: 'completed'
    }),
    Payment.find({
      createdAt: { $gte: startDate, $lte: endDate },
      paymentType: 'book_purchase',
      status: 'completed'
    })
  ]);

  // Generate report data
  const reportData = {
    timeRange,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
    totalPayments: payments.length,
    membershipRevenue: membershipPayments.reduce((sum, p) => sum + p.amount, 0),
    membershipPayments: membershipPayments.length,
    fineRevenue: finePayments.reduce((sum, p) => sum + p.amount, 0),
    finePayments: finePayments.length,
    bookSalesRevenue: bookSales.reduce((sum, p) => sum + p.amount, 0),
    bookSalesCount: bookSales.length,
    paymentMethods: {},
    revenueByDay: {}
  };

  // Calculate payment methods distribution
  payments.forEach(p => {
    reportData.paymentMethods[p.paymentMethod] =
      (reportData.paymentMethods[p.paymentMethod] || 0) + p.amount;
  });

  // Calculate revenue by day
  payments.forEach(p => {
    const day = new Date(p.createdAt).toISOString().split('T')[0];
    reportData.revenueByDay[day] = (reportData.revenueByDay[day] || 0) + p.amount;
  });

  // Create report record
  const report = await Report.create({
    reportType: 'financial_summary',
    generatedBy: req.user._id,
    startDate,
    endDate,
    data: reportData,
    status: 'completed'
  });

  res.status(201).json({
    status: 'success',
    data: {
      report
    }
  });
});

exports.getAllReports = catchAsync(async (req, res, next) => {
  // Only admins and librarians can view reports
  if (req.user.role !== 'admin' && req.user.role !== 'librarian') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  const reports = await Report.find()
    .populate('generatedBy', 'name email')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: reports.length,
    data: {
      reports
    }
  });
});

exports.getReport = catchAsync(async (req, res, next) => {
  const report = await Report.findById(req.params.id).populate('generatedBy', 'name email');

  if (!report) {
    return next(new AppError('No report found with that ID', 404));
  }

  // Only admins and librarians can view reports
  if (req.user.role !== 'admin' && req.user.role !== 'librarian') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      report
    }
  });
});

exports.generatePDFReport = catchAsync(async (req, res, next) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    return next(new AppError('No report found with that ID', 404));
  }

  // Only admins and librarians can generate PDF reports
  if (req.user.role !== 'admin' && req.user.role !== 'librarian') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  // Create PDF document
  const doc = new PDFDocument();
  const filePath = path.join(__dirname, '..', 'public', 'reports', `report-${report._id}.pdf`);
  const writeStream = fs.createWriteStream(filePath);

  doc.pipe(writeStream);
  doc.pipe(res);

  // Add content to PDF based on report type
  doc.fontSize(20).text(`Library Management System - ${report.reportType.replace('_', ' ')}`, { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`Generated on: ${new Date(report.createdAt).toLocaleString()}`);
  doc.fontSize(12).text(`Generated by: ${req.user.name}`);
  doc.moveDown();

  // Add report-specific content
  switch (report.reportType) {
    case 'daily_transactions':
      doc.fontSize(16).text('Daily Transactions Report');
      doc.fontSize(12).text(`Date: ${report.data.date}`);
      doc.fontSize(12).text(`Total Transactions: ${report.data.totalTransactions}`);
      doc.moveDown();

      doc.fontSize(14).text('Transactions by Type:');
      Object.entries(report.data.transactionsByType).forEach(([type, count]) => {
        doc.fontSize(12).text(`${type}: ${count}`);
      });
      break;

    case 'monthly_transactions':
      doc.fontSize(16).text('Monthly Transactions Report');
      doc.fontSize(12).text(`Month: ${report.data.month}`);
      doc.fontSize(12).text(`Total Transactions: ${report.data.totalTransactions}`);
      doc.fontSize(12).text(`Active Members: ${report.data.activeMembersCount}`);
      doc.moveDown();

      doc.fontSize(14).text('Top 10 Popular Books:');
      report.data.popularBooks.forEach(([book, count]) => {
        doc.fontSize(12).text(`${book}: ${count} borrows`);
      });
      break;

    case 'overdue_books':
      doc.fontSize(16).text('Overdue Books Report');
      doc.fontSize(12).text(`Generated: ${report.data.generatedAt}`);
      doc.fontSize(12).text(`Total Overdue Books: ${report.data.totalOverdue}`);
      doc.fontSize(12).text(`Total Fines: $${report.data.totalFines.toFixed(2)}`);
      doc.moveDown();

      doc.fontSize(14).text('Overdue Books:');
      report.data.overdueBooks.forEach(book => {
        doc.fontSize(12).text(`${book.book} by ${book.author} - ${book.member} (${book.daysOverdue} days overdue, $${book.fineAmount.toFixed(2)})`);
      });
      break;

    case 'financial_summary':
      doc.fontSize(16).text('Financial Summary Report');
      doc.fontSize(12).text(`Period: ${report.data.startDate} to ${report.data.endDate}`);
      doc.fontSize(12).text(`Total Revenue: $${report.data.totalRevenue.toFixed(2)}`);
      doc.fontSize(12).text(`Total Payments: ${report.data.totalPayments}`);
      doc.moveDown();

      doc.fontSize(14).text('Revenue Breakdown:');
      doc.fontSize(12).text(`Membership: $${report.data.membershipRevenue.toFixed(2)} (${report.data.membershipPayments} payments)`);
      doc.fontSize(12).text(`Fines: $${report.data.fineRevenue.toFixed(2)} (${report.data.finePayments} payments)`);
      doc.fontSize(12).text(`Book Sales: $${report.data.bookSalesRevenue.toFixed(2)} (${report.data.bookSalesCount} sales)`);
      break;

    default:
      doc.fontSize(16).text('Custom Report');
      doc.fontSize(12).text(JSON.stringify(report.data, null, 2));
  }

  doc.end();

  // Update report with file URL
  report.fileUrl = `/reports/report-${report._id}.pdf`;
  report.status = 'completed';
  await report.save();

  writeStream.on('finish', () => {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report-${report._id}.pdf"`);
  });
});
