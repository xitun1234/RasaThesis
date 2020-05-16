const mongoose = require("mongoose");
const puppeteer = require("puppeteer");
const Schema = mongoose.Schema;
require("../models/Phone");
const Phone = mongoose.model("phones");
const cloudinary = require("cloudinary").v2;
const JsonFind = require('json-find');
const axios = require('axios');

// config cloudinary
cloudinary.config({
    cloud_name: "xitun1234",
    api_key: "446615863382835",
    api_secret: "V9h9XGwIlGc9GYA0IjzrtUUY68Q",
});

mongoose
    .connect("mongodb://nghia:zxc123@ds137581.mlab.com:37581/phone-list", {
        useNewUrlParser: true,
    })
    .then(() => console.log("MongoDB connected"))
    .catch((error) => console.log(error));



// Xử lý tìm từ khóa google puppeteer
module.exports.SearchKeyword = function(req, res) {
    let PhoneName = req.body.PhoneName;
    let PhoneProperty = req.body.PhoneProperty;
    let PhoneCondition = req.body.PhoneCondition;
    var keyword = PhoneProperty + " " + PhoneCondition + " " + PhoneName;
    if (PhoneProperty && !PhoneProperty) {
        keyword = PhoneProperty + " " + PhoneName;
    } else if (!PhoneProperty && PhoneCondition) {
        keyword = PhoneCondition + " " + PhoneName;
    } else if (PhoneProperty && PhoneCondition) {
        keyword = PhoneProperty + " " + PhoneCondition + " " + PhoneName;
    }
    console.log(keyword);
    (async() => {
        const browser = await puppeteer.launch({
            headless: false,
            args: [
                "--incognito",
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-accelerated-2d-canvas",
                "--disable-gpu",
            ],
        });
        let result = {
            "keyword": "",
            "urlImage": "",
            "searchLink": ""
        }

        console.log("Browser openned");

        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();
        page.setViewport({ width: 1280, height: 720 });
        const url = "https://www.google.com.vn/";
        await page.goto(url, { waitUntil: "networkidle2" });
        console.log("Page loaded");
        await page.waitFor(500);

        // input keyword
        const inputSearch = await page.evaluate(({ keyword }) => {
            let inputText = document.getElementsByClassName("gLFyf gsfi");
            inputText[0].value = keyword;
            let clickButtonSearch = document.getElementsByClassName("gNO89b");
            clickButtonSearch[0].click();


        }, { keyword });
        await page.waitForNavigation({ waitUntil: "domcontentloaded" });

        await page.waitForFunction("document.title.length != 16");

        const urlCurrent = await page.evaluate(() => {
            return window.location.href;
        });
        result.keyword = keyword;
        result.searchLink = urlCurrent;
        await page.waitFor(500);
        const screenshot = await page.screenshot({
            omitBackground: true,
            encoding: "binary",
        });

        function uploadScreenshot(screenshot) {
            return new Promise((resolve, reject) => {
                const uploadOptions = {};
                cloudinary.uploader
                    .upload_stream(uploadOptions, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    })
                    .end(screenshot);
            });
        };
        // uploadScreenshot(screenshot).then((result) => {
        //     result.screenshot = result;
        // })

        let urlLink = await uploadScreenshot(screenshot);

        result.urlImage = urlLink.url;

        res.send(result);
        await browser.close();
    })();
};

