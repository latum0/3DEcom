// controllers/cartController.js
import Cart from '../models/Cart.js';


export const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const userId = req.user._id;

  try {
    let cart = await Cart.findOne({ user: userId }).populate('items.product', 'name price image');

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ product: productId, quantity }]
      });
    } else {
      const existingItem = cart.items.find(item => item.product.toString() === productId);

      if (existingItem) {
        existingItem.quantity += parseInt(quantity);
      } else {
        cart.items.push({ product: productId, quantity });
      }
    }

    await cart.save();
    await cart.populate('items.product', 'name price image'); // Corrigé ici

    res.status(200).json(cart);
  } catch (err) {
    console.error("Error in addToCart:", err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getCart = async (req, res) => {
  const userId = req.user._id;

  try {
    const cart = await Cart.findOne({ user: userId })
      .populate('items.product', 'name price image');

    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    res.status(200).json(cart);
  } catch (err) {
    console.error("Error in getCart:", err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

export const removeFromCart = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;

  try {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.items = cart.items.filter(item => item.product.toString() !== productId);

    await cart.save();
    await cart.populate('items.product', 'name price image');

    res.status(200).json(cart);
  } catch (err) {
    console.error("Error in removeFromCart:", err.message);
    res.status(500).json({ error: 'Server error' });
  }
};