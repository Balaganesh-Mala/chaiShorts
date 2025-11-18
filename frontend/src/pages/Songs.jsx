import React, { useEffect, useState } from "react";
import API from "../api/apiClient";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { Circles } from "react-loader-spinner";

const Songs = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [movie, setMovie] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [limit] = useState(10);

  const [showForm, setShowForm] = useState(false);

  // Uploading States
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  const [formData, setFormData] = useState({
    songName: "",
    authorName: "",
    singerName: "",
    categoryName: "",
    movieName: "",
    description: "",
    duration: "",
    language: "",
    genre: "",
    songUrl: "",
    thumbnailUrl: "",
    status: "active",
  });

  // Fetch songs
  const loadSongs = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page,
        limit,
        search,
        category,
        movie,
        sortBy,
        order,
      }).toString();

      const res = await API.get(`/admin/songs?${query}`);
      setSongs(res.data.data || []);
      setPages(res.data.pages || 1);
    } catch (error) {
      toast.error("Failed to load songs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSongs();
  }, [page, search, category, movie, sortBy, order]);

  // File Upload Function
  const uploadFile = async (file, folder, setLoader) => {
    setLoader(true);

    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);

    try {
      const res = await API.post("/admin/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.fileUrl;
    } catch {
      toast.error("Upload failed");
      return "";
    } finally {
      setLoader(false);
    }
  };

  // Add Song
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (uploadingAudio || uploadingThumbnail) {
      return toast.error("Please wait, file is still uploading...");
    }

    try {
      await API.post("/admin/songs", formData);

      Swal.fire("Success!", "Song added successfully!", "success");
      setShowForm(false);

      setFormData({
        songName: "",
        authorName: "",
        singerName: "",
        categoryName: "",
        movieName: "",
        description: "",
        duration: "",
        language: "",
        genre: "",
        songUrl: "",
        thumbnailUrl: "",
        status: "active",
      });

      loadSongs();
    } catch {
      Swal.fire("Error", "Failed to save song", "error");
    }
  };

  // Delete Song
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This song will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!",
    });

    if (!confirm.isConfirmed) return;

    try {
      await API.delete(`/admin/songs/${id}`);
      Swal.fire("Deleted!", "Song removed successfully.", "success");
      loadSongs();
    } catch {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">Songs Management</h2>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded-md"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border p-2 rounded-md"
          >
            <option value="createdAt">Newest</option>
            <option value="totalPlays">Most Played</option>
            <option value="totalLikes">Most Liked</option>
          </select>

          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="border p-2 rounded-md"
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "+ Add Song"}
          </button>
        </div>
      </div>

      {/* Add Song Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow mb-8 grid gap-4 md:grid-cols-2"
        >
          <input
            type="text"
            placeholder="Song Name"
            value={formData.songName}
            onChange={(e) =>
              setFormData({ ...formData, songName: e.target.value })
            }
            className="border p-2 rounded-md"
          />

          <input
            type="text"
            placeholder="Singer Name"
            value={formData.singerName}
            onChange={(e) =>
              setFormData({ ...formData, singerName: e.target.value })
            }
            className="border p-2 rounded-md"
          />

          <input
            type="text"
            placeholder="Category"
            value={formData.categoryName}
            onChange={(e) =>
              setFormData({ ...formData, categoryName: e.target.value })
            }
            className="border p-2 rounded-md"
          />

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm mb-1">Thumbnail</label>

            <input
              type="file"
              onChange={async (e) => {
                const url = await uploadFile(
                  e.target.files[0],
                  "thumbnails",
                  setUploadingThumbnail
                );
                setFormData({ ...formData, thumbnailUrl: url });
              }}
            />

            {uploadingThumbnail && (
              <div className="flex items-center gap-2 mt-2 text-blue-600">
                <Circles height="25" width="25" color="#2563eb" />
                <span>Uploading Thumbnail...</span>
              </div>
            )}
          </div>

          {/* Audio Upload */}
          <div>
            <label className="block text-sm mb-1">Song File</label>

            <input
              type="file"
              accept="audio/*"
              onChange={async (e) => {
                const url = await uploadFile(
                  e.target.files[0],
                  "songs",
                  setUploadingAudio
                );
                setFormData({ ...formData, songUrl: url });
              }}
            />

            {uploadingAudio && (
              <div className="flex items-center gap-2 mt-2 text-green-600">
                <Circles height="25" width="25" color="#16a34a" />
                <span>Uploading Audio...</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={uploadingAudio || uploadingThumbnail}
            className={`col-span-2 py-2 rounded-md text-white font-medium 
              ${uploadingAudio || uploadingThumbnail
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
              }`}
          >
            {uploadingAudio || uploadingThumbnail ? "Uploading..." : "Save Song"}
          </button>
        </form>
      )}

      {/* Songs Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Circles height="60" width="60" color="#2563eb" />
        </div>
      ) : songs.length === 0 ? (
        <p className="text-gray-500">No songs found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="p-3">Thumbnail</th>
                <th className="p-3">Song</th>
                <th className="p-3">Plays</th>
                <th className="p-3">Likes</th>
                <th className="p-3">Status</th>
                <th className="p-3">Audio</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {songs.map((song) => (
                <tr key={song._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <img
                      src={song.thumbnailUrl}
                      className="w-12 h-12 rounded-md object-cover"
                    />
                  </td>

                  <td className="p-3 font-medium">{song.songName}</td>
                  <td className="p-3">{song.totalPlays}</td>
                  <td className="p-3">{song.totalLikes}</td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        song.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {song.status}
                    </span>
                  </td>

                  <td className="p-3">
                    <audio controls src={song.songUrl} className="w-32" />
                  </td>

                  <td className="p-3 flex justify-center gap-3">
                    <button
                      onClick={() => handleDelete(song._id)}
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

export default Songs;
