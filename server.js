const express = require('express');
const app = express();
const db = require('./models');
const port = process.env.PORT || 3000
const apiRoutes = require('./routes/apiRoutes')

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use('/api', apiRoutes);

db.sequelize.sync().then(() => {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${3000}`)
    })
})
