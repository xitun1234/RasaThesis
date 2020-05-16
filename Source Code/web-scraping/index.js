const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const keys = require('./config/keys')

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
  const browser = await puppeteer.launch({ headless: false });
  console.log('Browser openned');
  const page = await browser.newPage();
  const url = 'https://www.thegioididong.com/dtdd#i:5';
  await page.goto(url);
  console.log('Page loaded');

  const phoneListName = await page.evaluate(() => {
           
    function selector(phone) {
      let img;
      if (phone.querySelector('img').getAttribute('src') == null) {
        if (phone.querySelector('img').src !== "") {
          img = phone.querySelector('img').src;
        } else if (phone.querySelector('img').getAttribute('data-original') != null) {
          img = phone.querySelector('img').getAttribute('data-original');
        }
      } else {
        img =phone.querySelector('img').getAttribute('src');
      }
      return img;
    }

    let phoneList = document.querySelectorAll('li >a[href^="/dtdd/"]')
    phoneList = [...phoneList];

    let result = phoneList.map(phone => {
      return {
        image : selector(phone),
        name : phone.querySelector('h3').innerText,
        price : phone.querySelector('div.price').querySelector('strong').innerText,
        url: "https://thegioididong.com" + phone.getAttribute('href'),
      }
    }
      
    );

    return result;
  });

  console.log(phoneListName);
  
  for (let i = 0; i < phoneListName.length; i++) {
    const { image, name, price, url } = phoneListName[i];
    await page.goto(url);
    const reviews = await page.evaluate(() => {
      
      let reviews = [];
      let commentList = document.querySelectorAll('li.comment_ask');
      commentList.forEach(comment => {
        let review = {};
        review.content = comment.children[1].innerText; 
        if (comment.children[3].firstChild) {
          if (comment.children[3].firstChild.children[1]) {
            review.answer = comment.children[3].firstChild.children[1].innerText;
          }
          else {
            review.answer = "";
          }
        } else {
          review.answer = "";
        }
        reviews.push(review);
      })
      console.log(reviews);
      // let reviews = document.querySelectorAll('div.question');
      // reviews = [...reviews];
      // reviews = reviews.map(review => review.innerText);
      return reviews;
    })

    const phone = new Phone({
      image, name, price: String(price).slice(0, -1), url, reviews
    });

    
  }

  await browser.close();

})();

app.listen(PORT);
// data crawling for fptshop.com.vn

// (async() => {
//   const browser = await puppeteer.launch({ headless: false });
//   console.log('Browser openned');
//   const page = await browser.newPage();
  
//   for (let i = 1; i <= 7; i++) {
//     const url = `https://fptshop.com.vn/dien-thoai?sort=gia-cao-den-thap&trang=${i}`;
//     await page.goto(url);
//     console.log('Page loaded');
  
//     const phoneListName = await page.evaluate(() => {
             
//       // get all phones in page 
//       let phonesInPage = document.querySelectorAll('div.fs-lpil');
//       phonesInPage = [...phonesInPage];
//       let result = phonesInPage.map(phone => {
//           return {
//             // crawl image, name, price and url
//             image : phone.children[0].querySelector('p> img').src,
//             name : phone.children[0].title,
//             price: phone.children[1].querySelector('div.fs-lpilname > div.fs-lpil-price').innerText,
//             url: phone.children[0].href
//           }
//       })
  
//       return result;
//     });
  
//     console.log(phoneListName);
    
//     // loop through each phones and start crawling review 
//     for (let i = 0; i < phoneListName.length; i++) {
//       const { image, name, price, url } = phoneListName[i];
//       await page.goto(url);

//       // start crawling reviews
//       const reviews = await page.evaluate(() => {
        
//         let reviews = [];
//         let qAndA = document.querySelectorAll('div.f-cmt-ask div.f-cmmain');
//         qAndA = [...qAndA];
//         if ((qAndA.length % 2) != 0) {
//           qAndA.shift();
//         }
//         for (let i = 0; i < qAndA.length; i+=2) {
//           let review = {};
//           review.content = qAndA[i].innerText;
//           review.answer = qAndA[i+1].innerText;
//           reviews.push(review);
//         }
//         return reviews;
        
//       })
//       console.log(reviews);

//       // save phone data to db
//       const phone = new Phone({
//         image, name, price: String(price).slice(0, -1), url, reviews
//       });
  
//       phone.save();
//     }
  

  
//   }
//   await browser.close();
// })();

// data crawling for cellphones.com.vn

// (async() => {
//   const browser = await puppeteer.launch({ headless: false });
//   console.log('Browser openned');
//   const page = await browser.newPage();
  
//   for (let i = 1; i <= 8; i++) {
//     const url = `https://cellphones.com.vn/mobile.html?p=${i}`;
//     await page.goto(url);
//     console.log('Page loaded');
  
//     const phoneListName = await page.evaluate(() => {
             
//       // get all phones in page 
//       let phonesInPage = document.querySelectorAll('li.cate-pro-short');
//       phonesInPage = [...phonesInPage].slice(-20);
//       let result = phonesInPage.map(phone => {
//           return {
//             // crawl image, name, price and url
//             image : phone.querySelector('a img').src,
//             name : phone.children[1].querySelector('h3').innerText,
//             price: phone.children[1].querySelector('span.price').innerText,
//             url: phone.querySelector('a').href
//           }
//       })
  
//       return result;
//     });
  
//     console.log(`phone list name in ${i} page`,phoneListName);
    
//     // loop through each phones and start crawling review 

//     for (let j = 0; j < phoneListName.length; j++) {
//       const { image, name, price, url } = phoneListName[j];
//       await page.goto(url);

//       // start crawling reviews
//       const reviews = await page.evaluate(() => {
        
//         let reviews = [];
//         let qANDa = document.querySelectorAll('.f-left.cmt_item');
//         qANDa = [...qANDa];

//         for (let k = 0; k < qANDa.length; k++) {
//           let review = {};
//           review.content = qANDa[k].querySelector('.question').innerText;
//           review.answer = qANDa[k].querySelector('.reply_list .question') ? 
//                           qANDa[k].querySelector('.reply_list .question').innerText : "";
//           reviews.push(review);
//         }
//         return reviews;
        
//       })
//       console.log(`review of phone ${phoneListName[j].name}`,reviews);

//       // save phone data to db
//       const phone = new Phone({
//         image, name, price: String(price).slice(0, -1), url, reviews
//       });
  
//       phone.save();
//     }
  
//   }
//   await browser.close();
// })();

