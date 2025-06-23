import mongoose from 'mongoose'
const { Schema, model } = mongoose

// Sub-schema for guest details
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

// Sub-schema for order items (supports product or custom)
const orderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: function () {
        // productId required when no customImage is provided
        return !this.customImage
      }
    },
    customImage: {
      type: String, // URL or Base64-encoded image
      required: function () {
        // customImage required when ordering a custom product without an existing product
        return !this.product
      }
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    size: {
      type: String,
      enum: ['s', 'm', 'L'],
      required: true,
    },
    color: {
      type: String,
      enum: ['black', 'White', 'Blue', 'Red', 'Green', 'Gray'],
      required: true,
    }
  },
  { _id: false }
)

// Main Order schema
const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false, // not required for guests
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
    items: {
      type: [orderItemSchema],
      validate: [
        items => items.length > 0,
        'Order must have at least one item'
      ]
    },
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
