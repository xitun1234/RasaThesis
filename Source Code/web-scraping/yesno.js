const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const request = require('request');
const axios = require('axios');
'use strict';

require('./models/Phone');
const Phone = mongoose.model("phones");
const JsonFind = require('json-find');

mongoose
    .connect("mongodb://nghia:zxc123@ds137581.mlab.com:37581/phone-list", {
        useNewUrlParser: true,
    })
    .then(() => console.log("MongoDB connected"))
    .catch((error) => console.log(error));


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
    "checkNew": ["hàng mới", "new seal", "nguyên seal", "100%"],
    "isAvailable": ["có hàng", "còn hàng"],
    "Type-C": ["type c", "type-c"],
    "configureHigh": ['cao', 'cấu hình cao'],
    "configureMedium": ['ổn', 'mượt', 'bình thường', 'tốt'],
    "configureLow": ['thấp', 'cấu hình thấp'],
    "BatteryCalculator": ['chơi game', 'game', 'xài', 'sử dụng', 'bao lâu'],
    "companyName": ['hãng', 'nhà sản xuất'],
    "paperInstallment": ['thủ tục', 'giấy tờ'],
    "discount": ["khuyến mãi", "giảm giá"],
    "warranty": ["bảo hành"],
}


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


function TranslateCondition(jsonCondition, phone_condition) {
    var Translate = findCondition(jsonCondition, phone_condition);
    if (Translate) {
        return Translate.phone_property;
    } else if (Translate === false) {
        return phone_condition;
    }
}
async function translatePhonePropertyToMongo(phone_property) {

    var url = "http://localhost:3000/answer/queryMongo&PhoneProperty=" + phone_property;
    var result = await axios.get(encodeURI(url));
    return result.data;
}



