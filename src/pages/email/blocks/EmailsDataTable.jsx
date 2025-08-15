// src/pages/blocks/EmailsDataTable.jsx
import { useMemo, useState } from "react";
import { DataGrid, DataGridColumnHeader } from "@/components/data-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { KeenIcon } from "@/components";
// 点击按钮后在新窗口展示 HTML 内容
const handleViewEmail = (emailHtml) => {
  const newWindow = window.open("", "_blank");
  newWindow.document.write(emailHtml);
  newWindow.document.close();
};

export default function EmailsDataTable({ emails }) {
  const [filteredCount, setFilteredCount] = useState(emails.length);

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
        accessorKey: "property_address",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Address"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
        cell: ({ row }) => {
          const email = row.original;
          return (
            <Link
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
              to={`/property/${email.property_id}`}
            >
              <KeenIcon icon="home-2" className="text-sm" />
              {email.property_address}
            </Link>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: "subject",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Subject"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
        enableSorting: true,
      },
      {
        accessorKey: "sender",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Sender"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
        enableSorting: true,
      },
      {
        accessorKey: "created_at",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Received At"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
        enableSorting: true,
        cell: ({ getValue }) => {
          const dateStr = getValue();
          // if not null
          if (dateStr) {
            const date = new Date(dateStr);
            // 使用澳大利亚格式（en-AU），显示中等日期格式
            return date.toLocaleString("en-AU", {
              dateStyle: "medium",
            });
          }
        },
      },
      {
        accessorKey: "task_type",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Task Type"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
        cell: ({ row }) => {
          const email = row.original;
          return (
            <Link
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
              to={`/property/tasks/${email.task_id}`}
            >
              <KeenIcon icon="note-2" className="text-sm" />
              {email.task_name}
            </Link>
          );
        },
        enableSorting: true,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const email = row.original;
          return (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                handleViewEmail(email.html);
              }}
            >
              <KeenIcon icon="eye" className="text-sm" />
              View HTML
            </Button>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <KeenIcon icon="information-5" className="text-sm" />
          <span>Showing {filteredCount} of {emails.length} emails</span>
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <DataGrid
          columns={columns}
          data={emails}
          serverSide={false} // 前端分页、排序
          rowSelection={false}
          pagination={{ size: 100 }}
          onFilteredDataChange={(count) => setFilteredCount(count)}
          sorting={[{ id: "updated_at", desc: true }]}
        />
      </div>
    </div>
  );
}
