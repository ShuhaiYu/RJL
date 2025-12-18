// src/pages/MyPropertiesDataTable.jsx

import { useMemo, useState } from "react";
import { DataGrid, DataGridColumnHeader } from "@/components/data-grid";
import { Button } from "../../../components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { getRegionLabel, getAllRegions } from "../../../components/custom/RegionSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { useAuthContext } from "@/auth";
import { toast } from "sonner";
import { KeenIcon } from "@/components";

export default function MyPropertiesDataTable({
  properties,
  onEdit,
  hideColumns = [],
  onRefresh,
}) {
  const { baseApi, auth } = useAuthContext();
  const token = auth?.accessToken;
  const [filteredCount, setFilteredCount] = useState(properties.length);
  const [selectedRows, setSelectedRows] = useState({});
  const [batchUpdating, setBatchUpdating] = useState(false);

  const selectedCount = Object.keys(selectedRows).filter(k => selectedRows[k]).length;
  const selectedIds = Object.entries(selectedRows)
    .filter(([_, selected]) => selected)
    .map(([id, _]) => parseInt(id));

  const handleBatchUpdateRegion = async (region) => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one property");
      return;
    }

    setBatchUpdating(true);
    try {
      await axios.put(
        `${baseApi}/properties/batch-update-region`,
        { property_ids: selectedIds, region },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Updated ${selectedIds.length} properties to ${getRegionLabel(region)}`);
      setSelectedRows({});
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update properties");
    } finally {
      setBatchUpdating(false);
    }
  };
  const ColumnInputFilter = ({ column }) => {
    return (
      <Input
        placeholder="Filter..."
        value={column.getFilterValue() ?? ""}
        onChange={(event) => column.setFilterValue(event.target.value)}
        className="h-9 w-full max-w-40"
      />
    );
  };

  //hide updated_at column
  hideColumns.push("updated_at");

  // 定义 DataGrid 的列
  const baseColumns = useMemo(
    () => [
      {
        accessorKey: "address",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Address"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
        cell: ({ row }) => {
          const property = row.original;
          return (
            <Link className="btn btn-link" to={`/property/${property.id}`}>
              {property.address}
            </Link>
          );
        },
      },
      {
        id: "agency_name",
        // 通过 accessorFn 取出嵌套的 agency_name
        accessorFn: (row) => row.agency?.agency_name || "",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Agency"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
        cell: ({ row, getValue }) => {
          const agencyName = getValue();
          return (
            <Link
              className="btn btn-link"
              to={`/agencies/${row.original.agency?.id}`}
            >
              {agencyName}
            </Link>
          );
        },
      },
      {
        id: "region",
        accessorKey: "region",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Region"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
        cell: ({ row }) => {
          const region = row.original.region;
          if (!region) {
            return <span className="text-gray-400">-</span>;
          }
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              {getRegionLabel(region)}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const property = row.original;
          return (
            <Button variant="view" onClick={() => onEdit(property.id)}>
              View
            </Button>
          );
        },
      },
      {
        accessorKey: "updated_at", // 必须与数据源中的字段名一致
        header: "Updated At",
        cell: ({ row }) => {
          const { updated_at } = row.original;
          return new Date(updated_at).toLocaleString();
        },
      },
    ],
    [onEdit]
  );

  const columns = useMemo(() => {
    return baseColumns.filter((col) => {
      const key = col.accessorKey || col.id;
      return !hideColumns.includes(key);
    });
  }, [baseColumns, hideColumns]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          Showing {filteredCount} of {properties.length} properties
        </p>

        {/* Batch Action Bar */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <span className="text-sm font-medium text-blue-700">
              {selectedCount} selected
            </span>
            <div className="h-4 w-px bg-blue-300" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Set Region:</span>
              <Select
                onValueChange={handleBatchUpdateRegion}
                disabled={batchUpdating}
              >
                <SelectTrigger className="w-36 h-8">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {getAllRegions().map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedRows({})}
              className="text-gray-500 hover:text-gray-700"
            >
              <KeenIcon icon="cross" className="text-sm" />
              Clear
            </Button>
          </div>
        )}
      </div>

      <DataGrid
        columns={columns}
        data={properties}
        serverSide={false}
        rowSelection={true}
        getRowId={(row) => row.id.toString()}
        onRowSelectionChange={setSelectedRows}
        rowSelectionState={selectedRows}
        pagination={{ size: 100 }}
        onFilteredDataChange={(count) => setFilteredCount(count)}
      />
    </div>
  );
}
