// src/pages/MyPropertiesDataTable.jsx

import { useMemo } from "react";
// 假设你有一个封装好的 DataGrid
import { DataGrid, DataGridColumnHeader } from "@/components/data-grid";
import { Button } from "../../../../components/ui/button";
import { Input } from "@/components/ui/input";

export default function MyPropertiesDataTable({ properties, onEdit }) {
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
  // 定义 DataGrid 的列
  const columns = useMemo(
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
      },
      {
        id: "agency_name",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Agency Name"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
        // accessorFn 可以从 row.user?.agency?.agency_name 中取值
        accessorFn: (row) => row.agency?.agency_name || "N/A",
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
    ],
    [onEdit]
  );

  return (
    <DataGrid
      columns={columns}
      data={properties}
      serverSide={false} // 前端分页/排序
      rowSelection={false} // 不需要选择行
      // 其它 DataGrid 配置，如 toolbar, pagination, etc.
      pagination={{ size: 100 }}
    />
  );
}
