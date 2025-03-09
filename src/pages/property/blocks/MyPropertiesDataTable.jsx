// src/pages/MyPropertiesDataTable.jsx

import { useMemo, useState } from "react";
import { DataGrid, DataGridColumnHeader } from "@/components/data-grid";
import { Button } from "../../../components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

export default function MyPropertiesDataTable({
  properties,
  onEdit,
  hideColumns = [],
}) {
  const [filteredCount, setFilteredCount] = useState(properties.length);
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
            title="Property Address"
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
            title="Agency Name"
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
      <p className="text-sm text-gray-500 mb-4">
        Showing {filteredCount} of {properties.length} properties
      </p>
      <DataGrid
        columns={columns}
        data={properties}
        serverSide={false} // 前端分页/排序
        rowSelection={false} // 不需要选择行
        // 其它 DataGrid 配置，如 toolbar, pagination, etc.
        pagination={{ size: 100 }}
        onFilteredDataChange={(count) => setFilteredCount(count)}
      />
    </div>
  );
}
