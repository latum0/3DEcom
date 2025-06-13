// models/Order.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    // For authenticated users, this field will hold the user's ID.
    // For guest users, this field will be null.
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false // Optional for guest orders
    },

    // Flag to determine if the order is from a guest
    isGuest: {
      type: Boolean,
      default: false
    },

    // Guest-specific details (only populated for guest orders)
    guestDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: {
        street: String,
        city: String,
        postalCode: String,
        country: String
      }
    },

    // Array of items in the order
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        priceAtPurchase: {
          type: Number,
          required: true
        }
      }
    ],

    // Total amount of the order
    totalAmount: {
      type: Number,
      required: true
    },

    // Shipping information
    shippingInfo: {
      street: String,
      city: String,
      postalCode: String,
      country: String
    },

    // Payment method used for the order
    paymentMethod: {
      type: String,
      enum: ['PayPal', 'CreditCard', 'CashOnDelivery'],
      required: true
    },

    // Status of the order
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending'
    }
  },
  { timestamps: true }
);


export default mongoose.model('Order', orderSchema);
