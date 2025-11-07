import { useEffect, useState } from "react";
import API from "../api/apiClient";
import toast from "react-hot-toast";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data.data || res.data);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "blocked" : "active";
      await API.put(`/admin/users/${id}`, { status: newStatus });
      toast.success(`User ${newStatus === "active" ? "unblocked" : "blocked"} successfully`);
      fetchUsers();
    } catch {
      toast.error("Failed to update user status");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="p-6">Loading users...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">Users Management</h2>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md"
        />
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
        <table className="w-full border border-gray-200 text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Gender</th>
              <th className="p-3 border">Country</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Registered</th>
              <th className="p-3 border">Last Login</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user._id} className="border-t">
                  <td className="p-3">{user.fullName}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.gender || "-"}</td>
                  <td className="p-3">{user.country || "-"}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.status === "active"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {new Date(user.dateOfRegistration).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => toggleStatus(user._id, user.status)}
                      className={`px-2 py-1 rounded text-white ${
                        user.status === "active" ? "bg-red-500" : "bg-green-600"
                      }`}
                    >
                      {user.status === "active" ? "Block" : "Unblock"}
                    </button>
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="bg-gray-700 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