async function TestActionYesNo(phone_name, phone_property, phone_condition) {
    var result = {
        message: '',
        isFlag: false
    };

    async function findResult() {
        try {
            params = {
                "PhoneName": phone_name,
                "PhoneProperty": "price",
                "MongoProperty": "price"
            }
            const response = await axios.post('http://localhost:3000/answer/query', params)

            jsonPhone = response.data;


            if (!phone_property && phone_condition) {
                var translateCondition = TranslateCondition(jsonCondition, phone_condition);
                var __findTextCondition = findCondition(jsonPhone, translateCondition);
                if (__findTextCondition) {

                    if (translateCondition == "sim") {
                        result["message"] = "Chào anh/chị. Sau quá trình em kiểm tra thì máy " + phone_name + " có hỗ trợ " + jsonPhone.sim + ". Xin thông tin đến anh/chị!";
                    } else {
                        result["message"] = "Chào anh/chị. Sau quá trình em kiểm tra thì máy " + phone_name + " có hỗ trợ " + phone_condition + ". Xin thông tin đến anh/chị!";
                    }
                    result["isFlag"] = true;
                    return result;

                } else if (__findTextCondition === false) {
                    //  kiểm tra và xử lý những trường hợp đặc biệt
                    if (translateCondition == "isAvailable") {
                        result["message"] = "Chào anh/chị. Hiện tại sản phẩm Điện thoại " + phone_name + " bên em còn hàng đó ạ. Giá của máy là " + jsonPhone.price.toLocaleString('it-IT', { style: 'currency', currency: 'VND' }) + " . Anh/chị có thể tham khảo nha. Thông tin đến anh/chị";
                        result["isFlag"] = true;
                    } else if (translateCondition == "checkNew") {
                        result["message"] = "Chào anh/chị. Hiện tại bên em chỉ kinh doanh điện thoại mới nguyên seal, chính hãng Việt Nam ạ. Bên em không có kinh doanh máy cũ. Thông tin đến anh/chị";
                        result["isFlag"] = true;
                    } else {
                        result["message"] = "Chào anh/chị. Sau quá trình kiểm tra dữ liệu của hệ thống bên em thì máy " + phone_name + " không hỗ trợ " + phone_condition + " .Em vừa tham khảo qua google thì có thông tin như sao.";
                        result["isFlag"] = false;
                    }
                    return result;
                }

            } else if (phone_property && phone_condition) {
                var translateCondition = TranslateCondition(jsonCondition, phone_condition);
                console.log(translateCondition);
                var __findTextCondition = findCondition(jsonPhone, translateCondition);
                console.log(__findTextCondition);
                if (__findTextCondition) {
                    result["message"] = "Chào anh/chị. Sau quá trình em kiểm tra thì thấy máy " + phone_name + " có " + phone_property + " hỗ trợ " + translateCondition;
                    result["isFlag"] = true;
                } else if (__findTextCondition === false) {

                    let MongoProperty = "";
                    return translatePhonePropertyToMongo(phone_property).then(response => {
                        MongoProperty = response;

                        if (jsonPhone[MongoProperty]) {
                            var PhonePropertyData = jsonPhone[MongoProperty].toLowerCase();
                            if (PhonePropertyData.search(translateCondition) != -1) {
                                result["message"] = "Chào anh/chị. Sau quá trình em kiểm tra thì thấy máy " + phone_name + " có " + phone_property + " hỗ trợ " + phone_condition;
                                result["isFlag"] = true;
                            } else {
                                if (translateCondition == "Face ID") {
                                    result["message"] = "Chào anh/chị. Sau quá trình em kiểm tra thì thấy " + phone_property + " chỉ có " + jsonPhone[MongoProperty];
                                    result["isFlag"] = true;
                                } else {
                                    result["message"] = "Chào anh/chị. Sau quá trình em kiểm tra thì thấy " + phone_property + " chỉ có " + jsonPhone[MongoProperty] + " và không hỗ trợ " + translateCondition;
                                    result["isFlag"] = true;
                                }

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
                }
                return result;

            } else if (phone_property && !phone_condition) {
                return translatePhonePropertyToMongo(phone_property).then(response => {
                    MongoProperty = response;
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

// var temp;
// TestActionYesNo('Samsung Galaxy A50s', 'ứng dụng', 'tải phim nhanh').then(function(result) {
//     temp = result;
//     console.log(temp);
// })

var jsonPhone = {
    "_id": "5eb3d886fca37257b07ea081",
    "name": "iPhone 7 32GB",
    "price": 9990000,
    "display_technology": "LED-backlit IPS LCD",
    "display_protection": "Kính cường lực oleophobic (ion cường lực)",
    "display_resolution": "HD (750 x 1334 Pixels)",
    "display_size": "Màn hình 4.7\"",
    "back_camera_resolution": "Camera sau 12 MP",
    "back_camera_video": "Quay phim 4K 2160p@30fps",
    "back_camera_flash": "4 đèn LED (2 tông màu)",
    "back_camera_advanced": "Tự động lấy nét (AF), Chạm lấy nét, Nhận diện khuôn mặt, HDR, Toàn cảnh (Panorama), Chống rung quang học (OIS)",
    "front_camera_resolution": "7 MP",
    "front_camera_videocall": "Hỗ trợ VideoCall thông qua ứng dụng",
    "front_camera_other_infor": "Retina Flash, Toàn cảnh (Panorama), Nhận diện khuôn mặt, Quay video Full HD, Tự động lấy nét (AF), HDR",
    "operating_system": "iOS 12",
    "os_version": "iOS 12",
    "chipset": "Apple A10 Fusion 4 nhân",
    "cpu": "2.3 GHz",
    "gpu": "Chip đồ họa 6 nhân",
    "ram": "4 GB",
    "memory_internal": "32 GB",
    "memory_available": "Khoảng 28 GB",
    "memory_card_slot": "Không",
    "mobile_network": "3G, 4G LTE Cat 9",
    "sim": "1 Nano SIM",
    "wifi": "Wi-Fi 802.11 a/b/g/n/ac, Dual-band, Wi-Fi hotspot",
    "gps": "A-GPS, GLONASS",
    "bluetooth": "A2DP, LE, v4.2",
    "charging_port": "Lightning",
    "headphone_jack": "Lightning",
    "other_port": "NFC, Air Play, OTG, HDMI",
    "design": "Nguyên khối, mặt kính cong 2.5D",
    "material": "Khung & Mặt lưng hợp kim nhôm, magie",
    "dimensions": "Dài 138.3 mm - Ngang 67.1 mm - Dày 7.1 mm",
    "weight": "138 g",
    "battery_capacity": "Pin 1960 mAh",
    "battery_type": "Pin chuẩn Li-Ion",
    "battery_technology": "Tiết kiệm pin",
    "advanced_security": "Mở khóa bằng vân tay",
    "special_features": "3D Touch\n",
    "recording": "Có, microphone chuyên dụng chống ồn",
    "radio": "Không",
    "watchfilm": "H.265, MP4, AVI, H.264(MPEG4-AVC), DivX, Xvid",
    "music": "Lossless, MP3, WAV, AAC, FLAC",
    "time_of_lunch": "11/2016",
    "__v": 0
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
    "chipset": ["chipset", "cấu hình"],
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
    "battery_capacity": ["pin", "dung lượng pin"],
    "battery_type": ["loại pin"],
    "battery_technology": ["công nghệ pin"],
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


test = TranslateCondition(jsonCondition, 'chơi game');
jsonPhone = {
        "_id": {
            "$oid": "5eb3d882fca37257b07ea07f"
        },
        "name": "iPhone 7 Plus 32GB",
        "price": 12990000,
        "display_technology": "LED-backlit IPS LCD",
        "display_protection": "Kính cường lực oleophobic (ion cường lực)",
        "display_resolution": "Full HD (1080 x 1920 Pixels)",
        "display_size": "Màn hình 5.5\"",
        "back_camera_resolution": "Camera sau Chính 12 MP & Phụ 12 MP",
        "back_camera_video": "Quay phim 4K 2160p@30fps",
        "back_camera_flash": "4 đèn LED (2 tông màu)",
        "back_camera_advanced": "Tự động lấy nét (AF), Chạm lấy nét, Nhận diện khuôn mặt, HDR, Toàn cảnh (Panorama), Chống rung quang học (OIS)",
        "front_camera_resolution": "7 MP",
        "front_camera_videocall": "Hỗ trợ VideoCall thông qua ứng dụng",
        "front_camera_other_infor": "Nhận diện khuôn mặt, Retina Flash, Quay video Full HD, Tự động lấy nét (AF), HDR",
        "operating_system": "iOS 12",
        "os_version": "iOS 12",
        "chipset": "Android 7.1 (Nougat)",
        "cpu": "2.3 GHz",
        "gpu": "Chip đồ họa 6 nhân",
        "ram": "3 GB",
        "memory_internal": "32 GB",
        "memory_available": "Khoảng 28 GB",
        "memory_card_slot": "Không",
        "mobile_network": "3G, 4G LTE Cat 9",
        "sim": "1 Nano SIM",
        "wifi": "Wi-Fi 802.11 a/b/g/n/ac, Dual-band, Wi-Fi hotspot",
        "gps": "A-GPS, GLONASS",
        "bluetooth": "A2DP, LE, v4.2",
        "charging_port": "Lightning",
        "headphone_jack": "Lightning",
        "other_port": "NFC, Air Play, OTG, HDMI",
        "design": "Nguyên khối, mặt kính cong 2.5D",
        "material": "Khung & Mặt lưng hợp kim nhôm, magie",
        "dimensions": "Dài 158.2 mm - Ngang 77.9 mm - Dày 7.3 mm",
        "weight": "188 g",
        "battery_capacity": "Pin 2900 mAh",
        "battery_type": "Pin chuẩn Li-Ion",
        "battery_technology": "Tiết kiệm pin",
        "advanced_security": "Mở khóa bằng vân tay",
        "special_features": "3D Touch\n",
        "recording": "Có, microphone chuyên dụng chống ồn",
        "radio": "Không",
        "watchfilm": "H.265, 3GP, MP4, AVI, WMV, H.264(MPEG4-AVC), DivX, WMV9, Xvid",
        "music": "Lossless, Midi, MP3, WAV, WMA, AAC, eAAC+",
        "time_of_lunch": "11/2016",
        "__v": 0
    }
    // console.log(TranslateCondition(jsonCondition, 'chơi game'));
    // console.log(findCondition(jsonPhone, TranslateCondition(jsonCondition, 'chơi game')));
    // var currentDate = new Date();
    // console.log(currentDate.getMonth());
    // var price = 7690000;
    // console.log(((jsonPhone.price * 5) / 100).toLocaleString('it-IT', { style: 'currency', currency: 'VND' }));

// jsonPhone.price.toLocaleString('it-IT', { style: 'currency', currency: 'VND' })

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
    console.log(batteryCapacity);

    if (findCondition(jsonPhone, 'sạc pin nhanh') || findCondition(jsonPhone, 'sạc nhanh')) {
        timeChargeDefault = ((batteryCapacity / 3) + 1000) / 1000;
    } else if (jsonPhone.price >= 2000000) {
        timeChargeDefault = ((batteryCapacity / 2) + 1000) / 1000;
    } else if (jsonPhone.price < 2000000) {
        timeChargeDefault = ((batteryCapacity / 1) + 1000) / 1000;
    }

    maxTimeCharge = Math.ceil(timeChargeDefault);
    result = timeChargeDefault + " - " + maxTimeCharge + " giờ";

    return result;
}

console.log(findCondition(jsonPhone, 'android'));