const mongoose = require('mongoose')
const Workspace = require('./workSpace')
const User = require('./user')
const Desk = require('./desk')


const bookingSchema = new mongoose.Schema({

    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    desk: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Desk'
    },
    fixed: {
        type: Boolean
    },
    users: [{

        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'

    }],
    title: {
        type: String,
        trim: true
    },
    start: {
        type: Date,
        required: true

    },
    end: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: false,
        trim: true
    }



}, {
    timestamps: true
})


bookingSchema.methods.toJSON = function () {
    const booking = this

    const bookingObject = booking.toObject()

    return bookingObject
}



bookingSchema.statics.findById = async (id) => {
    const booking = await Booking.findOne({ id })

    if (!booking) {
        throw new Error('User not found')
    }

    return booking
}

// Hash the plain text password before saving

const Booking = mongoose.model('Booking', bookingSchema)
module.exports = Booking


