const express = require("express");
const InterviewSchedule = require("../models/InterviewSchedule");

const router = express.Router();

/*
  CREATE INTERVIEW SCHEDULE
  POST /api/schedules
*/
router.post("/", async (req, res) => {
  try {
    const { userId, title, type, date, time, notes } = req.body;

    if (!userId || !title || !type || !date || !time) {
      return res.status(400).json({
        message: "Please fill in all required fields.",
      });
    }

    const schedule = await InterviewSchedule.create({
      user: userId,
      title,
      type,
      date,
      time,
      notes: notes || "",
      status: "upcoming",
    });

    res.status(201).json({
      message: "Interview scheduled successfully.",
      schedule,
    });
  } catch (error) {
    console.error("Create schedule error:", error);

    res.status(500).json({
      message: "Failed to create interview schedule.",
    });
  }
});

/*
  GET ALL USER SCHEDULES
  GET /api/schedules/:userId
*/
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const schedules = await InterviewSchedule.find({
      user: userId,
    }).sort({
      date: 1,
      time: 1,
    });

    res.json({
      schedules,
    });
  } catch (error) {
    console.error("Get schedules error:", error);

    res.status(500).json({
      message: "Failed to fetch interview schedules.",
    });
  }
});

/*
  UPDATE INTERVIEW SCHEDULE
  PUT /api/schedules/:id
*/
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      type,
      date,
      time,
      notes,
      status,
    } = req.body;

    const schedule = await InterviewSchedule.findByIdAndUpdate(
      id,
      {
        title,
        type,
        date,
        time,
        notes,
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!schedule) {
      return res.status(404).json({
        message: "Interview schedule not found.",
      });
    }

    res.json({
      message: "Interview schedule updated successfully.",
      schedule,
    });
  } catch (error) {
    console.error("Update schedule error:", error);

    res.status(500).json({
      message: "Failed to update interview schedule.",
    });
  }
});

/*
  DELETE / CANCEL INTERVIEW SCHEDULE
  DELETE /api/schedules/:id
*/
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await InterviewSchedule.findByIdAndUpdate(
      id,
      {
        status: "cancelled",
      },
      {
        new: true,
      }
    );

    if (!schedule) {
      return res.status(404).json({
        message: "Interview schedule not found.",
      });
    }

    res.json({
      message: "Interview schedule cancelled successfully.",
      schedule,
    });
  } catch (error) {
    console.error("Cancel schedule error:", error);

    res.status(500).json({
      message: "Failed to cancel interview schedule.",
    });
  }
});

module.exports = router;