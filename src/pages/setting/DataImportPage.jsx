import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Box, CircularProgress } from "@mui/material";
import { KeenIcon } from "@/components";

export default function DataImportPage() {
  const { baseApi, auth } = useAuthContext();
  const token = auth?.accessToken;

  const [selectedFile, setSelectedFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState("");
  const [importResult, setImportResult] = useState(null);

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    setImportError("");
    setImportResult(null);

    if (!selectedFile) {
      setImportError("Please select a file to upload");
      return;
    }

    if (
      selectedFile.type !== "text/csv" &&
      !selectedFile.name.endsWith(".csv")
    ) {
      setImportError("Only CSV files are allowed");
      return;
    }

    setImportLoading(true);

    const formData = new FormData();
    formData.append("csv_file", selectedFile);
    try {
      const res = await axios.post(`${baseApi}/data-import`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // axios interceptor auto-unwraps { success, data } to just data
      // So res.data is the inner data object: { created, skipped, errors }
      const result = res.data || {};
      const createdCount = result.created ?? 0;
      const skippedCount = result.skipped ?? 0;

      toast.success(`Import completed: ${createdCount} job orders created`);
      setSelectedFile(null);
      setImportError("");
      setImportResult({
        created: createdCount,
        skipped: skippedCount,
        messages: result.errors || []
      });
    } catch (error) {
      let errorMessage = "Import failed";
      if (error.response?.data) {
        errorMessage = error.response.data.error?.message || error.response.data.message || errorMessage;
      }

      setImportError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <KeenIcon icon="file-up" className="text-xl text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Data Import</h1>
              <p className="text-gray-600">Import job orders and other data from CSV files</p>
            </div>
          </div>
        </div>

        {/* 导入表单 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <KeenIcon icon="document" className="text-lg text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">CSV File Import</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">Upload CSV files to import job orders into the system</p>
          </div>

          <div className="p-6">
            <form onSubmit={handleFileSubmit} className="space-y-6">
              {/* 错误信息显示 */}
              {importError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <KeenIcon icon="information" className="text-red-500 text-lg mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800 mb-1">Import Error</h4>
                      <div className="text-sm text-red-700 whitespace-pre-line">
                        {importError}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 成功结果显示 */}
              {importResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <KeenIcon icon="check-circle" className="text-green-500 text-lg mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-green-800 mb-1">Import Successful</h4>
                      <div className="text-sm text-green-700">
                        <p>Created: {importResult.created} job orders</p>
                        {importResult.skipped > 0 && (
                          <p>Skipped: {importResult.skipped} records (duplicates or errors)</p>
                        )}
                      </div>
                      {importResult.messages?.length > 0 && (
                        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700">
                          <p className="font-medium mb-1">Details:</p>
                          <ul className="list-disc list-inside space-y-0.5">
                            {importResult.messages.map((msg, idx) => (
                              <li key={idx}>{msg}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 文件上传区域 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <KeenIcon icon="folder" className="inline mr-1" />
                    Select CSV File
                  </label>
                  
                  <div className="relative">
                    <input
                      ref={(input) => {
                        if (input) {
                          input.style.display = 'none';
                        }
                      }}
                      key={importLoading ? "loading" : "ready"}
                      type="file"
                      name="csv_file"
                      accept=".csv"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      disabled={importLoading}
                      id="csv-file-input"
                    />
                    <Button
                      type="button"
                      onClick={() => document.getElementById('csv-file-input').click()}
                      disabled={importLoading}
                      className="w-full justify-start bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                    >
                      <KeenIcon icon="folder" className="mr-2" />
                      {selectedFile ? selectedFile.name : 'Choose CSV File'}
                    </Button>
                  </div>
                  
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <KeenIcon icon="information-2" className="text-xs" />
                    <span>Only CSV files are accepted. Maximum file size: 10MB</span>
                  </div>
                </div>

                {/* 文件信息显示 */}
                {selectedFile && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <KeenIcon icon="document" className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-900">{selectedFile.name}</p>
                        <p className="text-xs text-blue-700">
                          Size: {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 导入说明 */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <KeenIcon icon="information-2" className="text-gray-500 text-lg mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Import Guidelines</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Ensure your CSV file contains the required columns</li>
                      <li>• Data will be validated before import</li>
                      <li>• Duplicate entries will be skipped</li>
                      <li>• Import process may take a few minutes for large files</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 提交按钮 */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button 
                  type="submit" 
                  disabled={importLoading || !selectedFile}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  {importLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <KeenIcon icon="file-up" className="text-sm" />
                      Import Data
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* 导入历史或统计信息（可选） */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <KeenIcon icon="chart-line" className="text-lg text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Import Tips</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <KeenIcon icon="file-check" className="text-2xl text-blue-600 mb-2" />
                <h4 className="font-medium text-blue-900">Supported Format</h4>
                <p className="text-sm text-blue-700">CSV files only</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <KeenIcon icon="shield-tick" className="text-2xl text-green-600 mb-2" />
                <h4 className="font-medium text-green-900">Data Validation</h4>
                <p className="text-sm text-green-700">Automatic validation</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <KeenIcon icon="rocket" className="text-2xl text-purple-600 mb-2" />
                <h4 className="font-medium text-purple-900">Fast Processing</h4>
                <p className="text-sm text-purple-700">Bulk import support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
