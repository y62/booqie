const express = require("express");
const nodemon = require("nodemon");
const app = express();
const port = 8080;
app.use(express.static("frontend"));

//____________________________________________________________________________

app.get("/", (req, res) => {
    return res.sendFile(__dirname + '/frontend/index.html');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + 'frontend/test.html')
})

app.get("/", (req, res) => {
    return res.sendFile(__dirname + '/frontend/loginModal.html');
});

app.listen(port, () => {
    console.log("Server is running on port:", port)
});

