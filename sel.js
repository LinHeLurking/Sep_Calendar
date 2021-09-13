// @name         SEP Calendar Genterator
// @namespace    http://tampermonkey.net/
// @version      1.0
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.js
// @description  Generate calendar from SEP!
// @author       LinHeLurking
// @match        http://jwxk.ucas.ac.cn/course/personSchedule
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function () {
    'use strict';


    var chineseWeekDayToWeekDayLabel = new Map();
    chineseWeekDayToWeekDayLabel.set("星期一", "MO");
    chineseWeekDayToWeekDayLabel.set("星期二", "TU");
    chineseWeekDayToWeekDayLabel.set("星期三", "WE");
    chineseWeekDayToWeekDayLabel.set("星期四", "TH");
    chineseWeekDayToWeekDayLabel.set("星期五", "FR");
    chineseWeekDayToWeekDayLabel.set("星期六", "SA");
    chineseWeekDayToWeekDayLabel.set("星期七", "SU");

    var chineseWeekDayToWeekDayNum = new Map();
    chineseWeekDayToWeekDayNum.set("星期一", 1);
    chineseWeekDayToWeekDayNum.set("星期二", 2);
    chineseWeekDayToWeekDayNum.set("星期三", 3);
    chineseWeekDayToWeekDayNum.set("星期四", 4);
    chineseWeekDayToWeekDayNum.set("星期五", 5);
    chineseWeekDayToWeekDayNum.set("星期六", 6);
    chineseWeekDayToWeekDayNum.set("星期七", 7);

    var sessionStartTimeYQH = new Map();
    sessionStartTimeYQH.set(1, "08:30:00");
    sessionStartTimeYQH.set(2, "09:20:00");
    sessionStartTimeYQH.set(3, "10:30:00");
    sessionStartTimeYQH.set(4, "11:20:00");
    sessionStartTimeYQH.set(5, "13:30:00");
    sessionStartTimeYQH.set(6, "14:20:00");
    sessionStartTimeYQH.set(7, "15:30:00");
    sessionStartTimeYQH.set(8, "16:20:00");
    sessionStartTimeYQH.set(9, "18:10:00");
    sessionStartTimeYQH.set(10, "19:00:00");
    sessionStartTimeYQH.set(11, "20:10:00");
    sessionStartTimeYQH.set(12, "21:00:00");

    var sessionEndTimeYQH = new Map();
    sessionEndTimeYQH.set(1, "09:20:00");
    sessionEndTimeYQH.set(2, "10:10:00");
    sessionEndTimeYQH.set(3, "11:20:00");
    sessionEndTimeYQH.set(4, "12:10:00");
    sessionEndTimeYQH.set(5, "14:20:00");
    sessionEndTimeYQH.set(6, "15:10:00");
    sessionEndTimeYQH.set(7, "16:20:00");
    sessionEndTimeYQH.set(8, "17:10:00");
    sessionEndTimeYQH.set(9, "19:00:00");
    sessionEndTimeYQH.set(10, "19:50:00");
    sessionEndTimeYQH.set(11, "21:00:00");
    sessionEndTimeYQH.set(12, "21:50:00");

    var sessionStartTimeYQL = new Map();
    sessionStartTimeYQL.set(1, "08:00:00");
    sessionStartTimeYQL.set(2, "08:50:00");
    sessionStartTimeYQL.set(3, "10:00:00");
    sessionStartTimeYQL.set(4, "10:50:00");
    sessionStartTimeYQL.set(5, "13:30:00");
    sessionStartTimeYQL.set(6, "14:20:00");
    sessionStartTimeYQL.set(7, "15:10:00");
    sessionStartTimeYQL.set(8, "16:10:00");
    sessionStartTimeYQL.set(9, "18:10:00");
    sessionStartTimeYQL.set(10, "19:00:00");
    sessionStartTimeYQL.set(11, "20:00:00");
    sessionStartTimeYQL.set(12, "20:50:00");

    var sessionEndTimeYQL = new Map();
    sessionEndTimeYQL.set(1, "08:50:00");
    sessionEndTimeYQL.set(2, "09:40:00");
    sessionEndTimeYQL.set(3, "10:50:00");
    sessionEndTimeYQL.set(4, "11:40:00");
    sessionEndTimeYQL.set(5, "14:20:00");
    sessionEndTimeYQL.set(6, "15:10:00");
    sessionEndTimeYQL.set(7, "16:10:00");
    sessionEndTimeYQL.set(8, "17:00:00");
    sessionEndTimeYQL.set(9, "19:00:00");
    sessionEndTimeYQL.set(10, "19:50:00");
    sessionEndTimeYQL.set(11, "20:50:00");
    sessionEndTimeYQL.set(12, "21:40:00");

    const tbodySel = (tbody) => {
        var courseSet = new Set();
        for (let i = 0; i < tbody.childElementCount; i += 1) {
            for (let j = 0; j < tbody.children[i].childElementCount; j += 1) {
                if (tbody.children[i].children[j].childElementCount > 0) {
                    for (let k = 0; k < tbody.children[i].children[j].childElementCount; k += 1) {
                        var nd = $("[href]", tbody.children[i].children[j].children[k].firstChild);
                        courseSet.add(nd.prevObject[0].href);
                    }
                }
            }
        }
        return courseSet;
    };

    class CourseInfo {
        constructor(courseName, courseWeekday, courseSessionIds, courseLocation, courseWeeks) {
            this.courseName = courseName;
            this.courseWeekday = courseWeekday;
            this.courseSessionIds = courseSessionIds;
            this.courseLocation = courseLocation;
            this.courseWeeks = courseWeeks;
        };
    };

    const getCourseInfo = (urls) => {
        var resArr = new Array();
        urls.forEach(item => {
            $.get(item, (data) => {
                var courseHTML = $(data);
                var courseName = $("div.mc-body > p", courseHTML)[0].innerText;
                var courseDateTime = $("div.mc-body > table > tbody > tr:nth-child(1) > td", courseHTML)[0].innerText;
                var courseLocation = $("div.mc-body > table > tbody > tr:nth-child(2) > td", courseHTML)[0].innerText;
                var courseWeeks = $("div.mc-body > table > tbody > tr:nth-child(3) > td", courseHTML)[0].innerText;

                if (courseName.startsWith("course name：")) {
                    courseName = courseName.substr("course name：".length);
                }
                courseWeeks = courseWeeks.split("、");
                var courseWeekday = courseDateTime.split("：")[0];
                var courseSessionIds = courseDateTime.split("：")[1].trim();
                courseSessionIds = courseSessionIds.substr(1, courseSessionIds.length - 3).split("、");

                resArr.push(new CourseInfo(courseName, courseWeekday, courseSessionIds, courseLocation, courseWeeks));

                if ($("div.mc-body > table > tbody > tr", courseHTML).length > 3) {
                    var courseDateTime = $("div.mc-body > table > tbody > tr:nth-child(4) > td", courseHTML)[0].innerText;
                    var courseLocation = $("div.mc-body > table > tbody > tr:nth-child(5) > td", courseHTML)[0].innerText;
                    var courseWeeks = $("div.mc-body > table > tbody > tr:nth-child(6) > td", courseHTML)[0].innerText;

                    if (courseName.startsWith("course name：")) {
                        courseName = courseName.substr("course name：".length);
                    }
                    courseWeeks = courseWeeks.split("、");
                    var courseWeekday = courseDateTime.split("：")[0];
                    var courseSessionIds = courseDateTime.split("：")[1].trim();
                    courseSessionIds = courseSessionIds.substr(1, courseSessionIds.length - 3).split("、");

                    resArr.push(new CourseInfo(courseName, courseWeekday, courseSessionIds, courseLocation, courseWeeks));
                }
            });
        });
        return resArr;
    };


    // https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    const padZ = (str, n) => {
        str = str.toString();
        while (str.length < n) {
            str = "0" + str;
        }
        return str;
    }



    function parseTime(t, forThisDay = null) {
        var d = null;
        if (forThisDay instanceof Date) {
            d = new Date(forThisDay);
        } else {
            d = new Date();
        }
        var time = t.match(/(\d\d):(\d\d):(\d\d)/);
        d.setHours(parseInt(time[1]));
        d.setMinutes(parseInt(time[2]));
        d.setSeconds(parseInt(time[3]));
        return d;
    }

    const getIcsTimeStamp = (date, useZeroZone = false) => {
        if (useZeroZone) {
            return padZ(date.getUTCFullYear(), 2) +
                padZ(date.getUTCMonth() + 1, 2) +
                padZ(date.getUTCDate(), 2) + "T" +
                padZ(date.getUTCHours(), 2) +
                padZ(date.getUTCMinutes(), 2) +
                padZ(date.getUTCSeconds(), 2) + "Z";
        } else {
            return padZ(date.getFullYear(), 2) +
                padZ(date.getMonth() + 1, 2) +
                padZ(date.getDate(), 2) + "T" +
                padZ(date.getHours(), 2) +
                padZ(date.getMinutes(), 2) +
                padZ(date.getSeconds(), 2);
        }
    }


    class RecursiveRule {
        constructor(freq, until, interval, byDay) {
            this.freq = freq;
            this.until = until;
            this.interval = interval;
            this.byDay = byDay;
        }
    };

    class Event {
        constructor(description, location, startTimeInDay, endTimeInDay, rule) {
            this.description = description;
            this.location = location;
            this.startTimeInDay = startTimeInDay;
            this.endTimeInDay = endTimeInDay;
            this.rule = rule;
        }
    }

    class ICS {
        constructor() {
            this.events = new Array();
        }

        addEvent(description, location, startTimeInDay, endTimeInDay, rule) {
            this.events.push(new Event(description, location, startTimeInDay, endTimeInDay, rule));
        }

        toIcsString(name) {
            var head = `BEGIN:VCALENDAR
VERSION:2.0
X-WR-CALNAME:${name}
X-APPLE-CALENDAR-COLOR:#ff9500
X-WR-TIMEZONE:Asia/Shanghai
BEGIN:VTIMEZONE
TZID:Asia/Shanghai
X-LIC-LOCATION:Asia/Shanghai
BEGIN:STANDARD
TZOFFSETFROM:+0800
TZOFFSETTO:+0800
TZNAME:CST
DTSTART:19700101T000000
END:STANDARD
END:VTIMEZONE`;

            var tail = `END:VCALENDAR`;

            var eventsStr = ""
            var currentIcsTimeStampZ = getIcsTimeStamp(new Date(), true);
            this.events.forEach((vEvent) => {
                var eventStartInDay = vEvent.startTimeInDay;
                var eventEndInDay = vEvent.endTimeInDay;
                var eventStartInDayTimeStamp = getIcsTimeStamp(eventStartInDay, false);
                var eventEndInDayTimeStamp = getIcsTimeStamp(eventEndInDay, false);

                var eventStr = `BEGIN:VEVENT
CREATED:${currentIcsTimeStampZ}
DTSTAMP:${currentIcsTimeStampZ}
SUMMARY:${vEvent.description}
DESCRIPTION:
LOCATION:${vEvent.location}
TZID:Asia/Shanghai
SEQUENCE:0
UID:${uuidv4()}
RRULE:FREQ=WEEKLY;UNTIL=${getIcsTimeStamp(vEvent.rule.until, false)};INTERVAL=${vEvent.rule.interval},BYDAY=${vEvent.rule.byDay.join(",")}
DTSTART;TZID=Asia/Shanghai:${eventStartInDayTimeStamp}
DTEND;TZID=Asia/Shanghai:${eventEndInDayTimeStamp}
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:This is an event reminder
TRIGGER:-P0DT0H15M0S
X-WR-ALARMUID:${uuidv4()}
UID:${uuidv4()}
END:VALARM
END:VEVENT`;

                eventsStr += eventStr + "\n\n";
            });

            var res = `${head}\n\n${eventsStr}\n\n${tail}\n`

            return res;
        }
    };


    const genIcsFromInfo = (allCourseInfo, startWeekMondayUTC, isUndergraduate = false) => {
        var calendar = new ICS();

        var sessionStartTime = sessionStartTimeYQH;
        var sessionEndTime = sessionEndTimeYQH;

        if (isUndergraduate) {
            sessionStartTime = sessionStartTimeYQL;
            sessionEndTime = sessionEndTimeYQL;
        }

        allCourseInfo.forEach((course) => {
            var seriesUntil = new Date(startWeekMondayUTC);
            seriesUntil.setDate(seriesUntil.getDate() + course.courseWeeks.at(-1) * 7);

            var seriesStartDate = new Date(startWeekMondayUTC);
            seriesStartDate.setDate(seriesStartDate.getDate() + (course.courseWeeks[0] - 1) * 7 + chineseWeekDayToWeekDayNum.get(course.courseWeekday) - 1);


            var startTimeInDay = parseTime(sessionStartTime.get(Number(course.courseSessionIds[0])), seriesStartDate);
            var endTimeInDay = parseTime(sessionEndTime.get(Number(course.courseSessionIds.at(-1))), seriesStartDate);

            var location = course.courseLocation;
            var description = course.courseName;
            var weekday = new Array();
            if (!(course.courseWeekday instanceof Array)) {
                weekday.push(chineseWeekDayToWeekDayLabel.get(course.courseWeekday));
            } else {
                course.courseWeekday.forEach((day) => {
                    weekday.push(chineseWeekDayToWeekDayLabel.get(day));
                });
            }
            var interval = 1;
            // check if it is an 'every 2 week' events
            if (course.courseWeeks.length > 3) {
                if (course.courseWeeks[1] == course.courseWeeks[0] + 2 &&
                    course.courseWeeks[2] == course.courseWeeks[1] + 2) {
                    interval = 2;
                }
            }
            var rule = new RecursiveRule("WEEKLY", seriesUntil, interval, weekday);
            calendar.addEvent(description, location, startTimeInDay, endTimeInDay, rule);
        });
        return calendar;
    };


    var tbody = $("body > div.container-fluid > div > div.m-cbox.m-lgray > div.mc-body > table > tbody")[0];
    // console.log(tbody);
    var courseURL = tbodySel(tbody);
    var allCourseInfo = getCourseInfo(courseURL);
    // console.log(courseInfo);

    var startWeekMondayInputHTML = `<div><input type="text" id="startWeekStr" value="2021-08-30">  请按照样例的 YYYY-MM-DD 格式输入本学期第一周周一的日期</div>`;
    $("body > div.container-fluid > div").append(startWeekMondayInputHTML);

    var undergraduateCheckboxHTML = `<input type="checkbox" id="undergraduateButton" name="roleBox">`;
    var masterOrPhdCheckboxHTML = `<input type="checkbox" id=\"masterOrPhdButton" name="roleBox">`;
    var checkboxHTML = `<div> ${undergraduateCheckboxHTML} 我是玉泉路本科生 </div> <div> ${masterOrPhdCheckboxHTML} 我是雁栖湖硕士生/博士生 </div>`;
    $("body > div.container-fluid > div").append(checkboxHTML);

    // thanks https://stackoverflow.com/questions/9709209/html-select-only-one-checkbox-in-a-group

    $("input:checkbox").on('click', function () {
        // in the handler, 'this' refers to the box clicked on
        var $box = $(this);
        if ($box.is(":checked")) {
            // the name of the box is retrieved using the .attr() method
            // as it is assumed and expected to be immutable
            var group = "input:checkbox[name='" + $box.attr("name") + "']";
            // the checked state of the group/box on the other hand will change
            // and the current value is retrieved using .prop() method
            $(group).prop("checked", false);
            $box.prop("checked", true);
        } else {
            $box.prop("checked", false);
        }
    });

    var genCalendarButtonHTML = `<button type="button" >生成 iCS 文件</button>`;
    $("body > div.container-fluid > div").append(genCalendarButtonHTML);
    $("body > div.container-fluid > div > button").on("click", () => {
        var isUndergraduate = $("#undergraduateButton").is(":checked");
        var isMasterOrPhd = $("#masterOrPhdButton").is(":checked");
        if (isUndergraduate || isMasterOrPhd) {
            var startWeekMondayUTC = new Date($("#startWeekStr").val());
            var calendar = genIcsFromInfo(allCourseInfo, startWeekMondayUTC);
            var name = $("#page-title > span").text().substr(0, 9);
            var calendarStr = calendar.toIcsString(name);

            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(calendarStr));
            element.setAttribute('download', `${name}.ics`);

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        }
    });
})();