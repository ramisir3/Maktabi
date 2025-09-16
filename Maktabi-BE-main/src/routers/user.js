const express = require('express')
const User = require('../models/user')
const Workspace = require('../models/workSpace')
const auth = require('../middleware/auth')
const sharp = require('sharp')
const router = new express.Router()
const multer = require('multer')
const Booking = require('../models/booking')
const sendMail = require('../middleware/sendMail')

//router.get("/test", (req, res) => {res.status(200).send("he")})

router.post('/users', async (req, res) => {
    console.log("1")
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        const message = user.role == 'basic' ? 'Welcome to Maktabi. Log in to start exploring.<br>Using the Maktabi platform, you will be able to browse public workspace and subscribe to them and start booking.<br>Hope you enjoy using our platform.' :
            'Welcome to Maktabi. Log in to start exploring.\nUsing the Maktabi platform, you will be able to create yout workspaces, add and manage users and admins, configure your workspaces and allow users to book from our platform.<br>Hope you enjoy using our platform.'
        sendMail('softwareproject92@gmail.com', user.email, message, 'Welcome to Maktabi')
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
    res.send(req.user)
})

router.post('/users/logout', auth, async (req, res) => {

    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})


router.get('/users/me', auth, async (req, res) => {
    const data = await req.user.populate('workspaces')
    res.send(data)
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['email', 'age', 'password', 'firstName', 'lastName', 'phone', 'workspaces']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ 'error': 'Invalid updates!' })
    }

    const _id = req.params.id

    try {
        const user = req.user
        updates.forEach((update) => user[update] = req.body[update])
        await user.save()

        if (!user) {
            res.status(404).send()
        }
        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {

    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})



const avatar = multer({
    limits: {
        fileSize: 100000000
    }, fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
            cb(new Error('Please upload an image with jpg|png|jpeg extension!'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, avatar.single('avatar'), async (req, res) => {

    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            res.send('')
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})


router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findOne({ "_id": req.params.id }).populate('workspaces')

        res.send(user)
    }
    catch (error) {
        res.sendStatus(404);
    }

})

router.patch('/users/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['email', 'password', 'firstName', 'lastName', 'role', 'phone', 'active', 'workspaces', 'avatar', 'workspaces']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ 'error': 'Invalid updates!' })
    }


    try {
        const user = await User.findById(req.params.id)
        updates.forEach((update) => user[update] = req.body[update])
        await user.save()

        if (!user) {
            res.status(404).send()
        }
        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/users/ids/:id', async (req, res) => {
    try {
        const user = await User.find({ " _id": ObjectId({ $regex: req.params.id, $options: "i" }) })
        if (!user) {
            res.send([])
        }
        res.send(user)
    }
    catch (error) {
        res.sendStatus(404);
    }

})

router.delete('/users/:id', async (req, res) => {

    await User.deleteById(req.params.id)
    res.sendStatus(200)

})

router.get('/users/emails/:email', async (req, res) => {
    try {
        const user = await User.find({ email: { $regex: req.params.email, $options: "i" } })
        if (!user) {
            res.send([])
        }
        res.send(user)
    }
    catch (error) {
        res.sendStatus(404);
    }

})

router.get('/user/email/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email })
        if (!user) {
            throw new Error()
        }
        res.send(user)
    }
    catch (error) {
        res.sendStatus(404);
    }
}
)

router.get('/users/names/:name', async (req, res) => {

    try {

        const filter = { $or: [{ firstName: { $regex: req.params.name || '', $options: 'i' } }, { lastName: { $regex: req.params.name || '', $options: 'i' } }] }
        const all = await User.find(filter)
        if (!all) {
            res.send([])
        }
        res.send(all)
    }
    catch (error) {
        res.sendStatus(404)
    }
})

module.exports = router

router.get('/users/', async (req, res) => {

    try {
        const filter = { firstName: { $regex: req.query.firstName || '', $options: "i" }, lastName: { $regex: req.query.lastName || '', $options: "i" }, email: { $regex: req.query.email || '', $options: "i" } }
        const all = await User.find(filter)
        if (!all) {
            res.send([])
        }
        res.send(all)
    }
    catch (error) {
        res.sendStatus(404)
    }

})

router.get('/users/admin/email/:email', async (req, res) => {

    try {
        const filter = { role: 'admin', email: req.params.email }
        const user = await User.find(filter)
        if (!user) {
            res.send('')
        }
        res.send(user)
    } catch (error) {
        res.sendStatus(404)
    }
})

router.get('/users/admin/id/:id', async (req, res) => {

    try {
        const filter = { role: 'admin', "_id": req.params.id }
        const user = await User.find(filter)
        if (!user) {
            res.send('')
        }
        res.send(user)
    } catch (error) {
        res.sendStatus(404)
    }
})

router.get('/users/basic/name/:name', async (req, res) => {

    try {
        const filter = { role: 'basic', $or: [{ firstName: { $regex: req.params.name || '', $options: 'i' } }, { lastName: { $regex: req.params.name || '', $options: 'i' } }] }
        const user = await User.find(filter)
        if (!user) {
            res.send('')
        }
        res.send(user)
    } catch (error) {
        res.sendStatus(404)
    }
})

router.get('/users/basic/email/:email', async (req, res) => {

    try {
        const filter = { role: 'basic', email: { $regex: req.params.email || '', $options: "i" } }
        const user = await User.find(filter)
        if (!user) {
            res.send('')
        }
        res.send(user)
    } catch (error) {
        res.sendStatus(404)
    }
})

router.get('/users/admin/searchName/:name', async (req, res) => {

    try {
        const filter = { role: 'admin', $or: [{ firstName: { $regex: req.params.name || '', $options: 'i' } }, { lastName: { $regex: req.params.name || '', $options: 'i' } }] }
        const user = await User.find(filter)
        if (!user) {
            res.send('')
        }
        res.send(user)
    } catch (error) {
        res.sendStatus(404)
    }
})

router.get('/users/admin/searchEmail/:email', async (req, res) => {

    try {
        const filter = { role: 'admin', email: { $regex: req.params.email || '', $options: "i" } }
        const user = await User.find(filter)
        if (!user) {
            res.send('')
        }
        res.send(user)
    } catch (error) {
        res.sendStatus(404)
    }
})

router.get('/users/:id/workspaces/:name', async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id }).populate('workspaces')

        const regexp = new RegExp(req.params.name, 'i');
        const workspaces = user.workspaces.filter(ws => regexp.test(ws.name) || regexp.test(ws.location.city))
        res.send(workspaces)
    } catch (error) {
        res.send(error)
    }
})

router.delete('/users/:id/workspaces/:wsId', async (req, res) => {
    try {
        await User.updateOne({ _id: req.params.id }, { $pull: { workspaces: req.params.wsId } })
        await Workspace.updateOne({ _id: req.params.wsId }, { $pull: { users: req.params.id } })
        await Booking.deleteMany({ user: req.params.id, workspace: req.params.wsId })
        res.sendStatus(200)
    } catch (error) {
        res.sendStatus(404)
    }
})

router.post('/users/:id/workspaces/:wsId', async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id })
        if (!user) {
            res.send([])
        }
        user.workspaces.push(req.params.wsId)
        await user.save()
        const workspace = await Workspace.findOne({ _id: req.params.wsId })
        workspace.users.push(req.params.id)
        await workspace.save()
        res.sendStatus(200)
    } catch (error) {
        res.sendStatus(404)
    }
})