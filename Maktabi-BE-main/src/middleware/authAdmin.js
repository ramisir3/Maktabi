const jwt = require('jsonwebtoken')
const Admin = require('../models/user')


const auth = async (req, res, next) => {

    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const admin = await Admin.findOne({ _id: decoded._id, 'tokens.token': token })

        if(!user){
            throw new Error()
        }

        req.token = token
        req.admin = admin
        next()
    } catch (e) {
        res.status(401).send('Please Authenticate!')
    }
    

}

adminAuth = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '')
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: "Not authorized" })
      } else {
        if (decodedToken.role !== "admin") {
          return res.status(401).json({ message: "Not authorized" })
        } else {
          next()
        }
      }
    })
  } else {
    return res
      .status(401)
      .json({ message: "Not authorized, token not available" })
  }
}
module.exports = auth