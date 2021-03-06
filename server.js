const express = require('express');
const path = require('path');
const cors = require('cors')
const port = process.env.PORT || 4000

const app = express()

app.use(express.json())
app.use(cors())


app.use(express.static(path.join(__dirname, './client/build')))

app.get('*', (req,res)=>{
    res.sendFile(path.join(__dirname, './client/build/index.html'))
})

app.listen(port)