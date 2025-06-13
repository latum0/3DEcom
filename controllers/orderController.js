import mongoose from 'mongoose';
import Order from '../models/Order.js';

/**
 * Create a new order.
 */
export const createOrder = async (req, res) => {
  try {
    console.log("Données reçues:", req.body); // Debug 1

    const { items, shippingInfo, paymentMethod, guestDetails } = req.body;

    // Validation approfondie
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log("Erreur: Panier vide"); // Debug 2
      return res.status(400).json({ error: "Le panier est vide" });
    }

    // Vérification des items
    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        console.log("Erreur: Product ID invalide", item.product); // Debug 3
        return res.status(400).json({ error: `Product ID invalide: ${item.product}` });
      }
      if (!item.priceAtPurchase || isNaN(item.priceAtPurchase)) {
        console.log("Erreur: Prix manquant ou invalide", item); // Debug 4
        return res.status(400).json({ error: "Prix manquant ou invalide" });
      }
    }

    // Calcul du montant total
    const totalAmount = items.reduce((total, item) => {
      return total + (item.priceAtPurchase * item.quantity);
    }, 0);

    // Determine if the user is logged in or a guest
    const isGuest = !req.user; // req.user is undefined for guests

    console.log("Création de la commande avec:", { // Debug 5
      user: isGuest ? "Guest" : req.user._id,
      items,
      shippingInfo,
      paymentMethod,
      guestDetails,
      totalAmount
    });

    // Create the order
    const order = new Order({
      user: isGuest ? null : req.user._id, // Null for guest orders
      isGuest,
      guestDetails: isGuest ? guestDetails : undefined, // Populate guest details only for guests
      items: items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase
      })),
      shippingInfo,
      paymentMethod,
      totalAmount,
      status: 'Pending'
    });

    const savedOrder = await order.save();
    console.log("Commande sauvegardée:", savedOrder._id); // Debug 6

    res.status(201).json({
      success: true,
      orderId: savedOrder._id
    });

  } catch (error) {
    console.error("Erreur complète:", error); // Debug 7
    res.status(500).json({
      error: error.message,
      stack: error.stack // Aide au debug
    });
  }
};

/**
 * Get orders for the currently authenticated buyer.
 */
export const getBuyerOrders = async (req, res) => {
  try {
    const buyerId = req.user._id;
    const orders = await Order.find({ user: buyerId })
      .populate('user', 'name email')
      .populate('items.product', 'name price images');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error("Error getting buyer orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Retrieve a single order by its ID.
 */
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }
    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('items.product', 'name price images');

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("Error retrieving order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Update the status of an order.
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }
    const validStatuses = ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true })
      .populate('user', 'name email')
      .populate('items.product', 'name price images');

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.status(200).json({ success: true, data: order, message: "Order status updated" });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Cancel an order.
 */
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Only allow cancellation if the order is still pending
    if (order.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: "Only pending orders can be cancelled"
      });
    }

    order.status = 'Cancelled';
    await order.save();

    await order.populate('user', 'name email')
      .populate('items.product', 'name price images');

    res.status(200).json({
      success: true,
      data: order,
      message: "Order cancelled"
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * Retrieve all orders.
 * For admin use.
 */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name price images');

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error("Error retrieving all orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getOrderByContact = async (req, res) => {
  try {
    const { email, phone } = req.query;

    // Validate query parameters
    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide either an email or a phone number."
      });
    }

    // Build the query condition
    const query = {};
    if (email) query['guestDetails.email'] = email;
    if (phone) query['guestDetails.phone'] = phone;

    // Find orders matching the email or phone number
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name price images');

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found for the provided contact information."
      });
    }

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error("Error retrieving order by contact:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};