import React, { useEffect, useState } from "react";
import API from "../api/apiClient";
import toast from "react-hot-toast";

const Video = () => {
  const [videos, setVideos] = useState([]);
  const [songs, setSongs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    videoTitle: "",
    description: "",
    duration: "",
    videoUrl: "",
    thumbnailUrl: "",
    linkedSong: "",
    linkedCategory: "",
    status: "approved",
    isFeatured: false,
  });

  useEffect(() => {
    loadVideos();
    loadHelpers();
  }, []);

  // ✅ Load all videos
  const loadVideos = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/videos");
      setVideos(res.data.data || []);
    } catch (error) {
      toast.error("Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load songs and categories for dropdowns
  const loadHelpers = async () => {
    try {
      const songsRes = await API.get("/admin/videos/helpers/songs");
      const categoriesRes = await API.get("/admin/videos/helpers/categories");
      setSongs(songsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ Handle upload (Cloudinary or your API)
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
    } catch (error) {
      toast.error("Upload failed");
      return "";
    } finally {
      setUploading(false);
    }
  };

  // ✅ Handle add/edit video
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVideo) {
        await API.put(`/admin/videos/${editingVideo._id}`, formData);
        toast.success("Video updated successfully ✅");
      } else {
        await API.post("/admin/videos", formData);
        toast.success("Video added successfully ✅");
      }
      setShowForm(false);
      setEditingVideo(null);
      resetForm();
      loadVideos();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving video");
    }
  };

  // ✅ Reset form
  const resetForm = () => {
    setFormData({
      videoTitle: "",
      description: "",
      duration: "",
      videoUrl: "",
      thumbnailUrl: "",
      linkedSong: "",
      linkedCategory: "",
      status: "approved",
      isFeatured: false,
    });
  };

  // ✅ Delete video
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    try {
      await API.delete(`/admin/videos/${id}`);
      toast.success("Video deleted successfully");
      loadVideos();
    } catch {
      toast.error("Failed to delete");
    }
  };

  // ✅ Edit video
  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      videoTitle: video.videoTitle,
      description: video.description,
      duration: video.duration,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      linkedSong: video.linkedSong?._id || "",
      linkedCategory: video.linkedCategory?._id || "",
      status: video.status,
      isFeatured: video.isFeatured,
    });
    setShowForm(true);
  };

  // ✅ Update status / feature
  const updateStatus = async (id, updateFields) => {
    try {
      await API.put(`/admin/videos/${id}`, updateFields);
      toast.success("Video updated successfully");
      loadVideos();
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">Short Videos</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setEditingVideo(null);
              resetForm();
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ Add Video"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow mb-8 grid gap-4 md:grid-cols-2"
        >
          <input
            type="text"
            placeholder="Video Title"
            value={formData.videoTitle}
            onChange={(e) =>
              setFormData({ ...formData, videoTitle: e.target.value })
            }
            className="border p-2 rounded-md"
            required
          />

          <input
            type="text"
            placeholder="Duration (e.g. 0:45)"
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: e.target.value })
            }
            className="border p-2 rounded-md"
          />

          <select
            value={formData.linkedSong}
            onChange={(e) =>
              setFormData({ ...formData, linkedSong: e.target.value })
            }
            className="border p-2 rounded-md"
          >
            <option value="">Select Song</option>
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
            className="border p-2 rounded-md"
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
            className="border p-2 rounded-md md:col-span-2"
          />

          {/* Thumbnail */}
          <div>
            <label className="block text-sm mb-1">Thumbnail</label>
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
                alt="thumbnail"
                className="w-24 h-24 mt-2 rounded-md border object-cover"
              />
            )}
          </div>

          {/* Video File */}
          <div>
            <label className="block text-sm mb-1">Video File</label>
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
                className="w-32 h-20 mt-2 rounded-md border"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="col-span-2 bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
          >
            {uploading ? "Uploading..." : editingVideo ? "Update" : "Save"}
          </button>
        </form>
      )}

      {/* Table */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : videos.length === 0 ? (
        <p className="text-gray-500 text-center">No videos found.</p>
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
                      alt="thumbnail"
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
                      controls
                      className="w-20 h-14 rounded-md border"
                    />
                  </td>
                  <td className="p-3 flex justify-center gap-2 flex-wrap">
                    <button
                      onClick={() =>
                        updateStatus(video._id, {
                          status:
                            video.status === "approved"
                              ? "rejected"
                              : "approved",
                        })
                      }
                      className={`px-2 py-1 rounded-md border ${
                        video.status === "approved"
                          ? "text-red-600 border-red-600 hover:bg-red-50"
                          : "text-green-600 border-green-600 hover:bg-green-50"
                      }`}
                    >
                      {video.status === "approved" ? "Reject" : "Approve"}
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(video._id, {
                          isFeatured: !video.isFeatured,
                        })
                      }
                      className={`px-2 py-1 rounded-md border ${
                        video.isFeatured
                          ? "bg-yellow-400 text-white border-yellow-500"
                          : "text-yellow-600 border-yellow-500 hover:bg-yellow-100"
                      }`}
                    >
                      {video.isFeatured ? "Unfeature" : "Feature"}
                    </button>

                    <button
                      onClick={() => handleEdit(video)}
                      className="text-blue-600 border border-blue-500 px-2 py-1 rounded-md hover:bg-blue-50"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(video._id)}
                      className="text-gray-600 border border-gray-400 px-2 py-1 rounded-md hover:bg-gray-100"
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
    </div>
  );
};

export default Video;
