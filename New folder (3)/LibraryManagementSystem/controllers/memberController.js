const User = require('../models/User');
const Transaction = require('../models/Transaction');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const sharp = require('sharp');

// Configure multer for profile image uploads
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadProfileImage = upload.single('profileImage');

exports.resizeProfileImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(300, 300)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

exports.getAllMembers = catchAsync(async (req, res, next) => {
  // Only admins and librarians can see all members
  if (req.user.role !== 'admin' && req.user.role !== 'librarian') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  const members = await User.find({ role: 'member' })
    .select('-password -__v')
    .sort('name');

  res.status(200).json({
    status: 'success',
    results: members.length,
    data: {
      members
    }
  });
});

exports.getMember = catchAsync(async (req, res, next) => {
  const memberId = req.params.id;

  // Check if user has permission to view this member
  if (req.user.role !== 'admin' && req.user.role !== 'librarian' && memberId !== req.user._id.toString()) {
    return next(new AppError('You do not have permission to view this member', 403));
  }

  const member = await User.findById(memberId).select('-password -__v');

  if (!member) {
    return next(new AppError('No member found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      member
    }
  });
});

exports.updateMember = catchAsync(async (req, res, next) => {
  const memberId = req.params.id;

  // Check if user has permission to update this member
  if (req.user.role !== 'admin' && req.user.role !== 'librarian' && memberId !== req.user._id.toString()) {
    return next(new AppError('You do not have permission to update this member', 403));
  }

  // Add profile image if uploaded
  if (req.file) req.body.profileImage = req.file.filename;

  const member = await User.findByIdAndUpdate(
    memberId,
    {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      profileImage: req.body.profileImage,
      membershipStatus: req.body.membershipStatus,
      membershipExpiry: req.body.membershipExpiry
    },
    {
      new: true,
      runValidators: true
    }
  ).select('-password -__v');

  if (!member) {
    return next(new AppError('No member found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      member
    }
  });
});

exports.getMemberProfile = catchAsync(async (req, res, next) => {
  // Get current user's profile
  const member = await User.findById(req.user._id)
    .select('-password -__v')
    .populate({
      path: 'transactions',
      select: 'book transactionType status dueDate returnDate'
    });

  if (!member) {
    return next(new AppError('No member found with that ID', 404));
  }

  // Get active transactions count
  const activeTransactions = await Transaction.countDocuments({
    member: member._id,
    status: 'active'
  });

  // Get overdue transactions count
  const currentDate = new Date();
  const overdueTransactions = await Transaction.countDocuments({
    member: member._id,
    status: 'active',
    dueDate: { $lt: currentDate }
  });

  res.status(200).json({
    status: 'success',
    data: {
      member,
      statistics: {
        activeTransactions,
        overdueTransactions,
        totalTransactions: member.transactions.length
      }
    }
  });
});

exports.updateMembershipStatus = catchAsync(async (req, res, next) => {
  // Only admins and librarians can update membership status
  if (req.user.role !== 'admin' && req.user.role !== 'librarian') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  const { memberId, status, expiryDate } = req.body;

  const member = await User.findByIdAndUpdate(
    memberId,
    {
      membershipStatus: status,
      membershipExpiry: expiryDate
    },
    {
      new: true,
      runValidators: true
    }
  ).select('-password -__v');

  if (!member) {
    return next(new AppError('No member found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      member
    }
  });
});

exports.getMembersWithOverdueBooks = catchAsync(async (req, res, next) => {
  // Only admins and librarians can access this
  if (req.user.role !== 'admin' && req.user.role !== 'librarian') {
    return next(new AppError('You do not have permission to perform this action', 403));
  }

  const currentDate = new Date();

  // Find members with overdue transactions
  const members = await User.aggregate([
    {
      $lookup: {
        from: 'transactions',
        localField: '_id',
        foreignField: 'member',
        as: 'transactions'
      }
    },
    {
      $match: {
        role: 'member',
        'transactions.status': 'active',
        'transactions.dueDate': { $lt: currentDate },
        'transactions.transactionType': 'borrow'
      }
    },
    {
      $project: {
        name: 1,
        email: 1,
        membershipId: 1,
        phone: 1,
        membershipStatus: 1,
        overdueTransactions: {
          $filter: {
            input: '$transactions',
            as: 'transaction',
            cond: {
              $and: [
                { $eq: ['$$transaction.status', 'active'] },
                { $lt: ['$$transaction.dueDate', currentDate] },
                { $eq: ['$$transaction.transactionType', 'borrow'] }
              ]
            }
          }
        }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    results: members.length,
    data: {
      members
    }
  });
});
