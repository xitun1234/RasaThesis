const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const keys = require('./config/keys')
const jest = require('jest');

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

var ListPhone = [];

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
                img = phone.querySelector('img').getAttribute('src');
            }
            return img;
        }

        let phoneList = document.querySelectorAll('li >a[href^="/dtdd/"]')
        phoneList = [...phoneList];

        let result = phoneList.map(phone => {
                return {
                    image: selector(phone),
                    name: phone.querySelector('h3').innerText,
                    price: phone.querySelector('div.price').querySelector('strong').innerText,
                    url: "https://thegioididong.com" + phone.getAttribute('href'),
                }
            }

        );
        return result;
    });

    for (var i = 0; i < phoneListName.length; i++) {
        ListPhone.push(phoneListName[i].name);
    }
    ListPhone.sort()
    for (var i = 0; i < ListPhone.length; i++) {
        console.log(ListPhone[i]);
    }

    // for (let i=0; i< phoneListName.length; i++)
    // {
    //   const { image, name, price, url } = phoneListName[i];
    //   priceTemp = price.replace('₫','');
    //   priceTemp = priceTemp.replace('.','');
    //   priceTemp = priceTemp.replace('.','');
    //   await page.goto(url);

    //   const clickButton = await page.evaluate(()=>{
    //       let buttonTemp = document.querySelector('body > section > div.box_content > aside.right_content > div.tableparameter > button');
    //       if (buttonTemp != null)
    //       {
    //           buttonTemp.click()
    //       }
    //       else
    //       {
    //           return false;
    //       }
    //       return true;
    //     });

    //   if (clickButton == false){
    //       continue;
    //   }

    //   await page.waitFor(1000)
    //   const getData = await page.evaluate(()=>{

    //       let display_technology = document.getElementsByClassName('g6459')[0].children[1].innerText;
    //       let display_resolution = document.getElementsByClassName('g78')[0].children[1].innerText;
    //       let display_size = document.getElementsByClassName('g79')[0].innerText;
    //       let display_protection = document.getElementsByClassName('g7799')[0].children[1].innerText;
    //       let back_camera_resolution = document.getElementsByClassName('g27')[0].innerText;
    //       let back_camera_video = document.getElementsByClassName('g31')[0].children[1].innerText;
    //       let back_camera_flash = document.getElementsByClassName('g6460')[0].children[1].innerText;
    //       let back_camera_advanced = document.getElementsByClassName('g28')[0].children[1].innerText;
    //       let front_camera_resolution = document.getElementsByClassName('g29')[0].children[1].innerText;
    //       let front_camera_videocall = document.getElementsByClassName('g30')[0].children[1].innerText;
    //       let front_camera_other_infor = document.getElementsByClassName('g7801')[0].children[1].innerText;
    //       let operating_system = document.getElementsByClassName('g72')[0].children[1].innerText;
    //       let os_version = document.getElementsByClassName('g72')[0].children[1].innerText;
    //       let chipset = document.getElementsByClassName('g6059')[0].children[1].innerText;
    //       let cpu = document.getElementsByClassName('g51')[0].children[1].innerText;
    //       let gpu = document.getElementsByClassName('g6079')[0].children[1].innerText;
    //       let ram = document.getElementsByClassName('g50')[0].children[1].innerText;
    //       let memory_internal = document.getElementsByClassName('g49')[0].children[1].innerText;
    //       let memory_available = document.getElementsByClassName('g7803')[0].children[1].innerText;
    //       let memory_card_slot = document.getElementsByClassName('g52')[0].children[1].innerText;
    //       let mobile_network = document.getElementsByClassName('g7761')[0].children[1].innerText;
    //       let sim = document.getElementsByClassName('g6339')[0].children[1].innerText;
    //       let wifi = document.getElementsByClassName('g66')[0].children[1].innerText;
    //       let gps = document.getElementsByClassName('g68')[0].children[1].innerText;
    //       let bluetooth = document.getElementsByClassName('g69')[0].children[1].innerText;
    //       let charging_port = document.getElementsByClassName('g71')[0].children[1].innerText;
    //       let headphone_jack = document.getElementsByClassName('g48')[0].children[1].innerText;
    //       let other_port = document.getElementsByClassName('g5199')[0].children[1].innerText;
    //       let design = document.getElementsByClassName('g7804')[0].children[1].innerText;
    //       let material = document.getElementsByClassName('g7805')[0].children[1].innerText;
    //       let dimensions = document.getElementsByClassName('g88')[0].children[1].innerText;
    //       let weight = document.getElementsByClassName('g100')[0].children[1].innerText;
    //       let battery_capacity = document.getElementsByClassName('g84')[0].innerText;
    //       let battery_type = document.getElementsByClassName('g83')[0].children[1].innerText;
    //       let battery_technology = document.getElementsByClassName('g10859')[0].children[1].innerText;
    //       let advanced_security = document.getElementsByClassName('g10860')[0].children[1].innerText;
    //       let special_features = document.getElementsByClassName('g43')[0].children[1].innerText;
    //       let recording = document.getElementsByClassName('g36')[0].children[1].innerText;
    //       let radio = document.getElementsByClassName('g34')[0].children[1].innerText;
    //       let watchfilm = document.getElementsByClassName('g32')[0].children[1].innerText;
    //       let music = document.getElementsByClassName('g33')[0].children[1].innerText;
    //       let time_of_lunch = document.getElementsByClassName('g13045')[0].children[1].innerText;

    //       let results = {name: 'TEST',
    //        price: 'TEST',
    //        display_technology: display_technology,
    //        display_protection: display_protection,
    //        display_resolution: display_resolution,
    //        display_size: display_size,
    //        back_camera_resolution: back_camera_resolution,
    //        back_camera_video: back_camera_video,
    //        back_camera_flash: back_camera_flash,
    //        back_camera_advanced: back_camera_advanced,
    //        front_camera_resolution: front_camera_resolution,
    //        front_camera_videocall: front_camera_videocall,
    //        front_camera_other_infor: front_camera_other_infor,
    //        operating_system: operating_system,
    //        os_version:os_version,
    //        chipset: chipset,
    //        cpu: cpu,
    //        gpu: gpu,
    //        ram: ram,
    //        memory_internal: memory_internal,
    //        memory_available: memory_available,
    //        memory_card_slot: memory_card_slot,
    //        mobile_network: mobile_network,
    //        sim: sim,
    //        wifi: wifi,
    //        gps: gps,
    //        bluetooth: bluetooth,
    //        charging_port: charging_port,
    //        headphone_jack: headphone_jack,
    //        other_port: other_port,
    //        design: design,
    //        material: material,
    //        dimensions: dimensions,
    //        weight: weight,
    //        battery_capacity: battery_capacity,
    //        battery_type: battery_type,
    //        battery_technology: battery_technology,
    //        advanced_security: advanced_security,
    //        special_features: special_features,
    //        recording: recording,
    //        radio: radio,
    //        watchfilm: watchfilm,
    //        music: music,
    //        time_of_lunch: time_of_lunch}
    //       return results;


    //   })

    //   const phone = new Phone({name: name,
    //   price: parseInt(priceTemp),
    //   display_technology: getData.display_technology,
    //   display_protection: getData.display_protection,
    //   display_resolution: getData.display_resolution,
    //   display_size: getData.display_size,
    //   back_camera_resolution: getData.back_camera_resolution,
    //   back_camera_video: getData.back_camera_video,
    //   back_camera_flash: getData.back_camera_flash,
    //   back_camera_advanced: getData.back_camera_advanced,
    //   front_camera_resolution: getData.front_camera_resolution,
    //   front_camera_videocall: getData.front_camera_videocall,
    //   front_camera_other_infor: getData.front_camera_other_infor,
    //   operating_system: getData.operating_system,
    //   os_version: getData.os_version,
    //   chipset: getData.chipset,
    //   cpu: getData.cpu,
    //   gpu: getData.gpu,
    //   ram: getData.ram,
    //   memory_internal: getData.memory_internal,
    //   memory_available: getData.memory_available,
    //   memory_card_slot: getData.memory_card_slot,
    //   mobile_network: getData.mobile_network,
    //   sim: getData.sim,
    //   wifi: getData.wifi,
    //   gps: getData.gps,
    //   bluetooth: getData.bluetooth,
    //   charging_port: getData.charging_port,
    //   headphone_jack: getData.headphone_jack,
    //   other_port: getData.other_port,
    //   design: getData.design,
    //   material: getData.material,
    //   dimensions: getData.dimensions,
    //   weight: getData.weight,
    //   battery_capacity: getData.battery_capacity,
    //   battery_type: getData.battery_type,
    //   battery_technology: getData.battery_technology,
    //   advanced_security: getData.advanced_security,
    //   special_features: getData.special_features,
    //   recording: getData.recording,
    //   radio: getData.radio,
    //   watchfilm: getData.watchfilm,
    //   music: getData.music,
    //   time_of_lunch: getData.time_of_lunch });

    //   console.log(phone);
    //   phone.save();
    // }


    await browser.close();

})();

app.listen(PORT);