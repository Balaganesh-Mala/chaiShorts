import React, { useEffect, useState } from "react";
import API from "../api/apiClient";
import toast from "react-hot-toast";

const ShortVideos = () => {
  const [videos, setVideos] = useState([]);
  const [songs, setSongs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [formData, setFormData] = useState({
    videoTitle: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: "",
    duration: "",
    linkedSong: "",
    linkedCategory: "",
    status: "approved",
    isFeatured: false,
  });

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // ✅ Load Videos, Songs, Categories
  useEffect(() => {
    loadVideos();
    loadHelpers();
  }, [page]);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/videos?page=${page}&limit=10`);
      setVideos(res.data.data || []);
      setPages(res.data.pages || 1);
    } catch {
      toast.error("Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  const loadHelpers = async () => {
    try {
      const songRes = await API.get("/admin/videos/helpers/songs");
      const catRes = await API.get("/admin/videos/helpers/categories");
      setSongs(songRes.data.data || []);
      setCategories(catRes.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Upload file to Cloudinary
  const uploadFile = async (file, folder) => {
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    try {
      const res = await API.post("/admin/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.fileUrl;
    } catch {
      toast.error("File upload failed");
      return "";
    } finally {
      setUploading(false);
    }
  };

  // ✅ Handle Submit (Add/Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingVideo) {
        await API.put(`/admin/videos/${editingVideo._id}`, formData);
        toast.success("Video updated successfully");
      } else {
        await API.post("/admin/videos", formData);
        toast.success("Video added successfully");
      }

      setShowForm(false);
      setEditingVideo(null);
      resetForm();
      loadVideos();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving video");
    }
  };

  // ✅ Delete Video
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this video permanently?")) return;
    try {
      await API.delete(`/admin/videos/${id}`);
      toast.success("Video deleted");
      loadVideos();
    } catch {
      toast.error("Failed to delete");
    }
  };

  // ✅ Edit Mode
  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      videoTitle: video.videoTitle,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      linkedSong: video.linkedSong?._id || "",
      linkedCategory: video.linkedCategory?._id || "",
      status: video.status,
      isFeatured: video.isFeatured,
    });
    setShowForm(true);
  };

  // ✅ Reset Form
  const resetForm = () => {
    setFormData({
      videoTitle: "",
      description: "",
      videoUrl: "",
      thumbnailUrl: "",
      duration: "",
      linkedSong: "",
      linkedCategory: "",
      status: "approved",
      isFeatured: false,
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">Short Videos</h2>

        <button
          onClick={() => {
            setShowForm(!showForm);
            resetForm();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ Add Video"}
        </button>
      </div>

      {/* Form Section */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow mb-8 grid gap-4 md:grid-cols-2"
        >
          <input
            type="text"
            placeholder="Video Title"
            value={formData.videoTitle}
            onChange={(e) => setFormData({ ...formData, videoTitle: e.target.value })}
            className="border rounded-md p-2"
            required
          />
          <input
            type="text"
            placeholder="Duration (e.g. 00:45)"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            className="border rounded-md p-2"
          />
          <select
            value={formData.linkedSong}
            onChange={(e) => setFormData({ ...formData, linkedSong: e.target.value })}
            className="border rounded-md p-2"
          >
            <option value="">Select Linked Song</option>
            {songs.map((song) => (
              <option key={song._id} value={song._id}>
                {song.songName} - {song.singerName}
              </option>
            ))}
          </select>
          <select
            value={formData.linkedCategory}
            onChange={(e) =>
              setFormData({ ...formData, linkedCategory: e.target.value })
            }
            className="border rounded-md p-2"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.categoryName}
              </option>
            ))}
          </select>

          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="border rounded-md p-2 md:col-span-2"
          />

          <div>
            <label className="block text-sm text-gray-600 mb-1">Thumbnail</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const url = await uploadFile(e.target.files[0], "thumbnails");
                setFormData({ ...formData, thumbnailUrl: url });
              }}
            />
            {formData.thumbnailUrl && (
              <img
                src={formData.thumbnailUrl}
                alt="thumb"
                className="w-20 h-20 rounded-md mt-2"
              />
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Video File</label>
            <input
              type="file"
              accept="video/*"
              onChange={async (e) => {
                const url = await uploadFile(e.target.files[0], "videos");
                setFormData({ ...formData, videoUrl: url });
              }}
            />
            {formData.videoUrl && (
              <video
                src={formData.videoUrl}
                controls
                className="w-40 mt-2 rounded-md"
              ></video>
            )}
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="col-span-2 bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
          >
            {uploading ? "Uploading..." : editingVideo ? "Update Video" : "Save Video"}
          </button>
        </form>
      )}

      {/* Video Table */}
      {loading ? (
        <p>Loading...</p>
      ) : videos.length === 0 ? (
        <p className="text-gray-500">No videos found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="p-3">Thumbnail</th>
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Song</th>
                <th className="p-3">Views</th>
                <th className="p-3">Status</th>
                <th className="p-3">Video</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr key={video._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <img
                      src={video.thumbnailUrl}
                      className="w-14 h-14 rounded-md object-cover"
                    />
                  </td>
                  <td className="p-3 font-medium">{video.videoTitle}</td>
                  <td className="p-3">
                    {video.linkedCategory?.categoryName || "—"}
                  </td>
                  <td className="p-3">{video.linkedSong?.songName || "—"}</td>
                  <td className="p-3">{video.viewsCount}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        video.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : video.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {video.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <video
                      src={video.videoUrl}
                      className="w-24 h-14 rounded-md"
                      controls
                    />
                  </td>
                  <td className="p-3 flex justify-center gap-3">
                    <button
                      onClick={() => handleEdit(video)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(video._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center gap-3 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 border rounded-md disabled:opacity-50"
        >
          Prev
        </button>
        {[...Array(pages).keys()].map((p) => (
          <button
            key={p}
            onClick={() => setPage(p + 1)}
            className={`px-3 py-1 border rounded-md ${
              page === p + 1 ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            {p + 1}
          </button>
        ))}
        <button
          disabled={page === pages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 border rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ShortVideos;
