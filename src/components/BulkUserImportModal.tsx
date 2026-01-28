/**
 * Bulk User Import Modal Component
 * 
 * Enables bulk user provisioning via CSV upload.
 * 
 * Workflow per spec:
 * 1. Download Template: CSV with headers (First Name, Last Name, Email, Role Name, Location Path)
 * 2. Upload CSV: User uploads populated file
 * 3. Validation & Preview: System validates rows
 * 
 * Logic:
 * - Role Existence: Validates Role Name exists (System or Custom)
 * - Bulk Update: If email exists, treats as update request (modifies Role and Location)
 */

import React, { useState } from "react";
import type { LocationNode } from "../schemas/locations";

export interface ParsedUserRow {
  rowNumber: number;
  firstName: string;
  lastName: string;
  email: string;
  roleName: string;
  locationPath: string;
  isValid: boolean;
  errorMessage?: string;
}

interface BulkUserImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (validRows: ParsedUserRow[]) => void;
  existingEmails: Set<string>;
  validRoleNames: Set<string>;
  locationNodes: LocationNode[];
}

export default function BulkUserImportModal({
  isOpen,
  onClose,
  onImport,
  existingEmails,
  validRoleNames,
  locationNodes
}: BulkUserImportModalProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedUserRow[]>([]);
  const [validCount, setValidCount] = useState(0);
  const [invalidCount, setInvalidCount] = useState(0);

  // Build location path map for validation
  const locationPathMap = new Map<string, string>();
  const buildLocationPaths = (node: LocationNode, path: string = "") => {
    const currentPath = path ? `${path} > ${node.name}` : node.name;
    locationPathMap.set(currentPath.toLowerCase(), node.id);
    node.children?.forEach(child => buildLocationPaths(child, currentPath));
  };
  locationNodes.forEach(node => buildLocationPaths(node));

  // Generate and download CSV template
  const handleDownloadTemplate = () => {
    const headers = ["First Name", "Last Name", "Email", "Role Name", "Location Path"];
    const exampleRows = [
      ["John", "Doe", "john.doe@company.com", "Global Admin", "Global Operations > North America > USA > Plant A"],
      ["Jane", "Smith", "jane.smith@company.com", "Location Admin", "Global Operations > Europe > Germany"]
    ];
    
    const csvContent = [
      headers.join(","),
      ...exampleRows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `user_import_template_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert("Please upload a CSV file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setUploadedFile(file);
    parseCSV(file);
  };

  // Parse CSV and validate rows
  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter(line => line.trim());
      
      if (lines.length < 2) {
        alert("CSV file appears to be empty or invalid");
        return;
      }

      const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ''));
      const rows: ParsedUserRow[] = [];
      let valid = 0;
      let invalid = 0;
      const emailsInFile = new Set<string>();

      // Validate headers
      const requiredHeaders = ["First Name", "Last Name", "Email", "Role Name", "Location Path"];
      const hasValidHeaders = requiredHeaders.every(h => headers.includes(h));
      
      if (!hasValidHeaders) {
        alert(`CSV must have headers: ${requiredHeaders.join(", ")}`);
        return;
      }

      // Parse data rows (skip header)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        // Simple CSV parser (handles quoted fields)
        const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
        const cleanValues = values.map(v => v.trim().replace(/^"|"$/g, ''));

        const rowData: Record<string, string> = {};
        headers.forEach((header, index) => {
          rowData[header] = cleanValues[index] || "";
        });

        const firstName = rowData["First Name"]?.trim() || "";
        const lastName = rowData["Last Name"]?.trim() || "";
        const email = rowData["Email"]?.trim().toLowerCase() || "";
        const roleName = rowData["Role Name"]?.trim() || "";
        const locationPath = rowData["Location Path"]?.trim() || "";

        // Validate row
        let isValid = true;
        let errorMessage = "";

        // Validate First Name
        if (!firstName) {
          isValid = false;
          errorMessage = "First Name is required";
        }
        // Validate Last Name
        else if (!lastName) {
          isValid = false;
          errorMessage = "Last Name is required";
        }
        // Validate Email format
        else if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          isValid = false;
          errorMessage = "Invalid email format";
        }
        // Validate Email uniqueness within CSV
        else if (emailsInFile.has(email)) {
          isValid = false;
          errorMessage = "Duplicate email within CSV";
        }
        // Validate Role Name exists
        else if (!roleName) {
          isValid = false;
          errorMessage = "Role Name is required";
        }
        else if (!validRoleNames.has(roleName)) {
          isValid = false;
          errorMessage = `Role '${roleName}' does not exist. Create this role before importing.`;
        }
        // Validate Location Path
        else if (!locationPath) {
          isValid = false;
          errorMessage = "Location Path is required";
        }
        else if (!locationPathMap.has(locationPath.toLowerCase())) {
          isValid = false;
          errorMessage = `Location path '${locationPath}' not found in hierarchy`;
        }

        if (isValid) {
          emailsInFile.add(email);
          valid++;
        } else {
          invalid++;
        }

        rows.push({
          rowNumber: i,
          firstName,
          lastName,
          email,
          roleName,
          locationPath,
          isValid,
          errorMessage
        });
      }

      setParsedRows(rows);
      setValidCount(valid);
      setInvalidCount(invalid);
    };

    reader.readAsText(file);
  };

  // Download error report
  const handleDownloadErrorReport = () => {
    const errorRows = parsedRows.filter(row => !row.isValid);
    const headers = ["Row Number", "First Name", "Last Name", "Email", "Error Message"];
    const csvContent = [
      headers.join(","),
      ...errorRows.map(row => 
        [row.rowNumber, row.firstName, row.lastName, row.email, row.errorMessage]
          .map(cell => `"${cell}"`)
          .join(",")
      )
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `import_errors_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Handle import
  const handleImport = () => {
    const validRows = parsedRows.filter(row => row.isValid);
    onImport(validRows);
    handleReset();
    onClose();
  };

  // Reset state
  const handleReset = () => {
    setUploadedFile(null);
    setParsedRows([]);
    setValidCount(0);
    setInvalidCount(0);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900 bg-opacity-50" 
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Import Users</h2>
              <p className="text-sm text-gray-600 mt-0.5">Bulk user provisioning via CSV upload</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {/* Step 1: Download Template */}
          {!uploadedFile && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-blue-900 mb-1">Download Template</h3>
                    <p className="text-xs text-blue-800 mb-3">
                      Start by downloading the CSV template with the correct headers and format
                    </p>
                    <button
                      onClick={handleDownloadTemplate}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download CSV Template
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 2: Upload CSV */}
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-700 font-semibold text-sm">2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Upload CSV File</h3>
                    <p className="text-xs text-gray-600 mb-3">
                      Upload your populated CSV file (max 5MB)
                    </p>
                    
                    {/* File Upload Zone */}
                    <label className="block w-full">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm text-gray-700 font-medium mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          CSV files only, up to 5MB
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">Important Notes</h4>
                    <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                      <li>Role Names must match exactly (case-insensitive)</li>
                      <li>Custom Roles must be created before import</li>
                      <li>Existing users (matching email) will be updated</li>
                      <li>New users will receive invitation emails</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Validation Results & Preview */}
          {uploadedFile && parsedRows.length > 0 && (
            <div className="space-y-4">
              {/* Status Banner */}
              <div className={`rounded-lg p-4 ${
                invalidCount === 0 
                  ? "bg-green-50 border border-green-200"
                  : validCount === 0
                    ? "bg-red-50 border border-red-200"
                    : "bg-amber-50 border border-amber-200"
              }`}>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {invalidCount === 0 ? (
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : validCount === 0 ? (
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-sm font-semibold mb-0.5 ${
                      invalidCount === 0 
                        ? "text-green-900"
                        : validCount === 0
                          ? "text-red-900"
                          : "text-amber-900"
                    }`}>
                      {invalidCount === 0 
                        ? `All ${validCount} rows validated successfully. Ready to import.`
                        : validCount === 0
                          ? "All rows have errors. Please correct the issues and try again."
                          : `${validCount} rows validated successfully. ${invalidCount} rows have errors.`
                      }
                    </h3>
                    <p className={`text-xs ${
                      invalidCount === 0 
                        ? "text-green-800"
                        : validCount === 0
                          ? "text-red-800"
                          : "text-amber-800"
                    }`}>
                      {invalidCount > 0 && "Review errors below and correct your CSV file, or import only valid rows."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">#</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">First Name</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Last Name</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Email</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Role</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Location</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {parsedRows.map((row) => (
                        <tr key={row.rowNumber} className={row.isValid ? "bg-green-50" : "bg-red-50"}>
                          <td className="px-3 py-2 text-xs text-gray-700">{row.rowNumber}</td>
                          <td className="px-3 py-2 text-xs text-gray-900">{row.firstName}</td>
                          <td className="px-3 py-2 text-xs text-gray-900">{row.lastName}</td>
                          <td className="px-3 py-2 text-xs text-gray-700">{row.email}</td>
                          <td className="px-3 py-2 text-xs text-gray-700">{row.roleName}</td>
                          <td className="px-3 py-2 text-xs text-gray-700 max-w-xs truncate" title={row.locationPath}>
                            {row.locationPath}
                          </td>
                          <td className="px-3 py-2 text-xs">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Valid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700" title={row.errorMessage}>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                {row.errorMessage}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-3 flex-shrink-0">
          <div>
            {invalidCount > 0 && (
              <button
                onClick={handleDownloadErrorReport}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Error Report
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            {parsedRows.length > 0 && validCount > 0 && (
              <button
                onClick={handleImport}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Import {validCount} Valid Row{validCount !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
