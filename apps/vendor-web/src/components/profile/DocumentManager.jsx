import React, { useState, useEffect } from 'react';

export default function DocumentManager({ token }) {
  const [documents, setDocuments] = useState([
    {
      id: 'fssai',
      name: 'FSSAI License',
      required: true,
      status: 'approved',
      uploadedDate: '2024-01-15',
      expiryDate: '2025-01-15',
      filename: 'FSSAI_License.pdf',
      rejectionReason: null
    },
    {
      id: 'gst',
      name: 'GST Certificate',
      required: true,
      status: 'pending',
      uploadedDate: '2024-01-20',
      expiryDate: null,
      filename: 'GST_Certificate.pdf',
      rejectionReason: null
    },
    {
      id: 'business_license',
      name: 'Business License',
      required: true,
      status: 'rejected',
      uploadedDate: '2024-01-18',
      expiryDate: null,
      filename: 'Business_License.pdf',
      rejectionReason: 'Document is not clear, please upload a higher quality scan'
    },
    {
      id: 'pan_card',
      name: 'PAN Card',
      required: true,
      status: null,
      uploadedDate: null,
      expiryDate: null,
      filename: null,
      rejectionReason: null
    },
    {
      id: 'bank_statement',
      name: 'Bank Statement',
      required: false,
      status: null,
      uploadedDate: null,
      expiryDate: null,
      filename: null,
      rejectionReason: null
    }
  ]);
  const [uploading, setUploading] = useState(null);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Pending Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const handleFileUpload = async (documentId, file) => {
    if (!file) return;

    try {
      setUploading(documentId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update document status
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? {
              ...doc,
              status: 'pending',
              uploadedDate: new Date().toISOString().split('T')[0],
              filename: file.name
            }
          : doc
      ));
      
      alert('Document uploaded successfully! It will be reviewed within 1-2 business days.');
    } catch (error) {
      alert('Failed to upload document. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(null);
    }
  };

  const handleFileInputChange = (documentId, event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a PDF, JPG, or PNG file.');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        alert('File size must be less than 5MB.');
        return;
      }
      
      handleFileUpload(documentId, file);
    }
  };

  const downloadDocument = (doc) => {
    // Simulate download
    alert(`Downloading ${doc.filename}`);
  };

  const viewDocument = (doc) => {
    // Simulate view
    alert(`Viewing ${doc.filename}`);
  };

  return (
    <div className="bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] rounded-lg border border-base p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-accent rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Documents</h2>
          <p className="text-muted text-sm">Manage your compliance documents and certificates</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-muted text-sm">
          Upload and manage your compliance documents. All required documents must be approved
          before you can start accepting orders.
        </p>
      </div>

      <div className="space-y-6">
        {documents.map((doc) => (
          <div key={doc.id} className="border border-base rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium">{doc.name}</h3>
                  {doc.required && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-xs rounded">
                      Required
                    </span>
                  )}
                </div>
                
                {doc.uploadedDate && (
                  <p className="text-muted text-sm">
                    Uploaded: {doc.uploadedDate}
                    {doc.expiryDate && ` • Expires: ${doc.expiryDate}`}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {getStatusBadge(doc.status)}
              </div>
            </div>

            {doc.rejectionReason && (
              <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-400 text-sm font-medium">
                  Rejection Reason: {doc.rejectionReason}
                </p>
              </div>
            )}

            {doc.filename && (
              <div className="flex items-center gap-2 mb-3 text-sm">
                <svg className="w-4 h-4 text-muted" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <span className="text-muted">{doc.filename}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              {doc.status && (
                <>
                  <button
                    onClick={() => viewDocument(doc)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-base rounded hover:bg-accent transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </button>
                  
                  <button
                    onClick={() => downloadDocument(doc)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-base rounded hover:bg-accent transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </button>
                </>
              )}

              <div className="relative">
                <input
                  type="file"
                  id={`file-${doc.id}`}
                  className="sr-only"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileInputChange(doc.id, e)}
                  disabled={uploading === doc.id}
                />
                <label
                  htmlFor={`file-${doc.id}`}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded cursor-pointer transition-colors ${
                    doc.status
                      ? 'border border-base hover:bg-accent'
                      : 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {uploading === doc.id ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      {doc.status ? 'Replace' : 'Upload'}
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-accent rounded-lg">
        <h3 className="font-medium mb-2">Document Requirements:</h3>
        <ul className="text-sm text-muted space-y-1">
          <li>• All documents must be clear and readable</li>
          <li>• Accepted formats: PDF, JPG, PNG (max 5MB per file)</li>
          <li>• Documents should be valid and not expired</li>
          <li>• Processing time: 1-2 business days</li>
        </ul>
      </div>
    </div>
  );
}