var jsonTranslate = {
    "name": [""],
    "price": ["giá", "tiền"],
    "display_technology": ["công nghệ màn hình", "loại màn hình"],
    "display_resolution": ["độ phân giải màn hình", "độ phân giải"],
    "display_size": ["kích cỡ màn hình"],
    "display_protection": ["mặt kính cảm ứng", "kính cảm ứng"],
    "back_camera_resolution": ["camera sau",
        "cam sau",
        "độ phân giải cam sau",
        "độ phân giải camera sau", "chụp ảnh"
    ],
    "back_camera_video": ["quay phim", "quay video"],
    "back_camera_flash": ["đèn flash"],
    "back_camera_advanced": ["Góc siêu rộng (Ultrawide)",
        "Góc rộng (Wide)",
        "Nhãn dán (AR Stickers)",
        "Xoá phông", "Chụp bằng cử chỉ",
        "Tự động lấy nét (AF)",
        "Chạm lấy nét",
        "Nhận diện khuôn mặt",
        "HDR",
        "Toàn cảnh (Panorama)",
        "Làm đẹp (Beautify)", "Chuyên nghiệp (Pro)", "xóa phông cam sau", "xóa phông"
    ],
    "front_camera_resolution": ["12 MP", "cam trước", "chụp ảnh", "camera trước"],
    "front_camera_videocall": ["video call"],
    "front_camera_other_infor": ["Xoá phông camera trước", "Quay phim 4K", "Nhãn dán (AR Stickers)",
        "Retina Flash", "Quay video HD", "Nhận diện khuôn mặt", "Quay video Full HD", "Tự động lấy nét (AF)", "HDR", "Quay chậm (Slow Motion)", "Xóa phông cam trước"
    ],
    "operating_system": ["hệ điều hành", "ios", "android"],
    "os_version": ["phiên bản ios", "phiên bản android", "android mấy"],
    "chipset": ["chipset", "chip"],
    "cpu": ["tốc độ cpu", "cpu"],
    "gpu": ["gpu"],
    "ram": ["ram"],
    "memory_internal": ["bộ nhớ trong", "bộ nhớ máy", "bộ nhớ"],
    "memory_available": ["bộ nhớ còn lại", "bộ nhớ khả dụng"],
    "memory_card_slot": ["thẻ nhớ ngoài", "thẻ nhớ"],
    "mobile_network": ["mạng di động", "4G"],
    "sim": ["sim"],
    "Wifi": ["wifi", "mạng wifi"],
    "gps": ["gps", "định vị"],
    "bluetooth": ["bluetooth"],
    "charging_port": ["Cổng kết nối", "cổng sạc", "kết nối"],
    "headphone_jack": ["jack tai nghe"],
    "other_port": ["kết nối khác"],
    "design": ["thiết kế", "thân", "thân máy"],
    "material": ["vật liệu", "chất liệu"],
    "dimensions": ["kích thước"],
    "weight": ["trọng lượng"],
    "battery_capacity": ["pin", "dung lượng pin", ],
    "battery_type": ["loại pin"],
    "battery_technology": ["công nghệ pin", "sạc", "sạc pin"],
    "advanced_security": ["Mở khoá khuôn mặt Face ID", "mở khoá", "vân tay"],
    "special_features": ["Đèn pin", "Sạc pin không dây", "Dolby Audio™", "Chuẩn Kháng nước", "Chuẩn kháng bụi", "Sạc pin nhanh", "Apple Pay"],
    "recording": ["Có microphone chuyên dụng chống ồn", "ghi âm"],
    "radio": ["radio"],
    "watchfilm": ["H.264(MPEG4-AVC)", "xem phim"],
    "music": ["Lossless, MP3, AAC, FLAC", "nghe nhạc"],
    "time_of_lunch": ["ngày ra mắt"]
}

function translateProperty(slotProperty, jsonTranslate) {
    result = [];

    for (var key in jsonTranslate) {
        for (var i = 0; i < jsonTranslate[key].length; i++) {
            if (slotProperty.toLowerCase() == jsonTranslate[key][i].toLowerCase()) {
                result.push(key);
            }
        }
    }
    return result;
}

module.exports.QueryMongo = function(req, res) {
    var PhoneName = req.body.PhoneName;
    var mongo_property = req.body.MongoProperty;

    Phone.find({ name: new RegExp(PhoneName, "i"), [mongo_property]: { $exists: true } },
        function(err, result) {
            if (err) res.send(err);
            else res.send(result[0]);
        }
    );

};


module.exports.queryMongoProperty = function(req, res) {
    var PhoneProperty = req.params.PhoneProperty;

    var mongo_property = translateProperty(PhoneProperty, jsonTranslate);
    res.status(200).json(mongo_property);
};



