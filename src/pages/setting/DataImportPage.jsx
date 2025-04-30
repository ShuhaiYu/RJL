import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Box, CircularProgress } from "@mui/material";

export default function DataImportPage() {
  const { baseApi, auth } = useAuthContext();
  const token = auth?.accessToken;

  const [selectedFile, setSelectedFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState("");

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    setImportError("");

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

      if (res.data) {
        const createdCount = res.data.created || 0;
        toast.success(`Import completed: ${createdCount} job orders created`);
        setSelectedFile(null);
        setImportError("");
        if (res.data.errors?.length > 0) {
          setImportError(res.data.errors.map((e) => `• ${e}`).join("\n"));
        }
      } else {
        setImportError(res.data.error || "Import failed");
      }
    } catch (error) {
      let errorMessage = "Import failed";
      if (error.response) {
        errorMessage = error.response.data.message;
      }

      setImportError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div>
      <section className="container mx-auto p-4 max-w-xl">
        <div className="space-y-5 bg-white p-5 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Data Import</h2>

          <form onSubmit={handleFileSubmit} className="space-y-4">
            {importError && (
              <div className="text-red-500 text-sm mb-2 whitespace-pre-line">
                {importError}
              </div>
            )}

            <div>
              <label className="block mb-2 font-medium">CSV File</label>
              <Input
                key={importLoading ? "loading" : "ready"}
                type="file"
                name="csv_file"
                accept=".csv"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                disabled={importLoading}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Only CSV files are accepted
              </p>
            </div>

            <Button type="submit" disabled={importLoading || !selectedFile}>
              {importLoading ? (
                <Box className="flex justify-center items-center h-40">
                  <CircularProgress />
                </Box>
              ) : (
                "Import Data"
              )}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
