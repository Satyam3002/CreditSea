import React, { useState, useRef } from 'react';
import { Upload as UploadIcon, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';
import { toast } from 'react-hot-toast';

const Upload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => 
      file.type === 'text/xml' || file.name.toLowerCase().endsWith('.xml')
    );
    
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(file => 
      file.type === 'text/xml' || file.name.toLowerCase().endsWith('.xml')
    );
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one XML file');
      return;
    }

    setUploading(true);
    setUploadResults([]);

    try {
      let response;
      
      if (files.length === 1) {
        // Single file upload
        response = await apiService.uploadXMLFile(files[0]);
        
        setUploadResults([{
          fileName: files[0].name,
          success: response.success,
          data: response.data,
          error: response.error
        }]);
        
        if (response.success) {
          toast.success('File uploaded and processed successfully!');
          setFiles([]);
        } else {
          toast.error('Failed to process file');
        }
      } else {
        // Batch upload
        response = await apiService.uploadMultipleFiles(files);
        
        setUploadResults([
          ...response.results,
          ...response.errors.map(error => ({
            fileName: error.fileName,
            success: false,
            error: error.error,
            details: error.details
          }))
        ]);
        
        if (response.summary.successful > 0) {
          toast.success(`${response.summary.successful} files processed successfully!`);
        }
        
        if (response.summary.failed > 0) {
          toast.error(`${response.summary.failed} files failed to process`);
        }
        
        // Remove successfully uploaded files
        const successfulFiles = response.results.map(r => r.fileName);
        setFiles(prev => prev.filter(file => !successfulFiles.includes(file.name)));
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleXML = async () => {
    try {
      const response = await apiService.getSampleXML();
      const blob = new Blob([response], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sample_credit_report.xml';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Sample XML file downloaded');
    } catch (error) {
      console.error('Error downloading sample:', error);
      toast.error('Failed to download sample XML');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Credit Reports</h1>
        <p className="text-gray-600">Upload XML files containing credit report data</p>
      </div>

      {/* Upload Area */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Drag and drop XML files here
          </h3>
          <p className="text-gray-600 mb-4">
            or click to browse files
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FileText className="w-4 h-4 mr-2" />
            Select XML Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".xml,text/xml,application/xml"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Supported formats: XML files (.xml)
          </p>
          <button
            onClick={downloadSampleXML}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Download sample XML
          </button>
        </div>
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Selected Files ({files.length})
          </h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={uploadFiles}
              disabled={uploading}
              className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Upload {files.length} file{files.length > 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Upload Results */}
      {uploadResults.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Results</h3>
          <div className="space-y-3">
            {uploadResults.map((result, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                result.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start space-x-3">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{result.fileName}</p>
                    {result.success ? (
                      <div className="mt-2 text-sm text-green-700">
                        <p>✅ Processed successfully</p>
                        {result.data && (
                          <div className="mt-1 space-y-1">
                            <p>Name: {result.data.name}</p>
                            <p>PAN: {result.data.pan}</p>
                            <p>Credit Score: {result.data.creditScore}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-2 text-sm text-red-700">
                        <p>❌ {result.error}</p>
                        {result.details && (
                          <div className="mt-1">
                            <p className="text-xs text-red-600">
                              Details: {Array.isArray(result.details) ? result.details.join(', ') : result.details}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Upload Instructions</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start space-x-2">
            <span className="text-blue-600">•</span>
            <span>Only XML files are supported (.xml extension)</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600">•</span>
            <span>Maximum file size: 10MB per file</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600">•</span>
            <span>You can upload multiple files at once using batch upload</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600">•</span>
            <span>Download the sample XML file to see the expected format</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600">•</span>
            <span>Files are validated and processed automatically</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Upload;
