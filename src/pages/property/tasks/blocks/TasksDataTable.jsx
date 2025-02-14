// src/components/TasksDataTable.jsx

import { useMemo } from "react";
// 假设你的 DataGrid 封装在同目录下或其它位置，请根据实际情况修改导入
import {
  DataGrid,
  DataGridColumnHeader,

} from "@/components/data-grid";
import { Input } from "@/components/ui/input";
import StatusSelectCell from "./StatusSelectCell";

export default function TasksDataTable({ tasks, onTaskClick }) {

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
        accessorKey: "status", // 其实在 data 里
        header: "Status",      // 也可以像上面那样 DataGridColumnHeader + filter
        cell: ({ row }) => {
          const task = row.original;
          return (
            <StatusSelectCell
              task={task}
              // 若想在修改成功后刷新表格 => onStatusUpdated={() => ...}
              // onStatusUpdated={(id, newStatus) => { ...some refresh... }}
            />
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
      {
        accessorKey: "type",
        header: ({ header }) => (
          <DataGridColumnHeader column={header.column} title="Type" filter={<ColumnInputFilter column={header.column} />}/>
        ),
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
              onClick={(e) => {
                e.stopPropagation();
                onTaskClick?.(task.id);
              }}
            >
              <span className="flex gap-1 items-center"><i className="ki-outline ki-notepad-edit"></i>
              Edit</span>
              
            </button>
          );
        },
      },
    ];
  }, [onTaskClick]);

  // 渲染 DataGrid
  return (
    <DataGrid
      columns={columns}
      data={tasks} // 这里传入的 tasks 就是你外部筛选后的数组
      serverSide={false} // 前端分页、排序
      rowSelection={false} // 不需要多选行
      //   pagination={{
      //     size: 5,
      //     sizes: [5, 10, 20],
      //   }}
    />
  );
}
