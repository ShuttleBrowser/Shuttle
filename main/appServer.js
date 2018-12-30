const addonsPath = `${require('electron').app.getPath('userData').replace(/\\/g,"/")}/addons`

const express = require("express")
const app = express()
const port = 57661 

app.get(/^(.+)$/, (req, res) => { 
  try {
    res.sendfile(addonsPath + req.params[0])
  } catch (error) {
    res.status(404).send('Addon not found !')
  }
})

app.listen(port, () => {
  console.log("Listening on " + port);
})