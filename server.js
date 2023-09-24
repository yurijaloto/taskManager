const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config({ override: true })
const {tasksRouter, usersRouter} = require('./src/routes')

const app = express()
app.use(express.json())

//TODO: Ver questoes de logging

// mongoose.connect(process.env.MONGO_URL).then(() => console.log('conectado')).catch((error) => console.log(error))
mongoose.connect(process.env.MONGO_URL)
// const {Schema} = mongoose

app.listen(process.env.PORT, () => {
  console.log(`Server ${process.pid} running on port ${process.env.PORT}`)
})

app.use(tasksRouter)
app.use(usersRouter)