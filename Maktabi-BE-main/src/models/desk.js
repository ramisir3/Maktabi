const mongoose = require('mongoose')
const validator = require('validator')
const Workspace = require('./workSpace')
const User = require('./user')

const deskSchema = new mongoose.Schema({

    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace'
    },
    deskType: {
        type: String,
        required: true,
        trim: true,
    },
    floor: {
        type: Number,
        required: true
    },
    capacity: {
        type: Number,
        required: false
    },
    x: {
        type: Number,
        required: true
    },
    y: {
        type: Number,
        required: true
    },
    scaleX: {
        type: Number,
        required: false
    },
    scaleY: {
        type: Number,
        required: false
    },
    width: {
        type: Number,
        required: false
    },
    height: {
        type: Number,
        required: false
    },
    name: {
        type: String,
        required: true
    },
    rotation: {
        type: Number,
        required: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    fixed: {
        type: Boolean
    }
}, {
    timestamps: true
})


deskSchema.methods.toJSON = function () {
    const desk = this

    const deskObject = desk.toObject()

    return deskObject
}



deskSchema.statics.findById = async (id) => {
    const desk = await Desk.findOne({ id })

    if (!desk) {
        throw new Error('User not found')
    }

    return desk
}



const Desk = mongoose.model('Desk', deskSchema)
module.exports = Desk


