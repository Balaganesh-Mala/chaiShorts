import React, { useEffect, useState } from "react";
import API from "../api/apiClient";
import toast from "react-hot-toast";
import { Pencil, Trash2, PlusCircle } from "lucide-react";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    categoryName: "",
    categoryDescription: "",
    categoryImage: "",
    status: "active",
    isFeatured: false,
  });

  // ✅ Fetch all categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/categories");
      setCategories(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ✅ Handle form input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ✅ Handle create / update category
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await API.put(`/admin/categories/${editing._id}`, formData);
        toast.success("Category updated successfully!");
      } else {
        await API.post("/admin/categories", formData);
        toast.success("Category added successfully!");
      }
      setShowForm(false);
      setEditing(null);
      setFormData({
        categoryName: "",
        categoryDescription: "",
        categoryImage: "",
        status: "active",
        isFeatured: false,
      });
      fetchCategories();
    } catch (error) {
      toast.error("Failed to save category");
    }
  };

  // ✅ Delete category
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await API.delete(`/admin/categories/${id}`);
      toast.success("Category deleted!");
      fetchCategories();
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  // ✅ Edit category
  const handleEdit = (cat) => {
    setEditing(cat);
    setFormData(cat);
    setShowForm(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Category Management</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditing(null);
            setFormData({
              categoryName: "",
              categoryDescription: "",
              categoryImage: "",
              status: "active",
              isFeatured: false,
            });
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          <PlusCircle size={18} /> {showForm ? "Close" : "Add Category"}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Category Name
              </label>
              <input
                type="text"
                name="categoryName"
                value={formData.categoryName}
                onChange={handleChange}
                required
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Category Image URL
              </label>
              <input
                type="text"
                name="categoryImage"
                value={formData.categoryImage}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-1">
                Description
              </label>
              <textarea
                name="categoryDescription"
                value={formData.categoryDescription}
                onChange={handleChange}
                rows={3}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
              />
              <label className="text-gray-700 font-medium">Mark as Featured</label>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-semibold"
            >
              {editing ? "Update Category" : "Create Category"}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        {loading ? (
          <p className="text-center py-6 text-gray-500">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="text-center py-6 text-gray-500">No categories found.</p>
        ) : (
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-blue-100 text-gray-900">
              <tr>
                <th className="py-3 px-4 text-left">Image</th>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Description</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Featured</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr
                  key={cat._id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <img
                      src={cat.categoryImage || "https://via.placeholder.com/80"}
                      alt={cat.categoryName}
                      className="w-16 h-16 rounded-md object-cover border"
                    />
                  </td>
                  <td className="py-3 px-4 font-semibold">{cat.categoryName}</td>
                  <td className="py-3 px-4">{cat.categoryDescription || "—"}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        cat.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {cat.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {cat.isFeatured ? "⭐ Yes" : "—"}
                  </td>
                  <td className="py-3 px-4 flex gap-3 justify-center">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Category;
