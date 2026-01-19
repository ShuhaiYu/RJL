import { useState, useEffect } from "react";
import { useParams } from "react-router";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function LoadingState() {
  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <img
          src="/media/app/RJL.png"
          alt="RJL"
          className="h-12 mx-auto mb-8"
        />
        <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading...</p>
      </div>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-sm border p-8 text-center">
        <img
          src="/media/app/RJL.png"
          alt="RJL"
          className="h-12 mx-auto mb-6"
        />
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Booking</h2>
        <p className="text-gray-500">{message}</p>
      </div>
    </div>
  );
}

function SuccessState({ booking }) {
  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-8 text-center">
        {/* Logo */}
        <img
          src="/media/app/RJL.png"
          alt="RJL"
          className="h-12 mx-auto mb-6"
        />

        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Submitted Successfully!</h2>
        <p className="text-gray-500 text-sm mb-6">
          Your inspection booking has been received. You will receive a confirmation email once it's approved.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 text-left space-y-3 text-sm mb-6">
          <div>
            <p className="text-gray-400">Property</p>
            <p className="font-medium text-gray-900">{booking.property_address}</p>
          </div>
          <div>
            <p className="text-gray-400">Date</p>
            <p className="font-medium text-gray-900">{booking.schedule_date}</p>
          </div>
          <div>
            <p className="text-gray-400">Time</p>
            <p className="font-medium text-gray-900">{booking.time_slot}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-gray-400 text-sm">
            You can now safely close this page.
          </p>
        </div>
      </div>
    </div>
  );
}

function AlreadyBookedState({ booking }) {
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-AU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const statusColors = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    confirmed: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    cancelled: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-sm border p-8">
        {/* Logo */}
        <img
          src="/media/app/RJL.png"
          alt="RJL"
          className="h-12 mx-auto mb-6"
        />

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Already Made</h2>
          <p className="text-gray-500">
            An inspection booking has already been submitted using this link.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Status</span>
            <span className={`px-3 py-1 rounded border text-sm font-medium capitalize ${statusColors[booking.status] || statusColors.pending}`}>
              {booking.status}
            </span>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Property</p>
            <p className="font-medium text-gray-900">{booking.property.address}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Date</p>
            <p className="font-medium text-gray-900">{formatDate(booking.schedule.schedule_date)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Time</p>
            <p className="font-medium text-gray-900">{booking.slot.start_time} - {booking.slot.end_time}</p>
          </div>
        </div>

        <div className="border-t mt-6 pt-4">
          <p className="text-gray-400 text-sm text-center">
            You can safely close this page.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PublicBookingPage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [formData, setFormData] = useState({
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    note: "",
  });

  useEffect(() => {
    fetchBookingData();
  }, [token]);

  const fetchBookingData = async () => {
    try {
      const res = await axios.get(`${API_URL}/public/booking/${token}`);
      // Note: axios interceptor already unwraps response.data.data to response.data
      setData(res.data);

      // Set initial selected date (first available date with slots)
      if (res.data.schedules?.length > 0) {
        setSelectedDate(res.data.schedules[0].id);
      }

      // Pre-fill contact name from booker info
      if (res.data.booker?.name) {
        setFormData((prev) => ({
          ...prev,
          contact_name: res.data.booker.name || "",
        }));
      } else if (res.data.contact?.name) {
        setFormData((prev) => ({
          ...prev,
          contact_name: res.data.contact.name || "",
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load booking page");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }
    if (!formData.contact_name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/public/booking/${token}`, {
        slot_id: selectedSlot,
        contact_name: formData.contact_name,
        contact_phone: formData.contact_phone || undefined,
        contact_email: formData.contact_email || undefined,
        note: formData.note || undefined,
      });
      // axios interceptor unwraps response.data.data to response.data
      setSubmitted(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit booking");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-AU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (submitted) return <SuccessState booking={submitted} />;
  if (data?.already_booked) return <AlreadyBookedState booking={data.booking} />;

  return (
    <div className="min-h-screen w-full bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl mx-auto">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <img
            src="/media/app/RJL.png"
            alt="RJL"
            className="h-16 mx-auto mb-6"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Book Your Inspection</h1>
          <p className="text-gray-500">Select a convenient time for your property inspection</p>
        </div>

        {/* Property Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-4">Property Details</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Address</p>
                <p className="font-medium text-gray-900">{data?.property?.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Region</p>
                <p className="font-medium text-gray-900">{data?.region?.label || data?.schedule?.region_label}</p>
              </div>
            </div>
            {/* Booker Identity */}
            {data?.booker?.name && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Booking As</p>
                  <p className="font-medium text-gray-900">{data.booker.name}</p>
                  {data.booker.type === "agencyUser" && (
                    <p className="text-xs text-blue-600">Agency Staff</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Date Selection (Multi-date support) */}
        {data?.schedules?.length > 1 && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-4">
            <h2 className="font-semibold text-gray-900 mb-4">Select Inspection Date</h2>
            <div className="flex flex-wrap gap-2">
              {data.schedules.map((schedule) => (
                <button
                  key={schedule.id}
                  type="button"
                  onClick={() => {
                    setSelectedDate(schedule.id);
                    setSelectedSlot(null); // Reset slot when date changes
                  }}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    selectedDate === schedule.id
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 hover:border-gray-400 bg-white text-gray-700"
                  }`}
                >
                  {formatDate(schedule.schedule_date)}
                  <span className={`block text-xs ${selectedDate === schedule.id ? "text-gray-300" : "text-gray-400"}`}>
                    {schedule.slots.length} slot{schedule.slots.length !== 1 ? "s" : ""} available
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Time Slot Selection */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-4">
            Select a Time Slot
            {data?.schedules?.length > 1 && selectedDate && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                for {formatDate(data.schedules.find((s) => s.id === selectedDate)?.schedule_date)}
              </span>
            )}
          </h2>
          {(() => {
            // Get slots for selected date
            const currentSchedule = data?.schedules?.find((s) => s.id === selectedDate);
            const slotsToShow = currentSchedule?.slots || data?.available_slots || [];

            if (slotsToShow.length === 0) {
              return (
                <p className="text-gray-500 text-center py-6 text-sm">
                  No available time slots. Please contact your property manager.
                </p>
              );
            }

            return (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {slotsToShow.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlot(slot.id)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      selectedSlot === slot.id
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 hover:border-gray-400 bg-white"
                    }`}
                  >
                    <p className="font-medium text-sm">
                      {slot.start_time} - {slot.end_time}
                    </p>
                    <p className={`text-xs mt-1 ${selectedSlot === slot.id ? "text-gray-300" : "text-gray-400"}`}>
                      {slot.available_spots} spot{slot.available_spots > 1 ? "s" : ""} left
                    </p>
                  </button>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-4">
            <h2 className="font-semibold text-gray-900 mb-4">Your Contact Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.contact_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contact_name: e.target.value }))}
                  placeholder="Your full name"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contact_phone: e.target.value }))}
                  placeholder="Your phone number"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="Your email address"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Additional Notes
                </label>
                <Textarea
                  value={formData.note}
                  onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
                  placeholder="Any special requirements or notes..."
                  rows={3}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={submitting || !selectedSlot || !formData.contact_name.trim()}
            className="w-full py-5 text-base font-medium bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300"
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </div>
            ) : (
              "Confirm Booking"
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by RJL Property Management
        </p>
      </div>
    </div>
  );
}
