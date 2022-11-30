#!/usr/bin/env node
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
express()
  .use(express.static(path.resolve(__dirname, 'dist')))
  .use((req, res) => {
    res.type('.html').sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  }).listen(process.env.PORT || 3203, () => {
    console.info('Magic happens on port ', process.env.PORT || 3203)
  }) 