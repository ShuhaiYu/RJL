// UserDataTable.jsx
/**
 * 通用 DataTable 卡片组件
 * @param {Object} props
 * @param {string} props.title - 表格标题
 * @param {React.ReactNode} props.children - 表格主体（table 元素）
 * @param {React.ReactNode} [props.footer] - 可选的表格底部区域（分页、页数等信息）
 */
const DataTableCard = ({ title, children, footer }) => {
  return (
    <div className="grid">
      <div className="card card-grid min-w-full">
        <div className="card-header py-5 flex flex-wrap items-center justify-between">
          <h3 className="card-title text-xl font-bold">{title}</h3>
          {/* 这里可以添加开关或其他操作 */}
          <label className="switch switch-sm">
            <input
              defaultChecked
              className="order-2"
              name="check"
              type="checkbox"
              value="1"
            />
            <span className="switch-label order-1">Push Alerts</span>
          </label>
        </div>
        <div className="card-body">{children}</div>
        {footer && (
          <div className="card-footer justify-center md:justify-between flex-col md:flex-row gap-3 text-gray-600 text-xs font-medium">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * UserDataTable 组件：分别显示 properties 与 tasks 的 DataTable
 * @param {Object} props
 * @param {Array} props.tasks - 任务数组
 * @param {Array} props.properties - 房产数组
 */
const UserDataTable = ({ tasks, properties }) => {
  return (
    <div className="space-y-8">
      {/* Properties DataTable */}
      <DataTableCard
        title="Properties"
        footer={
          <div className="flex items-center gap-4 w-full">
            <div className="flex items-center gap-2">
              Show
              <select
                className="select select-sm w-16"
                data-datatable-size="true"
                name="perpage"
              >
                <option>5</option>
                <option>10</option>
                <option>20</option>
              </select>
              per page
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <span data-datatable-info="true">
                Showing 1 to {properties.length} of {properties.length} entries
              </span>
              <div className="pagination" data-datatable-pagination="true">
                {/* 如果需要，可以在这里添加分页控件 */}
              </div>
            </div>
          </div>
        }
      >
        <div className="scrollable-x-auto">
          <table
            className="table table-auto table-border"
            data-datatable-table="true"
          >
            <thead>
              <tr>
                <th className="w-[100px] text-center">ID</th>
                <th className="min-w-[185px]">Address</th>
                <th className="w-[185px]">Active</th>
                <th className="w-[60px]"></th>
                <th className="w-[60px]"></th>
              </tr>
            </thead>
            <tbody>
              {properties && properties.length > 0 ? (
                properties.map((property) => (
                  <tr key={property.id} className="border-b">
                    <td className="px-4 py-2 text-center">{property.id}</td>
                    <td className="px-4 py-2">{property.address}</td>
                    <td className="px-4 py-2">
                      {property.is_active ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-2">
                      <a
                        className="btn btn-sm btn-icon btn-clear btn-light"
                        href="#"
                      >
                        <i className="ki-outline ki-notepad-edit"></i>
                      </a>
                    </td>
                    <td className="px-4 py-2">
                      <a
                        className="btn btn-sm btn-icon btn-clear btn-light"
                        href="#"
                      >
                        <i className="ki-outline ki-trash"></i>
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-2 text-center text-gray-500"
                  >
                    No properties available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DataTableCard>

      {/* Tasks DataTable */}
      <DataTableCard
        title="Tasks"
        footer={
          <div className="flex items-center gap-4 w-full">
            <div className="flex items-center gap-2">
              Show
              <select
                className="select select-sm w-16"
                data-datatable-size="true"
                name="perpage"
              >
                <option>5</option>
                <option>10</option>
                <option>20</option>
              </select>
              per page
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <span data-datatable-info="true">
                Showing 1 to {tasks.length} of {tasks.length} entries
              </span>
              <div className="pagination" data-datatable-pagination="true">
                {/* 如果需要，可以在这里添加分页控件 */}
              </div>
            </div>
          </div>
        }
      >
        <div className="scrollable-x-auto">
          <table
            className="table table-auto table-border"
            data-datatable-table="true"
          >
            <thead>
              <tr>
                <th className="w-[100px] text-center">ID</th>
                <th className="min-w-[185px]">Task Name</th>
                <th className="w-[185px]">Status</th>
                <th className="w-[60px]"></th>
                <th className="w-[60px]"></th>
              </tr>
            </thead>
            <tbody>
              {tasks && tasks.length > 0 ? (
                tasks.map((task) => (
                  <tr key={task.id} className="border-b">
                    <td className="px-4 py-2 text-center">{task.id}</td>
                    <td className="px-4 py-2">{task.task_name}</td>
                    <td className="px-4 py-2">{task.status}</td>
                    <td className="px-4 py-2">
                      <a
                        className="btn btn-sm btn-icon btn-clear btn-light"
                        href="#"
                      >
                        <i className="ki-outline ki-notepad-edit"></i>
                      </a>
                    </td>
                    <td className="px-4 py-2">
                      <a
                        className="btn btn-sm btn-icon btn-clear btn-light"
                        href="#"
                      >
                        <i className="ki-outline ki-trash"></i>
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-2 text-center text-gray-500"
                  >
                    No tasks available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DataTableCard>
    </div>
  );
};

export { UserDataTable };
