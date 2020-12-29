const express = require('express')
const PORT = process.env.PORT || 3000

app = express()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/turtle', (req, res) => {
  let label = req.header('label')
  let x = req.header('x')
  let y = req.header('y')
  let z = req.header('z')
  console.log(label,x,y,z)
  res.send('ok')
})

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})