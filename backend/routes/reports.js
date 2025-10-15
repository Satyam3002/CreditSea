const express = require('express');
const CreditReport = require('../models/CreditReport');
const { query, validationResult } = require('express-validator');

const router = express.Router();

/**
 * GET /api/reports
 * Get all credit reports with optional filtering and pagination
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('sortBy').optional().isIn(['name', 'creditScore', 'processedAt', 'pan']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'processedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { pan: { $regex: search, $options: 'i' } },
        { mobilePhone: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const reports = await CreditReport.find(query)
      .select('-xmlData') // Exclude large XML data
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count for pagination
    const total = await CreditReport.countDocuments(query);

    res.json({
      success: true,
      data: reports,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports',
      message: error.message
    });
  }
});

/**
 * GET /api/reports/:id
 * Get specific credit report by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid report ID format'
      });
    }

    const report = await CreditReport.findById(id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Credit report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report',
      message: error.message
    });
  }
});

/**
 * GET /api/reports/pan/:pan
 * Get credit report by PAN number
 */
router.get('/pan/:pan', async (req, res) => {
  try {
    const { pan } = req.params;
    
    if (!pan || pan.length !== 10) {
      return res.status(400).json({
        success: false,
        error: 'PAN must be exactly 10 characters'
      });
    }

    const report = await CreditReport.findOne({ 
      pan: pan.toUpperCase() 
    }).select('-xmlData');
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Credit report not found for this PAN'
      });
    }

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Error fetching report by PAN:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report',
      message: error.message
    });
  }
});

/**
 * GET /api/reports/stats/summary
 * Get summary statistics
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await CreditReport.aggregate([
      {
        $group: {
          _id: null,
          totalReports: { $sum: 1 },
          avgCreditScore: { $avg: '$creditScore' },
          maxCreditScore: { $max: '$creditScore' },
          minCreditScore: { $min: '$creditScore' },
          totalCurrentBalance: { $sum: '$reportSummary.currentBalanceAmount' },
          totalAccounts: { $sum: '$reportSummary.totalAccounts' },
          totalActiveAccounts: { $sum: '$reportSummary.activeAccounts' }
        }
      }
    ]);

    // Get recent reports count (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentReports = await CreditReport.countDocuments({
      processedAt: { $gte: sevenDaysAgo }
    });

    const result = stats[0] || {
      totalReports: 0,
      avgCreditScore: 0,
      maxCreditScore: 0,
      minCreditScore: 0,
      totalCurrentBalance: 0,
      totalAccounts: 0,
      totalActiveAccounts: 0
    };

    res.json({
      success: true,
      data: {
        ...result,
        recentReports,
        _id: undefined // Remove the aggregation _id
      }
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

/**
 * GET /api/reports/stats/credit-score-distribution
 * Get credit score distribution
 */
router.get('/stats/credit-score-distribution', async (req, res) => {
  try {
    const distribution = await CreditReport.aggregate([
      {
        $bucket: {
          groupBy: '$creditScore',
          boundaries: [300, 400, 500, 600, 700, 800, 900],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            avgBalance: { $avg: '$reportSummary.currentBalanceAmount' }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: distribution
    });

  } catch (error) {
    console.error('Error fetching credit score distribution:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch credit score distribution',
      message: error.message
    });
  }
});

/**
 * DELETE /api/reports/:id
 * Delete a credit report
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid report ID format'
      });
    }

    const report = await CreditReport.findByIdAndDelete(id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Credit report not found'
      });
    }

    res.json({
      success: true,
      message: 'Credit report deleted successfully',
      data: {
        id: report._id,
        name: report.name,
        pan: report.formattedPAN
      }
    });

  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete report',
      message: error.message
    });
  }
});

module.exports = router;

