import { useState, useEffect } from "react";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { KeenIcon } from "@/components";
import { getRegionLabel } from "@/components/custom/RegionSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-700",
};

function BookingRow({ booking, onConfirm, onReject }) {
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div>
          <p className="font-medium text-gray-900">{booking.property?.address || "N/A"}</p>
          <p className="text-sm text-gray-500">{booking.schedule?.region_label}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="text-gray-900">{formatDate(booking.schedule?.schedule_date)}</p>
        <p className="text-sm text-gray-500">{booking.slot?.start_time} - {booking.slot?.end_time}</p>
      </td>
      <td className="px-6 py-4">
        <div>
          <p className="text-gray-900">{booking.contact_name}</p>
          <p className="text-sm text-gray-500">{booking.contact_phone || booking.contact_email || "-"}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        {booking.booked_by ? (
          <div>
            <p className="text-gray-900">{booking.booked_by.name}</p>
            <p className={`text-xs ${booking.booked_by.type === "agencyUser" ? "text-blue-600" : "text-gray-500"}`}>
              {booking.booked_by.type_label}
            </p>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[booking.status] || STATUS_COLORS.pending}`}>
          {booking.status}
        </span>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-gray-500">{formatDate(booking.created_at)}</p>
      </td>
      <td className="px-6 py-4 text-right">
        {booking.status === "pending" && (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onConfirm(booking)}
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              <KeenIcon icon="check" className="text-sm mr-1" />
              Confirm
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReject(booking)}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <KeenIcon icon="cross" className="text-sm mr-1" />
              Reject
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
}

export default function BookingsListPage() {
  const { baseApi, auth } = useAuthContext();
  const token = auth?.accessToken;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });

  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState({ open: false, booking: null });
  const [rejectDialog, setRejectDialog] = useState({ open: false, booking: null });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [filters, token]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== "all") {
        params.append("status", filters.status);
      }

      // axios interceptor will auto-add Authorization header
      const res = await axios.get(`${baseApi}/inspection/bookings?${params.toString()}`);
      // Note: axios interceptor auto-unwraps { success, data } format
      setBookings(res.data || []);
      setPagination({ page: 1, limit: 50, total: res.data?.length || 0 });
    } catch (error) {
      console.error("Failed to load bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirmDialog.booking) return;
    setProcessing(true);
    try {
      // axios interceptor will auto-add Authorization header
      await axios.put(
        `${baseApi}/inspection/bookings/${confirmDialog.booking.id}/confirm`,
        { send_notification: true }
      );
      toast.success("Booking confirmed successfully");
      setConfirmDialog({ open: false, booking: null });
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to confirm booking");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
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
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject booking");
    } finally {
      setProcessing(false);
    }
  };

  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <KeenIcon icon="notepad-bookmark" className="text-xl text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
              <p className="text-gray-600">Review and manage inspection bookings</p>
            </div>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <KeenIcon icon="notification-bing" className="text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">
                {pendingCount} pending booking{pendingCount > 1 ? "s" : ""} awaiting review
              </span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="w-40">
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters((f) => ({ ...f, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeenIcon icon="notepad-bookmark" className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Found</h3>
              <p className="text-gray-500">
                {filters.status !== "all"
                  ? "No bookings match the current filter"
                  : "No inspection bookings have been made yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booked By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <BookingRow
                      key={booking.id}
                      booking={booking}
                      onConfirm={(b) => setConfirmDialog({ open: true, booking: b })}
                      onReject={(b) => setRejectDialog({ open: true, booking: b })}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Confirm Dialog */}
        <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ open, booking: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Booking</DialogTitle>
              <DialogDescription>
                Are you sure you want to confirm this inspection booking?
              </DialogDescription>
            </DialogHeader>
            {confirmDialog.booking && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Property</p>
                    <p className="font-medium">{confirmDialog.booking.property?.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="font-medium">{confirmDialog.booking.contact_name}</p>
                  </div>
                  {confirmDialog.booking.booked_by && (
                    <div>
                      <p className="text-sm text-gray-500">Booked By</p>
                      <p className="font-medium">
                        {confirmDialog.booking.booked_by.name}
                        <span className="text-gray-500 font-normal ml-1">
                          ({confirmDialog.booking.booked_by.type_label})
                        </span>
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Time Slot</p>
                    <p className="font-medium">{confirmDialog.booking.slot?.start_time} - {confirmDialog.booking.slot?.end_time}</p>
                  </div>
                </div>

                {/* Auto-reject warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                  <KeenIcon icon="information-2" className="text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium">Other pending bookings will be auto-rejected</p>
                    <p className="text-yellow-600">
                      Any other pending bookings for this property will be automatically rejected (without notification).
                    </p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDialog({ open: false, booking: null })}>
                Cancel
              </Button>
              <Button onClick={handleConfirm} disabled={processing} className="bg-green-600 hover:bg-green-700">
                {processing ? "Confirming..." : "Confirm Booking"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, booking: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Booking</DialogTitle>
              <DialogDescription>
                Are you sure you want to reject this inspection booking? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {rejectDialog.booking && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Property</p>
                  <p className="font-medium">{rejectDialog.booking.property?.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="font-medium">{rejectDialog.booking.contact_name}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialog({ open: false, booking: null })}>
                Cancel
              </Button>
              <Button onClick={handleReject} disabled={processing} className="bg-red-600 hover:bg-red-700">
                {processing ? "Rejecting..." : "Reject Booking"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
