// src/models/Order.js
import mongoose from 'mongoose'
const { Schema, model } = mongoose

// Sub-schema for guest details
const guestDetailsSchema = new Schema(
  {
    name: { type: String, required: function () { return this.parent().isGuest } },
    email: { type: String, required: function () { return this.parent().isGuest } },
    phone: { type: String, required: function () { return this.parent().isGuest } },
    address: {
      street: String,
      city: String,
      postalCode: String,
      country: String,
    },
  },
  { _id: false }
)

// Sub-schema for order items (supports product or custom) – note customName added
const orderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: function () { return !this.customImage },
    },
    customImage: {
      type: String,
      required: function () { return !this.product },
    },
    quantity: { type: Number, required: true, min: 1 },
    size: {
      type: String,
      lowercase: true,
      enum: ['s', 'm', 'l'],
      required: true,
    },
    color: {
      type: String,
      lowercase: true,
      enum: ['black', 'white', 'blue', 'red', 'green', 'gray'],
      required: true,
    },
    customName: {                         // ← new field here
      type: String,
      required: false,
      default: null,
      maxlength: 50,
      trim: true,
    },
  },
  { _id: false }
)

// Main Order schema
const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isGuest: { type: Boolean, default: false },
    guestDetails: {
      type: guestDetailsSchema,
      required: function () { return this.isGuest },
    },
    items: {
      type: [orderItemSchema],
      validate: [
        (items) => items.length > 0,
        'Order must have at least one item',
      ],
    },
    totalAmount: { type: Number, required: true },
    shippingInfo: {
      street: String,
      city: String,
      postalCode: String,
      country: String,
      phone: String,
      email: String,
    },
    paymentMethod: {
      type: String,
      enum: ['PayPal', 'CarteEdahabia', 'CashOnDelivery'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
)

export default model('Order', orderSchema)
