// src/pages/blocks/AgenciesMetricsDataGrid.jsx
import { useMemo, useState } from "react";
import { DataGrid, DataGridColumnHeader } from "@/components/data-grid";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";

export default function AgenciesMetricsDataGrid({ agencies }) {
  const navigate = useNavigate();
  const [filteredCount, setFilteredCount] = useState(agencies.length);

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

  const columns = useMemo(
    () => [
      {
        accessorKey: "agency_name",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Agency Name"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
        cell: ({ row }) => {
          const agency = row.original;
          return (
            <Button
              variant="link"
              onClick={() => navigate(`/agencies/${agency.id}`)}
            >
              {agency.agency_name}
            </Button>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: "total_users",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Total User"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
        cell: ({ row }) => {
          const agency = row.original;
          return (
            <Button
              variant="link"
              onClick={() =>
                navigate("/users", { state: { agency_id: agency.id } })
              }
            >
              {agency.total_users || 0}
            </Button>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: "total_properties",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Total Property"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
        cell: ({ row }) => {
          const agency = row.original;
          return (
            <Button
              variant="link"
              onClick={() =>
                navigate("/property/my-properties", { state: { agency_id: agency.id } })
              }
            >
              {agency.total_properties || 0}
            </Button>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: "total_unknown_job_orders",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Total Unknown Job Order"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
        cell: ({ row }) => {
          const agency = row.original;
          return (
            <Button
              variant="link"
              onClick={() =>
                navigate("/property/tasks?status=UNKNOWN", {
                  state: { agency_id: agency.id },
                })
              }
            >
              {agency.total_unknown_job_orders || 0}
            </Button>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: "total_incomplete_job_orders",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Total Incomplete Job Order"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
        cell: ({ row }) => {
          const agency = row.original;
          return (
            <Button
              variant="link"
              onClick={() =>
                navigate("/property/tasks?status=INCOMPLETE", {
                  state: { agency_id: agency.id },
                })
              }
            >
              {agency.total_incomplete_job_orders || 0}
            </Button>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: "total_processing_job_orders",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Total Processing Job Order"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
        cell: ({ row }) => {
          const agency = row.original;
          return (
            <Button
              variant="link"
              onClick={() =>
                navigate("/property/tasks?status=PROCESSING", {
                  state: { agency_id: agency.id },
                })
              }
            >
              {agency.total_processing_job_orders || 0}
            </Button>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: "total_due_soon_job_orders",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Total DUE SOON Job Order"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
        cell: ({ row }) => {
          const agency = row.original;
          return (
            <Button
              variant="link"
              onClick={() =>
                navigate("/property/tasks?status=DUE_SOON", {
                  state: { agency_id: agency.id },
                })
              }
            >
              {agency.total_due_soon_job_orders || 0}
            </Button>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: "total_expired_job_orders",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Total EXPIRED Job Order"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
        cell: ({ row }) => {
          const agency = row.original;
          return (
            <Button
              variant="link"
              onClick={() =>
                navigate("/property/tasks?status=EXPIRED", {
                  state: { agency_id: agency.id },
                })
              }
            >
              {agency.total_expired_job_orders || 0}
            </Button>
          );
        },
        enableSorting: true,
      },
    ],
    [navigate]
  );

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        Showing {filteredCount} of {agencies.length} agencies
      </p>
      <DataGrid
        columns={columns}
        data={agencies}
        serverSide={false} // 前端分页、排序
        rowSelection={false}
        pagination={{ size: 100 }}
        onFilteredDataChange={(count) => setFilteredCount(count)}
        sorting={[{ id: "agency_name", desc: false }]}
      />
    </div>
  );
}
