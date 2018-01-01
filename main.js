let monthView = $('#monthView');
let dayView = $('#dayView');
let viewSelect = $('#viewSelect');
let title = $('#title');
let newEventParent = $('#newEventParent');
let newEventTitle = $('#newEventTitle');
let startSelect = $('#startSelect');
let stopSelect = $('#stopSelect');
let newEventSubmit = $('#newEventSubmit');
let newEventErr = $('#newEventErr');
let selectedDate = null;
let events = [];

(function(){
    let date = new Date();
    layoutMonth(date.getMonth(), date.getDate(), date.getFullYear());
    viewSelect.change(function(){
        let val = viewSelect.val();
        if(val === 'Day'){
            layoutDay(new Date());
        }else if(val === 'Month'){
            let date = new Date();
            layoutMonth(date.getMonth(), date.getDate(), date.getFullYear());
        }
    });
    $('#newEventCancel').click(closeNewEvent);
    newEventParent.click(function(event){
        if(event.target.id === 'newEventParent'){
            closeNewEvent();
        }
    });
    newEventSubmit.click(handleNewEventSubmission);
}());
function layoutMonth(month, day, year){
    monthView.find('.day').remove();
    title.text(getMonthText(month) + ' ' + year);
    let date = new Date(year, month);
    date.setDate(date.getDate() - date.getDay() % 7);
    for(let i = 0; i < 42; i ++){
        let dayDiv;
        let idText = date.getMonth() + 1 + "-" + date.getDate() + "-" + date.getFullYear();
        if(date.getMonth() !== month){
            dayDiv = $('<div class="day otherMonth" id=' + idText + '>' + date.getDate() + '</div>');
        }else{
            if(date.getDate() === day && date.getMonth() === month && date.getFullYear() === year){
                dayDiv = $('<div class="day today" id=' + idText + '>' + date.getDate() + '</div>');
            }else{
                dayDiv = $('<div class="day" id=' + idText + '>' + date.getDate() + '</div>');
            }
        }
        monthView.append(dayDiv);
        date.setDate(date.getDate() + 1);
    }
    $('.day').click(function(event){
        viewSelect.val('Day');
        layoutDay(new Date(Date.parse(event.target.id)));
    });
    dayView.css('display', 'none');
    monthView.css('display', 'grid');
}
function layoutDay(date){
    selectedDate = date;
    title.text(getDayText(date.getDay()) + ', ' + getMonthText(date.getMonth()) + ' ' + date.getDate() + ', ' + date.getFullYear());
    dayView.find('.hour').remove();
    for(let i = 6; i < 24; i++){
        let hourDiv = $('<div class="hour" id="' + i + '"></div>');
        let timeDiv = $('<div class="time">' + getTimeText(i) + '</div>');
        hourDiv.append(timeDiv);
        dayView.append(hourDiv);
    }
    $('.hour').click(function(event){
        startSelect.val(getTimeText(event.target.id));
        stopSelect.val(getTimeText(Number(event.target.id) + 1));
        newEventParent.css('display', 'block');
        newEventTitle.focus();
    });
    layoutEvents();
    monthView.css('display', 'none');
    dayView.css('display', 'grid');
}
function getMonthText(month){
    switch(month){
        case 0:
            return "January";
        case 1:
            return "February";
        case 2:
            return "March";
        case 3:
            return "April";
        case 4:
            return "May";
        case 5:
            return "June";
        case 6:
            return "July";
        case 7:
            return "August";
        case 8:
            return "September";
        case 9:
            return "October";
        case 10:
            return "November";
        case 11:
            return "December";
        default:
            return "Unrecognized";
    }
}
function getDayText(day){
    switch(day){
        case 0:
            return 'Sunday';
        case 1:
            return 'Monday';
        case 2:
            return 'Tuesday';
        case 3:
            return 'Wednesday';
        case 4:
            return 'Thursday';
        case 5:
            return 'Friday';
        case 6:
            return 'Saturday';
        default:
            return 'Unrecognized';
    }
}
function getTimeText(hour){
    hour = Number(hour);
    let ending = ":00AM";
    if(hour === 12){
        ending = ':00PM';
    }
    else if(hour === 24){
        hour -= 12;
    }
    else if(hour > 12) {
        hour -= 12;
        ending = ':00PM';
    }
    return String(hour) + ending;
}
function closeNewEvent(){
    newEventParent.css('display', 'none');
    newEventTitle.val('');
    newEventErr.text('');
}
function handleNewEventSubmission(){
    if(newEventTitle.val() === ''){
        newEventErr.text('Event title missing.');
        newEventTitle.focus();
    }else{
        let time1 = (startSelect.val());
        let time2 = (stopSelect.val());
        let date1 = new Date(selectedDate.getTime());
        let date2 = new Date(selectedDate.getTime());
        date1.setHours(parseInt(time1));
        if(time1.substr(-2, 1) === 'P' && date1.getHours() !== 12){
            date1.setHours(date1.getHours() + 12);
        }else if(time1.substr(-2, 1) === 'A' && date1.getHours() === 12){
            date1.setHours(24);
        }
        date2.setHours(parseInt(time2));
        if(time2.substr(-2, 1) === 'P' && date2.getHours() !== 12){
            date2.setHours(date2.getHours() + 12);
        }else if(time2.substr(-2, 1) === 'A' && date2.getHours() === 12){
            date2.setHours(24);
        }
        let timeDifference = (date2 - date1) / 36e5;
        if(timeDifference <= 0){
            newEventErr.text('Ending time must be later than starting time.');
        }else{
            events.push({
                title: newEventTitle.val(),
                startTime: date1,
                stopTime: date2
            });
            closeNewEvent();
            layoutDay(selectedDate);
        }
    }
}
function layoutEvents(){
    dayView.find('.eventParent').remove();
    events.forEach(function(event){
        let start = event.startTime;
        let stop = event.stopTime;
        if(start.getFullYear() === selectedDate.getFullYear()
        && start.getMonth() === selectedDate.getMonth()
        && start.getDate() === selectedDate.getDate()){
            let startTime = start.getHours();
            let stopTime = stop.getHours();
            if(stopTime === 0) stopTime = 24;
            let eventDiv = $('<div class="eventParent"></div>');
            eventDiv.text(event.title);
            let totalTime = stopTime - startTime;
            let heightCSS = 'calc(' + totalTime + '00% + ' + (totalTime - 1) + 'px)';
            eventDiv.css('height', heightCSS);
            $('#' + startTime).append(eventDiv);
        }
    });
}
