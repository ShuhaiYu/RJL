// src/pages/property/blocks/VeuDetailModal.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Box, CircularProgress } from "@mui/material";
import { useAuthContext } from "@/auth";
import { Button } from "@/components/ui/button";
import { Modal, ModalBody, ModalContent } from "@/components/modal";

/**
 * VEU Project modal for a property.
 *
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - propertyId: number | string
 * - canEdit: boolean   // controls edit rights in modal
 */
export default function VeuDetailModal({
  open,
  onClose,
  propertyId,
  canEdit = false,
}) {
  const { auth, baseApi, currentUser } = useAuthContext();
  const token = auth?.accessToken;

  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);

  // files state per project
  const [filesMap, setFilesMap] = useState({});
  const [selectedFileMap, setSelectedFileMap] = useState({});
  const [fileDescMap, setFileDescMap] = useState({});
  const [uploadingMap, setUploadingMap] = useState({});
  const [fileInputKeyMap, setFileInputKeyMap] = useState({});

  // Completed By UI state
  const [cbModeMap, setCbModeMap] = useState({});   // 'rjl' | 'other' | 'not_required'
  const [cbOtherMap, setCbOtherMap] = useState({}); // free text for "other"

  const role = currentUser?.role?.toLowerCase?.() || "";
  const isAdmin = role === "admin" || role === "superuser";
  const isAgency = role === "agency-admin" || role === "agency-user";
  const canEditOtherFields = canEdit && isAdmin; // price / is_completed / files
  const canEditCompletedBy = canEdit;            // edit permission gate

  const authHeader = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  // format "water_heater" -> "Water Heater"
  const formatType = (t) =>
    String(t || "")
      .split("_")
      .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : ""))
      .join(" ");

  // ---------- API ----------
  const fetchProjectsAndFiles = async () => {
    if (!propertyId || !token) return;
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${baseApi}/properties/${propertyId}/veu-projects`,
        { headers: authHeader }
      );
      const list = Array.isArray(data) ? data : [];
      setProjects(list);

      // init Completed By UI maps
      const modeMap = {};
      const otherMap = {};
      list.forEach((p) => {
        const v = p.completed_by;

        if (isAdmin) {
          if (v === "RJL A Group") {
            modeMap[p.id] = "rjl";
            otherMap[p.id] = "";
          } else if (v === "not_required") {
            modeMap[p.id] = "not_required";
            otherMap[p.id] = "";
          } else if (typeof v === "string" && v.startsWith("other__")) {
            modeMap[p.id] = "other";
            otherMap[p.id] = v.slice(7);
          } else if (v) {
            modeMap[p.id] = "other";
            otherMap[p.id] = v;
          } else {
            modeMap[p.id] = "other";
            otherMap[p.id] = "";
          }
        } else if (isAgency) {
          // Agency user: allow "Other" and "Not Required"
          if (v === "not_required") {
            modeMap[p.id] = "not_required";
            otherMap[p.id] = "";
          } else if (typeof v === "string" && v.startsWith("other__")) {
            modeMap[p.id] = "other";
            otherMap[p.id] = v.slice(7);
          } else if (v && v !== "RJL A Group") {
            modeMap[p.id] = "other";
            otherMap[p.id] = v;
          } else {
            // RJL A Group or empty -> default to "other" with empty input (save disabled until filled)
            modeMap[p.id] = "other";
            otherMap[p.id] = "";
          }
        } else {
          // other roles: only "Other" free text (previous behavior)
          modeMap[p.id] = "other";
          if (typeof v === "string" && v.startsWith("other__")) {
            otherMap[p.id] = v.slice(7);
          } else if (v && v !== "RJL A Group" && v !== "not_required") {
            otherMap[p.id] = v;
          } else {
            otherMap[p.id] = "";
          }
        }
      });
      setCbModeMap(modeMap);
      setCbOtherMap(otherMap);

      // fetch files per project
      const pairs = await Promise.all(
        list.map(async (p) => {
          try {
            const r = await axios.get(
              `${baseApi}/veu-projects/${p.id}/files`,
              { headers: authHeader }
            );
            return [p.id, r.data || []];
          } catch {
            return [p.id, []];
          }
        })
      );
      const map = {};
      pairs.forEach(([pid, files]) => (map[pid] = files));
      setFilesMap(map);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load VEU projects");
    } finally {
      setLoading(false);
    }
  };

  const saveProject = async (proj) => {
    if (!token) return;
    try {
      const payload = {
        is_completed: proj.is_completed,
        price:
          proj.price === "" || proj.price === null ? null : Number(proj.price),
        completed_by: proj.completed_by,
        note: proj.note ?? null,
        type: proj.type, // not editable in UI
      };
      const { data } = await axios.put(
        `${baseApi}/veu-projects/${proj.id}`,
        payload,
        { headers: authHeader }
      );
      setProjects((prev) => prev.map((p) => (p.id === proj.id ? data : p)));
      toast.success("Saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    }
  };

  // ---------- Helpers ----------
  const setLocalProject = (id, key, value) =>
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, [key]: value } : p)));

  const setCbMode = (projId, mode) => {
    setCbModeMap((prev) => ({ ...prev, [projId]: mode }));
    if (mode === "rjl") {
      setLocalProject(projId, "completed_by", "RJL A Group");
    } else if (mode === "not_required") {
      setLocalProject(projId, "completed_by", "not_required");
    } else {
      const other = cbOtherMap[projId] || "";
      setLocalProject(projId, "completed_by", `other__${other}`);
    }
  };

  const setCbOther = (projId, val) => {
    setCbOtherMap((prev) => ({ ...prev, [projId]: val }));
    const mode = cbModeMap[projId] || "other";
    if (mode === "other") {
      setLocalProject(projId, "completed_by", `other__${val}`);
    }
  };

  // ---------- Files ----------
  const onSelectFile = (projId, file) =>
    setSelectedFileMap((prev) => ({ ...prev, [projId]: file || null }));

  const uploadFile = async (projId) => {
    const file = selectedFileMap[projId];
    const desc = fileDescMap[projId] || "";
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    setUploadingMap((p) => ({ ...p, [projId]: true }));
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("desc", desc);
      await axios.post(`${baseApi}/veu-projects/${projId}/files`, formData, {
        headers: { ...authHeader, "Content-Type": "multipart/form-data" },
      });
      const r = await axios.get(`${baseApi}/veu-projects/${projId}/files`, {
        headers: authHeader,
      });
      setFilesMap((prev) => ({ ...prev, [projId]: r.data || [] }));
      setSelectedFileMap((prev) => ({ ...prev, [projId]: null }));
      setFileDescMap((prev) => ({ ...prev, [projId]: "" }));
      setFileInputKeyMap((prev) => ({ ...prev, [projId]: Date.now() }));
      toast.success("File uploaded");
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploadingMap((p) => ({ ...p, [projId]: false }));
    }
  };

  const deleteFile = async (projId, fileId) => {
    if (!window.confirm("Are you sure to delete this file?")) return;
    try {
      await axios.delete(
        `${baseApi}/veu-projects/${projId}/files/${fileId}`,
        { headers: authHeader }
      );
      setFilesMap((prev) => ({
        ...prev,
        [projId]: (prev[projId] || []).filter((f) => f.id !== fileId),
      }));
      toast.success("File deleted");
    } catch {
      toast.error("File deletion failed");
    }
  };

  const openFile = async (projId, fileId) => {
    try {
      const r = await axios.get(
        `${baseApi}/veu-projects/${projId}/files/${fileId}/download`,
        { headers: authHeader }
      );
      window.open(r.data.url, "_blank");
    } catch {
      toast.error("Unable to open file");
    }
  };

  // ---------- Effects ----------
  useEffect(() => {
    if (open) {
      fetchProjectsAndFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, propertyId, token]);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent>
        {/* Header with close button (match PropertyDetailModal style) */}
        <div className="flex justify-between items-center border-b p-6 mb-4">
          <h2 className="text-xl font-semibold">VEU Projects</h2>
          <button
            className="text-gray-600 hover:text-gray-800"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <ModalBody>
          {loading ? (
            <Box className="flex justify-center items-center h-32">
              <CircularProgress />
            </Box>
          ) : projects.length === 0 ? (
            <div className="p-4">
              <p className="text-gray-600">No VEU projects found for this property.</p>
            </div>
          ) : (
            // two-column layout
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((p) => {
                const files = filesMap[p.id] || [];
                const inputKey = fileInputKeyMap[p.id] || 0;
                const cbMode = cbModeMap[p.id] || "other";
                const cbOther = cbOtherMap[p.id] || "";

                // Save button disabled rules:
                // - must have edit perm
                // - non-admin & non-agency: only "other" allowed and must be non-empty
                // - agency: if mode=other, text must be non-empty
                const saveDisabled =
                  !canEdit ||
                  (!isAdmin && !isAgency && cbMode !== "other") ||
                  ((isAgency || (!isAdmin && !isAgency)) &&
                    cbMode === "other" &&
                    cbOther.trim().length === 0);

                return (
                  <div key={p.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Field label="Type">
                        <span className="font-medium">{formatType(p.type)}</span>
                      </Field>

                      <Field label="Quote Price">
                        {canEditOtherFields ? (
                          <input
                            type="number"
                            step="0.01"
                            className="input input-bordered w-full"
                            value={p.price ?? ""}
                            onChange={(e) =>
                              setLocalProject(
                                p.id,
                                "price",
                                e.target.value === "" ? null : e.target.value
                              )
                            }
                          />
                        ) : (
                          <span className="font-medium">{p.price ?? "-"}</span>
                        )}
                      </Field>

                      

                      <Field label="Completed By">
                        {!canEditCompletedBy ? (
                          <span className="font-medium">{p.completed_by ?? "-"}</span>
                        ) : isAdmin ? (
                          <div className="flex flex-col gap-2">
                            <select
                              className="select select-bordered w-full"
                              value={cbMode}
                              onChange={(e) => setCbMode(p.id, e.target.value)}
                            >
                              <option value="rjl">RJL A Group</option>
                              <option value="other">Other</option>
                              <option value="not_required">Not Required</option>
                            </select>
                            {cbMode === "other" && (
                              <input
                                type="text"
                                className="input input-bordered w-full"
                                value={cbOther}
                                onChange={(e) => setCbOther(p.id, e.target.value)}
                              />
                            )}
                          </div>
                        ) : isAgency ? (
                          <div className="flex flex-col gap-2">
                            <select
                              className="select select-bordered w-full"
                              value={cbMode === "rjl" ? "other" : cbMode}
                              onChange={(e) => setCbMode(p.id, e.target.value)}
                            >
                              <option value="other">Other</option>
                              <option value="not_required">Not Required</option>
                            </select>
                            {cbMode === "other" && (
                              <input
                                type="text"
                                className="input input-bordered w-full"
                                value={cbOther}
                                onChange={(e) => setCbOther(p.id, e.target.value)}
                              />
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              className="input input-bordered w-full"
                              value={cbOther}
                              onChange={(e) => setCbOther(p.id, e.target.value)}
                            />
                            <div className="text-xs text-gray-500">
                              Only “Other” is allowed for your role
                            </div>
                          </div>
                        )}
                      </Field>
                    </div>

                    {/* Note - full width row */}
                    <div className="mt-3">
                      <Field label="Note">
                        {canEditOtherFields ? (
                          <textarea
                            rows={3}
                            className="textarea textarea-bordered w-full"
                            value={p.note ?? ""}
                            onChange={(e) => setLocalProject(p.id, "note", e.target.value)}
                          />
                        ) : (
                          <div className="text-sm whitespace-pre-wrap">{p.note ?? "-"}</div>
                        )}
                      </Field>
                    </div>

                    {canEdit && (
                      <div className="mt-4">
                        <Button
                          variant="edit"
                          onClick={() => saveProject(p)}
                          disabled={saveDisabled}
                        >
                          Save
                        </Button>
                      </div>
                    )}

                    {/* Files */}
                    <div className="mt-6">
                      <h4 className="text-md font-semibold mb-3">Files</h4>

                      {canEditOtherFields && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="flex flex-col md:flex-row items-center gap-3">
                            <div className="relative flex-1">
                              <input
                                key={inputKey}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                type="file"
                                onChange={(e) =>
                                  onSelectFile(
                                    p.id,
                                    e.target.files?.[0] ? e.target.files[0] : null
                                  )
                                }
                                accept="image/*,application/pdf"
                                id={`veu-file-${p.id}`}
                              />
                              <label
                                htmlFor={`veu-file-${p.id}`}
                                className="flex items-center justify-center w-full h-12 px-4 bg-white border border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
                              >
                                <span className="text-gray-600">
                                  {selectedFileMap[p.id]?.name || "Choose File"}
                                </span>
                              </label>
                            </div>
                            <input
                              type="text"
                              className="input input-bordered flex-1 w-full"
                              value={fileDescMap[p.id] || ""}
                              onChange={(e) =>
                                setFileDescMap((prev) => ({
                                  ...prev,
                                  [p.id]: e.target.value,
                                }))
                              }
                            />
                            <button
                              className="btn btn-primary min-w-[120px]"
                              onClick={() => uploadFile(p.id)}
                              disabled={!!uploadingMap[p.id]}
                            >
                              {uploadingMap[p.id] ? "Uploading..." : "Upload"}
                            </button>
                          </div>
                          {selectedFileMap[p.id] && (
                            <div className="mt-2 text-sm text-green-600">
                              Selected: {selectedFileMap[p.id].name}
                            </div>
                          )}
                        </div>
                      )}

                      {files.length === 0 ? (
                        <div className="text-gray-500">No files</div>
                      ) : (
                        <div className="space-y-2">
                          {files.map((f) => (
                            <div
                              key={f.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                            >
                              <div>
                                <div className="font-medium">{f.file_name}</div>
                                {f.file_desc && (
                                  <div className="text-sm text-gray-600">
                                    {f.file_desc}
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  className="btn btn-sm btn-light"
                                  onClick={() => openFile(p.id, f.id)}
                                >
                                  Open
                                </button>
                                {canEditOtherFields && (
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => deleteFile(p.id, f.id)}
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div>{children}</div>
    </div>
  );
}
