// models/User.js
import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: function () { return this.role !== 'guest'; } },
    email: {
      type: String,
      required: function () { return this.role !== 'guest'; }, // 'email' required for non-guest users
      unique: function () { return this.role !== 'guest'; } // Ensure uniqueness only for registered users
    },
    passwordHash: {
      type: String, required: function () { return this.role !== 'guest'; }
    },
    role: { type: String, enum: ['client', 'guest', 'admin'], default: 'client' },
    address: {
      street: String,
      city: String,
      postalCode: String,
      country: String
    },

    isGuest: { type: Boolean, default: false },
    guestDetails: {
      name: { type: String }, // Optional name for guest
      email: { type: String }, // Optional email for guest
      phone: { type: String }, // Optional phone for guest
      address: {
        street: String,
        city: String,
        postalCode: String,
        country: String
      }
    },
    phone: { type: String, required: false },
    status: { type: String, enum: ['Actif', 'Inactif'], default: 'Inactif' },
    refreshTokens: [{ type: String }]
  },
  { timestamps: true }
);

const User = model('User', userSchema);
export default User;
