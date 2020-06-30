const express = require('express');
const cors = require('cors');

require('dotenv').config()

const app = express();

const port = process.env.PORT || 6000;

app.use(cors());

app.listen(port, () => console.log(`Server working on port ${port}`));