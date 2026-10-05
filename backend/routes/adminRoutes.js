const express = require("express");

const router = express.Router();

const adminMiddleware = require("../middleware/adminMiddleware");
const User = require("../models/User");

// ==========================================
// ADMIN DASHBOARD
// ==========================================

router.get(
  "/dashboard",
  adminMiddleware,
  async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();

      const totalStudents =
        await User.countDocuments({
          role: "student",
        });

      const totalAdmins =
        await User.countDocuments({
          role: "admin",
        });

      res.json({
        success: true,
        message: "Admin dashboard data loaded.",
        stats: {
          totalUsers,
          totalStudents,
          totalAdmins,
        },
      });

    } catch (error) {
      console.error(
        "Admin Dashboard Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to load admin dashboard.",
      });
    }
  }
);

// ==========================================
// GET ALL USERS
// ==========================================

router.get(
  "/users",
  adminMiddleware,
  async (req, res) => {
    try {
      const users = await User.find()
        .select("-password -resetCode")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        users,
      });
    } catch (error) {
      console.error(
        "Admin Users Error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Unable to load users.",
      });
    }
  }
);


// ==========================================
// DELETE USER
// ==========================================

router.delete(
  "/users/:id",
  adminMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Prevent admin from deleting their own account
      if (req.user._id.toString() === id) {
        return res.status(400).json({
          success: false,
          message:
            "You cannot delete your own admin account.",
        });
      }

      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      await User.findByIdAndDelete(id);

      res.json({
        success: true,
        message: "User deleted successfully.",
      });

    } catch (error) {
      console.error(
        "Delete User Error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Unable to delete user.",
      });
    }
  }
);
module.exports = router;
