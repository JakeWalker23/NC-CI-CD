const express = require('express');
const path = require('path');
const { logger } = require('./utils');

const app = express();

const options = {
  root: path.join(__dirname, 'public'),
};

app.use((req, res, next) => {
  logger(req.method, req.url);
  next();
});

app.get('/s3', (req, res) => {
  res.sendFile('s3.html', options);
});

app.get('/lambda', (req, res) => {
  res.sendFile('lambda.html', options);
});

app.get('/ec2', (req, res) => {
  res.sendFile('ec2.html', options);
});

module.exports = app;
