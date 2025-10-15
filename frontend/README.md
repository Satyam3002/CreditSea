# CreditSea Frontend

A modern, responsive React frontend application for the CreditSea credit report management system. Built with React, Vite, Tailwind CSS, and React Router.

## Features

- **Dashboard**: Overview with key metrics and recent reports
- **File Upload**: Drag-and-drop XML file upload with batch processing
- **Reports Management**: List, search, and view detailed credit reports
- **Statistics**: Comprehensive analytics and insights
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Notifications**: Toast notifications for user feedback
- **Modern UI/UX**: Clean, professional interface with Lucide React icons

## Technology Stack

- **React 19** - Latest React with modern hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework
- **React Router 6** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Beautiful toast notifications
- **Lucide React** - Modern icon library

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Layout.jsx      # Main layout with navigation
│   │   ├── Dashboard.jsx   # Dashboard overview
│   │   ├── Upload.jsx      # File upload component
│   │   ├── Reports.jsx     # Reports listing
│   │   ├── ReportDetail.jsx # Individual report view
│   │   └── Statistics.jsx  # Analytics dashboard
│   ├── services/           # API services
│   │   └── api.js         # Axios configuration and API calls
│   ├── App.jsx            # Main app component with routing
│   ├── main.jsx           # App entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

## Installation

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The frontend communicates with the backend API through the `apiService` module:

### Key Features:

- **Base URL Configuration**: Automatically configured for backend API
- **Request/Response Interceptors**: Automatic logging and error handling
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **File Upload**: Multipart form data support for XML files

### API Endpoints Used:

- `GET /api/health` - Health check
- `POST /api/upload` - Single file upload
- `POST /api/upload/batch` - Batch file upload
- `GET /api/upload/sample` - Download sample XML
- `GET /api/reports` - List reports with pagination
- `GET /api/reports/:id` - Get specific report
- `GET /api/reports/pan/:pan` - Get report by PAN
- `DELETE /api/reports/:id` - Delete report
- `GET /api/reports/stats/summary` - Summary statistics
- `GET /api/reports/stats/credit-score-distribution` - Credit score distribution

## Components Overview

### Layout Component

- **Navigation**: Sidebar with route navigation
- **Header**: App branding and status indicators
- **Responsive**: Mobile-friendly sidebar toggle

### Dashboard Component

- **Key Metrics**: Total reports, average credit score, total accounts, total balance
- **Recent Reports**: Latest processed reports with quick access
- **Quick Actions**: Direct links to upload and view reports
- **Credit Score Overview**: Score distribution and statistics

### Upload Component

- **Drag & Drop**: Modern file upload interface
- **Batch Upload**: Support for multiple file uploads
- **File Validation**: XML file type validation
- **Progress Feedback**: Real-time upload status
- **Sample Download**: Access to sample XML format

### Reports Component

- **Advanced Search**: Search by name, PAN, or phone number
- **Sorting**: Sort by various fields with direction control
- **Pagination**: Efficient data loading with page controls
- **Actions**: View details and delete reports
- **Responsive Table**: Mobile-friendly table layout

### ReportDetail Component

- **Comprehensive View**: Complete report information
- **Basic Details**: Personal information and credit score
- **Report Summary**: Account statistics and financial overview
- **Credit Accounts**: Detailed account information with status
- **Addresses**: Multiple address support with proper formatting

### Statistics Component

- **Key Metrics**: System-wide statistics and averages
- **Credit Score Distribution**: Visual distribution charts
- **Financial Overview**: Balance and account statistics
- **Performance Indicators**: System performance metrics

## Styling & Design

### Tailwind CSS Configuration

- **Utility-First**: Rapid UI development with utility classes
- **Responsive Design**: Mobile-first responsive design
- **Custom Components**: Reusable component patterns
- **Color Scheme**: Professional blue and gray color palette

### Design Principles

- **Consistency**: Uniform spacing, typography, and colors
- **Accessibility**: Proper contrast ratios and keyboard navigation
- **User Experience**: Intuitive navigation and clear feedback
- **Performance**: Optimized loading and smooth animations

## State Management

The application uses React's built-in state management:

- **useState**: Local component state
- **useEffect**: Side effects and API calls
- **React Router**: URL-based state for navigation
- **Context**: Could be extended for global state if needed

## Error Handling

Comprehensive error handling throughout the application:

- **API Errors**: Network and server error handling
- **Validation Errors**: Form validation with user feedback
- **Toast Notifications**: Non-intrusive error and success messages
- **Fallback UI**: Graceful degradation for missing data

## Performance Optimizations

- **Code Splitting**: Route-based code splitting with React Router
- **Lazy Loading**: Components loaded on demand
- **Optimized Images**: Proper image optimization
- **Efficient Re-renders**: Proper dependency arrays in useEffect
- **Debounced Search**: Optimized search input handling

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Support**: iOS Safari, Chrome Mobile
- **Progressive Enhancement**: Graceful degradation for older browsers

## Development Guidelines

### Code Style

- **ESLint**: Enforced code quality and consistency
- **Prettier**: Automatic code formatting (if configured)
- **Component Structure**: Consistent component organization
- **Naming Conventions**: Clear, descriptive variable and function names

### Best Practices

- **Component Composition**: Reusable, composable components
- **Props Validation**: Proper prop types and default values
- **Error Boundaries**: Error handling at component level
- **Performance**: Efficient rendering and state updates

## Deployment

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Environment Variables

Create a `.env` file for environment-specific configuration:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Contributing

1. Follow the existing code style and patterns
2. Add proper error handling to new features
3. Include responsive design considerations
4. Test on multiple devices and browsers
5. Update documentation for new features

## Troubleshooting

### Common Issues

1. **API Connection Issues**

   - Ensure backend server is running on port 5000
   - Check CORS configuration in backend
   - Verify API endpoints are accessible

2. **Build Issues**

   - Clear node_modules and reinstall dependencies
   - Check for version conflicts in package.json
   - Ensure all environment variables are set

3. **Styling Issues**
   - Verify Tailwind CSS is properly configured
   - Check for conflicting CSS rules
   - Ensure proper class names are used

## License

MIT License - see LICENSE file for details
