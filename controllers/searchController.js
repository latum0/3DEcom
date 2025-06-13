import Product from '../models/Product.js';

// Controller function to handle product search
export const searchProducts = async (req, res) => {
  try {
    const query = req.query.q; // Get the search query from the URL
    if (!query) {
      return res.status(200).json({ success: true, data: [] });
    }
    const regex = new RegExp(query, 'i'); // case-insensitive regex

    // Find products matching the query in name or description
    const products = await Product.find({
      $or: [
        { name: { $regex: regex } },
        { description: { $regex: regex } }
      ]
    }).limit(5);

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
