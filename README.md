# CreditSea - Credit Intelligence Platform

A modern fullstack application for processing and analyzing credit report data from XML files.

## 🚀 Features

- **XML File Processing**: Upload and parse credit report XML files
- **Real-time Analysis**: Extract credit scores, account details, and financial data
- **Modern Dashboard**: Beautiful, responsive interface with analytics
- **Report Management**: View, search, and manage credit reports
- **Secure Processing**: Robust error handling and data validation

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide React Icons
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **File Processing**: XML2JS for XML parsing
- **Deployment**: Render (Backend), Local Development (Frontend)

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (Atlas or local)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Update .env with your MongoDB URI
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Update .env with your API URL
npm run dev
```

## 🌐 API Endpoints

- `POST /api/upload` - Upload XML files
- `GET /api/reports` - Get all reports
- `GET /api/reports/:id` - Get specific report
- `GET /api/reports/stats/summary` - Get summary statistics
- `DELETE /api/reports/:id` - Delete report

## 📱 Usage

1. **Upload XML Files**: Drag and drop or select XML files containing credit report data
2. **View Reports**: Browse processed reports in the dashboard
3. **Analyze Data**: Review credit scores, account summaries, and financial details
4. **Export Data**: Access detailed report information

## 🔧 Environment Variables

### Backend (.env)

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=production
```

### Frontend (.env)

```
VITE_API_BASE_URL=https://your-backend-url.com/api
```

## 📊 Data Structure

The application processes XML files and extracts:

- Personal Information (Name, PAN, Mobile)
- Credit Score and Rating
- Account Summary (Total, Active, Closed accounts)
- Financial Data (Balances, Overdue amounts)
- Address Information

## 🚀 Deployment

### Backend (Render)

1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on git push

### Frontend

1. Update `VITE_API_BASE_URL` in environment variables
2. Build and deploy to your preferred hosting service

## 📝 License

MIT License - feel free to use this project for your needs.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Built with ❤️ for credit intelligence and financial analysis**
