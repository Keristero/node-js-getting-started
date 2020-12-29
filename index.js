const express = require('express')
const PORT = process.env.PORT || 3000

app = express()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})