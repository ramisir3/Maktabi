const express = require('express')
const Workspace = require('../models/workSpace')
const User = require('../models/user')
const sharp = require('sharp')
const router = new express.Router()
const multer = require('multer')
const auth = require('../middleware/auth')
const sendMail = require('../middleware/sendMail')



module.exports = router

router.post('/workspaces', async (req, res) => {
    const workspace = new Workspace(req.body)

    try {
        await workspace.save()


        const floorsCount = req.body.numberOfFloors
        for (let i = 0; i < floorsCount; i++) {
            let floor = { floorNumber: i + 1 }
            workspace.floors.push(floor)
        }
        const primaryAdmin = await User.findById(req.body.primaryAdmin)
        primaryAdmin.workspaces.push(workspace._id)
        await primaryAdmin.save()

        await workspace.save()
        res.send(workspace)
    } catch (e) {
        res.sendStatus(400)
    }
})

router.get('/workspaces/names/:name', async (req, res) => {
    const workspace = await Workspace.find({ name: { $regex: req.params.name || '', $options: 'i' } }).populate('primaryAdmin')

    res.send(workspace)
})

router.get('/workspaces/cities/:city', async (req, res) => {
    try {
        const filter = { 'location.city': { $regex: req.params.city || '', $options: 'i' } }
        const workspaces = await Workspace.find(filter).populate('primaryAdmin')
        if (!workspaces) {
            res.send([])
        }
        res.send(workspaces)
    } catch (error) {
        res.sendStatus(404)
    }
})

router.get('/workspaces/primaryAdmin/names/:name', async (req, res) => {
    try {
        //const filter = { 'primaryAdmin.name': { $regex: req.params.name } || '', options: 'i' }
        //const workspaces = await Workspace.find(filter).populate('primaryAdmin')
        const all = await Workspace.find().populate('primaryAdmin')
        const regexp = new RegExp(req.params.name, 'i');
        const workspaces = all.filter(ws => regexp.test(ws.primaryAdmin.firstName) || regexp.test(ws.primaryAdmin.lastName))

        res.send(workspaces)
    } catch (error) {
        res.sendStatus(404)
    }
})


router.get('/workspaces/primaryAdmin/ids/:id', async (req, res) => {
    try {
        const filter = { 'primaryAdmin.id': { $regex: req.params.id } || '', options: 'i' }
        const workspaces = await Workspace.find(filter).populate('primaryAdmin')
        if (!workspaces) {
            res.send([])
        }
        res.send(workspaces)
    } catch (error) {
        res.sendStatus(404)
    }
})

router.get('/workspaces/primaryAdmin/emails/:email', async (req, res) => {
    try {
        const all = await Workspace.find().populate('primaryAdmin')
        const regexp = new RegExp(req.params.email, 'i');
        const workspaces = all.filter(ws => regexp.test(ws.primaryAdmin.email))
        res.send(workspaces)
    } catch (error) {
        res.sendStatus(404)
    }
})

router.get('/workspaces/:id', async (req, res) => {
    try {
        const workspace = await Workspace.findOne({ "_id": req.params.id }).populate('primaryAdmin').populate('users').populate('admins')
        if (!workspace) {
            res.send('')
        }
        res.send(workspace)
    }
    catch (error) {
        res.sendStatus(404);
    }

})

router.delete('/workspaces/:id', async (req, res) => {


    await Workspace.deleteById(req.params.id)
    res.sendStatus(200)

})

router.get('/workspaces', async (req, res) => {

    try {
        const all = await Workspace.find().populate('primaryAdmin').populate('users')

        res.send(all)
    }
    catch (error) {
        res.sendStatus(404);
    }


})


