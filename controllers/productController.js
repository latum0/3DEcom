import Product from "../models/Product.js";
import mongoose from "mongoose";

// ✅ Get all products (with optional filters)
export const getProducts = async (req, res) => {
  try {
    const { category, user } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (user) filter.user = user;

    const products = await Product.find(filter)
      .populate('proposedBy', 'name email') // Populate proposedBy field
      .populate('category', 'name description'); // Populate the category field

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Error getting products:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(id)
      .populate("proposedBy", "name email")
      .populate("category", "name description customNameAllowed");

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("Error getting product by ID:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Create new product (admin only)
export const createProductAdmin = async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!name?.trim()) missingFields.push("name");
    if (!description?.trim()) missingFields.push("description");
    if (typeof price !== "number" || price < 0) missingFields.push("price");
    if (!category) missingFields.push("category");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing or invalid fields: ${missingFields.join(", ")}`,
        fields: missingFields,
      });
    }

    const imageArray = Array.isArray(image) ? image : [];

    const newProduct = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price,
      category,
      image: imageArray,
      status: "Approved",
    });

    res.status(201).json({
      success: true,
      data: newProduct,
      message: "Product created successfully",
    });
  } catch (error) {
    console.error("Product creation error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Update existing product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Check if the user is an admin
    const isAdmin = req.user.role === "admin";

    // Enforce price requirement for admins
    if (isAdmin && req.body.price !== undefined) {
      if (typeof req.body.price !== "number" || req.body.price < 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be a number and greater than or equal to 0.",
        });
      }
    }

    const updateData = { ...req.body };

    if (updateData.image && !Array.isArray(updateData.image)) {
      updateData.image = [updateData.image];
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("proposedBy", "name email");

    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Propose a product (client functionality)
export const proposeProduct = async (req, res) => {
  try {
    const { name, description, category, image } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!name?.trim()) missingFields.push("name");
    if (!description?.trim()) missingFields.push("description");
    if (!category) missingFields.push("category");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing or invalid fields: ${missingFields.join(", ")}`,
        fields: missingFields,
      });
    }

    const imageArray = Array.isArray(image) ? image : [];

    const newProductProposal = await Product.create({
      proposedBy: req.user._id, // Track who proposed the product
      name: name.trim(),
      description: description.trim(),
      price: null, // Price is not set by the client
      category,
      image: imageArray,
      status: "Proposed", // Default status
    });

    res.status(201).json({
      success: true,
      data: newProductProposal,
      message: "Product proposal created successfully",
    });
  } catch (error) {
    console.error("Error proposing product:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Review product proposal (admin functionality)
export const reviewProposedProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, price } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    const validStatuses = ["Approved", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    if (status === "Approved" && (typeof price !== "number" || price < 0)) {
      return res.status(400).json({
        success: false,
        message: "Price must be provided and greater than or equal to 0 when approving a product.",
      });
    }

    const product = await Product.findById(id);

    if (!product || product.status !== "Proposed") {
      return res
        .status(404)
        .json({ success: false, message: "Proposed product not found" });
    }

    product.status = status;
    product.reviewedBy = req.user._id; // Track admin who reviewed
    if (status === "Approved") {
      product.price = price; // Set price only on approval
    }

    await product.save();

    res.status(200).json({
      success: true,
      data: product,
      message: `Product proposal ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    console.error("Error reviewing product proposal:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};