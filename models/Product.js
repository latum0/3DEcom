import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    // Field to track the client (aspiring seller) who proposed the product
    proposedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // Only set when it's proposed by a client
    },

    // Product fields
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      trim: true,
      default: null
    },
    price: {
      type: Number,
      required: false, // No longer required at the schema level
      min: 0
    },
    salePrice: {
      type: Number,
      min: 0,
      default: null
    },
    category: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the Category model
      ref: 'Category',
      required: true
    },
    tags: {
      type: [String],
      default: []
    },
    image: {
      type: [String],
      default: []
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviews: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5
        },
        comment: {
          type: String,
          trim: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    // Status of the product (proposed, approved, rejected)
    status: {
      type: String,
      enum: ['Proposed', 'Approved', 'Rejected'],
      default: 'Proposed' // Default status when proposed by a client
    },

    // Admin who reviewed the product
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // Only set when reviewed by an admin
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to update the average rating based on reviews
productSchema.pre('save', async function (next) {
  if (this.reviews && this.reviews.length > 0) {
    const totalRatings = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating = totalRatings / this.reviews.length;
  } else {
    this.rating = 0;
  }
  next();
});

export default mongoose.model('Product', productSchema);