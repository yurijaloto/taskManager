const express = require('express')
const router = express.Router()
const {Task} = require('../models')
const {authMiddleware} = require('../middlewares')
const sum = require('./teste')


test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});