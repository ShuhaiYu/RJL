// GeneralInfo.jsx
import { useState } from "react";
import { KeenIcon } from "@/components/keenicons";
import { ChangePasswordModal } from "./ChangePasswordModal";

export const GeneralInfo = ({ user }) => {
  const [showModal, setShowModal] = useState(false);

  if (!user) {
    return (
      <div className="card bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* User avatar and basic information */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{user.name || 'Unknown User'}</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <KeenIcon icon="sms" className="text-base" />
            <span>{user.email || 'No email'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <KeenIcon icon="badge" className="text-base" />
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
              {user.role || 'No role'}
            </span>
          </div>
        </div>
      </div>

      {/* Contact information */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <KeenIcon icon="calendar" className="text-gray-600" />
          </div>
          <div>
            <span className="text-gray-500">Join Date</span>
            <p className="text-gray-900 font-medium">
              {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US') : 'Unknown'}
            </p>
          </div>
        </div>
        
        {user.phone && (
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <KeenIcon icon="phone" className="text-gray-600" />
            </div>
            <div>
              <span className="text-gray-500">Phone</span>
              <p className="text-gray-900 font-medium">{user.phone}</p>
            </div>
          </div>
        )}
      </div>

      {/* Agency information */}
      {user.agency && (
        <div className="border-t border-gray-100 pt-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <KeenIcon icon="office-bag" className="text-lg text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Agency Information</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mt-0.5">
                <KeenIcon icon="home-2" className="text-blue-600" />
              </div>
              <div>
                <span className="text-gray-500">Agency Name</span>
                <p className="text-gray-900 font-medium">{user.agency.agency_name}</p>
              </div>
            </div>
            
            {user.agency.address && (
              <div className="flex items-start gap-3 text-sm">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center mt-0.5">
                  <KeenIcon icon="geolocation" className="text-green-600" />
                </div>
                <div>
                  <span className="text-gray-500">Address</span>
                  <p className="text-gray-900 font-medium">{user.agency.address}</p>
                </div>
              </div>
            )}
            
            {user.agency.phone && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                  <KeenIcon icon="phone" className="text-purple-600" />
                </div>
                <div>
                  <span className="text-gray-500">Contact Phone</span>
                  <p className="text-gray-900 font-medium">{user.agency.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="border-t border-gray-100 pt-6">
        <div className="flex gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <KeenIcon icon="lock" className="text-base" />
            Change Password
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
            <KeenIcon icon="pencil" className="text-base" />
            Editorial Material
          </button>
        </div>
      </div>

      <ChangePasswordModal
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};
