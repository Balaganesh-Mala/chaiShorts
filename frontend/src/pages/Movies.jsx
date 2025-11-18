import { useEffect, useState } from "react";
import API from "../api/apiClient";
import { Trash2, Edit, Plus, ArrowLeft } from "lucide-react";

export default function Movie() {
  const [mode, setMode] = useState("list"); // list | add | edit
  const [movies, setMovies] = useState([]);
  const [songs, setSongs] = useState([]);
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [movie, setMovie] = useState({
    movieName: "",
    directorName: "",
    cast: "",
    language: "",
    releaseYear: "",
    description: "",
    posterUrl: "",
    bannerUrl: "",
    linkedSongs: [],
  });

  const [editId, setEditId] = useState(null);

  // ✅ Fetch Movies
  const fetchMovies = async () => {
    setLoading(true);
    const res = await API.get(
      `/admin/movies?search=${search}&language=${language}&page=${page}`
    );
    setMovies(res.data.data);
    setPages(res.data.pages);
    setLoading(false);
  };

  // ✅ Fetch Songs (for dropdown)
  const fetchSongs = async () => {
    const res = await API.get("/admin/songs");
    setSongs(res.data.data);
  };

  useEffect(() => {
    fetchMovies();
    fetchSongs();
  }, [search, language, page]);

  // ✅ Upload image
  const uploadImage = async (file, field) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await API.post("/admin/upload", formData);
    setMovie({ ...movie, [field]: res.data.fileUrl });
  };

  // ✅ Add Movie
  const addMovie = async (e) => {
    e.preventDefault();
    await API.post("/admin/movies", movie);
    resetForm();
    fetchMovies();
    setMode("list");
  };

  // ✅ Load movie into form for editing
  const loadMovie = async (id) => {
    const res = await API.get(`/admin/movies/${id}`);
    setMovie(res.data.data);
    setEditId(id);
    setMode("edit");
  };

  // ✅ Update Movie
  const updateMovie = async (e) => {
    e.preventDefault();
    await API.put(`/admin/movies/${editId}`, movie);
    resetForm();
    fetchMovies();
    setMode("list");
  };

  // ✅ Delete Movie
  const deleteMovie = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    await API.delete(`/admin/movies/${id}`);
    fetchMovies();
  };

  const resetForm = () => {
    setMovie({
      movieName: "",
      directorName: "",
      cast: "",
      language: "",
      releaseYear: "",
      description: "",
      posterUrl: "",
      bannerUrl: "",
      linkedSongs: [],
    });
    setEditId(null);
  };

  // ✅ Movie Form Component (Add / Edit)
  const MovieForm = ({ title, onSubmit }) => (
    <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg shadow grid gap-4">
      <h2 className="text-xl font-bold mb-2">{title}</h2>

      <input
        className="border p-2 rounded"
        placeholder="Movie Name"
        value={movie.movieName}
        onChange={(e) => setMovie({ ...movie, movieName: e.target.value })}
        required
      />

      <input
        className="border p-2 rounded"
        placeholder="Director Name"
        value={movie.directorName}
        onChange={(e) => setMovie({ ...movie, directorName: e.target.value })}
      />

      <input
        className="border p-2 rounded"
        placeholder="Cast"
        value={movie.cast}
        onChange={(e) => setMovie({ ...movie, cast: e.target.value })}
      />

      <input
        className="border p-2 rounded"
        placeholder="Language"
        value={movie.language}
        onChange={(e) => setMovie({ ...movie, language: e.target.value })}
      />

      <input
        type="number"
        className="border p-2 rounded"
        placeholder="Release Year"
        value={movie.releaseYear}
        onChange={(e) => setMovie({ ...movie, releaseYear: e.target.value })}
      />

      <textarea
        className="border p-2 rounded"
        placeholder="Description"
        value={movie.description}
        onChange={(e) => setMovie({ ...movie, description: e.target.value })}
      />

      {/* Poster Upload */}
      <div>
        <label className="font-semibold">Poster</label>
        <input
          type="file"
          onChange={(e) => uploadImage(e.target.files[0], "posterUrl")}
          className="block mt-2"
        />
        {movie.posterUrl && (
          <img src={movie.posterUrl} className="w-32 mt-2 rounded" />
        )}
      </div>

      {/* Banner Upload */}
      <div>
        <label className="font-semibold">Banner</label>
        <input
          type="file"
          onChange={(e) => uploadImage(e.target.files[0], "bannerUrl")}
          className="block mt-2"
        />
        {movie.bannerUrl && (
          <img src={movie.bannerUrl} className="w-full mt-2 rounded" />
        )}
      </div>

      {/* Linked Songs */}
      <div>
        <label className="font-semibold">Linked Songs</label>
        <select
          multiple
          className="border p-2 rounded w-full h-32"
          value={movie.linkedSongs}
          onChange={(e) =>
            setMovie({
              ...movie,
              linkedSongs: [...e.target.selectedOptions].map((o) => o.value),
            })
          }
        >
          {songs.map((s) => (
            <option key={s._id} value={s._id}>
              {s.songName}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          {title}
        </button>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setMode("list");
          }}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );

  return (
    <div className="p-6">
      {/* ✅ Movie List */}
      {mode === "list" && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Movies</h2>
            <button
              onClick={() => setMode("add")}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded"
            >
              <Plus className="mr-2" /> Add Movie
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded shadow grid md:grid-cols-3 gap-4 mb-5">
            <input
              className="border p-2 rounded"
              placeholder="Search movie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <input
              className="border p-2 rounded"
              placeholder="Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            />
          </div>

          {/* Movies Table */}
          <div className="bg-white shadow rounded overflow-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3">Poster</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Language</th>
                  <th className="p-3">Year</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((m) => (
                  <tr key={m._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <img
                        src={m.posterUrl}
                        className="w-14 h-20 object-cover rounded"
                      />
                    </td>
                    <td className="p-3 font-semibold">{m.movieName}</td>
                    <td className="p-3">{m.language}</td>
                    <td className="p-3">{m.releaseYear}</td>
                    <td className="p-3 flex justify-end gap-3">
                      <button
                        onClick={() => loadMovie(m._id)}
                        className="text-blue-600"
                      >
                        <Edit />
                      </button>
                      <button
                        onClick={() => deleteMovie(m._id)}
                        className="text-red-600"
                      >
                        <Trash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-5 gap-2">
            {[...Array(pages).keys()].map((n) => (
              <button
                key={n}
                onClick={() => setPage(n + 1)}
                className={`px-3 py-1 rounded ${
                  page === n + 1 ? "bg-blue-600 text-white" : "bg-gray-300"
                }`}
              >
                {n + 1}
              </button>
            ))}
          </div>
        </>
      )}

      {/* ✅ Add Movie */}
      {mode === "add" && <MovieForm title="Add Movie" onSubmit={addMovie} />}

      {/* ✅ Edit Movie */}
      {mode === "edit" && <MovieForm title="Update Movie" onSubmit={updateMovie} />}
    </div>
  );
}
