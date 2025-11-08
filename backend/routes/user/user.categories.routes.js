import express from "express";
import Category from "../../models/category.model.js";

const router = express.Router();

// ✅ Get all categories (public)
router.get("/", async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.categoryName = { $regex: search, $options: "i" };

    const categories = await Category.find(filter)
      .sort({ createdAt: -1 })
      .select("categoryName categoryImage description status");

    res.status(200).json({
      success: true,
      total: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Get category by ID
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).select(
      "categoryName categoryImage description status"
    );
    if (!category)
      return res.status(404).json({ success: false, message: "Category not found" });

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
