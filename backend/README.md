# CreditSea Backend API

A robust Node.js backend API for processing XML credit report files from Experian. Built with Express.js, MongoDB, and comprehensive XML parsing capabilities.

## Features

- **XML File Upload**: Secure endpoint for uploading XML credit report files
- **Data Extraction**: Intelligent parsing of credit report data from XML files
- **MongoDB Storage**: Well-designed schema for storing credit report information
- **RESTful API**: Clean API endpoints for data retrieval and management
- **Error Handling**: Comprehensive error handling and logging
- **Validation**: Input validation and data sanitization
- **Documentation**: Detailed API documentation

## Technology Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Multer** - File upload handling
- **xml2js** - XML parsing
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## API Endpoints

### Upload Endpoints

- `POST /api/upload` - Upload single XML file
- `POST /api/upload/batch` - Upload multiple XML files
- `GET /api/upload/sample` - Get sample XML structure

### Report Endpoints

- `GET /api/reports` - Get all reports with pagination and filtering
- `GET /api/reports/:id` - Get specific report by ID
- `GET /api/reports/pan/:pan` - Get report by PAN number
- `DELETE /api/reports/:id` - Delete a report

### Statistics Endpoints

- `GET /api/reports/stats/summary` - Get summary statistics
- `GET /api/reports/stats/credit-score-distribution` - Get credit score distribution

### Health Check

- `GET /api/health` - API health status

## Data Schema

The credit report schema includes:

### Basic Details

- Name
- Mobile Phone
- PAN (Permanent Account Number)
- Credit Score

### Report Summary

- Total number of accounts
- Active accounts
- Closed accounts
- Current balance amount
- Secured accounts amount
- Unsecured accounts amount
- Last 7 days credit enquiries

### Credit Accounts Information

- Credit Cards
- Banks of Credit Cards
- Account Numbers
- Amount Overdue
- Current Balance

### Addresses

- Address type
- Full address
- City, State, Pincode, Country

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd CreditSea/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp env.example .env
   ```

   Update the `.env` file with your configuration:

   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/creditsea
   NODE_ENV=development
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**

   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## API Usage Examples

### Upload XML File

```bash
curl -X POST http://localhost:5000/api/upload \
  -F "xmlFile=@credit_report.xml"
```

### Get All Reports

```bash
curl http://localhost:5000/api/reports?page=1&limit=10&search=john
```

### Get Report by PAN

```bash
curl http://localhost:5000/api/reports/pan/ABCDE1234F
```

### Get Statistics

```bash
curl http://localhost:5000/api/reports/stats/summary
```

## XML File Format

The API expects XML files with the following structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
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
</creditReport>
```

## Error Handling

The API provides comprehensive error handling:

- **400 Bad Request**: Invalid input data or file format
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side errors

Error responses include:

```json
{
  "success": false,
  "error": "Error description",
  "message": "Detailed error message"
}
```

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin request handling
- **Input Validation**: Request validation and sanitization
- **File Type Validation**: XML file type verification
- **Error Sanitization**: Sensitive information filtering

## Performance Features

- **Database Indexing**: Optimized queries with indexes
- **Pagination**: Efficient data retrieval with pagination
- **Selective Field Loading**: Exclude large fields from default queries
- **Connection Pooling**: MongoDB connection optimization

## Development

### Project Structure

```
backend/
├── models/           # MongoDB schemas
├── routes/           # API routes
├── services/         # Business logic
├── tests/           # Test files
├── server.js        # Main server file
├── package.json     # Dependencies
└── README.md        # Documentation
```

### Adding New Features

1. Create new routes in `routes/` directory
2. Add business logic in `services/` directory
3. Update models in `models/` directory if needed
4. Add tests in `tests/` directory
5. Update documentation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details
