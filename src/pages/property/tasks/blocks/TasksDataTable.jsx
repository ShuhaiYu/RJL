// src/components/TasksDataTable.jsx

import { useMemo } from "react";
// 假设你的 DataGrid 封装在同目录下或其它位置，请根据实际情况修改导入
import {
  DataGrid,
  DataGridColumnHeader,

} from "@/components/data-grid";
import { Input } from "@/components/ui/input";
import StatusSelectCell from "./StatusSelectCell";

export default function TasksDataTable({ tasks, onTaskClick, onStatusUpdated }) {

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
  const columns = useMemo(() => {
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

        enableSorting: true,
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
        enableSorting: true,   // 列启用排序
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
          <DataGridColumnHeader column={header.column} title="Type" filter={<ColumnInputFilter column={header.column} />}/>
        ),
        cell: ({ row }) => {
          const task = row.original;
          // 取出 type 字段
          const { type } = task;
          
          // 根据不同 type 设置颜色类
          const typeColorClasses = {
            "gas": "bg-blue-100 text-blue-700",
            "electricity": "bg-yellow-100 text-yellow-700",
            "smoke alarm": "bg-green-100 text-green-700",
          };
          // 如果 type 不在 [A,B,C], 给一个默认颜色
          const colorClass = typeColorClasses[type] || "bg-gray-100 text-gray-700";
      
          return (
            <span className={`rounded px-2 py-1 ${colorClass}`}>
              {type}
            </span>
          );
        },
      },
      {
        accessorKey: "due_date",
        header: ({ header }) => (
          <DataGridColumnHeader column={header.column} title="Due Date" filter={<ColumnInputFilter column={header.column} />}/>
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
      {
        accessorKey: "next_reminder",
        header: ({ header }) => (
          <DataGridColumnHeader column={header.column} title="Next Reminder" filter={<ColumnInputFilter column={header.column} />}/>
        ),
        cell: ({ getValue }) => {
          const val = getValue();
          return val ? new Date(val).toLocaleString() : "-";
        },
      },
      // 如果你想放一个操作列，就再加一个
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const task = row.original;
          return (
            <button
              className="btn btn-sm btn-clear btn-light"
              onClick={() => {
                onTaskClick(task.id);
              }}
            >
              <span className="flex gap-1 items-center"><i className="ki-outline ki-notepad-edit"></i>
              Edit</span>
              
            </button>
          );
        },
      },
    ];
  }, [onTaskClick, onStatusUpdated]);

  // 渲染 DataGrid
  return (
    <DataGrid
      columns={columns}
      data={tasks} // 这里传入的 tasks 就是你外部筛选后的数组
      serverSide={false} // 前端分页、排序
      rowSelection={false} // 不需要多选行
    />
  );
}
