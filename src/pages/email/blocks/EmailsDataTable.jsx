// src/pages/blocks/EmailsDataTable.jsx
import { useMemo } from "react";
// 根据你的实际情况修改 DataGrid 导入路径
import { DataGrid, DataGridColumnHeader } from "@/components/data-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// 点击按钮后在新窗口展示 HTML 内容
const handleViewEmail = (emailHtml) => {
  const newWindow = window.open("", "_blank");
  newWindow.document.write(emailHtml);
  newWindow.document.close();
};

export default function EmailsDataTable({ emails }) {
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
            title="Property Address"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
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
        accessorKey: "task_name",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Task Name"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
        enableSorting: true,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const email = row.original;
          return (
            <Button
              variant="view"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleViewEmail(email.html);
              }}
            >
              View HTML
            </Button>
          );
        },
      },
    ],
    []
  );

  return (
    <DataGrid
      columns={columns}
      data={emails}
      serverSide={false} // 前端分页、排序
      rowSelection={false}
      pagination={{ size: 100 }}
    />
  );
}
