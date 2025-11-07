import { useState } from "react";
import API from "../../api/apiClient";
import toast from "react-hot-toast";
import FileUpload from "../FileUpload/FileUpload";

const SongModal = ({ onClose, onSuccess, existingSong }) => {
  const [song, setSong] = useState(
    existingSong || {
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
    }
  );

  const handleChange = (e) => {
    setSong({ ...song, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (existingSong) {
        await API.put(`/admin/songs/${existingSong._id}`, song);
        toast.success("Song updated successfully");
      } else {
        await API.post("/admin/songs", song);
        toast.success("Song added successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save song");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[600px] rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">
          {existingSong ? "Edit Song" : "Add New Song"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <input
              name="songName"
              value={song.songName}
              onChange={handleChange}
              placeholder="Song Name"
              className="border p-2 rounded-md"
              required
            />
            <input
              name="authorName"
              value={song.authorName}
              onChange={handleChange}
              placeholder="Author Name"
              className="border p-2 rounded-md"
            />
            <input
              name="singerName"
              value={song.singerName}
              onChange={handleChange}
              placeholder="Singer Name"
              className="border p-2 rounded-md"
            />
            <input
              name="categoryName"
              value={song.categoryName}
              onChange={handleChange}
              placeholder="Category"
              className="border p-2 rounded-md"
            />
            <input
              name="movieName"
              value={song.movieName}
              onChange={handleChange}
              placeholder="Movie Name"
              className="border p-2 rounded-md"
            />
            <input
              name="language"
              value={song.language}
              onChange={handleChange}
              placeholder="Language"
              className="border p-2 rounded-md"
            />
            <input
              name="duration"
              value={song.duration}
              onChange={handleChange}
              placeholder="Duration (e.g. 3:45)"
              className="border p-2 rounded-md"
            />
            <input
              name="genre"
              value={song.genre}
              onChange={handleChange}
              placeholder="Genre"
              className="border p-2 rounded-md"
            />
          </div>

          <textarea
            name="description"
            value={song.description}
            onChange={handleChange}
            placeholder="Description"
            className="border w-full p-2 rounded-md mt-3"
          />

          <FileUpload
            label="Upload Song (Audio)"
            onUpload={(url) => setSong({ ...song, songUrl: url })}
          />

          <FileUpload
            label="Upload Thumbnail (Image)"
            onUpload={(url) => setSong({ ...song, thumbnailUrl: url })}
          />

          <div className="flex justify-end mt-4 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="border px-4 py-2 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SongModal;
