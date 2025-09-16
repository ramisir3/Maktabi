const express = require('express')
const Desk = require('../models/desk')
const Workspace = require('../models/workSpace')
const User = require('../models/user')
const sharp = require('sharp')
const router = new express.Router()
const multer = require('multer')
const auth = require('../middleware/auth')
const mongoose = require('mongoose')
const Booking = require('../models/booking')
const moment = require('moment')
const Expo = require('expo-server-sdk')
const sendMail = require('../middleware/sendMail')



let expo = new Expo.Expo();
let pushToken = 'ExponentPushToken[9jlf2ZNzHqkeU_QGJ1g8iz]'

module.exports = router

router.get('/bookings/userId/:id', async (req, res) => {
    //const desk = new Desk(req.body)

    try {
        const bookings = await Booking.find({ user: req.params.id }).populate('user').populate('workspace').populate('desk').populate('users')
        if (!bookings) {
            res.send([])
        }
        res.send(bookings)
    } catch (e) {
        res.sendStatus(400)
    }
})

router.get('/bookings/workspaceId/:id', async (req, res) => {
    //const desk = new Desk(req.body)

    try {
        const bookings = await Booking.find({ workspace: req.params.id }).populate('user').populate('workspace').populate('desk').populate('users')
        if (!bookings) {
            res.send([])
        }
        res.send(bookings)
    } catch (e) {
        res.sendStatus(400)
    }
})

router.get('/bookings/deskId/:id', async (req, res) => {
    //const desk = new Desk(req.body)

    try {
        const bookings = await Booking.find({ desk: req.params.id }).populate('user').populate('workspace').populate('desk').populate('users')
        if (!bookings) {
            res.send([])
        }
        res.send(bookings)
    } catch (e) {
        res.sendStatus(400)
    }
})


router.post('/bookings/deskId/:id', async (req, res) => {


    const bookings = req.body.bookings
    await Booking.deleteMany({ desk: req.params.id })
    try {
        bookings.forEach(async (b) => {
            let booking = new Booking(b)
            await booking.save()
        })
        res.sendStatus(201)
    } catch (e) {
        res.sendStatus(400)
    }
})

router.post('/bookings', async (req, res) => {
    try {
        const currentBookings = await Booking.find({ desk: req.body.desk })
        let conflict = false;
        for (let i in currentBookings) {
            if (moment(currentBookings[i].start).isBefore(moment(req.body.end)) && moment(currentBookings[i].end).isAfter(moment(req.body.start))) {
                conflict = true;
                return;
            }
        }
        if (conflict) {
            res.send('cannot post')
        }
        const booking = new Booking(req.body)
        const workspace = await Workspace.findById(req.body.workspace);
        await booking.save()

        // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
        let message = {
            to: pushToken,
            sound: 'default',
            title: 'New calendar event added',
            body: 'You have been added to an event at ' + workspace.name,
        };
        await expo.sendPushNotificationsAsync(message)
        res.send(booking)
    } catch (error) {
        res.sendStatus(404)
    }
})

router.delete('/bookings/:id', async (req, res) => {
    try {
        let booking = await Booking.findOne({ _id: req.params.id }).populate('workspace').populate('user')
        await Booking.deleteOne({ _id: req.params.id })
        const workspace = await Workspace.findById(booking.workspace._id);

        // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
        let messages = [{
            to: pushToken,
            sound: 'default',
            title: 'Calendar Event Deleted',
            body: 'Your event ' + booking.title + ' at ' + workspace.name + ' on ' + moment(booking.start).format('dddd DD MMM, YYYY') + ' was deleted by a worksapce admin.',
        }];
        await expo.sendPushNotificationsAsync(messages)
        const message = 'Your event ' + booking.title + ' at ' + workspace.name + ' on ' + moment(booking.start).format('dddd DD MMM, YYYY') + ' was deleted by a worksapce admin.';
        sendMail('softwareproject92@gmail.com', booking.user.email, message, 'Event Updated')
        res.sendStatus(200)
    } catch (e) {
        console.log(e)
        res.sendStatus(404)
    }
})