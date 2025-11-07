import User from "../models/user.model.js";
import Song from "../models/song.model.js";
import Video from "../models/video.model.js";
import Category from "../models/category.model.js";

// ✅ Get Dashboard Overview
export const getDashboardData = async (req, res) => {
  try {
    // 1️⃣ Basic Counts
    const totalUsers = await User.countDocuments();
    const totalSongs = await Song.countDocuments();
    const totalVideos = await Video.countDocuments();
    const totalCategories = await Category.countDocuments();

    // 2️⃣ Trending Content (Top 5)
    const trendingSongs = await Song.find({ isTrending: true })
      .sort({ totalPlays: -1 })
      .limit(5)
      .select("songName singerName thumbnailUrl totalPlays");

    const trendingVideos = await Video.find({ isFeatured: true })
      .sort({ viewsCount: -1 })
      .limit(5)
      .select("videoTitle thumbnailUrl viewsCount");

    // 3️⃣ Recently Added Items
    const recentSongs = await Song.find().sort({ createdAt: -1 }).limit(5);
    const recentVideos = await Video.find().sort({ createdAt: -1 }).limit(5);

    // 4️⃣ Daily Upload Stats (past 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();

    const songUploads = await Promise.all(
      last7Days.map(async (date) => ({
        date,
        count: await Song.countDocuments({
          createdAt: { $gte: new Date(date), $lt: new Date(`${date}T23:59:59Z`) },
        }),
      }))
    );

    const videoUploads = await Promise.all(
      last7Days.map(async (date) => ({
        date,
        count: await Video.countDocuments({
          createdAt: { $gte: new Date(date), $lt: new Date(`${date}T23:59:59Z`) },
        }),
      }))
    );

    // ✅ Final response
    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalSongs,
          totalVideos,
          totalCategories,
        },
        trending: {
          songs: trendingSongs,
          videos: trendingVideos,
        },
        recent: {
          songs: recentSongs,
          videos: recentVideos,
        },
        graphs: {
          songUploads,
          videoUploads,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