jsonCondition = {
    "Chuẩn Kháng nước": ["chống nước", "kháng nước"],
    "AOD": ["Màn hình luôn hiển thị", "always on display"],
    "Nhân bản ứng dụng": ["nhân bản ứng dụng", "nhân đôi ứng dụng"],
    "sim": ["2 sim", "hai sim", "một sim", "1 sim", "e-sim"],
    "Face ID": ["nhận diện khuôn mặt", "face id", "khuôn mặt"],
    "Sạc ngược không dây": ["sạc pin cho thiết bị khác", "sạc cho thiết bị khác", "sạc ngược cho thiết bị khác"],
    "Videocall": ["videocall", "video call", "gọi video", "gọi zalo", "gọi facebook", "call video", "gọi hình ảnh"],
    "Micro USB": ["usb"],
    "Wi-Fi 802.11": ["5ghz", "5 GHZ", "5 ghz"],
    "checkNew": ["mới", "new seal", "nguyên seal", "100%"],
    "isAvailable": ["có hàng", "còn hàng", "hàng"],
    "Type-C": ["type c", "type-c"],
    "configureHigh": ['cao', 'cấu hình cao'],
    "configureMedium": ['ổn', 'mượt', 'bình thường', 'tốt'],
    "configureLow": ['thấp', 'cấu hình thấp'],
    "BatteryCalculator": ['xài', 'sử dụng', 'bao lâu', 'dùng'],
    "companyName": ['hãng', 'nhà sản xuất'],
    "paperInstallment": ['thủ tục', 'giấy tờ'],
    "discount": ["khuyến mãi", "giảm giá"],
    "warranty": ["bảo hành"],
    "sạc pin nhanh": ["sạc nhanh"],
}

// Function Find keyword PhoneCondition in jsonPhone
function findCondition(jsonPhone, phone_condition) {
    for (key in jsonPhone) {
        var strKey = jsonPhone[key];
        if (String(strKey).toLowerCase().search(phone_condition.toLowerCase()) != -1) {
            var result = {
                "phone_property": key,
                "content": jsonPhone[key]
            }
            return result;
        }
    }
    return false;
}

// Function translate PhoneCondition
function TranslateCondition(jsonCondition, phone_condition) {
    var Translate = findCondition(jsonCondition, phone_condition);
    if (Translate) {
        return Translate.phone_property;
    } else if (Translate === false) {
        return phone_condition;
    }
}

// call API translate PhoneProperty to MongoProperty
async function translatePhonePropertyToMongo(phone_property) {

    var url = "http://localhost:3000/answer/queryMongo&PhoneProperty=" + phone_property;
    var result = await axios.get(encodeURI(url));
    return result.data;
}

function AnswerGameCondition(jsonPhone, phone_condition) {
    var _translateCondition = TranslateCondition(jsonCondition, phone_condition);
    var result = {
        message: ''
    };
    if (jsonPhone['operating_system'].toLowerCase().search('android') != -1) {
        if (jsonPhone.ram >= '4 GB' && jsonPhone.price > 5000000 && jsonPhone.price <= 8000000) {
            result['message'] = "Chào anh/chị!Dạ theo em kiểm tra thì Điện thoại " + jsonPhone.name + " sử dụng chip " + jsonPhone.chipset + ", cpu: " + jsonPhone.cpu + ", ram: " + jsonPhone.ram + " nên đáp ứng tốt nhu cầu chơi game ở mức cấu hình mượt đó ạ. Thông tin đến anh/chị!"
        } else if (jsonPhone.ram > '4 GB' && jsonPhone.price > 8000000) {
            result['message'] = "Chào anh/chị!Dạ theo em kiểm tra thì Điện thoại " + jsonPhone.name + " sử dụng chip " + jsonPhone.chipset + ", cpu: " + jsonPhone.cpu + ", ram: " + jsonPhone.ram + " nên đáp ứng nhu cầu chơi game ở mức cấu hình cao đó ạ. Thông tin đến anh/chị!"
        } else if (jsonPhone.ram <= '4 GB' && jsonPhone.price <= 5000000) {
            result['message'] = "Chào anh/chị!Dạ theo em kiểm tra thì Điện thoại " + jsonPhone.name + " sử dụng chip " + jsonPhone.chipset + ", cpu: " + jsonPhone.cpu + ", ram: " + jsonPhone.ram + " nên đáp ứng nhu cầu chơi game ở mức bình thường đó ạ. Thông tin đến anh/chị!"
        }
    } else if (jsonPhone['operating_system'].toLowerCase().search('ios') != -1) {
        if (jsonPhone.ram <= '2 GB') {
            result['message'] = "Chào anh/chị!Dạ theo em kiểm tra thì Điện thoại " + jsonPhone.name + " sử dụng chip " + jsonPhone.chipset + ", cpu: " + jsonPhone.cpu + ", ram: " + jsonPhone.ram + " nên đáp ứng nhu cầu chơi game ở mức bình thường đó ạ. Thông tin đến anh/chị!"
        } else if (jsonPhone.ram == '3 GB') {
            result['message'] = "Chào anh/chị!Dạ theo em kiểm tra thì Điện thoại " + jsonPhone.name + " sử dụng chip " + jsonPhone.chipset + ", cpu: " + jsonPhone.cpu + ", ram: " + jsonPhone.ram + " nên đáp ứng tốt nhu cầu chơi game ở mức cấu hình mượt đó ạ. Thông tin đến anh/chị!"
        } else if (jsonPhone.ram == '4 GB') {
            result['message'] = "Chào anh/chị!Dạ theo em kiểm tra thì Điện thoại " + jsonPhone.name + " sử dụng chip " + jsonPhone.chipset + ", cpu: " + jsonPhone.cpu + ", ram: " + jsonPhone.ram + " nên đáp ứng nhu cầu chơi game ở mức cấu hình cao đó ạ. Thông tin đến anh/chị!"
        }
    }
    return result;
}

