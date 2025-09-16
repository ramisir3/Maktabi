const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const adminSchema = new mongoose.Schema({

    userName: {
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

     tokens: [{
        token: {
            type: String,
            required: true
        }
    }],

}, {
    timestamps: true,
    strictQuery: false
})


adminSchema.methods.toJSON = function () {
    const admin = this

    const adminObject = admin.toObject()

    delete adminObject.password
    delete adminObject.tokens
    delete adminObject.avatar

    return adminObject
}

adminSchema.methods.generateAuthToken = async function () {
    const admin = this
    const token = jwt.sign({ _id: admin._id.toString() }, process.env.JWT_SECRET)

    admin.tokens = admin.tokens.concat({ token })
    await admin.save()

    return token
}


adminSchema.statics.findByCredentials = async (email, passowrd) => {
    const admin = await Admin.findOne({ email })

    if (!admin) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(passowrd, admin.password)

    console.log(isMatch)
    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return admin
}
adminSchema.statics.findById = async (_id) => {
    const admin = await Admin.findOne({_id})

    return admin
}




// Hash the plain text password before saving
adminSchema.pre('save', async function (next) {
    const admin = this

    if (admin.isModified('password')) {
        admin.password = await bcrypt.hash(admin.password, 8)
    }

    next()
})


const Admin = mongoose.model('Admin', adminSchema)
module.exports = Admin


