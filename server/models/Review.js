const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor ID is required'],
    },

    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment ID is required'],
      unique: true,
    },

    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },

    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
      default: '',
    },

    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevent duplicate reviews for the same appointment
// reviewSchema.index({ appointmentId: 1 }, { unique: true });
reviewSchema.index({ doctorId: 1, createdAt: -1 });
reviewSchema.index({ patientId: 1, createdAt: -1 });

/**
 * Post-save hook: Update doctor's average rating after a new review is saved
 */
reviewSchema.post('save', async function () {
  try {
    const DoctorProfile = mongoose.model('DoctorProfile');

    const stats = await mongoose.model('Review').aggregate([
      { $match: { doctorId: this.doctorId } },
      {
        $group: {
          _id: '$doctorId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await DoctorProfile.findOneAndUpdate(
        { userId: this.doctorId },
        {
          rating: Math.round(stats[0].averageRating * 10) / 10,
          totalReviews: stats[0].totalReviews,
        }
      );
    }
  } catch (error) {
    console.error(
      'Error updating doctor rating after review save:',
      error.message
    );
  }
});

/**
 * Post-remove hook: Recalculate doctor rating after a review is deleted
 */
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    try {
      const DoctorProfile = mongoose.model('DoctorProfile');

      const stats = await mongoose.model('Review').aggregate([
        { $match: { doctorId: doc.doctorId } },
        {
          $group: {
            _id: '$doctorId',
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
          },
        },
      ]);

      if (stats.length > 0) {
        await DoctorProfile.findOneAndUpdate(
          { userId: doc.doctorId },
          {
            rating: Math.round(stats[0].averageRating * 10) / 10,
            totalReviews: stats[0].totalReviews,
          }
        );
      } else {
        await DoctorProfile.findOneAndUpdate(
          { userId: doc.doctorId },
          {
            rating: 0,
            totalReviews: 0,
          }
        );
      }
    } catch (error) {
      console.error(
        'Error updating doctor rating after review deletion:',
        error.message
      );
    }
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