async function ActionYesNo(phone_name, phone_property, phone_condition) {
    // init result
    var result = {
        message: '',
        isFlag: false
    };

    async function findResult() {
        try {
            // query by phoneName
            params = {
                "PhoneName": phone_name,
                "PhoneProperty": "price",
                "MongoProperty": "price"
            }

            // call api query database
            const response = await axios.post('http://localhost:3000/answer/query', params)
            if (response.data) {
                jsonPhone = response.data;
            } else {
                `
            `
                result["message"] = "Chào anh/chị. Em vừa kiểm tra thì hệ thống bên em không có thông tin của mẫu điện thoại " + phone_name + " . Anh/chị giúp em kiểm tra lại tên của điện thoại với ạ. Thông tin đến anh/chị";
                result["isFlag"] = true;
                return result;
            }


            // case 1
            if (!phone_property && phone_condition) {

                var translateCondition = TranslateCondition(jsonCondition, phone_condition);

                var __findTextCondition = findCondition(jsonPhone, translateCondition);


                if (__findTextCondition) {
                    // special case handling
                    if (translateCondition == "sim") {
                        result["message"] = "Chào anh/chị. Sau quá trình em kiểm tra thì máy " + phone_name + " có hỗ trợ " + jsonPhone.sim + ". Xin thông tin đến anh/chị!";
                    } else {
                        result["message"] = "Chào anh/chị. Sau quá trình em kiểm tra thì máy " + phone_name + " có hỗ trợ " + phone_condition + ". Xin thông tin đến anh/chị!";
                    }
                    result["isFlag"] = true;
                    return result;

                } else if (__findTextCondition === false) {
                    //  special case handling
                    if (translateCondition == "isAvailable") {
                        result["message"] = "Chào anh/chị. Hiện tại sản phẩm Điện thoại " + phone_name + " bên em còn hàng đó ạ. Giá của máy là " + jsonPhone.price.toLocaleString('it-IT', { style: 'currency', currency: 'VND' }) + " . Anh/chị có thể tham khảo nha. Thông tin đến anh/chị";
                        result["isFlag"] = true;
                    } else if (translateCondition == "checkNew") {
                        result["message"] = "Chào anh/chị. Hiện tại bên em chỉ kinh doanh điện thoại mới nguyên seal, chính hãng Việt Nam ạ. Bên em không có kinh doanh máy cũ. Thông tin đến anh/chị";
                        result["isFlag"] = true;
                    } else if (translateCondition == "discount") {
                        result["message"] = "Chào anh/chị. Dạ hiện sản phẩm Điện thoại " + phone_name + ' bên em đang có chương trình khuyến mãi. Giảm thêm 5% (' + ((jsonPhone.price * 5) / 100).toLocaleString('it-IT', { style: 'currency', currency: 'VND' }) + ' ) cho khách hàng mua online có sinh nhật trong tháng này ạ. Xin thông tin đến anh/chị';
                        result["isFlag"] = true;
                    } else if (translateCondition == "warranty") {
                        result["message"] = "Chào anh/chị. Dạ hiện sản phẩm " + phone_name + " hỗ trợ Bảo hành chính hãng 12 tháng và 1 đổi 1 trong vòng 1 tháng nếu sản phẩm có lỗi từ nhà sản xuất. Thông tin đến anh/chị";
                        result["isFlag"] = true;
                    } else {
                        result["message"] = "Chào anh/chị. Sau quá trình kiểm tra dữ liệu của hệ thống bên em thì không đủ thông tin để trả lời cho câu hỏi này.Em vừa tham khảo qua google thì có thông tin như sao.";
                        result["isFlag"] = false;
                    }
                    return result;
                }

                // case 2
            } else if (phone_property && phone_condition) {
                var translateCondition = TranslateCondition(jsonCondition, phone_condition);
                console.log(translateCondition);
                var __findTextCondition = findCondition(jsonPhone, translateCondition);

                console.log(__findTextCondition);
                if (__findTextCondition) {
                    if (translateCondition == "Wi-Fi 802.11") {
                        result["message"] = "Chào anh/chị. Sau quá trình em kiểm tra thì thấy máy " + phone_name + " có " + phone_property + " hỗ trợ " + phone_condition;
                        result["isFlag"] = true;
                    } else {
                        result["message"] = "Chào anh/chị. Sau quá trình em kiểm tra thì thấy máy " + phone_name + " có " + phone_property + " hỗ trợ " + translateCondition;
                        result["isFlag"] = true;
                    }
                } else if (__findTextCondition === false) {

                    let MongoProperty = "";
                    return translatePhonePropertyToMongo(phone_property).then(response => {
                        MongoProperty = response;
                        console.log(MongoProperty);
                        // check exist data
                        if (jsonPhone[MongoProperty]) {
                            var PhonePropertyData = jsonPhone[MongoProperty].toLowerCase();
                            if (PhonePropertyData.search(translateCondition) != -1) {
                                result["message"] = "Chào anh/chị. Sau quá trình em kiểm tra thì thấy máy " + phone_name + " có " + phone_property + " hỗ trợ " + phone_condition;
                                result["isFlag"] = true;
                            } else {
                                if (translateCondition == "Face ID") {
                                    result["message"] = "Chào anh/chị. Sau quá trình em kiểm tra thì thấy " + phone_property + " có " + jsonPhone[MongoProperty];
                                    result["isFlag"] = true;
                                } else {
                                    result["message"] = "Chào anh/chị. Sau quá trình em kiểm tra thì thấy " + phone_property + " chỉ có " + jsonPhone[MongoProperty] + " và không hỗ trợ " + translateCondition;
                                    result["isFlag"] = true;
                                }
                            }
                        } else {
                            if (translateCondition.search('configure') != -1 && phone_property.search('game') != -1) {

                                result["message"] = AnswerGameCondition(jsonPhone, phone_condition).message;
                                result["isFlag"] = true;
                            } else {
                                result["message"] = "Chào anh/chị. Sau quá trình kiểm tra dữ liệu của hệ thống bên em thì bên em không đủ yếu tố để trả lời câu hỏi của anh/chị. Mong anh/chị thông cảm giúp bên em. Em vừa tham khảo google thì có thông tin như sao"
                                result["isFlag"] = false;
                            }
                        }
                    }).then(() => {
                        return result;
                    }).catch(function(err) {
                        console.log(err);
                        throw err;
                    })
                }
                return result;

                // case 3
            } else if (phone_property && !phone_condition) {
                return translatePhonePropertyToMongo(phone_property).then(response => {
                    MongoProperty = response;
                    // check exist data
                    if (jsonPhone[MongoProperty]) {
                        if (jsonPhone[MongoProperty] == "Có") {
                            result["message"] = "Chào anh/chị. Sau quá trình kiểm tra thì thấy máy " + phone_name + " có chức năng " + phone_property + " . Xin thông tin đến anh/chị."
                            result["isFlag"] = true;
                        } else if (jsonPhone[MongoProperty] == "Không") {

                            result["message"] = "Chào anh/chị. Sau quá trình kiểm tra thì thấy máy " + phone_name + " không có hỗ trợ " + phone_property + " . Xin thông tin đến anh/chị."
                            result["isFlag"] = true;
                        } else {
                            result["message"] = "Chào anh/chị. Sau quá trình kiểm tra thì thấy máy " + phone_name + " có " + phone_property + ": " + jsonPhone[MongoProperty] + ". Xin thông tin đến anh/chị."
                            result["isFlag"] = true;
                        }
                    } else {
                        result["message"] = "Chào anh/chị. Sau quá trình kiểm tra dữ liệu của hệ thống bên em thì bên em không đủ yếu tố để trả lời câu hỏi của anh/chị. Mong anh/chị thông cảm giúp bên em. Em vừa tham khảo google thì có thông tin như sao"
                        result["isFlag"] = false;
                    }

                }).then(() => {
                    return result;
                }).catch(function(err) {
                    console.log(err);
                    throw err;
                })
            } else if (!phone_property && !phone_condition) {
                result["message"] = "Chào anh/chị. Sau quá trình kiểm tra dữ liệu của hệ thống bên em thì bên em không đủ yếu tố để trả lời câu hỏi của anh/chị. Mong anh/chị thông cảm giúp bên em. Em vừa tham khảo google thì có thông tin như sao"
                result["isFlag"] = false;
                return result;
            }
        } catch (error) {
            console.log(error.response.body);
        }
    };

    return findResult().then(function(res) {
        // console.log(res);
        result = res;
    }).then(() => {
        return result;
    }).catch(function(err) {
        if (err) console.log(err);
        throw err;
    })

}



