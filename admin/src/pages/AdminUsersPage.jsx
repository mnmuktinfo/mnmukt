import { useEffect, useState } from "react";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);

  // Later: replace with real API call
  useEffect(() => {
    // Simulate fetch from API
    const fetchUsers = async () => {
      try {
        // For now, mock data
        const mockUsers = [
          {
            id: 1,
            name: "Ravi Kumar",
            email: "ravi@example.com",
            role: "User",
            status: "Active",
          },
          {
            id: 2,
            name: "Admin User",
            email: "admin@example.com",
            role: "Admin",
            status: "Active",
          },
          {
            id: 3,
            name: "Test User",
            email: "test@example.com",
            role: "User",
            status: "Inactive",
          },
        ];
        setUsers(mockUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Users</h1>

      {users.length === 0 ? (
        <div className="text-center text-gray-500 border rounded-lg p-6">
          <p>No users found. Add new users to see them here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
                <th className="py-3 px-6">ID</th>
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-6">Email</th>
                <th className="py-3 px-6">Role</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-6">{user.id}</td>
                  <td className="py-3 px-6">{user.name}</td>
                  <td className="py-3 px-6">{user.email}</td>
                  <td className="py-3 px-6">{user.role}</td>
                  <td className="py-3 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-right space-x-2">
                    <button className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600">
                      Edit
                    </button>
                    <button className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
