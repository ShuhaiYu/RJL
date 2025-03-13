// GeneralInfo.jsx (示例)
import { useState } from "react";
import { ChangePasswordModal } from "./ChangePasswordModal";

export const GeneralInfo = ({ user }) => {
  const [showModal, setShowModal] = useState(false);

  if (!user) {
    return <div className="bg-white p-5 shadow rounded">Loading...</div>;
  }

  return (
    <div className="bg-white p-5 shadow rounded flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
        <p className="mt-2 text-gray-600">
          <span className="font-semibold">Email:</span> {user.email}
        </p>
        <p className="text-gray-600">
          <span className="font-semibold">Role:</span> {user.role}
        </p>
      </div>

      {user.agency && (
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-800">Agency</h3>
          <p className="text-gray-600">{user.agency.agency_name}</p>
          <p className="text-gray-500">{user.agency.address}</p>
          <p className="text-gray-500">Tel: {user.agency.phone}</p>
        </div>
      )}

      <div className="pt-4 border-t">
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Change Password
        </button>
      </div>

      <ChangePasswordModal
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};
