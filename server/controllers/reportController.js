const Report = require('../models/Report');

// @desc    Submit report against user or project
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res, next) => {
  try {
    const { reportedUser, project, reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Reason for report is required' });
    }

    const report = await Report.create({
      reporter: req.user._id,
      reportedUser: reportedUser || null,
      project: project || null,
      reason
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully for admin review.',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reports (Admin)
// @route   GET /api/reports
// @access  Private / Admin
const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'name email username')
      .populate('reportedUser', 'name email username department')
      .populate('project', 'title category owner')
      .sort('-createdAt');

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update report status (Admin)
// @route   PUT /api/reports/:id
// @access  Private / Admin
const updateReportStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.status = status;
    await report.save();

    res.json({
      success: true,
      message: `Report status updated to ${status}`,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  getReports,
  updateReportStatus
};
