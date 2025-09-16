const express = require('express')
const Admin = require('../models/admin')
const auth = require('../middleware/authAdmin')
const router = new express.Router()




//router.get("/test", (req, res) => {res.status(200).send("he")})
router.post('/admin', async (req, res) => {
    console.log("1")
    const admin = new Admin(req.body)

    try {
        await admin.save()
        const token = await admin.generateAuthToken()
        res.status(201).send({ admin, token })
    } catch (e) {
        res.send('no')
    }
})

router.post('/admin/login', async (req, res) => {

    try {
        const admin = await Admin.findByCredentials(req.body.email, req.body.password)
        const token = await admin.generateAuthToken()
        res.send({ admin, token })
    } catch (e) {
        res.status(400).send(e)
    }
        res.send(req.admin)
})

router.post('/admin/logout', auth, async (req, res) => {

    try {
        req.admin.tokens = req.admin.tokens.filter((token) => token.token !== req.token)
        await req.admin.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/admin/logoutAll', auth, async (req, res) => {
    try {
        req.admin.tokens = []
        await req.admin.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})



router.delete('admin/:id')



module.exports = router


