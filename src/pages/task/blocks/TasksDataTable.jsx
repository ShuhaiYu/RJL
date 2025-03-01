// src/components/TasksDataTable.jsx

import { useMemo, useState } from "react";
// 假设你的 DataGrid 封装在同目录下或其它位置，请根据实际情况修改导入
import { DataGrid, DataGridColumnHeader } from "@/components/data-grid";
import { Input } from "@/components/ui/input";
import StatusSelectCell from "./StatusSelectCell";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function TasksDataTable({
  tasks,
  onTaskClick,
  onStatusUpdated,
  hideColumns = [],
}) {
  const [filteredCount, setFilteredCount] = useState(tasks.length);

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
  // 定义表格列
  const baseColumns = useMemo(() => {
    return [
      {
        accessorKey: "property_address",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Property Address"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
        cell: ({ row }) => {
          const task = row.original;
          return (
            <Link className="btn btn-link" to={`/property/${task.property_id}`}>
              {task.property_address}
            </Link>
          );
        },
        enableSorting: true,
      },
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
          const task = row.original;
          return (
            <Link className="btn btn-link" to={`/agencies/${task.agency_id}`}>
              {task.agency_name}
            </Link>
          );
        },
        enableSorting: true, // 列启用排序
      },
      // 新的 status 列
      {
        accessorKey: "status",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Status"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
        cell: ({ row }) => {
          const task = row.original;
          return (
            <StatusSelectCell
              task={task}
              // 刷新
              onStatusUpdated={onStatusUpdated}
            />
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: "type",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Type"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
        cell: ({ row }) => {
          const task = row.original;
          // 取出 type 字段
          const { type } = task;

          // 根据不同 type 设置颜色类
          const typeColorClasses = {
            "gas & electric": "bg-blue-100 text-blue-700",
            electric: "bg-yellow-100 text-yellow-700",
            "smoke alarm": "bg-green-100 text-green-700",
          };
          // 如果 type 不在 [A,B,C], 给一个默认颜色
          const colorClass =
            typeColorClasses[type] || "bg-gray-100 text-gray-700";

          return (
            <span className={`rounded px-2 py-1 ${colorClass}`}>{type}</span>
          );
        },
      },
      {
        accessorKey: "due_date",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Due Date"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
        cell: ({ getValue }) => {
          const val = getValue();
          return val ? new Date(val).toLocaleString() : "-";
        },
      },
      {
        accessorKey: "repeat_frequency",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Repeat Frequency"
            filter={<ColumnInputFilter column={header.column} />}
          />
        ),
      },
      // {
      //   accessorKey: "next_reminder",
      //   header: ({ header }) => (
      //     <DataGridColumnHeader
      //       column={header.column}
      //       title="Next Reminder"
      //       filter={<ColumnInputFilter column={header.column} />}
      //     />
      //   ),
      //   cell: ({ getValue }) => {
      //     const val = getValue();
      //     return val ? new Date(val).toLocaleString() : "-";
      //   },
      // },
      // 如果你想放一个操作列，就再加一个
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const task = row.original;
          return (
            <Button
              variant="view"
              onClick={() => {
                onTaskClick(task.id);
              }}
            >
              <span className="flex gap-1 items-center">View</span>
            </Button>
          );
        },
      },
    ];
  }, [onTaskClick, onStatusUpdated]);

  const columns = useMemo(() => {
    return baseColumns.filter((col) => {
      const key = col.accessorKey || col.id;
      return !hideColumns.includes(key);
    });
  }, [baseColumns, hideColumns]);

  // 渲染 DataGrid
  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        Showing {filteredCount} of {tasks.length} tasks
      </p>
      <DataGrid
        columns={columns}
        data={tasks} // 这里传入的是所有任务数据
        serverSide={false}
        rowSelection={false}
        pagination={{ size: 100 }}
        // 将 onFilteredDataChange 回调传递给 DataGrid
        onFilteredDataChange={(count) => setFilteredCount(count)}
      />
    </div>
  );
}
