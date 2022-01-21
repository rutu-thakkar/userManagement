const express = require('express');
const app = express();
const db = require('./models');
const port = process.env.PORT || 3000
const apiRoutes = require('./routes/apiRoutes');
const YAML = require('yamljs');
const cors = require('cors');
const JSDoc = YAML.load('./api.yaml')
const swaggerUI = require('swagger-ui-express');

app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(cors());
app.use('/api', apiRoutes);
app.set('view engine', 'ejs');
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(JSDoc));

db.sequelize.sync().then(() => {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${3000}`)
    });
});