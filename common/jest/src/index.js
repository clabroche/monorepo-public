#!/usr/bin/env node
const jest = require('jest')
const path = require('path')
const pathtoConfig = path.resolve(__dirname, 'jest.config.default.js')
jest.run(['-c', pathtoConfig])