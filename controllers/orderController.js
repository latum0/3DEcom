import mongoose from 'mongoose';
import Order from '../models/Order.js';



export const createOrder = async (req, res) => {
  try {
    const { items, shippingInfo, paymentMethod, guestDetails: bodyGuest } = req.body
    const isGuest = !req.user

    // 1) Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Le panier est vide.' })
    }
    for (const it of items) {
      if (it.product) {
        if (
          !mongoose.Types.ObjectId.isValid(it.product) ||
          typeof it.priceAtPurchase !== 'number' ||
          it.priceAtPurchase < 0 ||
          !it.quantity ||
          !it.size ||
          !it.color
        ) {
          return res
            .status(400)
            .json({ error: 'Données de produit incomplètes.' })
        }
      } else if (it.customImage) {
        if (
          typeof it.customImage !== 'string' ||
          !it.quantity ||
          !it.size ||
          !it.color
        ) {
          return res
            .status(400)
            .json({ error: 'Données de produit personnalisées incomplètes.' })
        }
        it.priceAtPurchase =
          typeof it.priceAtPurchase === 'number' ? it.priceAtPurchase : 0
      } else {
        return res
          .status(400)
          .json({ error: 'Chaque article doit avoir un produit ou une image personnalisée.' })
      }
    }

    // 2) Validate shippingInfo
    if (
      !shippingInfo ||
      !shippingInfo.city ||
      !shippingInfo.phone ||
      (isGuest && !shippingInfo.email)
    ) {
      return res
        .status(400)
        .json({ error: "Informations d'expédition incomplètes." })
    }

    // 3) Build guestDetails if needed
    let guestDetails = null
    if (isGuest) {
      if (!bodyGuest || !bodyGuest.name || !(bodyGuest.email || bodyGuest.phone)) {
        return res
          .status(400)
          .json({ error: 'Détails client invité incomplets.' })
      }
      guestDetails = bodyGuest
    }

    // 4) Compute total
    const totalAmount = items.reduce(
      (sum, i) => sum + i.priceAtPurchase * i.quantity,
      0
    )

    // 5) Create & save
    const order = new Order({
      user: isGuest ? null : req.user._id,
      isGuest,
      guestDetails: isGuest ? guestDetails : undefined,
      items: items.map((i) => ({
        product: i.product || undefined,
        customImage: i.customImage || undefined,
        quantity: i.quantity,
        priceAtPurchase: i.priceAtPurchase,
        size: i.size,
        color: i.color,
        customName: i.customName || null,       // ← make sure we map customName
      })),
      totalAmount,
      shippingInfo,
      paymentMethod,
      status: 'Pending',
    })

    const saved = await order.save()
    return res
      .status(201)
      .json({ success: true, orderId: saved._id, data: saved })
  } catch (err) {
    console.error('Error in createOrder:', err)
    return res.status(500).json({ error: err.message })
  }
}
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

    // Update only the status field
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: 'Cancelled' },
      { new: true }
    )
      .populate('user', 'name email')
      .populate('items.product', 'name price images');

    return res.status(200).json({
      success: true,
      data: updatedOrder,
      message: "Order cancelled"
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
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


export const deleteAllOrders = async (req, res) => {
  try {
    // WARNING: this will permanently remove every order!
    const result = await Order.deleteMany({});
    return res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} orders.`
    });
  } catch (err) {
    console.error("Error deleting all orders:", err);
    return res.status(500).json({ error: err.message });
  }
};