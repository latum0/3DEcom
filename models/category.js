import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true, // Ensures no duplicate categories
            maxlength: 100
        },
        description: {
            type: String,
            trim: true,
            default: null
        },
        isActive: {
            type: Boolean,
            default: true // Allows categories to be soft-deleted
        },

        // NEW: toggle custom name display per category
        customNameAllowed: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('Category', categorySchema);