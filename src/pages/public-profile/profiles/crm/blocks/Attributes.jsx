// Attributes.jsx
const Attributes = ({ user }) => {
  if (!user) {
    return null;
  }

  return (
    <div className="bg-white p-5 shadow rounded">
      <h3 className="text-lg font-semibold mb-3">Attributes</h3>
      
      <div>
        <h4 className="font-semibold">Properties:</h4>
        {user.properties && user.properties.length > 0 ? (
          <ul className="list-disc ml-5">
            {user.properties.map((property) => (
              <li key={property.id}>{property.address}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No properties available.</p>
        )}
      </div>

      <div className="mt-4">
        <h4 className="font-semibold">Tasks:</h4>
        {user.tasks && user.tasks.length > 0 ? (
          <ul className="list-disc ml-5">
            {user.tasks.map((task) => (
              <li key={task.id}>
                {task.task_name} - <span className="text-gray-500">{task.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No tasks available.</p>
        )}
      </div>
    </div>
  );
};

export { Attributes };
