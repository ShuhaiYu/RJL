// src/pages/blocks/EmailsDataTable.jsx
import { useMemo, useState } from "react";
import { DataGrid, DataGridColumnHeader } from "@/components/data-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { KeenIcon } from "@/components";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Open HTML content in new window
const handleViewEmail = (emailHtml) => {
  const newWindow = window.open("", "_blank");
  newWindow.document.write(emailHtml);
  newWindow.document.close();
};

export default function EmailsDataTable({ emails, onProcessEmail, processingId }) {
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
        accessorKey: "is_processed",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Status"
          />
        ),
        cell: ({ row }) => {
          const email = row.original;
          return email.is_processed ? (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
              <KeenIcon icon="check" className="mr-1 text-xs" />
              Processed
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
              <KeenIcon icon="time" className="mr-1 text-xs" />
              Pending
            </span>
          );
        },
        enableSorting: true,
        filterFn: (row, columnId, filterValue) => {
          const isProcessed = row.getValue(columnId);
          const lowerFilter = filterValue.toLowerCase();
          if (lowerFilter === 'processed' || lowerFilter === 'yes') return isProcessed === true;
          if (lowerFilter === 'pending' || lowerFilter === 'no') return isProcessed === false;
          return true;
        },
      },
      {
        accessorKey: "process_note",
        header: ({ header }) => (
          <DataGridColumnHeader
            column={header.column}
            title="Process Note"
          />
        ),
        cell: ({ row }) => {
          const email = row.original;
          if (!email.process_note) {
            return <span className="text-gray-400">-</span>;
          }
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-xs text-gray-700 truncate max-w-[200px] cursor-help">
                    {email.process_note.split('\n')[0]}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-md">
                  <pre className="text-xs whitespace-pre-wrap">{email.process_note}</pre>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
        enableSorting: false,
      },
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
          // Show "-" if not processed yet (no property linked)
          if (!email.is_processed || !email.property_id) {
            return <span className="text-gray-400">-</span>;
          }
          return (
            <Link
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
              to={`/property/${email.property_id}`}
            >
              <KeenIcon icon="home-2" className="text-sm" />
              {email.property_address || 'View Property'}
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
            title="Tasks"
          />
        ),
        cell: ({ row }) => {
          const email = row.original;
          // Show "-" if not processed yet or no tasks created
          const tasks = email.tasks || [];
          if (!email.is_processed || tasks.length === 0) {
            return <span className="text-gray-400">-</span>;
          }
          // Display multiple tasks
          return (
            <div className="flex flex-col gap-1">
              {tasks.map((task) => (
                <Link
                  key={task.id}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                  to={`/property/tasks/${task.id}`}
                >
                  <KeenIcon icon="note-2" className="text-xs" />
                  <span className="truncate max-w-[120px]" title={task.task_name}>
                    {task.type || task.task_name || 'View Task'}
                  </span>
                </Link>
              ))}
            </div>
          );
        },
        enableSorting: false,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const email = row.original;
          const isProcessing = processingId === email.id;

          return (
            <div className="flex gap-2">
              {/* Process button - only show for unprocessed emails */}
              {!email.is_processed && (
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onProcessEmail(email.id);
                  }}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <KeenIcon icon="loading" className="text-sm animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <KeenIcon icon="setting-3" className="text-sm" />
                      Process
                    </>
                  )}
                </Button>
              )}
              {/* View HTML button */}
              {email.html && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewEmail(email.html);
                  }}
                >
                  <KeenIcon icon="eye" className="text-sm" />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [onProcessEmail, processingId]
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
