require('dotenv').config()
const express = require('express')
const cors = require("cors");
const cookieSession = require("cookie-session");
var logger = require('morgan')
require('./db/mongoose')

var corsOptions = {
  origin: "http://localhost:3000"
};

const userRouter = require('./routers/user')
const workspaceRouter = require('./routers/workspace')
const adminRouter = require('./routers/admin')
const deskRouter = require('./routers/desk')
const bookingRouter = require('./routers/booking')

const app = express()
const port = process.env.PORT

app.use(cors())
app.use(express.json({limit: '50mb'}))
app.use(express.urlencoded({limit: '50mb'}));
app.use(logger('dev'))
app.use(userRouter)
app.use(workspaceRouter)
app.use(adminRouter)
app.use(deskRouter)
app.use(bookingRouter)

app.use(
  cookieSession({
    name: "bezkoder-session",
    secret: "COOKIE_SECRET", // should use as secret environment variable
    httpOnly: true
  })
);

app.get("/trying", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});


app.listen(port, () => {
  console.log('Server is up and running on port', port)
})
