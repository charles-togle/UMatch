import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(express.json())
app.listen(3000, () => console.log('listening in port 3000')) //change port if needed

//to run server do node backend/server.js
