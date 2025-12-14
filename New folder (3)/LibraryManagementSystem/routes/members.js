const express = require('express');
const memberController = require('../controllers/memberController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protected routes (require authentication)
router.use(authController.protect);

router.get('/me', memberController.getMemberProfile);
router.patch(
  '/update-me',
  memberController.uploadProfileImage,
  memberController.resizeProfileImage,
  memberController.updateMember
);

// Admin and librarian only routes
router.use(authController.restrictTo('admin', 'librarian'));

router.get('/', memberController.getAllMembers);
router.get('/overdue', memberController.getMembersWithOverdueBooks);
router.get('/:id', memberController.getMember);
router.patch('/:id', memberController.updateMember);
router.patch('/:id/membership', memberController.updateMembershipStatus);

module.exports = router;
