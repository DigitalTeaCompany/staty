const express = require("express");
const app = express();
const RateLimit = require('express-rate-limit');
const cors = require("cors");
const mongoose = require("mongoose");

const { MONGODB_URL } = require('../config/secret.json');
const { logger } = require('../functions/logger');

const api = () => {
    const limiter = RateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
    });

    app.use(limiter);
    app.use(express.json());
    app.use(cors());

    // BDD

    try {
        mongoose.connect(MONGODB_URL);
    }
    catch(error) { logger(`🔴 [api:database] Database connect : ${error}`); }

    try {
        // API
        const pingRoute = require('../routes/ping');
        const configRoute = require('../routes/config');
        const apiRoute = require('../routes/api');

        app.use(pingRoute);
        app.use(configRoute);
        app.use(apiRoute);

        app.get("/", (req, res) => {
            res.status(200).json({ message: "Bienvenue sur le backend de Staty" });
        });

        // Route 404
        app.all("*", (req, res) => {
            res.status(404).json({ message: "This route do not exist" });
        });
        
        app.listen(3000, () => {
            logger(`🚀 [api:server:launch] Started on port 3000`);
        });
    }
    catch(error) {
        logger(`🔴 [api:server] An error occured on api : ${error}`);
    }
}

module.exports = { api }