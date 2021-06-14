const puppeteer = require('puppeteer');
const express = require("express")
const cors = require("cors")

const socket = require("socket.io")
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const http = require("http")
const server = http.createServer(app)

// Automatically allow cross-origin requests
app.use(cors({ origin: true }))

const PORT = process.env.PORT || 2080

const io = socket(server, {
    cors: {
      origin: '*',
    }
})

io.on('connection', function(socket) {
    console.log("connection")
  socket.on('get', async data => {

    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    })

    
    const page = await browser.newPage();
    await page.goto('https://www.binance.com/en/news');
    

    var list = await page.evaluate(async ()=> {
        let listArr = []

        const nodeList = document.querySelectorAll('div.css-18t8by3 div.css-1i9bvdl')
        const imgArray = [nodeList]
        imgArray.forEach(element => {
            for (let i = 0; i < element.length; i++) {
                const el = element[i];
                
                var value = {
                    txt: el.textContent,
                    img: el.querySelector('img').src,
                    url: el.querySelector('a').href
                }
                listArr.push(value) 
            }
                
        })
        return listArr

    })

    io.emit('bitcoin', list)
  })

  socket.on('disconnect', function (reason) {
    console.log(`${socket.id} user disconnected, ${reason}`);
  })
})


server.listen(PORT, () => {
    console.log("Escutando na porta: " + PORT);
})