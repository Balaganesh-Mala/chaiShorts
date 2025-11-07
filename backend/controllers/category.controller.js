import Category from "../models/category.model.js";

// ✅ Create new category
export const createCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;
    const existing = await Category.findOne({ categoryName });
    if (existing)
      return res.status(400).json({ success: false, message: "Category already exists" });

    const category = new Category({
      ...req.body,
      addedBy: req.user.email,
    });

    await category.save();
    res.status(201).json({ success: true, message: "Category created successfully ✅", data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all categories (with optional filters)
export const getAllCategories = async (req, res) => {
  try {
    const { status, isFeatured } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (isFeatured) filter.isFeatured = isFeatured === "true";

    const categories = await Category.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get single category by ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update category
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    res.status(200).json({ success: true, message: "Category updated successfully ✅", data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete category
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });
    res.status(200).json({ success: true, message: "Category deleted successfully ✅" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
