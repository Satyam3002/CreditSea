import React, { useState, useRef } from 'react';
import { 
  Upload as UploadIcon, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Cloud,
  Download,
  Sparkles,
  Zap,
  ArrowUpRight,
  FileCheck,
  AlertTriangle,
  Info
} from 'lucide-react';
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
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Upload Credit Reports</h1>
                <p className="text-blue-100 text-lg">Process XML files with advanced credit intelligence</p>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
                  <Cloud className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-8">
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
              dragActive 
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-100 scale-105' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="relative">
              <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                dragActive 
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25 scale-110' 
                  : 'bg-gradient-to-br from-gray-100 to-gray-200'
              }`}>
                <UploadIcon className={`w-10 h-10 transition-colors duration-300 ${
                  dragActive ? 'text-white' : 'text-gray-600'
                }`} />
              </div>
              
              <h3 className={`text-2xl font-bold mb-3 transition-colors duration-300 ${
                dragActive ? 'text-blue-600' : 'text-gray-900'
              }`}>
                {dragActive ? 'Drop your files here!' : 'Upload Credit Reports'}
              </h3>
              
              <p className="text-gray-600 mb-8 text-lg">
                {dragActive 
                  ? 'Release to upload your XML files' 
                  : 'Drag and drop XML files here or click to browse'
                }
              </p>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/25 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FileText className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                Select XML Files
                <ArrowUpRight className="w-5 h-5 ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
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
          </div>
          
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FileCheck className="w-4 h-4 text-green-600" />
              <span>Supported: XML files (.xml)</span>
            </div>
            <button
              onClick={downloadSampleXML}
              className="group flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
            >
              <Download className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              <span>Download sample XML</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Selected Files</h3>
                  <p className="text-sm text-gray-600">{files.length} file{files.length > 1 ? 's' : ''} ready for upload</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 bg-white rounded-full border border-blue-200">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Ready</span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-3">
              {files.map((file, index) => (
                <div key={index} className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{file.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-sm text-gray-600">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <p className="text-sm text-gray-600">XML Format</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="group/remove p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <X className="w-5 h-5 group-hover/remove:scale-110 transition-transform duration-200" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                onClick={uploadFiles}
                disabled={uploading}
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {uploading ? (
                  <>
                    <div className="relative w-5 h-5 mr-3">
                      <div className="w-5 h-5 border-2 border-white/30 rounded-full animate-spin"></div>
                      <div className="absolute top-0 left-0 w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    Processing Files...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                    Upload {files.length} File{files.length > 1 ? 's' : ''}
                    <ArrowUpRight className="w-5 h-5 ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Results */}
      {uploadResults.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Upload Results</h3>
                <p className="text-sm text-gray-600">Processing complete</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {uploadResults.map((result, index) => (
                <div key={index} className={`group p-6 rounded-2xl border transition-all duration-200 ${
                  result.success 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100' 
                    : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 hover:from-red-100 hover:to-rose-100'
                }`}>
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                      result.success 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                        : 'bg-gradient-to-br from-red-500 to-rose-600'
                    }`}>
                      {result.success ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">{result.fileName}</p>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          result.success 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {result.success ? 'Success' : 'Failed'}
                        </div>
                      </div>
                      
                      {result.success ? (
                        <div className="text-sm text-green-700">
                          <p className="font-medium mb-2">✅ File processed successfully</p>
                          {result.data && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                              <div className="p-3 bg-white/60 rounded-lg">
                                <p className="text-xs text-gray-600 font-medium">Name</p>
                                <p className="font-semibold text-gray-900">{result.data.name}</p>
                              </div>
                              <div className="p-3 bg-white/60 rounded-lg">
                                <p className="text-xs text-gray-600 font-medium">PAN</p>
                                <p className="font-mono text-gray-900">{result.data.pan}</p>
                              </div>
                              <div className="p-3 bg-white/60 rounded-lg">
                                <p className="text-xs text-gray-600 font-medium">Credit Score</p>
                                <p className="font-semibold text-gray-900">{result.data.creditScore}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-red-700">
                          <p className="font-medium mb-2">❌ {result.error}</p>
                          {result.details && (
                            <div className="p-3 bg-white/60 rounded-lg">
                              <p className="text-xs text-gray-600 font-medium mb-1">Error Details:</p>
                              <p className="text-red-600">
                                {Array.isArray(result.details) ? result.details.join(', ') : result.details}
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
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Info className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Upload Guidelines</h3>
            <p className="text-sm text-gray-600">Everything you need to know about uploading files</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-white/60 rounded-xl border border-blue-100">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">File Format</p>
                <p className="text-sm text-gray-600">Only XML files (.xml extension) are supported</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-white/60 rounded-xl border border-blue-100">
              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">File Size</p>
                <p className="text-sm text-gray-600">Maximum 10MB per file for optimal processing</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-white/60 rounded-xl border border-blue-100">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Batch Upload</p>
                <p className="text-sm text-gray-600">Upload multiple files simultaneously for efficiency</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-white/60 rounded-xl border border-blue-100">
              <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">4</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Sample Format</p>
                <p className="text-sm text-gray-600">Download sample XML to see expected structure</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-white/60 rounded-xl border border-blue-100">
              <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">5</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Auto Validation</p>
                <p className="text-sm text-gray-600">Files are automatically validated and processed</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Secure Processing</p>
                <p className="text-sm text-gray-600">All files are processed securely with encryption</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <p className="text-sm font-medium text-blue-800">
              💡 <strong>Pro Tip:</strong> Use the sample XML file to understand the expected format and structure for optimal results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
