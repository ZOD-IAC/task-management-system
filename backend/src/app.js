const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middlewares/error.middleware');
const { clientUrl } = require('./config/env');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cookieParser());
app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy' });
});

app.use('/api', routes);

// Order matters: notFound catches unmatched routes, errorHandler catches
// everything (including what notFound forwards) - errorHandler must be last.
app.use(notFound);
app.use(errorHandler);

module.exports = app;
