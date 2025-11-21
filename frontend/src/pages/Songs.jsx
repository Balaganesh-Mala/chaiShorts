// src/pages/Songs.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import API from "../api/apiClient";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { Circles } from "react-loader-spinner";

/**
 * Songs page (optimized)
 * - Debounced search
 * - Proper useEffect dependencies (no duplicate calls)
 * - Only sends non-empty query params
 * - Displays populated movie name
 * - Clear filters button
 */

const Songs = () => {
  const [songs, setSongs] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [movieId, setMovieId] = useState("");
  const [category, setCategory] = useState("");

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [limit] = useState(10);

  const [showForm, setShowForm] = useState(false);

  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  const isMountedRef = useRef(true);

  const [formData, setFormData] = useState({
    songName: "",
    singerName: "",
    authorName: "",
    categoryName: "",
    movieId: "",
    description: "",
    duration: "",
    language: "",
    genre: "",
    songUrl: "",
    thumbnailUrl: "",
    status: "active",
  });

  // ----------------------------
  // Load movies (once)
  // ----------------------------
  const loadMovies = useCallback(async () => {
    try {
      const res = await API.get("/admin/movies");
      if (!isMountedRef.current) return;
      setMovies(res?.data?.data || []);
    } catch (err) {
      console.error("loadMovies error:", err);
      toast.error("Failed to load movies");
    }
  }, []);

  // ----------------------------
  // Build query and fetch songs
  // ----------------------------
  const fetchSongs = useCallback(
    async (opts = {}) => {
      setLoading(true);
      try {
        const params = {};
        // page and limit are always numbers
        params.page = opts.page ?? page;
        params.limit = limit;

        if (debouncedSearch) params.search = debouncedSearch;
        if (category) params.category = category;
        if (movieId) params.movieId = movieId; // only add when non-empty
        if (sortBy) params.sortBy = sortBy;
        if (order) params.order = order;

        const query = new URLSearchParams(params).toString();
        const url = `/admin/songs${query ? `?${query}` : ""}`;

        const res = await API.get(url);

        if (!isMountedRef.current) return;

        setSongs(res?.data?.data || []);
        setPages(res?.data?.pages || 1);
        console.log("songs response", res.data)
      } catch (err) {
        console.error("fetchSongs error:", err);
        toast.error("Failed to load songs");
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    },
    [page, limit, debouncedSearch, category, movieId, sortBy, order]
  );

  // ----------------------------
  // Debounce search input
  // ----------------------------
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // ----------------------------
  // Ensure component mounted flag
  // ----------------------------
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ----------------------------
  // When filters change (search/category/movie/sort/order),
  // reset page to 1 only — let the fetch useEffect do the work.
  // ----------------------------
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, movieId, sortBy, order]);

  // ----------------------------
  // Fetch movies once on mount
  // ----------------------------
  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  // ----------------------------
  // Fetch songs whenever page or filters change
  // ----------------------------
  useEffect(() => {
    // fetchSongs will read the latest state from its closure deps
    fetchSongs({ page });
  }, [fetchSongs, page]);

  // ----------------------------
  // Upload helper
  // ----------------------------
  const uploadFile = async (file, folder, setLoader) => {
    if (!file) return "";
    setLoader(true);
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);

    try {
      const res = await API.post("/admin/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res?.data?.fileUrl || "";
    } catch (err) {
      console.error("uploadFile error:", err);
      toast.error("Upload failed");
      return "";
    } finally {
      setLoader(false);
    }
  };

  // ----------------------------
  // Submit song
  // ----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.songName || !formData.songUrl) {
      return toast.error("Song name and audio are required");
    }

    if (!formData.movieId) return toast.error("Please select a movie!");

    if (uploadingAudio || uploadingThumbnail)
      return toast.error("Please wait — uploading files");

    try {
      const res = await API.post("/admin/songs", formData);
      Swal.fire("Success", "Song added successfully!", "success");
      setShowForm(false);
      // Reset form
      setFormData({
        songName: "",
        singerName: "",
        authorName: "",
        categoryName: "",
        movieId: "",
        description: "",
        duration: "",
        language: "",
        genre: "",
        songUrl: "",
        thumbnailUrl: "",
        status: "active",
      });
      // reload songs (stay on page 1 since setPage(1) will trigger fetch)
      setPage(1);
      fetchSongs({ page: 1 });
    } catch (err) {
      console.error("handleSubmit error:", err);
      Swal.fire("Error", "Failed to save song", "error");
    }
  };

  // ----------------------------
  // Delete song
  // ----------------------------
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Song?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
    });

    if (!confirm.isConfirmed) return;

    try {
      await API.delete(`/admin/songs/${id}`);
      Swal.fire("Deleted", "Song removed successfully!", "success");
      // reload current page
      fetchSongs({ page });
    } catch (err) {
      console.error("handleDelete error:", err);
      Swal.fire("Error", "Failed to delete", "error");
    }
  };

  // ----------------------------
  // Clear filters
  // ----------------------------
  const clearFilters = () => {
    setSearch("");
    setMovieId("");
    setCategory("");
    setSortBy("createdAt");
    setOrder("desc");
    setPage(1);
  };

  // ----------------------------
  // Render
  // ----------------------------
  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">Songs Management</h2>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search songs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded-md w-40 md:w-52"
          />

          {/* Movie Filter */}
          <select
            value={movieId}
            onChange={(e) => setMovieId(e.target.value)}
            className="border p-2 rounded-md"
          >
            <option value="">All Movies</option>
            {movies.map((m) => (
              <option key={m._id} value={m._id}>
                {m.movieName}
              </option>
            ))}
          </select>

          {/* Category (if you have categories) */}
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border p-2 rounded-md w-36"
          />

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border p-2 rounded-md"
          >
            <option value="createdAt">Newest</option>
            <option value="totalPlays">Most Played</option>
            <option value="totalLikes">Most Liked</option>
            <option value="songName">Song Name</option>
          </select>

          {/* Order */}
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="border p-2 rounded-md"
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>

          <button
            onClick={() => setShowForm((s) => !s)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "+ Add Song"}
          </button>

          <button
            onClick={clearFilters}
            className="bg-gray-200 text-gray-800 px-3 py-2 rounded-md hover:bg-gray-300"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow mb-8 grid gap-4 md:grid-cols-2"
        >
          {/* Song Name */}
          <input
            type="text"
            placeholder="Song Name *"
            value={formData.songName}
            onChange={(e) => setFormData({ ...formData, songName: e.target.value })}
            className="border p-2 rounded-md"
            required
          />

          {/* Movie */}
          <select
            value={formData.movieId}
            onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
            className="border p-2 rounded-md"
            required
          >
            <option value="">Select Movie *</option>
            {movies.map((m) => (
              <option key={m._id} value={m._id}>
                {m.movieName}
              </option>
            ))}
          </select>

          {/* Singer */}
          <input
            type="text"
            placeholder="Singer Name"
            value={formData.singerName}
            onChange={(e) => setFormData({ ...formData, singerName: e.target.value })}
            className="border p-2 rounded-md"
          />

          {/* Thumbnail */}
          <div>
            <label className="block text-sm mb-1">Thumbnail</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const url = await uploadFile(e.target.files[0], "thumbnails", setUploadingThumbnail);
                setFormData((fd) => ({ ...fd, thumbnailUrl: url }));
              }}
            />
            {uploadingThumbnail && (
              <div className="flex items-center gap-2 mt-2 text-blue-600">
                <Circles height="25" width="25" />
                <span>Uploading Thumbnail...</span>
              </div>
            )}
          </div>

          {/* Audio */}
          <div>
            <label className="block text-sm mb-1">Audio File</label>
            <input
              type="file"
              accept="audio/*"
              onChange={async (e) => {
                const url = await uploadFile(e.target.files[0], "songs", setUploadingAudio);
                setFormData((fd) => ({ ...fd, songUrl: url }));
              }}
            />
            {uploadingAudio && (
              <div className="flex items-center gap-2 mt-2 text-green-600">
                <Circles height="25" width="25" />
                <span>Uploading Audio...</span>
              </div>
            )}
          </div>

          <button type="submit" className="col-span-2 bg-green-600 text-white py-2 rounded-md hover:bg-green-700">
            Save Song
          </button>
        </form>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Circles height="60" width="60" />
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
                <th className="p-3">Movie</th>
                <th className="p-3">Plays</th>
                <th className="p-3">Likes</th>
                <th className="p-3">Status</th>
                <th className="p-3">Audio</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {songs.map((song) => (
                <tr key={song._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <img src={song.thumbnailUrl || "/no-thumb.png"} alt="" className="w-12 h-12 rounded-md object-cover" />
                  </td>

                  <td className="p-3 font-semibold">{song.songName}</td>

                  <td className="p-3">{song.movieId?.movieName ?? "-"}</td>

                  <td className="p-3">{song.totalPlays}</td>
                  <td className="p-3">{song.totalLikes}</td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        song.status === "active" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                      }`}
                    >
                      {song.status}
                    </span>
                  </td>

                  <td className="p-3">
                    <audio controls src={song.songUrl || ""} className="w-36" />
                  </td>

                  <td className="p-3 text-center">
                    <button onClick={() => handleDelete(song._id)} className="text-red-600 hover:text-red-800 font-medium">
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
        <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border rounded-md disabled:opacity-50">
          Prev
        </button>

        {[...Array(pages).keys()].map((p) => (
          <button key={p} onClick={() => setPage(p + 1)} className={`px-3 py-1 border rounded-md ${page === p + 1 ? "bg-blue-600 text-white" : ""}`}>
            {p + 1}
          </button>
        ))}

        <button disabled={page === pages} onClick={() => setPage((p) => Math.min(pages, p + 1))} className="px-3 py-1 border rounded-md disabled:opacity-50">
          Next
        </button>
      </div>
    </div>
  );
};

export default Songs;
