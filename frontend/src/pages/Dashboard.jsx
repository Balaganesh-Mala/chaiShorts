import React, { useEffect, useState } from "react";
import API from "../api/apiClient";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// 🎨 Color Palette
const COLORS = ["#3B82F6", "#22C55E", "#F97316", "#A855F7", "#14B8A6", "#E11D48"];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch Dashboard Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/admin/dashboard");
        setData(res.data.data);
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600 text-lg font-medium animate-pulse">
          Loading Dashboard...
        </p>
      </div>
    );

  if (!data)
    return (
      <div className="text-center text-gray-600">
        <p>No data available</p>
      </div>
    );

  // Dummy data for charts (replace later with real backend stats if available)
  const songGrowthData = [
    { month: "Jan", songs: 40 },
    { month: "Feb", songs: 55 },
    { month: "Mar", songs: 80 },
    { month: "Apr", songs: 60 },
    { month: "May", songs: 75 },
    { month: "Jun", songs: 100 },
  ];

  const videoGrowthData = [
    { month: "Jan", videos: 30 },
    { month: "Feb", videos: 45 },
    { month: "Mar", videos: 50 },
    { month: "Apr", videos: 70 },
    { month: "May", videos: 65 },
    { month: "Jun", videos: 95 },
  ];

  const categoryData = [
    { name: "Music", value: 30 },
    { name: "Comedy", value: 20 },
    { name: "Movie", value: 15 },
    { name: "Gaming", value: 25 },
    { name: "Others", value: 10 },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Dashboard Overview
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Users" value={data.users} color="blue" />
        <StatCard label="Total Songs" value={data.songs} color="green" />
        <StatCard label="Total Movies" value={data.movies} color="purple" />
        <StatCard label="Total Short Videos" value={data.shortVideos} color="orange" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart 1 */}
        <ChartCard title="Monthly Song Uploads">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={songGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="songs" fill="#3B82F6" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Bar Chart 2 */}
        <ChartCard title="Monthly Short Video Uploads">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={videoGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="videos" fill="#F97316" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Pie Chart */}
        <ChartCard title="Category Distribution">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Trending Songs */}
      <div className="mt-10 bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Trending Songs</h3>
        {data.trendingSongs && data.trendingSongs.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            {data.trendingSongs.map((song, index) => (
              <li key={index}>{song}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No trending songs right now</p>
        )}
      </div>
    </div>
  );
};

// 📦 Reusable Stat Card
const StatCard = ({ label, value, color }) => {
  const colorMap = {
    blue: "border-blue-500",
    green: "border-green-500",
    purple: "border-purple-500",
    orange: "border-orange-500",
  };

  return (
    <div className={`bg-white p-5 rounded-xl shadow border-t-4 ${colorMap[color]}`}>
      <h3 className="text-gray-500 font-medium">{label}</h3>
      <p className="text-3xl font-bold mt-2 text-gray-800">{value ?? 0}</p>
    </div>
  );
};

// 📈 Reusable Chart Wrapper
const ChartCard = ({ title, children }) => (
  <div className="bg-white rounded-xl shadow p-6">
    <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
    {children}
  </div>
);

export default Dashboard;
