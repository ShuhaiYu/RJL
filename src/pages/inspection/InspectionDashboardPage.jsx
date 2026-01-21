import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { KeenIcon } from "@/components";
import RegionSelect, { getRegionLabel } from "@/components/custom/RegionSelect";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const REGIONS = ["EAST", "SOUTH", "WEST", "NORTH", "CENTRAL"];

// ===================== Stats Card Component =====================
function StatsCard({ icon, value, label, color, onClick }) {
  const colorClasses = {
    purple: "bg-purple-100 text-purple-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <KeenIcon icon={icon} className="text-2xl" />
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

// ===================== Workflow Step Component =====================
function WorkflowIndicator({ currentStep }) {
  const steps = [
    { number: 1, label: "Configure Regions", icon: "setting-2" },
    { number: 2, label: "Create Schedule", icon: "calendar-add" },
    { number: 3, label: "Send Booking Links", icon: "sms" },
    { number: 4, label: "Confirm Bookings", icon: "check-circle" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  step.number <= currentStep
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {step.number <= currentStep ? (
                  <KeenIcon icon={step.icon} className="text-lg" />
                ) : (
                  step.number
                )}
              </div>
              <p
                className={`mt-2 text-xs font-medium text-center max-w-[80px] ${
                  step.number <= currentStep ? "text-purple-600" : "text-gray-400"
                }`}
              >
                {step.label}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 md:w-24 lg:w-32 h-1 mx-2 rounded ${
                  step.number < currentStep ? "bg-purple-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===================== Region Config Card =====================
function RegionConfigCard({ config, onConfigure, isExpanded, onToggle }) {
  const [formData, setFormData] = useState({
    start_time: config.start_time || "08:30",
    end_time: config.end_time || "17:00",
    slot_duration: config.slot_duration || 150,
    max_capacity: config.max_capacity || 1,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData({
      start_time: config.start_time || "08:30",
      end_time: config.end_time || "17:00",
      slot_duration: config.slot_duration || 150,
      max_capacity: config.max_capacity || 1,
    });
  }, [config]);

  const handleSave = async () => {
    if (!formData.start_time || !formData.end_time) {
      toast.error("Please set start and end time");
      return;
    }
    setSaving(true);
    await onConfigure(config.region, formData);
    setSaving(false);
    onToggle(null);
  };

  return (
    <div
      className={`rounded-xl border transition-all ${
        config.is_configured
          ? "bg-white border-green-200"
          : "bg-gray-50 border-dashed border-gray-300"
      }`}
    >
      <div
        className={`px-4 py-3 flex items-center justify-between cursor-pointer ${
          config.is_configured ? "hover:bg-green-50" : "hover:bg-gray-100"
        }`}
        onClick={() => onToggle(isExpanded ? null : config.region)}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              config.is_configured ? "bg-green-100" : "bg-gray-200"
            }`}
          >
            {config.is_configured ? (
              <KeenIcon icon="check" className="text-green-600" />
            ) : (
              <KeenIcon icon="setting-2" className="text-gray-400" />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">
              {getRegionLabel(config.region)}
            </p>
            {config.is_configured ? (
              <p className="text-xs text-gray-500">
                {config.start_time} - {config.end_time}
              </p>
            ) : (
              <p className="text-xs text-yellow-600">Not configured</p>
            )}
          </div>
        </div>
        <KeenIcon
          icon={isExpanded ? "up" : "down"}
          className="text-gray-400 text-sm"
        />
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Start Time
              </label>
              <Input
                type="time"
                value={formData.start_time}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, start_time: e.target.value }))
                }
                className="h-9"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                End Time
              </label>
              <Input
                type="time"
                value={formData.end_time}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, end_time: e.target.value }))
                }
                className="h-9"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Slot Duration (min)
              </label>
              <Input
                type="number"
                value={formData.slot_duration}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    slot_duration: parseInt(e.target.value) || 150,
                  }))
                }
                min={15}
                className="h-9"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Max Capacity
              </label>
              <Input
                type="number"
                value={formData.max_capacity}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    max_capacity: parseInt(e.target.value) || 1,
                  }))
                }
                min={1}
                className="h-9"
              />
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="w-full"
          >
            {saving ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      )}
    </div>
  );
}

// ===================== Schedule Card =====================
function ScheduleCard({ schedule, onSendLinks, canManage }) {
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return {
      day: date.toLocaleDateString("en-AU", { day: "numeric" }),
      month: date.toLocaleDateString("en-AU", { month: "short" }),
      weekday: date.toLocaleDateString("en-AU", { weekday: "short" }),
    };
  };

  const dateInfo = formatDate(schedule.schedule_date);
  const isUpcoming = new Date(schedule.schedule_date) >= new Date().setHours(0, 0, 0, 0);
  const unsentCount = schedule.properties_count - schedule.notifications_count;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
        isUpcoming ? "border-gray-200" : "border-gray-100 opacity-70"
      }`}
    >
      <div className="flex">
        {/* Date Column */}
        <div
          className={`w-20 flex-shrink-0 flex flex-col items-center justify-center py-4 ${
            isUpcoming ? "bg-purple-600" : "bg-gray-400"
          }`}
        >
          <p className="text-white text-2xl font-bold">{dateInfo.day}</p>
          <p className="text-purple-200 text-sm uppercase">{dateInfo.month}</p>
          <p className="text-purple-200 text-xs">{dateInfo.weekday}</p>
        </div>

        {/* Content Column */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">
                {getRegionLabel(schedule.region)}
              </h3>
              <p className="text-sm text-gray-500">
                {schedule.start_time} - {schedule.end_time}
              </p>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                schedule.status === "published"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {schedule.status}
            </span>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <KeenIcon icon="time" className="text-base" />
              <span>{schedule.slots_count} slots</span>
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <KeenIcon icon="sms" className="text-base" />
              <span>{schedule.notifications_count} sent</span>
            </div>
            {unsentCount > 0 && (
              <div className="flex items-center gap-1 text-yellow-600">
                <KeenIcon icon="notification-status" className="text-base" />
                <span>{unsentCount} unsent</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className={canManage ? "flex-1" : "w-full"}
              onClick={() => navigate(`/inspection/schedules/${schedule.id}`)}
            >
              <KeenIcon icon="eye" className="text-sm mr-1" />
              View
            </Button>
            {canManage && (
              <Button
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => onSendLinks(schedule)}
              >
                <KeenIcon icon="sms" className="text-sm mr-1" />
                Send Links
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===================== Pending Booking Card =====================
function PendingBookingCard({ booking, onConfirm, onReject, canManage }) {
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-AU", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="font-medium text-gray-900 text-sm truncate">
            {booking.property?.address || "N/A"}
          </p>
          <p className="text-xs text-gray-500">
            {formatDate(booking.schedule?.schedule_date)} · {booking.slot?.start_time}
          </p>
        </div>
        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
          Pending
        </span>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <KeenIcon icon="profile-circle" className="text-gray-400" />
        <div>
          <p className="text-sm text-gray-900">{booking.contact_name}</p>
          <p className="text-xs text-gray-500">
            {booking.contact_phone || booking.contact_email || "No contact info"}
          </p>
        </div>
      </div>
      {canManage && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-red-600 hover:bg-red-50 border-red-200"
            onClick={() => onReject(booking)}
          >
            Reject
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => onConfirm(booking)}
          >
            Confirm
          </Button>
        </div>
      )}
    </div>
  );
}

// ===================== Main Dashboard Component =====================
export default function InspectionDashboardPage() {
  const navigate = useNavigate();
  const { baseApi, auth, currentUser } = useAuthContext();
  const token = auth?.accessToken;

  // Check if user can manage inspections (create/update/delete/confirm/reject)
  const canManageInspection = ['superuser', 'admin'].includes(currentUser?.role);

  // Data states
  const [configs, setConfigs] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI states
  const [expandedRegion, setExpandedRegion] = useState(null);
  const [createFormData, setCreateFormData] = useState({
    region: "",
    selectedDates: [],
  });
  const [creating, setCreating] = useState(false);
  const [batchResult, setBatchResult] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState([]);

  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState({ open: false, booking: null });
  const [rejectDialog, setRejectDialog] = useState({ open: false, booking: null });
  const [resultDialog, setResultDialog] = useState({ open: false });
  const [previewDialog, setPreviewDialog] = useState({ open: false });
  const [processing, setProcessing] = useState(false);

  // ==================== Data Fetching ====================
  useEffect(() => {
    if (token) {
      fetchAllData();
    }
  }, [token]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // axios interceptor will auto-add Authorization header
      const [configRes, schedulesRes, bookingsRes] = await Promise.all([
        axios.get(`${baseApi}/inspection/config`),
        axios.get(`${baseApi}/inspection/schedules`),
        axios.get(`${baseApi}/inspection/bookings?status=pending`),
      ]);
      // Note: axios interceptor in _helpers.js auto-unwraps { success, data } format
      setConfigs(configRes.data || []);
      setSchedules(schedulesRes.data || []);
      setBookings(bookingsRes.data || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // ==================== Config Functions ====================
  const handleConfigureRegion = async (region, data) => {
    try {
      // axios interceptor will auto-add Authorization header
      await axios.put(`${baseApi}/inspection/config/${region}`, data);
      toast.success(`${getRegionLabel(region)} configured successfully`);
      await fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save configuration");
    }
  };

  // ==================== Schedule Functions ====================
  const handlePreview = async () => {
    if (!createFormData.region) {
      toast.error("Please select a region");
      return;
    }
    if (createFormData.selectedDates.length === 0) {
      toast.error("Please select at least one date");
      return;
    }

    const regionConfig = configs.find((c) => c.region === createFormData.region);
    if (!regionConfig?.is_configured) {
      toast.error(`Please configure ${getRegionLabel(createFormData.region)} first`);
      setExpandedRegion(createFormData.region);
      return;
    }

    setLoadingPreview(true);
    try {
      const response = await axios.get(
        `${baseApi}/inspection/preview-recipients/${createFormData.region}`
      );
      setPreviewData(response.data);

      // Initialize selectedRecipients with all recipients (default: all selected)
      const allRecipients = [];
      for (const property of response.data.properties || []) {
        for (const recipient of property.recipients || []) {
          allRecipients.push({
            property_id: property.id,
            contact_id: recipient.type === 'contact' ? recipient.id : null,
            user_id: recipient.type === 'agencyUser' ? recipient.id : null,
            type: recipient.type,
            email: recipient.email,
            name: recipient.name,
            // For UI tracking
            _key: `${property.id}:${recipient.email}`,
          });
        }
      }
      setSelectedRecipients(allRecipients);

      setPreviewDialog({ open: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load preview");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleAddDate = (dateStr) => {
    if (!dateStr) return;
    if (createFormData.selectedDates.includes(dateStr)) {
      toast.info("This date is already selected");
      return;
    }
    setCreateFormData((prev) => ({
      ...prev,
      selectedDates: [...prev.selectedDates, dateStr].sort(),
    }));
  };

  const handleRemoveDate = (dateStr) => {
    setCreateFormData((prev) => ({
      ...prev,
      selectedDates: prev.selectedDates.filter((d) => d !== dateStr),
    }));
  };

  const handleCreateSchedule = async () => {
    if (!createFormData.region) {
      toast.error("Please select a region");
      return;
    }
    if (createFormData.selectedDates.length === 0) {
      toast.error("Please select at least one date");
      return;
    }

    const regionConfig = configs.find((c) => c.region === createFormData.region);
    if (!regionConfig?.is_configured) {
      toast.error(`Please configure ${getRegionLabel(createFormData.region)} first`);
      setExpandedRegion(createFormData.region);
      return;
    }

    setCreating(true);
    try {
      // Prepare selected recipients for API (remove UI-only fields)
      const recipientsForApi = selectedRecipients.map(({ _key, ...rest }) => rest);

      // Call batch API with multiple dates and selected recipients
      const response = await axios.post(`${baseApi}/inspection/schedules/batch`, {
        region: createFormData.region,
        dates: createFormData.selectedDates,
        selected_recipients: recipientsForApi.length > 0 ? recipientsForApi : undefined,
      });

      const result = response.data;
      setBatchResult(result);
      setResultDialog({ open: true });

      // Show summary toast
      if (result.created?.length > 0) {
        toast.success(`Created ${result.created.length} schedule(s)`);
      }
      if (result.skipped?.length > 0) {
        toast.info(`${result.skipped.length} schedule(s) skipped (already exist)`);
      }
      if (result.failed?.length > 0) {
        toast.error(`${result.failed.length} schedule(s) failed`);
      }

      // Show notification results if any
      if (result.notifications) {
        const notifSuccess = result.notifications.success?.length || 0;
        const notifFailed = result.notifications.failed?.length || 0;
        if (notifSuccess > 0) {
          toast.success(`Sent ${notifSuccess} booking invitation(s)`);
        }
        if (notifFailed > 0) {
          toast.error(`${notifFailed} invitation(s) failed to send`);
        }
      }

      setCreateFormData({ region: "", selectedDates: [] });
      setPreviewDialog({ open: false });
      setPreviewData(null);
      setSelectedRecipients([]);
      await fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create schedules");
    } finally {
      setCreating(false);
    }
  };

  const handleSendLinks = (schedule) => {
    navigate(`/inspection/schedules/${schedule.id}`);
  };

  // ==================== Recipient Selection Functions ====================
  const isRecipientSelected = (propertyId, email) => {
    const key = `${propertyId}:${email}`;
    return selectedRecipients.some((r) => r._key === key);
  };

  const toggleRecipient = (property, recipient) => {
    const key = `${property.id}:${recipient.email}`;
    const isSelected = selectedRecipients.some((r) => r._key === key);

    if (isSelected) {
      setSelectedRecipients((prev) => prev.filter((r) => r._key !== key));
    } else {
      setSelectedRecipients((prev) => [
        ...prev,
        {
          property_id: property.id,
          contact_id: recipient.type === 'contact' ? recipient.id : null,
          user_id: recipient.type === 'agencyUser' ? recipient.id : null,
          type: recipient.type,
          email: recipient.email,
          name: recipient.name,
          _key: key,
        },
      ]);
    }
  };

  const selectAllRecipients = () => {
    const allRecipients = [];
    for (const property of previewData?.properties || []) {
      for (const recipient of property.recipients || []) {
        allRecipients.push({
          property_id: property.id,
          contact_id: recipient.type === 'contact' ? recipient.id : null,
          user_id: recipient.type === 'agencyUser' ? recipient.id : null,
          type: recipient.type,
          email: recipient.email,
          name: recipient.name,
          _key: `${property.id}:${recipient.email}`,
        });
      }
    }
    setSelectedRecipients(allRecipients);
  };

  const deselectAllRecipients = () => {
    setSelectedRecipients([]);
  };

  // Calculate total possible recipients from previewData
  const totalPossibleRecipients = useMemo(() => {
    if (!previewData?.properties) return 0;
    return previewData.properties.reduce(
      (sum, p) => sum + (p.recipients?.length || 0),
      0
    );
  }, [previewData]);

  // ==================== Booking Functions ====================
  const handleConfirmBooking = async () => {
    if (!confirmDialog.booking) return;
    setProcessing(true);
    try {
      // axios interceptor will auto-add Authorization header
      await axios.put(
        `${baseApi}/inspection/bookings/${confirmDialog.booking.id}/confirm`,
        { send_notification: true }
      );
      toast.success("Booking confirmed");
      setConfirmDialog({ open: false, booking: null });
      await fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to confirm booking");
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectBooking = async () => {
    if (!rejectDialog.booking) return;
    setProcessing(true);
    try {
      // axios interceptor will auto-add Authorization header
      await axios.put(
        `${baseApi}/inspection/bookings/${rejectDialog.booking.id}/reject`,
        { send_notification: true }
      );
      toast.success("Booking rejected");
      setRejectDialog({ open: false, booking: null });
      await fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject booking");
    } finally {
      setProcessing(false);
    }
  };

  // ==================== Computed Values ====================
  const configuredCount = configs.filter((c) => c.is_configured).length;
  const upcomingSchedules = schedules.filter(
    (s) => new Date(s.schedule_date) >= new Date().setHours(0, 0, 0, 0)
  );
  const totalLinksSent = schedules.reduce((sum, s) => sum + (s.notifications_count || 0), 0);
  const pendingBookingsCount = bookings.length;

  // Calculate current workflow step
  let currentStep = 1;
  if (configuredCount > 0) currentStep = 2;
  if (upcomingSchedules.length > 0) currentStep = 3;
  if (pendingBookingsCount > 0) currentStep = 4;

  // Get tomorrow's date as minimum for create form
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  // Get recent schedules (up to 6)
  const recentSchedules = [...schedules]
    .sort((a, b) => new Date(b.schedule_date) - new Date(a.schedule_date))
    .slice(0, 6);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <KeenIcon icon="calendar-tick" className="text-2xl text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Inspection Management
              </h1>
              <p className="text-gray-500 text-sm">
                Schedule property inspections and manage bookings
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/inspection/bookings")}
            className="flex items-center gap-2"
          >
            <KeenIcon icon="notepad-bookmark" className="text-base" />
            All Bookings
            {pendingBookingsCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                {pendingBookingsCount}
              </span>
            )}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            icon="geolocation"
            value={`${configuredCount}/5`}
            label="Regions Configured"
            color="purple"
          />
          <StatsCard
            icon="calendar"
            value={upcomingSchedules.length}
            label="Upcoming Schedules"
            color="blue"
          />
          <StatsCard
            icon="sms"
            value={totalLinksSent}
            label="Booking Links Sent"
            color="green"
          />
          <StatsCard
            icon="time"
            value={pendingBookingsCount}
            label="Pending Bookings"
            color="yellow"
            onClick={() => {
              const el = document.getElementById("pending-bookings");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </div>

        {/* Workflow Indicator - Only show for admins */}
        {canManageInspection && <WorkflowIndicator currentStep={currentStep} />}

        {/* Main Content Grid - Only show for admins */}
        {canManageInspection && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Panel: Region Configuration */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 font-bold">1</span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    Configure Regions
                  </h2>
                  <p className="text-xs text-gray-500">
                    Set inspection hours for each region
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
              {REGIONS.map((region) => {
                const config = configs.find((c) => c.region === region) || {
                  region,
                  is_configured: false,
                };
                return (
                  <RegionConfigCard
                    key={region}
                    config={config}
                    onConfigure={handleConfigureRegion}
                    isExpanded={expandedRegion === region}
                    onToggle={setExpandedRegion}
                  />
                );
              })}
            </div>
          </div>

          {/* Right Panel: Create Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    Create Schedule
                  </h2>
                  <p className="text-xs text-gray-500">
                    Schedule inspections for a region
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Region
                  </label>
                  <RegionSelect
                    value={createFormData.region}
                    onChange={(value) =>
                      setCreateFormData((prev) => ({ ...prev, region: value }))
                    }
                    placeholder="Choose a region"
                  />
                  {createFormData.region && (
                    <div className="mt-2">
                      {configs.find((c) => c.region === createFormData.region)
                        ?.is_configured ? (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <KeenIcon icon="check-circle" className="text-sm" />
                          Region configured:{" "}
                          {
                            configs.find((c) => c.region === createFormData.region)
                              ?.start_time
                          }{" "}
                          -{" "}
                          {
                            configs.find((c) => c.region === createFormData.region)
                              ?.end_time
                          }
                        </p>
                      ) : (
                        <p className="text-xs text-yellow-600 flex items-center gap-1">
                          <KeenIcon icon="information-2" className="text-sm" />
                          This region needs to be configured first
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inspection Dates
                    {createFormData.selectedDates.length > 0 && (
                      <span className="ml-2 text-blue-600 font-normal">
                        ({createFormData.selectedDates.length} selected)
                      </span>
                    )}
                  </label>
                  <Input
                    type="date"
                    value=""
                    onChange={(e) => handleAddDate(e.target.value)}
                    min={minDate}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Click a date to add it. You can select multiple dates.
                  </p>

                  {/* Selected dates tags */}
                  {createFormData.selectedDates.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {createFormData.selectedDates.map((dateStr) => {
                        const date = new Date(dateStr);
                        const formatted = date.toLocaleDateString("en-AU", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        });
                        return (
                          <span
                            key={dateStr}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            <KeenIcon icon="calendar" className="text-xs" />
                            {formatted}
                            <button
                              type="button"
                              onClick={() => handleRemoveDate(dateStr)}
                              className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                            >
                              <KeenIcon icon="cross" className="text-xs" />
                            </button>
                          </span>
                        );
                      })}
                      {createFormData.selectedDates.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setCreateFormData((prev) => ({
                              ...prev,
                              selectedDates: [],
                            }))
                          }
                          className="text-xs text-red-600 hover:text-red-700 underline"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handlePreview}
                    disabled={loadingPreview || creating || !createFormData.region || createFormData.selectedDates.length === 0}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    {loadingPreview ? (
                      <>
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <KeenIcon icon="eye" className="text-base mr-2" />
                        Preview
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleCreateSchedule}
                    disabled={creating || loadingPreview || !createFormData.region || createFormData.selectedDates.length === 0}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    {creating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <KeenIcon icon="plus" className="text-base mr-2" />
                        Create
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Quick tip */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Click "Preview" to see which properties and
                  contacts will receive booking invitation emails before creating.
                </p>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Recent Schedules Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Recent Schedules</h2>
                <p className="text-xs text-gray-500">
                  Send booking links to property contacts
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/inspection/schedules")}
            >
              View All
              <KeenIcon icon="arrow-right" className="text-sm ml-1" />
            </Button>
          </div>

          {recentSchedules.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeenIcon icon="calendar-remove" className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Schedules Yet
              </h3>
              <p className="text-gray-500 mb-4">
                Create your first inspection schedule above
              </p>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentSchedules.map((schedule) => (
                <ScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                  onSendLinks={handleSendLinks}
                  canManage={canManageInspection}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pending Bookings Section */}
        {pendingBookingsCount > 0 && (
          <div
            id="pending-bookings"
            className="bg-white rounded-xl shadow-sm border border-yellow-200 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-yellow-100 bg-gradient-to-r from-yellow-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 font-bold">4</span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    Pending Bookings
                    <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                      {pendingBookingsCount}
                    </span>
                  </h2>
                  <p className="text-xs text-gray-500">
                    Review and confirm customer bookings
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookings.slice(0, 6).map((booking) => (
                <PendingBookingCard
                  key={booking.id}
                  booking={booking}
                  onConfirm={(b) => setConfirmDialog({ open: true, booking: b })}
                  onReject={(b) => setRejectDialog({ open: true, booking: b })}
                  canManage={canManageInspection}
                />
              ))}
            </div>
            {pendingBookingsCount > 6 && (
              <div className="px-6 py-4 border-t border-gray-100 text-center">
                <Button variant="outline" onClick={() => navigate("/inspection/bookings")}>
                  View All {pendingBookingsCount} Pending Bookings
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Confirm Dialog */}
        <Dialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog({ open, booking: null })}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Booking</DialogTitle>
              <DialogDescription>
                Confirm this inspection booking? A confirmation email will be
                sent to the contact.
              </DialogDescription>
            </DialogHeader>
            {confirmDialog.booking && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm">
                  <span className="text-gray-500">Property:</span>{" "}
                  <span className="font-medium">
                    {confirmDialog.booking.property?.address}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Contact:</span>{" "}
                  <span className="font-medium">
                    {confirmDialog.booking.contact_name}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Time:</span>{" "}
                  <span className="font-medium">
                    {confirmDialog.booking.slot?.start_time} -{" "}
                    {confirmDialog.booking.slot?.end_time}
                  </span>
                </p>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmDialog({ open: false, booking: null })}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmBooking}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700"
              >
                {processing ? "Confirming..." : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog
          open={rejectDialog.open}
          onOpenChange={(open) => setRejectDialog({ open, booking: null })}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Booking</DialogTitle>
              <DialogDescription>
                Reject this inspection booking? A rejection email will be sent
                to the contact.
              </DialogDescription>
            </DialogHeader>
            {rejectDialog.booking && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm">
                  <span className="text-gray-500">Property:</span>{" "}
                  <span className="font-medium">
                    {rejectDialog.booking.property?.address}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Contact:</span>{" "}
                  <span className="font-medium">
                    {rejectDialog.booking.contact_name}
                  </span>
                </p>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRejectDialog({ open: false, booking: null })}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRejectBooking}
                disabled={processing}
                className="bg-red-600 hover:bg-red-700"
              >
                {processing ? "Rejecting..." : "Reject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog
          open={previewDialog.open}
          onOpenChange={(open) => {
            setPreviewDialog({ open });
            if (!open) setPreviewData(null);
          }}
        >
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <KeenIcon icon="eye" className="text-blue-600" />
                Preview: Create Schedules
              </DialogTitle>
              <DialogDescription>
                Review the schedules to create and who will receive booking invitation emails.
              </DialogDescription>
            </DialogHeader>

            {previewData && (
              <div className="flex-1 overflow-y-auto space-y-4">
                {/* Selected Dates */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <KeenIcon icon="calendar" className="text-sm" />
                    Schedules to Create ({createFormData.selectedDates.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {createFormData.selectedDates.map((dateStr) => (
                      <span
                        key={dateStr}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {new Date(dateStr).toLocaleDateString("en-AU", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {previewData.summary?.total_properties || 0}
                    </p>
                    <p className="text-xs text-gray-500">Properties</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {previewData.summary?.properties_with_recipients || 0}
                    </p>
                    <p className="text-xs text-gray-500">With Recipients</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {previewData.summary?.properties_without_recipients || 0}
                    </p>
                    <p className="text-xs text-gray-500">No Recipients</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {selectedRecipients.length}
                      <span className="text-sm text-purple-400">/{totalPossibleRecipients}</span>
                    </p>
                    <p className="text-xs text-gray-500">Selected to Email</p>
                  </div>
                </div>

                {/* Properties List */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <KeenIcon icon="home-2" className="text-sm" />
                      Properties & Recipients ({previewData.properties?.length || 0})
                    </h4>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={selectAllRecipients}
                        disabled={selectedRecipients.length === totalPossibleRecipients}
                        className="h-7 text-xs"
                      >
                        Select All
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={deselectAllRecipients}
                        disabled={selectedRecipients.length === 0}
                        className="h-7 text-xs"
                      >
                        Deselect All
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded-lg">
                    {previewData.properties?.map((property) => (
                      <div
                        key={property.id}
                        className={`p-3 border-b last:border-b-0 ${
                          property.has_recipients ? "bg-white" : "bg-yellow-50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {property.address}
                            </p>
                            {property.agency_name && (
                              <p className="text-xs text-gray-500">
                                {property.agency_name}
                              </p>
                            )}
                          </div>
                          <span
                            className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                              property.has_recipients
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {property.recipient_count} recipient{property.recipient_count !== 1 ? "s" : ""}
                          </span>
                        </div>
                        {property.recipients?.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {property.recipients.map((recipient, idx) => {
                              const isSelected = isRecipientSelected(property.id, recipient.email);
                              return (
                                <label
                                  key={idx}
                                  className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                                    isSelected
                                      ? recipient.type === "contact"
                                        ? "bg-blue-100 hover:bg-blue-150"
                                        : "bg-purple-100 hover:bg-purple-150"
                                      : "bg-gray-50 hover:bg-gray-100"
                                  }`}
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => toggleRecipient(property, recipient)}
                                    className="h-4 w-4"
                                  />
                                  <KeenIcon
                                    icon={recipient.type === "contact" ? "profile-circle" : "security-user"}
                                    className={`text-xs ${
                                      recipient.type === "contact" ? "text-blue-600" : "text-purple-600"
                                    }`}
                                  />
                                  <span className="text-sm text-gray-900">{recipient.name}</span>
                                  <span className="text-xs text-gray-400">({recipient.email})</span>
                                  <span
                                    className={`ml-auto text-[10px] px-1.5 py-0.5 rounded ${
                                      recipient.type === "contact"
                                        ? "bg-blue-50 text-blue-600"
                                        : "bg-purple-50 text-purple-600"
                                    }`}
                                  >
                                    {recipient.type === "contact" ? "Contact" : "Agency"}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                        {!property.has_recipients && (
                          <p className="mt-1 text-xs text-yellow-600">
                            No contacts or agency users with email
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
              <div className="flex-1 text-sm text-gray-500 hidden sm:block">
                {selectedRecipients.length > 0 ? (
                  <span className="flex items-center gap-1">
                    <KeenIcon icon="sms" className="text-purple-500" />
                    {selectedRecipients.length} email{selectedRecipients.length !== 1 ? "s" : ""} will be sent
                  </span>
                ) : (
                  <span className="text-yellow-600">No recipients selected - emails will not be sent</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPreviewDialog({ open: false });
                    setPreviewData(null);
                    setSelectedRecipients([]);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSchedule}
                  disabled={creating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {creating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating & Sending...
                    </>
                  ) : (
                    <>
                      <KeenIcon icon="check" className="text-sm mr-1" />
                      Create & Send ({selectedRecipients.length})
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Batch Creation Result Dialog */}
        <Dialog
          open={resultDialog.open}
          onOpenChange={(open) => {
            setResultDialog({ open });
            if (!open) setBatchResult(null);
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <KeenIcon icon="check-circle" className="text-green-600" />
                Batch Schedule Creation
              </DialogTitle>
              <DialogDescription>
                Here's a summary of the schedule creation results.
              </DialogDescription>
            </DialogHeader>
            {batchResult && (
              <div className="space-y-4">
                {/* Created schedules */}
                {batchResult.created?.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <KeenIcon icon="check" className="text-green-600" />
                      <span className="font-semibold text-green-800">
                        Created ({batchResult.created.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {batchResult.created.map((item) => (
                        <span
                          key={item.date}
                          className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm"
                        >
                          {new Date(item.date).toLocaleDateString("en-AU", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skipped schedules */}
                {batchResult.skipped?.length > 0 && (
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <KeenIcon icon="information-2" className="text-yellow-600" />
                      <span className="font-semibold text-yellow-800">
                        Skipped - Already Exist ({batchResult.skipped.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {batchResult.skipped.map((item) => (
                        <span
                          key={item.date}
                          className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm"
                        >
                          {new Date(item.date).toLocaleDateString("en-AU", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Failed schedules */}
                {batchResult.failed?.length > 0 && (
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <KeenIcon icon="cross-circle" className="text-red-600" />
                      <span className="font-semibold text-red-800">
                        Failed ({batchResult.failed.length})
                      </span>
                    </div>
                    <div className="space-y-1">
                      {batchResult.failed.map((item) => (
                        <p key={item.date} className="text-sm text-red-700">
                          {new Date(item.date).toLocaleDateString("en-AU", {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          - {item.error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notification Results */}
                {batchResult.notifications && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <KeenIcon icon="sms" className="text-purple-600" />
                      Email Notifications
                    </h4>

                    {/* Success notifications */}
                    {batchResult.notifications.success?.length > 0 && (
                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-200 mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <KeenIcon icon="check" className="text-purple-600 text-sm" />
                          <span className="font-medium text-purple-800 text-sm">
                            Sent ({batchResult.notifications.success.length})
                          </span>
                        </div>
                        <p className="text-xs text-purple-600">
                          Booking invitations sent successfully
                        </p>
                      </div>
                    )}

                    {/* Skipped notifications */}
                    {batchResult.notifications.skipped?.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <KeenIcon icon="information-2" className="text-gray-600 text-sm" />
                          <span className="font-medium text-gray-800 text-sm">
                            Skipped ({batchResult.notifications.skipped.length})
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          Already notified for this schedule
                        </p>
                      </div>
                    )}

                    {/* Failed notifications */}
                    {batchResult.notifications.failed?.length > 0 && (
                      <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                        <div className="flex items-center gap-2 mb-1">
                          <KeenIcon icon="cross-circle" className="text-red-600 text-sm" />
                          <span className="font-medium text-red-800 text-sm">
                            Failed ({batchResult.notifications.failed.length})
                          </span>
                        </div>
                        <p className="text-xs text-red-600">
                          Some emails could not be sent
                        </p>
                      </div>
                    )}

                    {/* Error message */}
                    {batchResult.notifications.error && (
                      <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                        <p className="text-sm text-red-700">
                          Error: {batchResult.notifications.error}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button
                onClick={() => {
                  setResultDialog({ open: false });
                  setBatchResult(null);
                }}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
