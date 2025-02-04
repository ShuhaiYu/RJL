// GeneralInfo.jsx
import React from 'react';

const GeneralInfo = ({ user }) => {
  // 构造需要展示的字段数组
  const fields = [
    { label: 'Name', value: user.name || 'N/A' },
    { label: 'Email', value: user.email || 'N/A' },
    { label: 'Role', value: user.role || 'N/A' },
  ];

  if (user.role === 'agency') {
    fields.push({ label: 'Agency Name', value: user.agencyName || 'N/A' });
    fields.push({ label: 'Agency Phone', value: user.agencyPhone || 'N/A' });
    fields.push({ label: 'Agency Address', value: user.agencyAddress || 'N/A' });
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">General Info</h3>
      </div>
      <div className="card-body pt-3.5 pb-3.5">
        <table className="table-auto w-full">
          <tbody>
            {fields.map((field, index) => (
              <tr key={index}>
                <td className="text-sm text-gray-600 pb-3 pr-4">{field.label}:</td>
                <td className="text-sm text-gray-900 pb-3">{field.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { GeneralInfo };
