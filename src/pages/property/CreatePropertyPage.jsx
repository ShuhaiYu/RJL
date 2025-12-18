// src/pages/property/CreatePropertyPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/auth";
import { toast } from "sonner";
import AsyncUserSelect from "../../components/custom/AsyncUserSelect";
import AddressInput from "../../components/custom/AddressInput";
import RegionSelect, { getRegionLabel } from "../../components/custom/RegionSelect";
import PropertyMapViewer from "../../components/custom/PropertyMapViewer";
import { KeenIcon } from "@/components/keenicons";
import StatsCards from "@/components/common/StatsCards";

export default function CreatePropertyPage() {
  const [address, setAddress] = useState("");
  const [region, setRegion] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [suggestedRegion, setSuggestedRegion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { auth, baseApi, currentUser } = useAuthContext();
  const token = auth?.accessToken;
  const navigate = useNavigate();

  const [selectedUserId, setSelectedUserId] = useState("");

  // VEU display condition (selected user has no agency OR their agency is VEU-activated)
  const [showVeuCard, setShowVeuCard] = useState(false);

  // VEU form state
  const initialVeuState = useMemo(
    () => ({
      water_heater: { price: "", mode: "other", other: "", note: "" },
      air_conditioner: { price: "", mode: "other", other: "", note: "" },
    }),
    []
  );
  const [veu, setVeu] = useState(initialVeuState);

  // Stats
  const [stats, setStats] = useState({ total: 0, active: 0, recent: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // Progress
  const [formProgress, setFormProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);

  const hasAgency = !!currentUser?.agency_id; // creator's agency presence controls VEU "Completed By" options

  // Fetch property statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${baseApi}/properties`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const properties = response.data || [];
        setStats({
          total: properties.length,
          active: properties.filter((p) => p.is_active === true).length,
          recent: properties.filter((p) => {
            const createdAt = new Date(p.created_at);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return createdAt >= thirtyDaysAgo;
          }).length,
        });
      } catch (error) {
        // silent
      } finally {
        setStatsLoading(false);
      }
    };

    if (token) fetchStats();
  }, [token, baseApi]);

  // Determine if VEU card should show based on selected user & agency activation
  useEffect(() => {
    if (!token || !selectedUserId) {
      setShowVeuCard(false);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        // 1) Get user (needs agency_id)
        const ures = await axios.get(`${baseApi}/users/${selectedUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = ures.data;
        const agencyId = user?.agency_id ?? null;

        if (agencyId == null) {
          // No agency -> always show VEU card
          if (!cancelled) setShowVeuCard(true);
          return;
        }

        // 2) Get agency detail -> veu_activated
        const ares = await axios.get(`${baseApi}/agencies/${agencyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const agency = ares.data;
        if (!cancelled) setShowVeuCard(!!agency?.veu_activated);
      } catch {
        if (!cancelled) setShowVeuCard(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedUserId, token, baseApi]);

  // Calculate form progress
  useEffect(() => {
    const fields = { address: !!address, region: !!region, selectedUserId: !!selectedUserId };
    const completedFields = Object.values(fields).filter(Boolean).length;
    const totalFields = Object.keys(fields).length;
    const progress = (completedFields / totalFields) * 100;

    setFormProgress(progress);
    if (address && region && selectedUserId) setCurrentStep(2);
    else setCurrentStep(1);
  }, [address, region, selectedUserId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!address) {
      setError("Please enter a property address.");
      return;
    }
    if (!region) {
      setError("Please select a region for this property.");
      return;
    }
    if (!selectedUserId) {
      setError("Please select a user to assign to this property.");
      return;
    }

    setLoading(true);
    try {
      // 1) Create property
      const response = await axios.post(
        `${baseApi}/properties`,
        { address, user_id: selectedUserId, region: region || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const property = response.data?.data;
      toast.success("Property created successfully!");

      // 2) If VEU card is shown, update the two VEU projects (created automatically on backend)
      if (showVeuCard && property?.id) {
        try {
          const vres = await axios.get(
            `${baseApi}/properties/${property.id}/veu-projects`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const projects = Array.isArray(vres.data) ? vres.data : [];

          const mapByType = {};
          projects.forEach((p) => (mapByType[p.type] = p));

          const updates = [];

          ["water_heater", "air_conditioner"].forEach((t) => {
            const proj = mapByType[t];
            if (!proj) return;

            const v = veu[t];
            const body = {};

            // price
            if (v.price !== "") {
              const num = Number(v.price);
              if (!Number.isNaN(num)) body.price = num;
            }

            // completed_by (respect rules: only send when valid)
            let completed_by = null;
            if (!hasAgency && v.mode === "rjl") {
              completed_by = "RJL A Group";
            } else if (v.mode === "not_required") {
              completed_by = "not_required";
            } else if (v.mode === "other" && v.other.trim().length > 0) {
              completed_by = `other__${v.other.trim()}`;
            }
            if (completed_by !== null) body.completed_by = completed_by;

            // note
            if (typeof v.note === "string" && v.note.trim().length > 0) {
              body.note = v.note.trim();
            }

            if (Object.keys(body).length > 0) {
              updates.push(
                axios.put(`${baseApi}/veu-projects/${proj.id}`, body, {
                  headers: { Authorization: `Bearer ${token}` },
                })
              );
            }
          });

          if (updates.length > 0) {
            await Promise.all(updates);
            toast.success("VEU details saved.");
          }
        } catch {
          // silent but non-blocking
        }
      }

      // 3) Navigate to detail
      navigate(`/property/${property.id}`);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to create property.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handlers for VEU form
  const setVeuField = (type, key, val) =>
    setVeu((prev) => ({ ...prev, [type]: { ...prev[type], [key]: val } }));

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 hover:bg-gray-50"
          >
            <KeenIcon icon="arrow-left" className="text-sm" />
            Back
          </Button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <KeenIcon icon="home-2" className="text-green-600 text-lg" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Create New Property
                </h1>
                <p className="text-gray-600 text-sm">
                  Add a new property to the system
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-700">
                  Step {currentStep} of 2
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round(formProgress)}% Complete
                </div>
              </div>
              <div className="relative w-16 h-16">
                <svg
                  className="w-16 h-16 transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    className="text-gray-200"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-green-600"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${formProgress}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-700">
                    {Math.round(formProgress)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8">
        <StatsCards
          title="Property Management Overview"
          cards={[
            {
              key: "total",
              title: "Total Properties",
              value: stats.total,
              icon: "home-2",
              color: "text-blue-600",
              bgColor: "bg-blue-50",
              borderColor: "border-blue-200",
              route: null,
            },
            {
              key: "active",
              title: "Active Properties",
              value: stats.active,
              icon: "check-circle",
              color: "text-green-600",
              bgColor: "bg-green-50",
              borderColor: "border-green-200",
              route: null,
            },
            {
              key: "recent",
              title: "Recent Properties",
              value: stats.recent,
              icon: "calendar",
              color: "text-purple-600",
              bgColor: "bg-purple-50",
              borderColor: "border-purple-200",
              route: null,
            },
          ]}
          loading={statsLoading}
        />
      </div>

      {/* Steps indicator */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between">
            {[
              {
                step: 1,
                title: "Property Info",
                icon: "home-2",
                completed: !!address,
              },
              {
                step: 2,
                title: "User Assignment",
                icon: "profile-circle",
                completed: !!selectedUserId,
              },
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div
                  className={`flex items-center gap-3 ${
                    currentStep >= item.step ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      item.completed
                        ? "bg-green-100 text-green-600"
                        : currentStep >= item.step
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {item.completed ? (
                      <KeenIcon icon="check" className="text-sm" />
                    ) : (
                      <KeenIcon icon={item.icon} className="text-sm" />
                    )}
                  </div>
                  <div>
                    <div
                      className={`text-sm font-medium ${
                        currentStep >= item.step
                          ? "text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      Step {item.step}
                    </div>
                    <div
                      className={`text-xs ${
                        currentStep >= item.step
                          ? "text-gray-600"
                          : "text-gray-400"
                      }`}
                    >
                      {item.title}
                    </div>
                  </div>
                </div>
                {index < 1 && (
                  <div
                    className={`w-16 h-0.5 mx-4 transition-all duration-300 ${
                      currentStep > item.step ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left - Property */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <KeenIcon icon="home-2" className="text-green-600" />
                  Property Information
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Enter the property's location details
                </p>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <KeenIcon icon="geolocation" className="text-gray-500 text-sm" />
                  Property Address <span className="text-red-500">*</span>
                  {address && (
                    <KeenIcon icon="check" className="text-green-500 text-sm" />
                  )}
                </label>
                <div
                  className={`transition-all duration-200 ${
                    address ? "ring-1 ring-green-200 rounded-md" : ""
                  }`}
                >
                  <AddressInput
                    value={address}
                    onChange={(formattedAddress) => {
                      setAddress(formattedAddress);
                      // Clear coordinates if address is manually edited
                      if (!formattedAddress) {
                        setCoordinates(null);
                        setSuggestedRegion(null);
                      }
                    }}
                    onCoordinatesChange={(coords) => {
                      setCoordinates(coords);
                    }}
                    placeholder="Enter property address"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Start typing to search for an address
                </p>
              </div>

              {/* Region */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <KeenIcon icon="map" className="text-gray-500 text-sm" />
                  Region <span className="text-red-500">*</span>
                  {region && (
                    <KeenIcon icon="check" className="text-green-500 text-sm" />
                  )}
                </label>
                <div
                  className={`transition-all duration-200 ${
                    region ? "ring-1 ring-green-200 rounded-md" : ""
                  }`}
                >
                  <RegionSelect
                    value={region}
                    onChange={(value) => setRegion(value)}
                    placeholder="Select region"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Select the Melbourne region for this property (East, South, West, North, Central)
                </p>
                {/* Suggested region button */}
                {suggestedRegion && !region && (
                  <button
                    type="button"
                    onClick={() => setRegion(suggestedRegion)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <KeenIcon icon="geolocation" className="text-xs" />
                    Use suggested: {suggestedRegion}
                  </button>
                )}
              </div>

              {/* Map Preview */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <KeenIcon icon="geolocation" className="text-gray-500 text-sm" />
                  Location Preview
                </label>
                <PropertyMapViewer
                  coordinates={coordinates}
                  address={address}
                  suggestedRegion={suggestedRegion}
                  onRegionSuggest={(suggested) => {
                    setSuggestedRegion(suggested);
                  }}
                />
              </div>
            </div>

            {/* Right - User */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <KeenIcon icon="profile-circle" className="text-blue-600" />
                  User Assignment
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Assign users to this property
                </p>
              </div>

              {/* User select */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <KeenIcon icon="people" className="text-gray-500 text-sm" />
                  Assign to User (Required)
                  {selectedUserId && (
                    <KeenIcon icon="check" className="text-green-500 text-sm" />
                  )}
                </label>
                <div
                  className={`transition-all duration-200 ${
                    selectedUserId ? "ring-1 ring-green-200 rounded-md" : ""
                  }`}
                >
                  <AsyncUserSelect
                    onChange={(option) =>
                      setSelectedUserId(option ? option.value : "")
                    }
                    placeholder="Search and select user..."
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Select a user to assign to this property
                </p>
              </div>
            </div>
          </div>

          {/* Conditional VEU card */}
          {showVeuCard && (
            <div className="mt-8">
              <VeuCreateCard
                veu={veu}
                setField={setVeuField}
                hasAgency={hasAgency}
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <KeenIcon icon="information-5" className="text-red-500 text-lg" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Completion */}
          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                Form Completion
              </span>
              <span className="text-sm text-gray-600">
                {Math.round(formProgress)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${formProgress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>Property Info</span>
              <span>User Assignment</span>
            </div>
          </div>

          {/* Submit */}
          <div className="mt-8 flex justify-end">
            <Button
              type="submit"
              disabled={loading || formProgress < 100}
              className={`px-8 py-2 font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
                formProgress >= 100
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <>
                  <KeenIcon icon="loading" className="animate-spin" />
                  Creating Property...
                </>
              ) : formProgress >= 100 ? (
                <>
                  <KeenIcon icon="plus" />
                  Create Property Now
                </>
              ) : (
                <>
                  <KeenIcon icon="information-5" />
                  Complete All Fields
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Subcomponents ---------- */

function VeuCreateCard({ veu, setField, hasAgency }) {
  // Allowed modes:
  // - If creator has an agency: only "Other" & "Not Required"
  // - If creator has NO agency (RJL admin/superuser): allow "RJL A Group", "Other", "Not Required"
  const options = hasAgency
    ? [
        { value: "other", label: "Other" },
        { value: "not_required", label: "Not Required" },
      ]
    : [
        { value: "rjl", label: "RJL A Group" },
        { value: "other", label: "Other" },
        { value: "not_required", label: "Not Required" },
      ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <KeenIcon icon="flash" className="text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">VEU Projects</h3>
        </div>
        <div className="text-xs text-gray-500">
          Will be created for this property
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <VeuMiniCard
          title="Water Heater"
          typeKey="water_heater"
          state={veu.water_heater}
          onChange={setField}
          options={options}
        />
        <VeuMiniCard
          title="Air Conditioner"
          typeKey="air_conditioner"
          state={veu.air_conditioner}
          onChange={setField}
          options={options}
        />
      </div>
    </div>
  );
}

function VeuMiniCard({ title, typeKey, state, onChange, options }) {
  const requireOtherText = state.mode === "other";

  return (
    <div className="border rounded-lg p-4">
      <div className="text-md font-semibold mb-4">{title}</div>

      <div className="grid grid-cols-1 gap-4">
        {/* Price */}
        <div>
          <div className="text-sm text-gray-500 mb-1">Quote Price</div>
          <input
            type="number"
            step="0.01"
            className="input input-bordered w-full"
            placeholder="e.g. 120.00"
            value={state.price}
            onChange={(e) => onChange(typeKey, "price", e.target.value)}
          />
        </div>

        {/* Note */}
        <div>
          <div className="text-sm text-gray-500 mb-1">Note</div>
          <textarea
            rows={3}
            className="textarea textarea-bordered w-full"
            placeholder="Optional note"
            value={state.note}
            onChange={(e) => onChange(typeKey, "note", e.target.value)}
          />
        </div>

        {/* Completed By */}
        <div>
          <div className="text-sm text-gray-500 mb-1">Completed By</div>
          <select
            className="select select-bordered w-full"
            value={state.mode}
            onChange={(e) => onChange(typeKey, "mode", e.target.value)}
          >
            {options.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>

          {requireOtherText && (
            <input
              type="text"
              className="input input-bordered w-full mt-2"
              placeholder="Enter company or person"
              value={state.other}
              onChange={(e) => onChange(typeKey, "other", e.target.value)}
            />
          )}

          {requireOtherText && state.other.trim().length === 0 && (
            <div className="text-xs text-gray-500 mt-1">
              Please fill in the “Other” name if you choose Other.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}