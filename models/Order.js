import mongoose from 'mongoose'
const { Schema, model } = mongoose

// Sub‐schema for guest details
const guestDetailsSchema = new Schema(
  {
    name: {
      type: String,
      required: function () {
        return this.parent().isGuest
      },
    },
    email: {
      type: String,
      required: function () {
        return this.parent().isGuest
      },
    },
    phone: {
      type: String,
      required: function () {
        return this.parent().isGuest
      },
    },
    address: {
      street: String,
      city: String,
      postalCode: String,
      country: String,
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
      required: false,
    },
    isGuest: {
      type: Boolean,
      default: false,
    },
    guestDetails: {
      type: guestDetailsSchema,
      required: function () {
        return this.isGuest
      },
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        priceAtPurchase: {
          type: Number,
          required: true,
        },
        size: {
          type: String,
          required: true,
        },
        color: {
          type: String,
          required: true,
        },
        customName: {
          type: String,
          default: null,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
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
      enum: ['PayPal', 'CreditCard', 'CashOnDelivery'],
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
