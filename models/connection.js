const mongodb = require("mongoose");
require('dotenv').config()

const connectionString = process.env.MONGO_DB_CONNEXION

// handle connection
mongodb.connect( connectionString, {connectTimeoutMS:2000})
    .then(() => console.log('crmdiscord db connected'))
    .catch(error => console.log(error))