const express = require('express');
const bodyParser = require('body-parser');
const innopplService = require('../service/innoppl-service');
const _ = require('lodash');
const methodOverride = require('method-override');
const jwt = require('jsonwebtoken');

const app = express.Router();

function logErrors(err, req, res, next) {
  console.error(err.stack || err);
  next(err);
}

function errorHandler(err, req, res, next) {
  res.status(err.status || 500);
  res.json({ error: err.message });
}

const getEmployee = async (req, res, next) => {
  try {
    const result = await innopplService.getEmployee();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const result = await innopplService.getProjects();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const postEmployeeAllocation = async (req, res, next) => {
  try {
    const { empid, projectid } = req.body;
    if (_.isUndefined(empid) || _.isUndefined(projectid)) {
      throw new Error('Invalid data provided');
    }

    const result = await innopplService.postEmployeeAllocation(empid, projectid);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getEmployeeAllocation = async (req, res, next) => {
  try {
    const result = await innopplService.getEmployeeAllocation();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const validate = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const secretKey = req.body.password;
    console.log(token)
    if (!token || !secretKey) {
      throw new Error('Unauthorized');
    }

    const decoded = jwt.verify(token, secretKey);
    console.log(decoded);
    req.decodedToken = decoded;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

const postAuthorization = async (req, res, next) => {
  // try {
  //   const { email, password } = req.body;

  //   if (_.isUndefined(email) || _.isUndefined(password)) {
  //     throw new Error('Invalid credentials provided');
  //   }

  //   const result = await innopplService.postAutherization(email, password);
  //   res.json(result);
  // } catch (err) { 
  //   next(err);
  // }
  try {
    const token = req.headers.authorization;
    const secretKey = req.body.password;
    console.log(token)
    if (!token || !secretKey) {
      throw new Error('Unauthorized');
    }

    const decoded = jwt.verify(token, secretKey);
    console.log(decoded);
    req.decodedToken = decoded;
    next();
    res.send({ result: "Processed" })
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = () => {
  app.use(bodyParser.json());
  app.get('/getEmployee', getEmployee);
  app.get('/getProjects', getProjects);
  app.post('/postEmployeeAllocation', postEmployeeAllocation);
  app.post('/postAuthorization', postAuthorization);
  app.get('/getEmployeeAllocation', getEmployeeAllocation)
  app.use(methodOverride());
  app.use(logErrors);
  app.use(errorHandler);

  return app;
};
