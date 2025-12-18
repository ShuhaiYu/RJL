/**
 * RegionSelect Component
 *
 * A dropdown selector for Melbourne regions (East, South, West, North, Central)
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Region options with labels
const REGION_OPTIONS = [
  { value: "EAST", label: "East" },
  { value: "SOUTH", label: "South" },
  { value: "WEST", label: "West" },
  { value: "NORTH", label: "North" },
  { value: "CENTRAL", label: "Central" },
];

// Helper function to get region label
export const getRegionLabel = (region) => {
  const option = REGION_OPTIONS.find((opt) => opt.value === region);
  return option ? option.label : region;
};

// Helper function to get all regions
export const getAllRegions = () => REGION_OPTIONS;

export default function RegionSelect({
  value,
  onChange,
  placeholder = "Select region",
  disabled = false,
  className = "",
  allowClear = false,
}) {
  const handleChange = (newValue) => {
    // Handle "clear" option
    if (newValue === "__clear__") {
      onChange(null);
    } else {
      onChange(newValue);
    }
  };

  return (
    <Select
      value={value || ""}
      onValueChange={handleChange}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowClear && value && (
          <SelectItem value="__clear__" className="text-gray-500">
            Clear selection
          </SelectItem>
        )}
        {REGION_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
