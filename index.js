console.log("Hello, RoomGames!");

function formatString(string, ...args)
{
    return string.replace(/{(\d+)}/g, function(match, index)
        {
            return typeof args[index] !== 'undefined' ? args[index] : match;
        }
    );
}

function display_current_time()
{
    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();                // 获取当前年份（四位数）
    let currentMonth = currentDate.getMonth() + 1;              // 获取当前月份（0-11，需要加 1）
    let currentDay = currentDate.getDate();                     // 获取当前日期（1-31）
    let currentHour = currentDate.getHours();                   // 获取当前小时（0-23）
    let currentMinute = currentDate.getMinutes();               // 获取当前分钟（0-59）
    let currentSecond = currentDate.getSeconds();               // 获取当前秒数（0-59）
    let timezoneOffset = currentDate.getTimezoneOffset();       // 获取当前时区偏移量（以分钟为单位）
    let timezoneOffsetHours = Math.abs(timezoneOffset / 60);    // 计算当前时区的小时偏移量
    let hemisphere = (timezoneOffset < 0) ? "east" : "west";    // 判断当前时区是东半球还是西半球
    
    let current_time = document.getElementById("current_time");
    let timezoneString;
    if (hemisphere == "east")
    {
        timezoneString = "+" + timezoneOffsetHours;
    }
    else
    {
        timezoneString = "-" + timezoneOffsetHours;
    }
    let format = formatString("当前时间: {0}.{1}.{2} (GMT/UTC {3}:00)", currentYear, currentMonth, currentDay, timezoneString);
    current_time.innerHTML = format;
}

display_current_time();
window.addEventListener("focus", display_current_time);