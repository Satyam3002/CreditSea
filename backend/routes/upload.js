const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const CreditReport = require('../models/CreditReport');
const xmlParserService = require('../services/xmlParser');
const fs = require('fs').promises;

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype === 'text/xml' || 
        file.mimetype === 'application/xml' || 
        file.originalname.toLowerCase().endsWith('.xml')) {
      cb(null, true);
    } else {
      cb(new Error('Only XML files are allowed'), false);
    }
  }
});

// Validation middleware
const validateUpload = [
  upload.single('xmlFile'),
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No XML file uploaded'
      });
    }
    next();
  }
];

/**
 * POST /api/upload
 * Upload and process XML credit report file
 */
router.post('/', validateUpload, async (req, res) => {
  try {
    const { file } = req;
    
    // Convert buffer to string
    const xmlContent = file.buffer.toString('utf8');
    
    console.log(`Processing XML file: ${file.originalname}, Size: ${file.size} bytes`);
    
    // Parse XML content
    const parseResult = await xmlParserService.parseCreditReport(xmlContent, file.originalname);
    
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to parse XML file',
        details: parseResult.error
      });
    }
    
    const creditData = parseResult.data;
    
    // Validate extracted data
    const validation = xmlParserService.validateCreditData(creditData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid credit data',
        details: validation.errors
      });
    }
    
    // Check if report already exists (by PAN)
    const existingReport = await CreditReport.findOne({ pan: creditData.pan });
    
    let report;
    if (existingReport) {
      // Update existing report
      Object.assign(existingReport, creditData, {
        originalFileName: file.originalname,
        processedAt: new Date(),
        xmlData: parseResult.originalData
      });
      report = await existingReport.save();
      
      console.log(`Updated existing credit report for PAN: ${creditData.pan}`);
    } else {
      // Create new report
      report = new CreditReport({
        ...creditData,
        originalFileName: file.originalname,
        xmlData: parseResult.originalData
      });
      await report.save();
      
      console.log(`Created new credit report for PAN: ${creditData.pan}`);
    }
    
    // Return success response
    res.status(201).json({
      success: true,
      message: existingReport ? 'Credit report updated successfully' : 'Credit report created successfully',
      data: {
        id: report._id,
        name: report.name,
        pan: report.formattedPAN,
        creditScore: report.creditScore,
        totalAccounts: report.reportSummary.totalAccounts,
        currentBalance: report.reportSummary.currentBalanceAmount,
        processedAt: report.processedAt
      }
    });
    
  } catch (error) {
    console.error('Upload processing error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to process XML file',
      message: error.message
    });
  }
});

/**
 * POST /api/upload/batch
 * Upload multiple XML files
 */
router.post('/batch', upload.array('xmlFiles', 10), async (req, res) => {
  try {
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No XML files uploaded'
      });
    }
    
    const results = [];
    const errors = [];
    
    for (const file of files) {
      try {
        const xmlContent = file.buffer.toString('utf8');
        const parseResult = await xmlParserService.parseCreditReport(xmlContent, file.originalname);
        
        if (!parseResult.success) {
          errors.push({
            fileName: file.originalname,
            error: 'Failed to parse XML file'
          });
          continue;
        }
        
        const creditData = parseResult.data;
        const validation = xmlParserService.validateCreditData(creditData);
        
        if (!validation.isValid) {
          errors.push({
            fileName: file.originalname,
            error: 'Invalid credit data',
            details: validation.errors
          });
          continue;
        }
        
        // Check if report exists
        const existingReport = await CreditReport.findOne({ pan: creditData.pan });
        
        let report;
        if (existingReport) {
          Object.assign(existingReport, creditData, {
            originalFileName: file.originalname,
            processedAt: new Date(),
            xmlData: parseResult.originalData
          });
          report = await existingReport.save();
        } else {
          report = new CreditReport({
            ...creditData,
            originalFileName: file.originalname,
            xmlData: parseResult.originalData
          });
          await report.save();
        }
        
        results.push({
          fileName: file.originalname,
          success: true,
          data: {
            id: report._id,
            name: report.name,
            pan: report.formattedPAN
          }
        });
        
      } catch (fileError) {
        console.error(`Error processing file ${file.originalname}:`, fileError);
        errors.push({
          fileName: file.originalname,
          error: fileError.message
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Processed ${files.length} files`,
      results,
      errors,
      summary: {
        total: files.length,
        successful: results.length,
        failed: errors.length
      }
    });
    
  } catch (error) {
    console.error('Batch upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process batch upload',
      message: error.message
    });
  }
});

/**
 * GET /api/upload/sample
 * Get sample XML structure for testing
 */
router.get('/sample', (req, res) => {
  const sampleXML = `<?xml version="1.0" encoding="UTF-8"?>
<creditReport>
  <name>John Doe</name>
  <mobilePhone>9876543210</mobilePhone>
  <pan>ABCDE1234F</pan>
  <creditScore>750</creditScore>
  <reportSummary>
    <totalAccounts>5</totalAccounts>
    <activeAccounts>4</activeAccounts>
    <closedAccounts>1</closedAccounts>
    <currentBalanceAmount>150000</currentBalanceAmount>
    <securedAccountsAmount>50000</securedAccountsAmount>
    <unsecuredAccountsAmount>100000</unsecuredAccountsAmount>
    <lastSevenDaysCreditEnquiries>2</lastSevenDaysCreditEnquiries>
  </reportSummary>
  <creditAccounts>
    <account>
      <accountNumber>1234567890123456</accountNumber>
      <bankName>HDFC Bank</bankName>
      <currentBalance>25000</currentBalance>
      <amountOverdue>0</amountOverdue>
      <accountType>Credit Card</accountType>
      <status>Active</status>
    </account>
    <account>
      <accountNumber>9876543210987654</accountNumber>
      <bankName>ICICI Bank</bankName>
      <currentBalance>75000</currentBalance>
      <amountOverdue>5000</amountOverdue>
      <accountType>Credit Card</accountType>
      <status>Active</status>
    </account>
  </creditAccounts>
  <addresses>
    <address>
      <type>Current</type>
      <line1>123 Main Street</line1>
      <city>Mumbai</city>
      <state>Maharashtra</state>
      <pincode>400001</pincode>
      <country>India</country>
    </address>
  </addresses>
  <reportDate>2024-01-15</reportDate>
</creditReport>`;

  res.setHeader('Content-Type', 'application/xml');
  res.send(sampleXML);
});

module.exports = router;