module.exports.ActionYesNo = function(req, res) {
    var PhoneName = req.body.PhoneName;
    var PhoneProperty = req.body.PhoneProperty;
    var PhoneCondition = req.body.PhoneCondition;
    var resultTemp;

    ActionYesNo(PhoneName, PhoneProperty, PhoneCondition).then(function(result) {
        resultTemp = result;
        res.send(resultTemp);
    })
};

function getCompanyName(phone_name) {
    var res = phone_name.slice(0, phone_name.search(' '));
    if (res.search('iPhone') != -1) {
        res = 'Apple';
    }
    return res;
}

function calBatteryUsageTime(jsonPhone) {
    // lấy dung lượng pin
    var stringTemp = jsonPhone.battery_capacity;
    var batteryCapacity = stringTemp.replace(/[^0-9]/g, '');
    var result = (parseInt(batteryCapacity, 10) / 2000) * (250 / 100);

    var minTime = Math.floor(result);
    var maxTime = minTime + 1.5;

    result = minTime + " - " + maxTime + " giờ";
    return result;
}

function calBatteryChargingTime(jsonPhone) {
    // lấy dung lượng pin
    var stringTemp = jsonPhone.battery_capacity;
    var batteryCapacity = stringTemp.replace(/[^0-9]/g, '');
    var timeChargeDefault = 0;

    if (findCondition(jsonPhone, 'sạc pin nhanh') || findCondition(jsonPhone, 'sạc nhanh')) {
        timeChargeDefault = ((batteryCapacity / 3) + 1000) / 1000;
    } else if (jsonPhone.price >= 2000000) {
        timeChargeDefault = ((batteryCapacity / 2) + 1000) / 1000;
    } else if (jsonPhone.price < 2000000) {
        timeChargeDefault = ((batteryCapacity / 1) + 1000) / 1000;
    }
    var fomartTimeCharge = parseFloat(timeChargeDefault);

    fomartTimeCharge = Math.round(fomartTimeCharge * 1000) / 1000;

    maxTimeCharge = Math.ceil(timeChargeDefault);

    result = fomartTimeCharge + " - " + maxTimeCharge + " giờ";

    return result;
}

