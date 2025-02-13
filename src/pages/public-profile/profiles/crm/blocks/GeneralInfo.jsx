// GeneralInfo.jsx
const GeneralInfo = ({ user }) => {
  if (!user) {
    return <div className="bg-white p-5 shadow rounded">Loading...</div>;
  }

  return (
    <div className="bg-white p-5 shadow rounded">
      <h2 className="text-2xl font-bold">{user.name}</h2>
      <p className="mt-2 text-gray-600">Email: {user.email}</p>
      <p className="mt-1 text-gray-600">Role: {user.role}</p>

      {user.agency && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Agency</h3>
          <p className="mt-1">{user.agency.agency_name}</p>
          <p className="mt-1 text-gray-500">{user.agency.address}</p>
          <p className="mt-1 text-gray-500">Tel: {user.agency.phone}</p>
        </div>
      )}
    </div>
  );
};

export { GeneralInfo };