router.patch('/workspaces/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'type', 'numberOfFloors', 'users', 'avatar', 'primaryAdmin', 'admins', 'email', 'phone', 'location', 'active', 'floors']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ 'error': 'Invalid updates!' })
    }

    try {
        const workspace = await Workspace.findOne({ _id: req.params.id }).populate('primaryAdmin')

        if (!workspace) {
            throw new Error()
        }

        updates.forEach((update) => {
            if (update == 'users') {
                let newArr = req.body.users
                let oldArr = workspace.users
                let addedUsers = newArr.filter((user) => {
                    let flag = false;
                    for (i in oldArr) {
                        if (user == oldArr[i]) { flag = true; }
                    }
                    return !flag;
                })

                let deletedUsers = oldArr.filter((user) => {
                    let flag = false;
                    for (i in newArr) {
                        if (user == newArr[i]) { flag = true; }
                    }
                    return !flag;
                })

                addedUsers.forEach(async (user) => {
                    let currentUser = await User.findById(user)
                    if (!currentUser.workspaces) {
                        currentUser.workspaces = []
                    }
                    currentUser.workspaces.push(workspace._id)
                    await currentUser.save()
                })
                deletedUsers.forEach(async (user) => {
                    let currentUser = await User.findById(user)
                    if (!currentUser.workspaces) {
                        currentUser.workspaces = []
                    }
                    User.updateOne({ _id: user }, { $pull: { workspaces: workspace._id } }
                    )
                    await currentUser.save()
                })
                workspace['users'] = req.body['users']
            }
            else if (update == 'floors') {
                let ws_floors = req.body.numberOfFloors
                //deleted
                if (ws_floors < workspace.floors.length()) {
                    workspace.floors.splice(ws_floors, workspace.floors.length - ws_floors)
                } else {
                    const addedCount = ws_floors - workspace.floors.length()
                    for (let i = 0; i < addedCount; i++) {
                        let floor = { floorNumber: workspace.floors.length + i, floorImage: undefined }
                        workspace.floors.push(floor)
                    }
                }
            } else if (update == 'active') {
                let message = '';
                if (req.body.active) {
                    message = 'An admin just activated your workspace ' + workspace.name + '. You can start configuring your workspace from your account dashboard!'
                } else {
                    message = 'An admin just deactivated your workspace ' + workspace.name + '. If you think this is a mistake or you need more info about this, contact us at softwareproject92@gmail.com'
                }
                sendMail('softwareproject92@gmail.com', workspace.primaryAdmin.email, message, 'Worksapce Activation Update')
            }
            workspace[update] = req.body[update]
        })
        await workspace.save()

        if (!workspace) {
            res.status(404).send()
        }
        res.send(workspace)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
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



router.post('/workspaces/avatar/:id', avatar.single('avatar'), async (req, res) => {
    try {
        const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
        const workspace = await Workspace.findById(req.params.id)
        if (!workspace) {
            res.sendStatus(404)
            return
        }
        workspace.avatar = buffer
        workspace.save()
        res.send(200)
    } catch (error) {
        res.status(400).send({ error: error.message })
    }


})

router.delete('/workspaces/avatar/:id', async (req, res) => {
    try {
        const workspace = await Workspace.findById(req.params.id)
        if (!workspace || workspace.avatar == undefined)
            return
        workspace.avatar = undefined
        workspace.save()
        res.send(200)
    } catch (error) {
        res.status(400).send({ error: error.message })
    }
})

//get floor image by workspace id and floor index
router.get('/workspaces/id/:id/floor/:floor', async (req, res) => {
    try {
        const workspace = await Workspace.findById(req.params.id)

        if (!workspace) {
            res.send('')
        }

        res.set('Content-Type', 'image/png')
        const floorIndex = req.params.floor
        res.send(workspace.floors[floorIndex].floorImage)
    } catch (e) {
        res.status(404).send('')
    }
})

router.get('/workspaces/avatar/:id', async (req, res) => {
    try {
        const workspace = await Workspace.findById(req.params.id)

        res.set('Content-Type', 'image/png')

        res.send(workspace.avatar)
    } catch (e) {
        res.status(404).send('')
    }
})


const floorImage = multer({
    limits: {
        fileSize: 100000000
    }, fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
            cb(new Error('Please upload an image with jpg|png|jpeg extension!'))
        }
        cb(undefined, true)
    }
})



router.post('/workspaces/id/:id/floor/:floor', avatar.single('avatar'), async (req, res) => {
    try {
        const buffer = await sharp(req.file.buffer).png().toBuffer()
        const workspace = await Workspace.findById(req.params.id)
        if (!workspace) {
            res.sendStatus(404)
            return
        }
        const floorIndex = parseInt(req.params.floor)
        workspace.floors[floorIndex].floorImage = buffer
        workspace.save()
        res.send(200)
    } catch (error) {
        res.status(400).send({ error: error.message })
    }


})

//search workspace by city
router.get('/workspaces/name_city/:name', async (req, res) => {

    try {

        const filter = { type: 'public', $or: [{ 'location.city': { $regex: req.params.name || '', $options: 'i' } }, { name: { $regex: req.params.name || '', $options: 'i' } }] }
        const all = await Workspace.find(filter).populate('users')
        if (!all) {
            res.send([])
        }
        res.send(all)
    }
    catch (error) {
        res.sendStatus(404)
    }
})
//get all public workspaces
router.get('/workspaces/public/all', async (req, res) => {

    try {
        const filter = { type: 'public' }
        const all = await Workspace.find(filter).populate('users')
        if (!all) {
            res.send([])
        }
        res.send(all)
    }
    catch (error) {
        res.sendStatus(404)
    }
})


// //added
// let arr = new.filter((user)=>{
//     let flag = false;
//         for (old){
//             if(id_old == id_new) { flag = true; }
//         }
//     return !flag;
// })


// //deleted
// let arr = old.filter((user)=>{
//     let flag = false;
//         for new{
//             if(id_old == id_new) { flag = true; }
//         }
//     return !flag;
// })