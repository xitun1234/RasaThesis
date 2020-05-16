const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const keys = require('./config/keys')
const jest = require('jest');
'use strict';
const PORT = process.env.PORT || 3030;
const app = express();
require('./models/Phone');
require('./models/Review');

const Phone = mongoose.model('phones');
const Review = mongoose.model('reviews')
console.log(keys);
mongoose.connect('mongodb://nghia:zxc123@ds137581.mlab.com:37581/phone-list', { useNewUrlParser: true })
    .then(() => console.log('MongoDB connected'))
    .catch((error) => console.log(error));

app.use(bodyParser.json());

// data crawling for thegioididong.com
(async() => {
  const browser = await puppeteer.launch({ headless: false,
                                args: ['--incognito',
                                '--no-sandbox',
                                '--disable-setuid-sandbox',
                                '--disable-accelerated-2d-canvas',
                                '--disable-gpu'] });
  console.log('Browser openned');
  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();
  page.setViewport({ width: 1280, height:720 });
  const url = 'https://www.google.com.vn/';
  await page.goto(url, {waitUntil: 'networkidle2'});
  console.log('Page loaded');

  await page.waitFor(1000);

  

  const inputSearch = await page.evaluate(()=>{
    let inputText = document.getElementsByClassName('gLFyf gsfi')
    keyword = "chuẩn kháng nước iPhone 11";
    inputText[0].value = keyword;
    let clickButtonSearch = document.getElementsByClassName('gNO89b');
    clickButtonSearch[0].click()

    return true
  });
  await page.waitForNavigation({waitUntil: 'domcontentloaded'});
  await page.waitForFunction('document.title.length != 16');
  const urlCurrent = await page.evaluate(() => {return window.location.href});
  console.log(urlCurrent);
  
  await browser.close();
 
})();

app.listen(PORT);
