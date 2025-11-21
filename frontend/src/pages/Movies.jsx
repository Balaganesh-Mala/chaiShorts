import React, { useEffect, useState } from "react";
import API from "../api/apiClient";

const Movie = () => {
  const defaultMovieState = {
    movieName: "",
    posterUrl: "",
    bannerUrl: "",
    publishedYear: "",
    genre: "",
    cast: "",
    description: "",
    linkedSongs: [],
  };

  const [movies, setMovies] = useState([]);
  const [songs, setSongs] = useState([]);
  const [movie, setMovie] = useState(defaultMovieState);
  const [mode, setMode] = useState("list");
  const [editId, setEditId] = useState(null);

  const fetchMovies = async () => {
    const res = await API.get("/admin/movies");
    setMovies(res.data.data || []);
    console.log(res.data)
  };

  const fetchSongs = async () => {
    const res = await API.get("/admin/songs");
    setSongs(res.data.data || []);
  };

  useEffect(() => {
    fetchMovies();
    fetchSongs();
  }, []);

  const resetForm = () => {
    setMovie(defaultMovieState);
    setMode("list");
    setEditId(null);
  };

  const handleChange = (e) => {
    setMovie({ ...movie, [e.target.name]: e.target.value });
  };

  const handleSongSelect = (e) => {
    setMovie({
      ...movie,
      linkedSongs: [...e.target.selectedOptions].map((o) => o.value),
    });
  };

  const uploadImage = async (file, field) => {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", "movies");

    const res = await API.post("/admin/upload", form);

    setMovie({ ...movie, [field]: res.data.fileUrl });
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) uploadImage(file, field);
  };

  const loadMovie = async (id) => {
    const res = await API.get(`/admin/movies/${id}`);
    const movieData = res.data.data;

    setMovie({
      ...movieData,
      linkedSongs: movieData.linkedSongs?.map((s) => s._id) || [],
    });

    setMode("edit");
    setEditId(id);
  };

  const addMovie = async (e) => {
    e.preventDefault();
    await API.post("/admin/movies", movie);
    fetchMovies();
    resetForm();
  };

  const updateMovie = async (e) => {
    e.preventDefault();
    await API.put(`/admin/movies/${editId}`, movie);
    fetchMovies();
    resetForm();
  };

  const deleteMovie = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    await API.delete(`/admin/movies/${id}`);
    fetchMovies();
  };

  // ---------------------------------------------------------
  // UI STARTS HERE
  // ---------------------------------------------------------
  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* LIST VIEW */}
      {mode === "list" && (
        <>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">🎬 Movies</h1>

            <button
              onClick={() => setMode("add")}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Add Movie
            </button>
          </div>

          {/* Movie Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {movies.map((m) => (
              <div
                key={m._id}
                className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition"
              >
                <img
                  src={m.posterUrl}
                  alt=""
                  className="w-full h-60 object-cover rounded-lg"
                />
                <h3 className="text-xl font-semibold mt-3">{m.movieName}</h3>
                <p className="text-sm text-gray-500">{m.genre}</p>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => loadMovie(m._id)}
                    className="px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteMovie(m._id)}
                    className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ADD / EDIT FORM */}
      {(mode === "add" || mode === "edit") && (
        <form
          onSubmit={mode === "add" ? addMovie : updateMovie}
          className="bg-white p-6 rounded-xl shadow-md max-w-2xl mx-auto"
        >
          <h2 className="text-2xl font-bold mb-4">
            {mode === "add" ? "Add Movie" : "Edit Movie"}
          </h2>

          {/* Input */}
          <input
            type="text"
            name="movieName"
            placeholder="Movie Name"
            value={movie.movieName}
            onChange={handleChange}
            className="w-full border p-3 rounded mb-3"
          />

          <input
            type="text"
            name="genre"
            placeholder="Genre"
            value={movie.genre}
            onChange={handleChange}
            className="w-full border p-3 rounded mb-3"
          />

          <input
            type="text"
            name="publishedYear"
            placeholder="Published Year"
            value={movie.publishedYear}
            onChange={handleChange}
            className="w-full border p-3 rounded mb-3"
          />

          <input
            type="text"
            name="cast"
            placeholder="Cast (comma separated)"
            value={movie.cast}
            onChange={handleChange}
            className="w-full border p-3 rounded mb-3"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={movie.description}
            onChange={handleChange}
            className="w-full border p-3 rounded mb-3"
          />

          {/* LINK SONGS */}
          <label className="font-semibold">Linked Songs</label>
          <select
            multiple
            value={movie.linkedSongs}
            onChange={handleSongSelect}
            className="w-full border p-3 rounded mb-3 h-32"
          >
            {songs.map((s) => (
              <option key={s._id} value={s._id}>
                {s.songName}
              </option>
            ))}
          </select>

          {/* Poster Upload */}
          <label className="font-semibold">Poster</label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, "posterUrl")}
            className="w-full border p-3 rounded mb-3"
          />
          {movie.posterUrl && (
            <img
              src={movie.posterUrl}
              className="w-40 h-40 object-cover rounded mb-3"
            />
          )}

          {/* Banner Upload */}
          <label className="font-semibold">Banner</label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, "bannerUrl")}
            className="w-full border p-3 rounded mb-3"
          />
          {movie.bannerUrl && (
            <img
              src={movie.bannerUrl}
              className="w-full h-40 object-cover rounded mb-3"
            />
          )}

          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {mode === "add" ? "Add Movie" : "Update Movie"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Movie;
