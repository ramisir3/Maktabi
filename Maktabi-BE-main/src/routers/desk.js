const express = require('express')
const Desk = require('../models/desk')
const Workspace = require('../models/workSpace')
const User = require('../models/user')
const sharp = require('sharp')
const router = new express.Router()
const multer = require('multer')
const auth = require('../middleware/auth')
const mongoose = require('mongoose')




module.exports = router

router.post('/desks/workspaceId/:id', async (req, res) => {
    //const desk = new Desk(req.body)
    const desks = req.body.desks
    await Desk.deleteMany({ workspace: req.params.id })
    try {
        desks.forEach(async (d) => {
            let desk = new Desk(d)
            await desk.save()
        })
        res.sendStatus(201)
    } catch (e) {
        res.sendStatus(400)
    }
})

router.delete('/desks/:id', async (req, res) => {

    await Desk.deleteById(req.params.id)
    res.sendStatus(200)

})

router.get('/desks/:id', async (req, res) => {
    try {
        const desk = await Desk.findOne({ "_id": req.params.id }).populate('workspace').populate('user')
        if (!desk) {
            res.send('')
        }
        res.send(desk)
    }
    catch (error) {
        res.sendStatus(404);
    }

})

router.get('/desks/workspaceId/:id', async (req, res) => {
    try {
        const desks = await Desk.find({ workspace: req.params.id }).populate('workspace').populate('user')
        if (!desks) {
            res.send([])
        }
        res.send(desks)
    } catch (error) {
        res.sendStatus(404);
    }
})

router.patch('/desks/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['deskType', 'workspace', 'floor', 'capacity', 'x', 'y', 'scaleX', 'sclaeY', 'width', 'height', 'name', 'rotation', 'users', 'fixed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ 'error': 'Invalid updates!' })
    }


    try {
        const desk = await Desk.findById(req.params.id)
        updates.forEach((update) => desk[update] = req.body[update])
        await desk.save()

        if (!desk) {
            res.status(404).send()
        }
        res.send(desk)
    } catch (e) {
        res.status(400).send(e)
    }
})