import React, { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, X, CheckCircle, AlertCircle } from 'lucide-react';

interface ExcelImportProps {
    onImport: (data: any) => void;
    onClose: () => void;
}

export function ExcelImport({ onImport, onClose }: ExcelImportProps) {
    const [file, setFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [visibility, setVisibility] = useState<'public' | 'private' | 'team'>('public');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleImport = async () => {
        if (!file) return;

        setImporting(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('visibility', visibility);

        try {
            const response = await fetch('http://localhost:8080/api/rules/import', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            setResult(data);

            if (response.ok) {
                setTimeout(() => {
                    onImport(data);
                    onClose();
                }, 2000);
            }
        } catch (error) {
            setResult({ error: 'Import failed. Please check your file format.' });
        } finally {
            setImporting(false);
        }
    };

    const downloadTemplate = () => {
        // Create a simple CSV template
        const template = `Rule Set Name,Loan Approval Rules
Description,Automated loan approval decisions
Category,Finance
Visibility,Public

Priority,Rule Name,Condition 1 Field,Condition 1 Operator,Condition 1 Value,Condition 2 Field,Condition 2 Operator,Condition 2 Value,Logic,Action 1 Type,Action 1 Variable,Action 1 Value
100,Auto Approve,creditScore,>,700,income,>,50000,AND,setVariable,decision,APPROVED
50,Manual Review,creditScore,>,650,debtRatio,<,0.4,AND,setVariable,decision,REVIEW
0,Reject,,,,,,,AND,setVariable,decision,REJECTED`;

        const blob = new Blob([template], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rules_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Upload size={24} />
                        Import Rules from Excel
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* File Upload Area */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <FileSpreadsheet size={48} className="mx-auto text-gray-400 mb-4" />
                        {file ? (
                            <div>
                                <p className="text-lg font-medium text-gray-900">{file.name}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {(file.size / 1024).toFixed(2)} KB
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-lg font-medium text-gray-900 mb-2">
                                    Drag & Drop Excel file here
                                </p>
                                <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                                <p className="text-xs text-gray-400">
                                    Supported: .xlsx, .xls, .csv
                                </p>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>

                    {/* Template Download */}
                    <button
                        onClick={downloadTemplate}
                        className="w-full px-4 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center justify-center gap-2"
                    >
                        <Download size={18} />
                        Download Template
                    </button>

                    {/* Import Options */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Visibility
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={visibility === 'public'}
                                    onChange={() => setVisibility('public')}
                                />
                                <span className="text-sm">🔓 Public</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={visibility === 'private'}
                                    onChange={() => setVisibility('private')}
                                />
                                <span className="text-sm">🔒 Private</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    checked={visibility === 'team'}
                                    onChange={() => setVisibility('team')}
                                />
                                <span className="text-sm">👥 Team Only</span>
                            </label>
                        </div>
                    </div>

                    {/* Result */}
                    {result && (
                        <div className={`p-4 rounded-lg ${result.error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                            <div className="flex items-start gap-3">
                                {result.error ? (
                                    <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                                ) : (
                                    <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                                )}
                                <div className="flex-1">
                                    {result.error ? (
                                        <p className="text-sm text-red-800">{result.error}</p>
                                    ) : (
                                        <div className="text-sm text-green-800">
                                            <p className="font-medium mb-1">Import successful!</p>
                                            <p>Imported {result.rulesImported} rules</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={!file || importing}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {importing ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Importing...
                            </>
                        ) : (
                            <>
                                <Upload size={18} />
                                Import
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Export Component
export function ExcelExport({ ruleSetId, ruleSetName }: { ruleSetId: string; ruleSetName: string }) {
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        setExporting(true);
        try {
            const response = await fetch(`http://localhost:8080/api/rules/rule-sets/${ruleSetId}/export`);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${ruleSetName.replace(/\s+/g, '_')}_rules.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
        >
            <Download size={18} />
            {exporting ? 'Exporting...' : 'Export to Excel'}
        </button>
    );
}
