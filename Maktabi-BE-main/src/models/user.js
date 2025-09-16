const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { ObjectId } = require('mongodb')
const Workspace = require('./workSpace')

const userSchema = new mongoose.Schema({

    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid Email!')
            }
        }
    }, password: {
        type: String,
        required: true,
        minLength: 7,
        trim: true,
        validate(value) {
            if (validator.contains(value, "password")) {
                throw new Error('Your password contains the \"password\" string inside of it!')
            }
        }
    },
    role: {
        type: String,
        default: "basic",
        lowercase: true,
        trim: true
    },

    phone: {
        type: Number,

    }
    , tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    },
    active: {
        type: Boolean,
        default: true
    },
    workspaces: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace'
    }]
}, {
    timestamps: true,
    strictQuery: false
})


userSchema.methods.toJSON = function () {
    const user = this

    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

userSchema.methods.isAdmin = (req, res, next) => {
    User.findById
}


userSchema.statics.findByCredentials = async (email, passowrd) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(passowrd, user.password)

    console.log(isMatch)
    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

userSchema.statics.deleteById = function (_id) {

    try {
        return this.deleteOne({ _id: _id })
    } catch (e) {
        return
    }
}

userSchema.statics.findById = async (_id) => {
    const user = await User.findOne({ _id })

    return user
}




// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})


const User = mongoose.model('User', userSchema)
module.exports = User


