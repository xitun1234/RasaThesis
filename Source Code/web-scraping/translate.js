var jsonTranslate = {
    "name": ["iPhone 11 Pro Max 64GB"],
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
    "front_camera_resolution": ["12 MP", "cam trước", "chụp ảnh"],
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
    "charging_port": ["Cổng kết nối", "cổng sạc"],
    "headphone_jack": ["jack tai nghe"],
    "other_port": ["kết nối khác"],
    "design": ["thiết kế"],
    "material": ["vật liệu", "chất liệu"],
    "dimensions": ["kích thước"],
    "weight": ["trọng lượng"],
    "battery_capacity": ["pin", "dung lượng pin"],
    "battery_type": ["loại pin"],
    "battery_technology": ["công nghệ pin"],
    "advanced_security": ["Mở khoá khuôn mặt Face ID"],
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
            if (slotProperty.toLowerCase() == jsonTranslate[key][i]) {
                result.push(key)
            }
        }
    }
    return result;
}
// var stringTemp = "Pin 3340 mAh";
// var batteryCapacity = stringTemp.replace(/[^0-9]/g, '');
// var result = (parseInt(batteryCapacity, 10) / 2000) * (250 / 100);
// // console.log(result);
// var minTime = Math.floor(result);
// var maxTime = minTime + 1.5;

// console.log('Thời gian sử dụng pin trung bình là ' + minTime + '-' + maxTime);

test = "Samsung Galaxy A51"
data_phone_property = "Pin 4000 mAh";

function getCompanyName(phone_name) {
    var res = phone_name.slice(0, phone_name.search(' '));
    if (res.search('iPhone') != -1) {
        res = 'Apple';
    }
    return res;
}

function calBatteryChargingTime(price, phone_battery_capacity) {
    // lấy dung lượng pin
    var stringTemp = phone_battery_capacity;
    var batteryCapacity = stringTemp.replace(/[^0-9]/g, '');

    timeChargeDefault = ((batteryCapacity / 2) + 1000) / 1000;
    maxTimeCharge = Math.ceil(timeChargeDefault);
    result = timeChargeDefault + " - " + maxTimeCharge + " giờ";
    return result;
}



console.log(calBatteryChargingTime(1690000, 'Pin 1690 mAh'));