async function ActionWhat(phone_name, phone_property, phone_condition) {
    var result = {
        message: '',
        isFlag: false
    }

    async function findResult() {
        try {
            // query by phoneName
            params = {
                "PhoneName": phone_name,
                "PhoneProperty": "price",
                "MongoProperty": "price"
            }

            // call api query select * from PhoneList where phoneName = phone_name
            const response = await axios.post('http://localhost:3000/answer/query', params);

            if (response.data) {
                jsonPhone = response.data;
            } else {
                result["message"] = "Chào anh/chị. Em vừa kiểm tra thì hệ thống bên em không có thông tin của mẫu điện thoại " + phone_name + " . Anh/chị giúp em kiểm tra lại tên của điện thoại với ạ. Thông tin đến anh/chị";
                result["isFlag"] = true;
                return result;
            }

            // case 1
            if (!phone_property && phone_condition) {

                var translateCondition = TranslateCondition(jsonCondition, phone_condition);

                var __findTextCondition = findCondition(jsonPhone, translateCondition);

                if (__findTextCondition) {
                    result["message"] = "Chào anh/chị. Sau quá trình em kiểm tra thì máy " + phone_name + " có hỗ trợ " + phone_condition + ": " + __findTextCondition.content + ". Xin thông tin đến anh/chị!";
                    result["isFlag"] = true;
                    return result;
                } else if (__findTextCondition === false) {
                    if (translateCondition == "discount") {
                        result["message"] = "Chào anh/chị. Dạ hiện sản phẩm Điện thoại " + phone_name + ' bên em đang có chương trình khuyến mãi. Giảm thêm 5% (' + ((jsonPhone.price * 5) / 100).toLocaleString('it-IT', { style: 'currency', currency: 'VND' }) + ' ) cho khách hàng mua online có sinh nhật trong tháng này ạ. Xin thông tin đến anh/chị';
                        result["isFlag"] = true;
                    } else if (translateCondition == "warranty") {
                        result["message"] = "Chào anh/chị. Dạ hiện sản phẩm " + phone_name + " hỗ trợ Bảo hành chính hãng 12 tháng và 1 đổi 1 trong vòng 1 tháng nếu sản phẩm có lỗi từ nhà sản xuất. Thông tin đến anh/chị";
                        result["isFlag"] = true;
                    } else if (translateCondition == "paperInstallment") {
                        result["message"] = "Chào anh/chị ! Dạ nếu anh/chị đủ 20 - 60 tuổi, có CMND và Hộ khẩu hoặc CMND và Bằng lái xe thì anh/chị có thể mua trả góp được rồi anh/chị nha, nếu anh/chị cần bên em hỗ trợ gì thêm anh/chị có thể phản hồi bên dưới anh/chị nhé. Thông tin đến anh/chị !";
                        result["isFlag"] = true;
                    } else if (translateCondition == "companyName") {
                        result["message"] = "Chào anh/chị ! Dạ sản phẩm " + phone_name + " là máy của hãng " + getCompanyName(phone_name) + " . Thông tin đến anh/chị !";
                        result["isFlag"] = true;
                    } else if (translateCondition.search('configure') != -1) {
                        result["message"] = "Chào anh/chị ! Dạ em kiểm tra thì thấy sản phẩm " + phone_name + " có cấu hình là Chip " + jsonPhone.chipset + " , CPU: " + jsonPhone.cpu + " , GPU: " + jsonPhone.gpu + " , RAM: " + jsonPhone.ram + " . Thông tin đến anh/chị !";
                        result["isFlag"] = true;
                    } else {
                        result["message"] = "Chào anh/chị. Sau quá trình kiểm tra dữ liệu của hệ thống bên em thì máy " + phone_name + " không hỗ trợ " + phone_condition + " .Em vừa tham khảo qua google thì có thông tin như sao.";
                        result["isFlag"] = false;
                    }
                    return result;
                }
                // case 2
            } else if (phone_property && phone_condition) {
                var translateCondition = TranslateCondition(jsonCondition, phone_condition);
                var __findTextCondition = findCondition(jsonPhone, translateCondition);

                if (__findTextCondition) {
                    result["message"] = "Chào anh/chị. Sau quá trình em kiểm tra thì thấy máy " + phone_name + " có " + phone_property + " hỗ trợ " + translateCondition;
                    result["isFlag"] = true;
                } else if (__findTextCondition === false) {
                    let MongoProperty = "";

                    return translatePhonePropertyToMongo(phone_property).then(response => {
                        MongoProperty = response;

                        if (jsonPhone[MongoProperty[0]]) {
                            var PhonePropertyData = jsonPhone[MongoProperty].toLowerCase();
                            if (PhonePropertyData.search(translateCondition) != -1) {
                                result["message"] = "Chào anh/chị. Sau quá trình em kiểm tra thì thấy máy " + phone_name + " có " + phone_property + " hỗ trợ " + phone_condition;
                                result["isFlag"] = true;
                            } else {
                                if (translateCondition == "BatteryCalculator" && MongoProperty == "battery_capacity") {
                                    var resultBatteryUsageTime = calBatteryUsageTime(jsonPhone);
                                    result["message"] = "Chào anh/chị. Dạ sản phẩm " + phone_name + " có thể sử dụng trong khoảng " + resultBatteryUsageTime + " tuỳ độ sáng màn hình, kết nối, tác vụ,... anh/chị nhé. Thông tin đến anh/chị."
                                    result["isFlag"] = true;
                                } else {
                                    result["message"] = "Chào anh/chị. Sau quá trình em kiểm tra thì thấy " + phone_property + " chỉ có " + jsonPhone[MongoProperty] + " và không hỗ trợ " + translateCondition;
                                    result["isFlag"] = true;
                                }

                            }
                        } else {
                            if (translateCondition == "BatteryCalculator" && MongoProperty == "battery_capacity") {
                                var resultBatteryUsageTime = calBatteryUsageTime(jsonPhone);
                                result["message"] = "Chào anh/chị. Dạ sản phẩm " + phone_name + " có thể sử dụng trong khoảng " + resultBatteryUsageTime + " tuỳ độ sáng màn hình, kết nối, tác vụ,... anh/chị nhé. Thông tin đến anh/chị."
                                result["isFlag"] = true;
                            } else {
                                result["message"] = "Chào anh/chị. Sau quá trình kiểm tra dữ liệu của hệ thống bên em thì bên em không đủ yếu tố để trả lời câu hỏi của anh/chị. Mong anh/chị thông cảm giúp bên em. Em vừa tham khảo google thì có thông tin như sao"
                                result["isFlag"] = false;
                            }
                        }
                    }).then(() => {
                        return result;
                    }).catch(function(err) {
                        console.log(err);
                        throw err;
                    });
                }
                return result;
                // case 3
            } else if (phone_property && !phone_condition) {
                return translatePhonePropertyToMongo(phone_property).then(response => {
                    MongoProperty = response;
                    console.log(MongoProperty);
                    // check exists data
                    if (jsonPhone[MongoProperty[0]]) {
                        if (MongoProperty == "battery_technology") {
                            var chargeTime = calBatteryChargingTime(jsonPhone);
                            result["message"] = "Chào anh/chị. Dạ theo em kiểm tra sản phẩm " + phone_name + " có thể sạc đầy pin trong khoảng " + chargeTime + " anh/chị nhé. Thông tin đến anh/chị";
                            result["isFlag"] = true;
                        }
                        // price
                        else if (MongoProperty == "price") {
                            result["message"] = "Chào anh/chị. Dạ em kiểm tra thì thấy sản phẩm " + phone_name + " hiện có giá là " + jsonPhone.price.toLocaleString('it-IT', { style: 'currency', currency: 'VND' }) + " . Anh/chị có thể tham khảo nha. Thông tin đến anh/chị";
                            result["isFlag"] = true;
                        } else {
                            result["message"] = "Chào anh/chị. Sau quá trình kiểm tra thì thấy máy " + phone_name + " có " + phone_property + ": " + jsonPhone[MongoProperty] + ". Xin thông tin đến anh/chị."
                            result["isFlag"] = true;
                        }
                    } else {
                        result["message"] = "Chào anh/chị. Sau quá trình kiểm tra dữ liệu của hệ thống bên em thì bên em không đủ yếu tố để trả lời câu hỏi của anh/chị. Mong anh/chị thông cảm giúp bên em. Em vừa tham khảo google thì có thông tin như sao"
                        result["isFlag"] = false;
                    }

                }).then(() => {
                    return result;
                }).catch(function(err) {
                    console.log(err);
                    throw err;
                });

            }
            return result;
        } catch (error) {
            console.log(error.response.body);
        }
    };

    return findResult().then(function(res) {
        result = res;
    }).then(() => {
        return result;
    }).catch(function(err) {
        console.log(err);
        throw err;
    })
}
module.exports.ActionWhat = function(req, res) {
    var PhoneName = req.body.PhoneName;
    var PhoneProperty = req.body.PhoneProperty;
    var PhoneCondition = req.body.PhoneCondition;
    var resultTemp;

    ActionWhat(PhoneName, PhoneProperty, PhoneCondition).then(function(result) {
        resultTemp = result;
        res.send(resultTemp);
    })
};