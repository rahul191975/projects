const Payment = require('../models/Payment');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createPayment = catchAsync(async (req, res, next) => {
  const { userId, amount, paymentMethod, paymentType, notes, transactionId } = req.body;

  // Find user
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  // Create payment
  const payment = await Payment.create({
    user: userId,
    amount,
    paymentMethod,
    paymentType,
    notes,
    createdBy: req.user._id
  });

  // If payment is for a fine, mark the transaction as fine paid
  if (paymentType === 'fine' && transactionId) {
    const transaction = await Transaction.findById(transactionId);
    if (transaction) {
      transaction.finePaid = true;
      await transaction.save({ validateBeforeSave: false });
    }
  }

  res.status(201).json({
    status: 'success',
    data: {
      payment
    }
  });
});

exports.createStripePaymentIntent = catchAsync(async (req, res, next) => {
  const { amount, currency = 'usd', paymentMethodTypes = ['card'], description } = req.body;

  // Create a PaymentIntent with Stripe
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    payment_method_types: paymentMethodTypes,
    description: description || 'Library payment',
    metadata: {
      userId: req.user._id.toString(),
      paymentType: req.body.paymentType || 'membership_fee'
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    }
  });
});

exports.confirmStripePayment = catchAsync(async (req, res, next) => {
  const { paymentIntentId, userId, paymentType, amount, notes } = req.body;

  // Retrieve the PaymentIntent
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== 'succeeded') {
    return next(new AppError('Payment not successful', 400));
  }

  // Create payment record in database
  const payment = await Payment.create({
    user: userId,
    amount,
    paymentMethod: 'stripe',
    paymentType: paymentType || 'membership_fee',
    status: 'completed',
    stripePaymentIntentId: paymentIntentId,
    receiptUrl: paymentIntent.charges.data[0].receipt_url,
    notes,
    createdBy: req.user._id
  });

  // Update user membership if this is a membership payment
  if (paymentType === 'membership_fee') {
    const user = await User.findById(userId);
    if (user) {
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year membership

      user.membershipStatus = 'active';
      user.membershipExpiry = expiryDate;
      await user.save({ validateBeforeSave: false });
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      payment
    }
  });
});

exports.getAllPayments = catchAsync(async (req, res, next) => {
  // Build query based on user role
  let query;

  if (req.user.role === 'admin' || req.user.role === 'librarian') {
    // Admins and librarians can see all payments
    query = Payment.find();
  } else {
    // Members can only see their own payments
    query = Payment.find({ user: req.user._id });
  }

  // Filtering
  if (req.query.paymentType) {
    query = query.find({ paymentType: req.query.paymentType });
  }

  if (req.query.status) {
    query = query.find({ status: req.query.status });
  }

  if (req.query.paymentMethod) {
    query = query.find({ paymentMethod: req.query.paymentMethod });
  }

  // Date range filtering
  if (req.query.startDate && req.query.endDate) {
    query = query.find({
      createdAt: {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      }
    });
  }

  // Sorting
  if (req.query.sort) {
    query = query.sort(req.query.sort);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  // Execute query with population
  const payments = await query
    .populate('user', 'name email membershipId')
    .populate('createdBy', 'name email');

  res.status(200).json({
    status: 'success',
    results: payments.length,
    data: {
      payments
    }
  });
});

exports.getPayment = catchAsync(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id)
    .populate('user', 'name email membershipId')
    .populate('createdBy', 'name email');

  if (!payment) {
    return next(new AppError('No payment found with that ID', 404));
  }

  // Check if user has permission to view this payment
  if (req.user.role !== 'admin' && req.user.role !== 'librarian' && payment.user._id.toString() !== req.user._id.toString()) {
    return next(new AppError('You do not have permission to view this payment', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      payment
    }
  });
});

exports.getPaymentStats = catchAsync(async (req, res, next) => {
  // Only admins and librarians can access payment stats
  if (req.user.role !== 'admin' && req.user.role !== 'librarian') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  // Get current date and calculate date ranges
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startOfYear = new Date(currentDate.getFullYear(), 0, 1);

  // Calculate statistics
  const [totalPayments, monthlyPayments, yearlyPayments, totalAmount] = await Promise.all([
    Payment.countDocuments(),
    Payment.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Payment.countDocuments({ createdAt: { $gte: startOfYear } }),
    Payment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ])
  ]);

  // Calculate monthly revenue
  const monthlyRevenue = await Payment.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfMonth }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);

  // Calculate payment type distribution
  const paymentTypeDistribution = await Payment.aggregate([
    {
      $group: {
        _id: '$paymentType',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      statistics: {
        totalPayments: totalPayments || 0,
        monthlyPayments: monthlyPayments || 0,
        yearlyPayments: yearlyPayments || 0,
        totalRevenue: totalAmount[0]?.total || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        paymentTypeDistribution
      }
    }
  });
});
