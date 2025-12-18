import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { KeenIcon } from "@/components";
import { getRegionLabel } from "@/components/custom/RegionSelect";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function SlotCard({ slot }) {
  const available = slot.current_bookings < slot.max_capacity;

  return (
    <div className={`p-4 rounded-lg border ${available ? "bg-white border-gray-200" : "bg-gray-100 border-gray-300"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${available ? "bg-green-100" : "bg-gray-200"}`}>
            <KeenIcon icon="time" className={`text-lg ${available ? "text-green-600" : "text-gray-500"}`} />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {slot.start_time} - {slot.end_time}
            </p>
            <p className="text-sm text-gray-500">
              {slot.current_bookings} / {slot.max_capacity} booked
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          available ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
        }`}>
          {available ? "Available" : "Full"}
        </span>
      </div>
    </div>
  );
}

function NotificationItem({ notification }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <KeenIcon icon="sms" className="text-sm text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{notification.property_address}</p>
          <p className="text-xs text-gray-500">{notification.recipient_email}</p>
        </div>
      </div>
      <span className={`px-2 py-1 rounded text-xs ${
        notification.status === "sent" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
      }`}>
        {notification.status}
      </span>
    </div>
  );
}

export default function ScheduleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { baseApi, auth } = useAuthContext();
  const token = auth?.accessToken;

  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Send Booking Links dialog state
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [properties, setProperties] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (token) {
      fetchSchedule();
    }
  }, [id, token]);

  const fetchSchedule = async () => {
    try {
      // axios interceptor will auto-add Authorization header
      const res = await axios.get(`${baseApi}/inspection/schedules/${id}`);
      setSchedule(res.data);
    } catch (error) {
      console.error("Failed to load schedule:", error);
      toast.error("Failed to load schedule");
      navigate("/inspection");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      // axios interceptor will auto-add Authorization header
      await axios.delete(`${baseApi}/inspection/schedules/${id}`);
      toast.success("Schedule deleted successfully");
      navigate("/inspection");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete schedule");
    } finally {
      setDeleting(false);
    }
  };

  // Send Booking Links dialog functions
  const openSendDialog = async () => {
    setSendDialogOpen(true);
    setLoadingProperties(true);
    setSelectedIds([]);
    try {
      const res = await axios.get(`${baseApi}/inspection/schedules/${id}/properties`);
      setProperties(res.data || []);
    } catch (error) {
      console.error("Failed to load properties:", error);
      toast.error("Failed to load properties");
    } finally {
      setLoadingProperties(false);
    }
  };

  const unnotifiedProperties = properties.filter((p) => !p.has_notification);
  const notifiedProperties = properties.filter((p) => p.has_notification);
  const selectableProperties = unnotifiedProperties.filter((p) => p.recipient);

  const handleSelectAll = (checked) => {
    if (checked) {
      const selectableIds = selectableProperties.map((p) => p.id);
      setSelectedIds(selectableIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectProperty = (propertyId, checked) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, propertyId]);
    } else {
      setSelectedIds((prev) => prev.filter((pid) => pid !== propertyId));
    }
  };

  const handleSendNotifications = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one property");
      return;
    }

    setSending(true);
    try {
      const res = await axios.post(
        `${baseApi}/inspection/schedules/${id}/notify`,
        { property_ids: selectedIds }
      );

      const result = res.data;
      const successCount = result.success?.length || 0;
      const failedCount = result.failed?.length || 0;
      const skippedCount = result.skipped?.length || 0;

      if (successCount > 0) {
        toast.success(`${successCount} booking link(s) sent successfully`);
      }

      if (skippedCount > 0) {
        toast.info(`${skippedCount} already sent (skipped)`);
      }

      if (failedCount > 0) {
        // Show detailed failure reasons
        const failedItems = result.failed || [];
        const reasons = failedItems.map((f) => f.error).filter(Boolean);
        const uniqueReasons = [...new Set(reasons)];
        const reasonText = uniqueReasons.length > 0
          ? uniqueReasons.join("; ")
          : "Unknown error";
        toast.error(`${failedCount} failed: ${reasonText}`);
      }

      setSendDialogOpen(false);
      fetchSchedule(); // Refresh to update notifications list
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send booking links");
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-AU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!schedule) {
    return null;
  }

  const isUpcoming = new Date(schedule.schedule_date) >= new Date().setHours(0, 0, 0, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Page Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/inspection")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <KeenIcon icon="arrow-left" className="text-sm" />
            Back to Inspection
          </button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isUpcoming ? "bg-blue-100" : "bg-gray-200"}`}>
                <KeenIcon icon="calendar" className={`text-2xl ${isUpcoming ? "text-blue-600" : "text-gray-500"}`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{formatDate(schedule.schedule_date)}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-gray-600">{getRegionLabel(schedule.region)}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    schedule.status === "published"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {schedule.status === "published" ? "Published" : "Closed"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={openSendDialog}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <KeenIcon icon="sms" className="text-sm" />
                Send Booking Links
              </Button>
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                    <KeenIcon icon="trash" className="text-sm" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Schedule</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this inspection schedule? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Schedule Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <KeenIcon icon="time" className="text-xl text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Work Hours</p>
                <p className="font-semibold text-gray-900">
                  {schedule.start_time} - {schedule.end_time}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <KeenIcon icon="element-7" className="text-xl text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Slot Duration</p>
                <p className="font-semibold text-gray-900">{schedule.slot_duration} minutes</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <KeenIcon icon="people" className="text-xl text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Max Capacity</p>
                <p className="font-semibold text-gray-900">{schedule.max_capacity} per slot</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Time Slots */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <KeenIcon icon="calendar-tick" className="text-purple-600" />
                  Time Slots
                </h2>
                <span className="text-sm text-gray-500">{schedule.slots?.length || 0} slots</span>
              </div>
            </div>
            <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
              {schedule.slots?.length > 0 ? (
                schedule.slots.map((slot) => <SlotCard key={slot.id} slot={slot} />)
              ) : (
                <p className="text-gray-500 text-center py-8">No time slots</p>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <KeenIcon icon="sms" className="text-blue-600" />
                  Notifications Sent
                </h2>
                <span className="text-sm text-gray-500">{schedule.notifications?.length || 0} sent</span>
              </div>
            </div>
            <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
              {schedule.notifications?.length > 0 ? (
                schedule.notifications.map((notif) => (
                  <NotificationItem key={notif.id} notification={notif} />
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <KeenIcon icon="sms" className="text-xl text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-1">No booking links sent yet</p>
                  <p className="text-gray-400 text-xs mb-3">Send booking links to property contacts via email</p>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={openSendDialog}
                  >
                    <KeenIcon icon="sms" className="text-sm mr-1" />
                    Send Booking Links
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Note */}
        {schedule.note && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <KeenIcon icon="notepad" className="text-gray-600" />
              Notes
            </h2>
            <p className="text-gray-600">{schedule.note}</p>
          </div>
        )}

        {/* Send Booking Links Dialog */}
        <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <KeenIcon icon="sms" className="text-blue-600" />
                Send Booking Links
              </DialogTitle>
              <DialogDescription>
                Select properties to send booking invitation emails
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto min-h-0">
              {loadingProperties ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <KeenIcon icon="home-2" className="text-xl text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-1">No properties found</p>
                  <p className="text-gray-400 text-xs">
                    No properties are assigned to this region yet
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {/* Select All */}
                  {selectableProperties.length > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-2">
                      <Checkbox
                        id="select-all"
                        checked={selectedIds.length === selectableProperties.length && selectableProperties.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                      <label htmlFor="select-all" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Select all ({selectableProperties.length} available)
                      </label>
                    </div>
                  )}

                  {/* Unnotified Properties */}
                  {unnotifiedProperties.map((property) => (
                    <div
                      key={property.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                        selectedIds.includes(property.id)
                          ? "bg-blue-50 border-blue-200"
                          : property.recipient
                            ? "bg-white border-gray-200 hover:bg-gray-50"
                            : "bg-red-50 border-red-200 opacity-60"
                      }`}
                      onClick={() => property.recipient && handleSelectProperty(property.id, !selectedIds.includes(property.id))}
                    >
                      <Checkbox
                        checked={selectedIds.includes(property.id)}
                        onCheckedChange={(checked) => property.recipient && handleSelectProperty(property.id, checked)}
                        disabled={!property.recipient}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{property.address}</p>
                        <p className="text-xs text-gray-500">{property.agency_name}</p>
                        {/* Recipient Info */}
                        {property.recipient ? (
                          <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                            <KeenIcon icon="sms" className="text-xs" />
                            {property.recipient.email}
                            {property.recipient_type === "agencyUser" && (
                              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] ml-1">
                                {property.recipient.role === "agencyAdmin" ? "Agency Admin" : "Agency User"}
                              </span>
                            )}
                          </p>
                        ) : (
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <KeenIcon icon="information-2" className="text-xs" />
                            No email recipient found
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Already Notified Properties */}
                  {notifiedProperties.length > 0 && (
                    <>
                      <div className="pt-3 pb-1">
                        <p className="text-xs font-medium text-gray-500 uppercase">
                          Already Sent ({notifiedProperties.length})
                        </p>
                      </div>
                      {notifiedProperties.map((property) => (
                        <div
                          key={property.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 opacity-60"
                        >
                          <Checkbox checked disabled />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{property.address}</p>
                            <p className="text-xs text-gray-500">{property.agency_name}</p>
                          </div>
                          <KeenIcon icon="check-circle" className="text-green-600 text-sm" />
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-gray-500">
                  {selectedIds.length} selected
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSendDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendNotifications}
                    disabled={selectedIds.length === 0 || sending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {sending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      `Send ${selectedIds.length} Link${selectedIds.length !== 1 ? "s" : ""}`
                    )}
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
