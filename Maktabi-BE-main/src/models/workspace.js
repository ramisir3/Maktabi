const mongoose = require('mongoose')
const validator = require('validator')
const User = require('./user')

const workspaceSchema = new mongoose.Schema({
    primaryAdmin: {

        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true
    },
    phone: {
        type: Number,
        trim: true
    },
    type: {
        type: String,
        trim: true
    },
    location: {

        city: {
            type: String,
            trim: true
        },
        address: {
            type: String,
            trim: true
        }
    },
    numberOfFloors:{
        type: Number,
        trim: true,
        default: 1
    },
    active: {
        type: Boolean,
        default: false
    },
    users: [{

        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        
    }],
    floors: [{
        
        floorNumber: {
            type: Number,
            default: 1,
           
        },
        floorImage: {
            type: Buffer,
            default: undefined
        }

    }],
    avatar: {
        type: Buffer,
        default: undefined
    },
    pictures: [{
        type: Buffer,
        default: undefined
    }],
    description: {
        type: String,
        trim: true
    },
    startDate:{
        type: Date
    },
    endDate:{
        type: Date
    },
    days: [{
        type: String,
        trim: true
    }]


})

workspaceSchema.methods.toJSON = function () {
    const workspace = this

    const workspaceObject = workspace.toObject()
    delete workspaceObject.avatar
    workspaceObject.floors.forEach((floor)=>{
        delete floor.floorImage
    })

    return workspaceObject
}



workspaceSchema.statics.findById = async (_id) => {
    const workspace = await Workspace.findOne({_id})

    return workspace
}

workspaceSchema.statics.deleteById = function(_id) {
    
    try{
    return this.deleteOne({ _id: _id })
    }catch(e){
        return
    }
}

const Workspace = mongoose.model('Workspace', workspaceSchema);

module.exports = Workspace