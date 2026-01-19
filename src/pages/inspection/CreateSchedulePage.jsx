import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { KeenIcon } from "@/components";
import RegionSelect, { getRegionLabel } from "@/components/custom/RegionSelect";

export default function CreateSchedulePage() {
  const navigate = useNavigate();
  const { baseApi, auth } = useAuthContext();
  const token = auth?.accessToken;

  const [loading, setLoading] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [regionConfig, setRegionConfig] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [formData, setFormData] = useState({
    region: "",
    start_time: "",
    end_time: "",
    slot_duration: 150,
    max_capacity: 1,
    note: "",
  });

  // Fetch region config when region changes
  useEffect(() => {
    if (!formData.region || !token) {
      setRegionConfig(null);
      return;
    }

    const fetchConfig = async () => {
      setLoadingConfig(true);
      try {
        // axios interceptor will auto-add Authorization header
        const res = await axios.get(`${baseApi}/inspection/config/${formData.region}`);
        const config = res.data;
        setRegionConfig(config);

        // Pre-fill with region config values
        if (config.is_configured) {
          setFormData((prev) => ({
            ...prev,
            start_time: config.start_time || prev.start_time,
            end_time: config.end_time || prev.end_time,
            slot_duration: config.slot_duration || prev.slot_duration,
            max_capacity: config.max_capacity || prev.max_capacity,
          }));
        }
      } catch (error) {
        console.error("Failed to load region config:", error);
      } finally {
        setLoadingConfig(false);
      }
    };

    fetchConfig();
  }, [formData.region, baseApi, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "slot_duration" || name === "max_capacity" ? parseInt(value) || 0 : value,
    }));
  };

  // Calculate slots preview
  const calculateSlots = () => {
    if (!formData.start_time || !formData.end_time || !formData.slot_duration) return [];

    const parseTime = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const formatTime = (minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
    };

    const slots = [];
    let current = parseTime(formData.start_time);
    const end = parseTime(formData.end_time);

    while (current + formData.slot_duration <= end) {
      slots.push({
        start: formatTime(current),
        end: formatTime(current + formData.slot_duration),
      });
      current += formData.slot_duration;
    }

    return slots;
  };

  const handleAddDate = (date) => {
    if (!date) return;
    if (selectedDates.includes(date)) {
      toast.error("This date is already selected");
      return;
    }
    setSelectedDates([...selectedDates, date].sort());
  };

  const handleRemoveDate = (dateToRemove) => {
    setSelectedDates(selectedDates.filter((d) => d !== dateToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.region) {
      toast.error("Please select a region");
      return;
    }
    if (selectedDates.length === 0) {
      toast.error("Please select at least one date");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        region: formData.region,
        dates: selectedDates,
        note: formData.note || undefined,
      };

      // Only include time settings if not using defaults
      if (formData.start_time) payload.start_time = formData.start_time;
      if (formData.end_time) payload.end_time = formData.end_time;
      if (formData.slot_duration) payload.slot_duration = formData.slot_duration;
      if (formData.max_capacity) payload.max_capacity = formData.max_capacity;

      // axios interceptor will auto-add Authorization header
      const res = await axios.post(`${baseApi}/inspection/schedules/batch`, payload);
      const result = res.data;

      // Show detailed result message
      const messages = [];
      if (result.created?.length > 0) {
        messages.push(`${result.created.length} schedule(s) created`);
      }
      if (result.skipped?.length > 0) {
        messages.push(`${result.skipped.length} skipped (already exist)`);
      }
      if (result.failed?.length > 0) {
        messages.push(`${result.failed.length} failed`);
      }

      if (result.created?.length > 0) {
        toast.success(messages.join(", "));
        // Navigate to the first created schedule or the list
        if (result.created.length === 1) {
          navigate(`/inspection/schedules/${result.created[0].id}`);
        } else {
          navigate("/inspection/schedules");
        }
      } else if (result.skipped?.length > 0) {
        toast.warning(messages.join(", "));
        navigate("/inspection/schedules");
      } else {
        toast.error("Failed to create schedules");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create schedules");
    } finally {
      setLoading(false);
    }
  };

  const slots = calculateSlots();

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Page Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/inspection/schedules")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <KeenIcon icon="arrow-left" className="text-sm" />
            Back to Schedules
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <KeenIcon icon="calendar-add" className="text-xl text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Inspection Schedule</h1>
              <p className="text-gray-600">Schedule an inspection day for a region</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Region and Dates */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Region <span className="text-red-500">*</span>
                    </label>
                    <RegionSelect
                      value={formData.region}
                      onChange={(value) => setFormData((prev) => ({ ...prev, region: value }))}
                      placeholder="Select a region"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Inspection Dates <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        id="date-picker"
                        min={minDate}
                        className="flex-1"
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddDate(e.target.value);
                            e.target.value = "";
                          }
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Select multiple dates for batch schedule creation
                    </p>
                  </div>
                </div>

                {/* Selected Dates Display */}
                {selectedDates.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selected Dates ({selectedDates.length})
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedDates.map((date) => (
                        <span
                          key={date}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-full text-sm text-purple-700"
                        >
                          {new Date(date).toLocaleDateString("en-AU", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                          <button
                            type="button"
                            onClick={() => handleRemoveDate(date)}
                            className="ml-1 text-purple-500 hover:text-purple-700"
                          >
                            <KeenIcon icon="cross" className="text-xs" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Time Settings */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Time Settings</h2>
                {regionConfig?.is_configured && (
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <KeenIcon icon="check-circle" className="text-sm" />
                    Using {getRegionLabel(formData.region)} defaults
                  </span>
                )}
              </div>

              {loadingConfig ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : !formData.region ? (
                <p className="text-gray-500 text-sm py-4">
                  Select a region to configure time settings
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <Input
                        type="time"
                        name="start_time"
                        value={formData.start_time}
                        onChange={handleChange}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <Input
                        type="time"
                        name="end_time"
                        value={formData.end_time}
                        onChange={handleChange}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slot Duration (minutes)
                      </label>
                      <Input
                        type="number"
                        name="slot_duration"
                        value={formData.slot_duration}
                        onChange={handleChange}
                        min={15}
                        max={480}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Capacity per Slot
                      </label>
                      <Input
                        type="number"
                        name="max_capacity"
                        value={formData.max_capacity}
                        onChange={handleChange}
                        min={1}
                        max={20}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Slots Preview */}
                  {slots.length > 0 && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-700 mb-2">
                        Time Slots Preview ({slots.length} slots will be created):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {slots.slice(0, 10).map((slot, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-white border border-blue-200 rounded text-sm text-blue-700"
                          >
                            {slot.start} - {slot.end}
                          </span>
                        ))}
                        {slots.length > 10 && (
                          <span className="px-3 py-1 text-sm text-gray-500">
                            +{slots.length - 10} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Note */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-4">Additional Notes</h2>
              <Textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="Add any notes about this inspection schedule..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="p-6 bg-gray-50 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/inspection/schedules")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formData.region || selectedDates.length === 0}>
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : selectedDates.length > 1 ? (
                  `Create ${selectedDates.length} Schedules`
                ) : (
                  "Create Schedule"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
