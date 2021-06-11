var options = {defaultMode: "stopWatch", activeStopWatch: null, activeTimer: null, intervalIdStopWatch: null, intervalIdTimer: null, totalSeconds: 0, updateNumbersOnScreenStopWatch: null, updateNumbersOnScreenTimer: null,}
var activeMode = options.defaultMode;
var timerNode = document.getElementById("timer");

/*  Save State Objs for every view */
var stopWatchSaveVar = {};
var timerSaveVar = {};
var alarmSaveVar = {};
var alarmItemSaveVar = [];
var alarmItemCounter = 0;

function listen(node, type, handler){
	if(window.addEventListener){
		node.addEventListener(type, handler);
	}

	else if(window.attachEvent){
		node.attachEvent("on" + type, handler);
	}
}

function clickHandler(event){
	var node = event.srcElement;
	var nodeId = node.id;
	
	if(nodeId === "startButton"){ return start() }
	else if(nodeId === "stopButton"){ return stop() }
	else if(nodeId === "resetButton"){ return resetTimer() }
	else if(nodeId === "changeToStopWatch"){ return change("stopWatch") }
	else if(nodeId === "changeToTimer"){ return change("timer") }
	else if(nodeId === "changeToAlarm"){ return change("alarm") }
	else if(nodeId === "alarmSaveButton"){ return saveAlarmItem() }
	else if(nodeId === "alarmDeleteButton"){ return deleteAlarmItem() }
	
	if(node.nodeName === "g" || node.nodeName === "path"){
		while(node.nodeName != "svg"){
			node = node.parentNode;
		}
	}
	
	var nodeClassName = node.nodeName === "svg" ? node.className.baseVal : node.className;
	
	if((containsClass(node, "timerItem") || containsClass(node, "timerSpan")) && (activeMode === "timer" || activeMode === "alarm")){
		if(!options.activeTimer){
			typeInTimerValue(node, event);
		}
	}
	
	else if(containsClass(node, "timerEditArrow") && !containsClass(node, "disabled")){
		setTimerValue(node);
	}
	
	
	else if(containsClass(node, "alarmItem") || containsClass(node, "alarmItemSpan") || containsClass(node, "alarmItemOptions")){
		setAlarmItemSelected(node);
	}
	
	else if(containsClass(node, "alarmItemArrowImg")){
		if(!containsClass(node, "opened")){
			toggleAlarmOptions(node, true);
		}
		else{
			toggleAlarmOptions(node, false);
		}
	}
	
	else if(containsClass(node, "alarmItemActive")){
		toggleAlarmItemActive(node);
	}
	
	else if(containsClass(node, "alarmItemEditArrow")){
		editAlarmItem(node);
	}
	
	else if(containsClass(node, "daysItem")){
		setDaysSelected(node);
	}
	
	else if(containsClass(node, "alarmItemOptionsSave")){
		saveAlarmItemNote(node);
	}
}

function blurHandler(event){
	var node = event.srcElement;
	
	if(containsClass(node, "timerSpanEdit")){
		return typeInTimerValue(node, event);
	}
	
}

function keyHandler(event){
	var node = event.srcElement;
	
	if(containsClass(node, "timerSpanEdit")){
		return typeInTimerValue(node, event);
	}
}

listen(document, "click", clickHandler);

var inputNodes = document.getElementsByClassName("timerSpanEdit");
for(i=0; i < inputNodes.length; i++){ 
	listen(inputNodes[i], "blur", blurHandler);
	listen(inputNodes[i], "keydown", keyHandler);
}

var timerHours = document.getElementById("timerHours");
var timerMinutes = document.getElementById("timerMinutes");
var timerSeconds = document.getElementById("timerSeconds");

var timerItems = document.getElementsByClassName("timerItem");
var timerArrows = document.getElementsByClassName("timerEditArrow");

printLabel(options.defaultMode);
renderDefaultMode();


function renderDefaultMode(){
	if(options.defaultMode === "stopWatch"){
		toggleActionButtons(true);
	}
	
	if(options.defaultMode === "timer"){
		toggleArrows(true);
		toggleActionButtons(true);
	}
	
	if(options.defaultMode === "alarm"){
		toggleArrows(true);
		toggleTimerItem("seconds", false);
		toggleAlarmScreen(true);
		toggleActionButtons(false);
		timerNode.style.width = "57%"
	}
}

function printLabel(mode) {
	var label = document.getElementById("label");
	
	if(mode === "stopWatch"){
		label.textContent = "Stop Watch";
	}

	if(mode === "timer"){
		label.textContent = "Timer";
	}

	if(mode === "alarm"){
		label.textContent = "Alarm";
	}
	
}

function updateTime(value, row){
	if(row === "hours"){
		timerHours.innerHTML = addZeros(value.toString(), 2);
	}
	if(row === "minutes"){
		timerMinutes.innerHTML = addZeros(value.toString(), 2);
	}
	if(row === "seconds"){
		timerSeconds.innerHTML = addZeros(value.toString(), 2);
	}
}

function toggleArrows(visible){
	if(visible){
		for(i=0; i < timerArrows.length; i++){
			addClass(timerArrows[i], "block")
			removeClass(timerArrows[i], "none")
		}
	}
	
	else{
		for(i=0; i < timerArrows.length; i++){
			addClass(timerArrows[i], "none")
			removeClass(timerArrows[i], "block")
		}
	}
}

function disableArrows(disabled){
	if(disabled){
		for(i=0; i < timerArrows.length; i++){
			addClass(timerArrows[i], "disabled")
		}
	}
	
	else{
		for(i=0; i < timerArrows.length; i++){
			removeClass(timerArrows[i], "disabled")
		}
	}
}

function toggleAlarmScreen(visible){
	var alarmScreen = document.getElementById("alarmScreen");
	
	if(visible){
		addClass(alarmScreen, "inline-block");
		removeClass(alarmScreen, "none");
	}
	else{
		addClass(alarmScreen, "none");
		removeClass(alarmScreen, "inline-block");
	}
}

// activate/deactivate -> HH/MM/SS parameter(x)
function toggleTimerItem(item, visible){
	if(visible){	
		for(i=0; i < timerItems.length; i++){
			if(timerItems[i].id == item){
				addClass(timerItems[i], "inline-block");
				removeClass(timerItems[i], "none");
			}
		}
	}
	else{
		for(i=0; i < timerItems.length; i++){
			if(timerItems[i].id == item){
				addClass(timerItems[i], "none");
				removeClass(timerItems[i], "inline-block");
			}
		}
	}
}

function toggleActionButtons(visible){
	var controlButtons = document.getElementsByClassName("changeState");
	
	if(visible){
		for(i=0; i < controlButtons.length; i++){
			addClass(controlButtons[i], "inline-block")
			removeClass(controlButtons[i], "none")
		}
	}
	
	else{
		for(i=0; i < controlButtons.length; i++){
			addClass(controlButtons[i], "none")
			removeClass(controlButtons[i], "inline-block")
		}
	}
}

function change(mode){
	var hoursCurrentValue = parseInt(timerHours.innerHTML);
	var minutesCurrentValue = parseInt(timerMinutes.innerHTML);
	var secondsCurrentValue = parseInt(timerSeconds.innerHTML);
	
	if(activeMode === "stopWatch"){
		options.updateNumbersOnScreenStopWatch = false;
	}
	if(activeMode === "timer"){
		options.updateNumbersOnScreenTimer = false;
		timerSaveVar = {"hours": hoursCurrentValue, "minutes": minutesCurrentValue, "seconds": secondsCurrentValue};
	}
	if(activeMode === "alarm"){
		alarmSaveVar = {"hours": hoursCurrentValue, "minutes": minutesCurrentValue};
	}
	
	if(mode === "stopWatch"){
		printLabel(mode);
		toggleArrows(false);
		toggleTimerItem("seconds", true);
		toggleAlarmScreen(false);
		toggleActionButtons(true);
		timerNode.style.width = "86%"
		
		if(stopWatchSaveVar.hours){
			updateTime(stopWatchSaveVar.hours,"hours");
			updateTime(stopWatchSaveVar.minutes, "minutes");
			updateTime(stopWatchSaveVar.seconds, "seconds");
		}
		else{
			updateTime(0,"hours");
			updateTime(0, "minutes");
			updateTime(0, "seconds");
		}
		options.updateNumbersOnScreenStopWatch = true;
		
	}

	if(mode === "timer"){
		if(options.activeTimer == true){
			disableArrows(true);
		}
		else{
			disableArrows(false);
		}
		printLabel(mode);
		toggleArrows(true);
		toggleTimerItem("seconds", true);
		toggleAlarmScreen(false);
		toggleActionButtons(true);
		timerNode.style.width = "86%"
		
		if(timerSaveVar.hours){
			updateTime(timerSaveVar.hours,"hours");
			updateTime(timerSaveVar.minutes, "minutes");
			updateTime(timerSaveVar.seconds, "seconds");
		}
		else{
			updateTime(0,"hours");
			updateTime(0, "minutes");
			updateTime(0, "seconds");
		}
		
		options.updateNumbersOnScreenTimer = true;
	}

	if(mode === "alarm"){
		disableArrows(false);
		printLabel(mode);
		toggleArrows(true);
		toggleTimerItem("seconds", false);
		toggleAlarmScreen(true);
		toggleActionButtons(false);
		timerNode.style.width = "57%"
		
		if(alarmSaveVar.hours){
			updateTime(alarmSaveVar.hours,"hours");
			updateTime(alarmSaveVar.minutes, "minutes");
		}
		else{
			updateTime(0,"hours");
			updateTime(0, "minutes");
		}
		
	}
	
	activeMode = mode;
	
}

function addZeros(string, lengthNumber){
	var tmpString = string;
	if(string.length === lengthNumber){
		return string;
	}
	for(i=string.length; i < lengthNumber; i++){
		tmpString = "0" + tmpString;
	}
	return tmpString;
}

function addClass(node,classStr) {
	if(node.nodeName === "svg" && !containsClass(node, classStr)){
		node.className.baseVal += " "+classStr;
	}
	else if(!containsClass(node, classStr)){
		node.className += " "+classStr;
	}
}

function removeClass(node,classStr) {
 	var nodeClassNames = node.nodeName === "svg" ? node.className.baseVal.split(" ") : node.className.split(" ");
	var tmpArray = nodeClassNames;
	
	for(c=0; c < nodeClassNames.length; c++){
		if(nodeClassNames[c] === classStr){
			tmpArray.splice(c, 1)
		}
	}
	
	if(node.nodeName === "svg"){
		node.className.baseVal = tmpArray.join(" ");
	}
	else{
		node.className = tmpArray.join(" ");
	}
}

function containsClass(node, classStr) {
	if(node.nodeName === "svg"){
		if(node.className && node.className.baseVal.split(/\s+/gi).indexOf(classStr) > -1) {
			return true;
		}
		else{
			return false;
		}
	}
	else{
		if(node.className && node.className.split(/\s+/gi).indexOf(classStr) > -1) {
			return true;
		}
		else{
			return false;
		}
	}
}

function start(){
	if(activeMode === "stopWatch"){
		if(options.activeStopWatch == true){
			return
		}
		options.updateNumbersOnScreenStopWatch = true;
		options.intervalIdStopWatch = setInterval(stopWatch, 1000);
		options.activeStopWatch = true;
		console.log("activated: " + activeMode);
	}

	if(activeMode === "timer"){
		if(options.activeTimer == true){
			return
		}
		
		disableArrows(true);
		
		options.updateNumbersOnScreenTimer = true;
		options.intervalIdTimer = setInterval(timer, 1000);
		options.activeTimer = true;
		console.log("activated: " + activeMode);
	}

	if(activeMode === "alarm"){
		console.log("activated: " + activeMode);
	}
}

function stop(){
	if(activeMode === "stopWatch"){
		options.activeStopWatch = null;
		clearInterval(options.intervalIdStopWatch);
	}

	if(activeMode === "timer"){
		disableArrows(false);
		options.activeTimer = null;
		clearInterval(options.intervalIdTimer);
	}
}

function resetTimer(){
	
	if(activeMode === "stopWatch"){
		options.activeStopWatch = null;
		options.totalSeconds = 0;
		stopWatchSaveVar = {};
		clearInterval(options.intervalIdStopWatch);
	}

	if(activeMode === "timer"){
		options.activeTimer = null;
		timerSaveVar = {};
		disableArrows(false);
		clearInterval(options.intervalIdTimer);
	}
	
	updateTime(0,"hours");
	updateTime(0, "minutes");
	updateTime(0, "seconds");
}

//Only timer and Alarm have these visible
function typeInTimerValue(node, event){
	var hoursCurrentValue = parseInt(timerHours.innerHTML);
	var minutesCurrentValue = parseInt(timerMinutes.innerHTML);
	var secondsCurrentValue = parseInt(timerSeconds.innerHTML);
	var eventType = event.type;
	
	if(eventType === "click"){
		if(node.nodeName !== "SPAN"){
			node = node.children[2];
		}
		

		if(containsClass(node, "inline-block")){
			addClass(node, "none");
			removeClass(node, "inline-block");
			addClass(node.nextElementSibling, "inline-block");
			removeClass(node.nextElementSibling, "none");

			node.nextElementSibling.value = "";
			node.nextElementSibling.focus();
		}
		
		
 		if(node.parentNode.id === "hours"){
			node.nextElementSibling.value = addZeros(hoursCurrentValue.toString(), 2);
		}
		else if(node.parentNode.id === "minutes"){
			node.nextElementSibling.value = addZeros(minutesCurrentValue.toString(), 2);
		}
		
		else if(node.parentNode.id === "seconds"){
			node.nextElementSibling.value =  addZeros(secondsCurrentValue.toString(), 2);
		}
		
	}
	
	else if(eventType === "blur"){
		addClass(node, "none");
		removeClass(node, "inline-block");
		addClass(node.previousElementSibling, "inline-block");
		removeClass(node.previousElementSibling, "none");
		if(activeMode === "timer" && Number(node.value) > 59 && (node.parentNode.id === "minutes" || node.parentNode.id === "seconds")){
			node.previousElementSibling.textContent = 59;
		}
		else if(activeMode === "alarm" && Number(node.value) > 24 && node.parentNode.id === "hours"){
			node.previousElementSibling.textContent = 24;
		}
			
		else if(activeMode === "alarm" && Number(node.value) > 59 && (node.parentNode.id === "minutes" || node.parentNode.id === "seconds")){
			node.previousElementSibling.textContent = 59;
		}
		
		else {
			node.previousElementSibling.textContent = addZeros(node.value.toString(), 2);
		}
	}
	
	else if(eventType === "keydown"){
		var key   = event.keyCode ? event.keyCode : event.which;
		
		if(key === 13){
			addClass(node, "none");
			removeClass(node, "inline-block");
			addClass(node.previousElementSibling, "inline-block");
			removeClass(node.previousElementSibling, "none");
			node.previousElementSibling.textContent = addZeros(node.value.toString(), 2);
		}
		
		else if (!( [8, 9, 27, 46, 110, 190].indexOf(key) !== -1 ||
         (key == 65 && ( event.ctrlKey || event.metaKey  ) ) || 
         (key >= 35 && key <= 40) ||
         (key >= 48 && key <= 57 && !(event.shiftKey || event.altKey)) ||
         (key >= 96 && key <= 105)
       )) event.preventDefault();
		
	}
	
	if(activeMode === "timer"){
		timerSaveVar.hours = hoursCurrentValue;
		timerSaveVar.minutes = minutesCurrentValue;
		timerSaveVar.seconds = secondsCurrentValue;
	}
	
	else if(activeMode === "alarm"){
		alarmSaveVar.hours = hoursCurrentValue;
		alarmSaveVar.minutes = minutesCurrentValue;
		alarmSaveVar.seconds = secondsCurrentValue;
	}

}


function setTimerValue(node){
	var hoursCurrentValue = parseInt(timerHours.innerHTML);
	var minutesCurrentValue = parseInt(timerMinutes.innerHTML);
	var secondsCurrentValue = parseInt(timerSeconds.innerHTML);
	var value;
	
	var nodeClassNames = node.nodeName === "svg" ? node.className.baseVal.split(" ") : node.className.split(" ");
	
	if(containsClass(node, "timerEditUpArrow") && node.parentNode.id === "hours"){
		if(activeMode === "timer"){
			if(hoursCurrentValue >= 99){
				value = 0;
			}
			else{
				value = hoursCurrentValue + 1;
			}
			updateTime(value, "hours");
		}

		else if(activeMode === "alarm"){
			if(hoursCurrentValue >= 24){
				value = 0;
			}
			else{
				value = hoursCurrentValue + 1;
			}
			updateTime(value, "hours");
		}
	}
	else if(containsClass(node, "timerEditDownArrow") && node.parentNode.id === "hours"){
		if(activeMode === "timer"){
			if(hoursCurrentValue === 0){
				value = 99;
			}
			else{
				value = hoursCurrentValue - 1;
			}
			updateTime(value, "hours");
		}
		
		else if(activeMode === "alarm"){
			if(hoursCurrentValue === 0){
				value = 24;
			}
			else{
				value = hoursCurrentValue - 1;
			}
			updateTime(value, "hours");
		}
	}
	else if(containsClass(node, "timerEditUpArrow") && node.parentNode.id === "minutes"){
		if(minutesCurrentValue === 59){
			value = 0;
		}
		else{
			value = minutesCurrentValue + 1;
		}
		updateTime(value, "minutes");
	}
	else if(containsClass(node, "timerEditDownArrow") && node.parentNode.id === "minutes"){
		if(minutesCurrentValue === 0){
			value = 59;
		}
		else{
			value = minutesCurrentValue - 1;
		}
		updateTime(value, "minutes");
	}
	else if(containsClass(node, "timerEditUpArrow") && node.parentNode.id === "seconds"){
		if(secondsCurrentValue === 59){
			value = 0;
		}
		else{
			value = secondsCurrentValue + 1;
		}
		updateTime(value, "seconds");
	}
	else if(containsClass(node, "timerEditDownArrow") && node.parentNode.id === "seconds"){
		if(secondsCurrentValue === 0){
			value = 59;
		}
		else{
			value = secondsCurrentValue - 1;
		}
		updateTime(value, "seconds");
	}
	
	if(activeMode === "timer"){
		timerSaveVar.hours = hoursCurrentValue;
		timerSaveVar.minutes = minutesCurrentValue;
		timerSaveVar.seconds = secondsCurrentValue;
	}

}

/* Specific */

/* StopWatch */
function stopWatch(){
	
	++options.totalSeconds;
	
	var hours = Math.floor(options.totalSeconds /3600);
	var minutes = Math.floor((options.totalSeconds - hours*3600)/60);
	var seconds = options.totalSeconds - (hours*3600 + minutes*60);
	
	if(options.updateNumbersOnScreenStopWatch === true){
		updateTime(hours, "hours");
		updateTime(minutes, "minutes");
		updateTime(seconds, "seconds");
	}
	
	else{
		hours = addZeros(hours.toString(), 2);
		minutes = addZeros(minutes.toString(), 2);
		seconds = addZeros(seconds.toString(), 2);
	}
	
	stopWatchSaveVar = {"hours": hours, "minutes": minutes, "seconds": seconds};
}

/* Timer */
function timer(){
	var hoursCurrentValue = parseInt(timerHours.innerHTML);
	var minutesCurrentValue = parseInt(timerMinutes.innerHTML);
	var secondsCurrentValue = parseInt(timerSeconds.innerHTML);
	
	if(!timerSaveVar.hours){
		timerSaveVar.hours = hoursCurrentValue;
		timerSaveVar.minutes = minutesCurrentValue;
		timerSaveVar.seconds = secondsCurrentValue;
	}
	
	
	if(timerSaveVar.seconds == 0){
		
		if(timerSaveVar.minutes == 0){
			if(timerSaveVar.hours != 0){
				timerSaveVar.hours = timerSaveVar.hours - 1;
				timerSaveVar.minutes = 60;
				if(options.updateNumbersOnScreenTimer == true){
					updateTime(timerSaveVar.hours, "hours");
					updateTime(timerSaveVar.minutes, "minutes");
				}
			}
			
			if(timerSaveVar.hours === 0 && timerSaveVar.minutes === 0 && timerSaveVar.seconds === 0){
				disableArrows(false);
				options.activeTimer = null;
				clearInterval(options.intervalIdTimer);
			}
		}
		
		if(timerSaveVar.minutes != 0){
			timerSaveVar.minutes = timerSaveVar.minutes - 1;
			timerSaveVar.seconds = 60;
			if(options.updateNumbersOnScreenTimer == true){
					updateTime(timerSaveVar.minutes, "minutes");
					updateTime(timerSaveVar.seconds, "seconds");
			}
		}
	}
	
	if(timerSaveVar.seconds != 0){
		timerSaveVar.seconds = timerSaveVar.seconds - 1;
		if(options.updateNumbersOnScreenTimer == true){
			updateTime(timerSaveVar.seconds, "seconds");
		}
	}
	
}

/* Alarm */
function saveAlarmItem(){
	//Get Values from Main Clock
	var timerValues = [timerHours.innerHTML, ":", timerMinutes.innerHTML];
	
	//Array for Alarm items
	var alarmList = document.getElementById("alarmItems");
	
	//Alarm Item
	var listItem = document.createElement("li");
	
	//Alarm Item OptionsDropDown Arrow
	var listArrow = document.createElement("div");
	
	var listEditArrowHourUpSvg = "<svg class='alarmItemEditArrowUp alarmItemEditArrow none' value='hUp' version='1.0' viewBox='0 0 200.000000 200.000000' preserveAspectRatio='xMidYMid meet'><g transform='translate(0.000000,200.000000) scale(0.100000,-0.100000)' fill='#000000' stroke='none'><path d='M537 1032 c-376 -376 -428 -432 -433 -464 -6 -32 -2 -41 24 -68 23 -23 39 -30 68 -30 37 0 52 13 404 365 339 338 368 365 400 365 32 0 61 -27 400 -365 359 -357 367 -365 406 -365 68 0 109 59 85 118 -7 16 -202 218 -434 450 -393 393 -425 422 -457 422 -32 0 -64 -30 -463 -428z'/></g></svg>";
	var listEditArrowHourDownSvg = "<svg class='alarmItemEditArrowDown alarmItemEditArrow none' value='hDown' version='1.0' viewBox='0 0 200.000000 200.000000' preserveAspectRatio='xMidYMid meet'><g transform='translate(0.000000,200.000000) scale(0.100000,-0.100000)' fill='#000000' stroke='none'><path d='M132 1470 c-29 -27 -37 -64 -23 -98 7 -16 202 -218 434 -450 393 -393 425 -422 457 -422 32 0 64 30 463 428 376 376 428 432 433 464 6 32 2 41 -24 68 -23 23 -39 30 -68 30 -37 0 -52 -13 -404 -365 -339 -338 -368 -365 -400 -365 -32 0 -61 27 -400 365 -359 357 -367 365 -406 365 -27 0 -48 -7 -62 -20z'/></g></svg>";
	var listEditArrowMinuteUpSvg = "<svg class='alarmItemEditArrowUp alarmItemEditArrow none' value='mUp' version='1.0' viewBox='0 0 200.000000 200.000000' preserveAspectRatio='xMidYMid meet'><g transform='translate(0.000000,200.000000) scale(0.100000,-0.100000)' fill='#000000' stroke='none'><path d='M537 1032 c-376 -376 -428 -432 -433 -464 -6 -32 -2 -41 24 -68 23 -23 39 -30 68 -30 37 0 52 13 404 365 339 338 368 365 400 365 32 0 61 -27 400 -365 359 -357 367 -365 406 -365 68 0 109 59 85 118 -7 16 -202 218 -434 450 -393 393 -425 422 -457 422 -32 0 -64 -30 -463 -428z'/></g></svg>";
	var listEditArrowMinuteDownSvg = "<svg class='alarmItemEditArrowDown alarmItemEditArrow none' value='mDown' version='1.0' viewBox='0 0 200.000000 200.000000' preserveAspectRatio='xMidYMid meet'><g transform='translate(0.000000,200.000000) scale(0.100000,-0.100000)' fill='#000000' stroke='none'><path d='M132 1470 c-29 -27 -37 -64 -23 -98 7 -16 202 -218 434 -450 393 -393 425 -422 457 -422 32 0 64 30 463 428 376 376 428 432 433 464 6 32 2 41 -24 68 -23 23 -39 30 -68 30 -37 0 -52 -13 -404 -365 -339 -338 -368 -365 -400 -365 -32 0 -61 27 -400 365 -359 357 -367 365 -406 365 -27 0 -48 -7 -62 -20z'/></g></svg>";
	
	for(i=0; i < timerValues.length; i++){
		var numberContainer = document.createElement("div");
		var span = document.createElement("span");
		span.className = "alarmItemSpan";
		numberContainer.className = i == 1 ? "alarmDoublePoint" : "alarmSpan";
		span.innerHTML = timerValues[i];
		numberContainer.appendChild(span);
		
		if(i === 0){
			numberContainer.insertAdjacentHTML("beforeend",listEditArrowHourUpSvg);
			numberContainer.insertAdjacentHTML("beforeend",listEditArrowHourDownSvg);
		}
		
		if(i === 2){
			numberContainer.insertAdjacentHTML("beforeend",listEditArrowMinuteUpSvg);
			numberContainer.insertAdjacentHTML("beforeend",listEditArrowMinuteDownSvg);
		}
		
		listItem.appendChild(numberContainer);
		
	}
	
	//Alarm item Options
	var listOptions = document.createElement("div");
	var listMessage = document.createElement("input");
	var listMessageLabel = document.createElement("span");
	var listDays = document.createElement("ul");
	var listOptionsSave = document.createElement("button");
	var listOptionsAlarmActive = document.createElement("button");
	
	//On/Off switch button
	listOptionsAlarmActive.className ="alarmItemActive";
	listItem.appendChild(listOptionsAlarmActive);
	
	var days = ["M", "D", "M", "D", "F", "S", "S"]
	for(i=0; i<7; i++){
		var tmpLi = document.createElement("li");
		tmpLi.innerHTML = days[i];
		tmpLi.className = "daysItem";
		tmpLi.value = i;
		listDays.appendChild(tmpLi);
	}
	
	listOptionsSave.textContent = "Save";
	listMessageLabel.textContent = "Note";
	
	var hr = document.createElement("hr");
	
	alarmItemCounter++;
	listItem.className = "alarmItem";
	listItem.value = alarmItemCounter;
	listArrow.className = "alarmItemDropDownArrow";
	listOptions.className = "alarmItemOptions";
	listMessage.className = "alarmItemInput";
	listDays.className = "alarmItemDays";
	listOptionsSave.className = "alarmItemOptionsSave";
	listMessageLabel.className = "alarmItemInputLabel";
	hr.className = "alarmSplit";
	
	listArrow.innerHTML = "<svg class='alarmItemArrowImg' version='1.0' viewBox='0 0 200.000000 200.000000' preserveAspectRatio='xMidYMid meet'><g transform='translate(0.000000,200.000000) scale(0.100000,-0.100000)' fill='#000000' stroke='none'><path d='M132 1470 c-29 -27 -37 -64 -23 -98 7 -16 202 -218 434 -450 393 -393 425 -422 457 -422 32 0 64 30 463 428 376 376 428 432 433 464 6 32 2 41 -24 68 -23 23 -39 30 -68 30 -37 0 -52 -13 -404 -365 -339 -338 -368 -365 -400 -365 -32 0 -61 27 -400 365 -359 357 -367 365 -406 365 -27 0 -48 -7 -62 -20z'/></g></svg>";
	
	listOptions.appendChild(listMessageLabel);
	listOptions.appendChild(listMessage);
	listOptions.appendChild(listDays);
	listOptions.appendChild(listOptionsSave);
	
	listItem.appendChild(listArrow);
	listItem.appendChild(listOptions);
	
	alarmList.appendChild(listItem);
	alarmList.appendChild(hr);
	
	var selectedDays = [
		{"day": "M", "selected": false},
		{"day": "D", "selected": false},
		{"day": "M", "selected": false},
		{"day": "F", "selected": false},
		{"day": "D", "selected": false},
		{"day": "S", "selected": false},
		{"day": "S", "selected": false}
	];
	alarmItemSaveVar.push({"row": alarmItemCounter,"dom": listItem,"active": true, "selected": false,"edit": false, "hours": timerValues[0], "minutes": timerValues[2], "note": "", "days": selectedDays});
	
}

function updateAlarmItemTime(node, value){
	value = addZeros(value.toString(), 2);	
	node.innerHTML = value;
}

function getAlarmItemNode(node){
	var alarmItem = node;
	
	while(!containsClass(alarmItem, "alarmItem")){
		alarmItem = alarmItem.parentNode;
	}
	
	return alarmItem;
}

function setAlarmItemSelected(node){
	var alarmItem = getAlarmItemNode(node);

	if(containsClass(alarmItem, "selected")){
		removeClass(alarmItem, "selected");
		alarmItemSaveVar[alarmItem.value - 1].selected = false;
	}
	else{
		addClass(alarmItem, "selected");
		alarmItemSaveVar[alarmItem.value - 1].selected = true;
	
	}
}

function setDaysSelected(node){
	var alarmItem = getAlarmItemNode(node);
	var nodeClassNames = node.className.split(" ");
	
	for(i= 0; i < nodeClassNames.length; i++){
		if(nodeClassNames[i] === "selected"){
			removeClass(node, "selected");
			alarmItemSaveVar[alarmItem.value - 1].days[node.value].selected = false;
		}
		else{
			addClass(node, "selected");
			alarmItemSaveVar[alarmItem.value - 1].days[node.value].selected = true;
		}
	} 
}

function toggleAlarmItemActive(node, disabled){
	var alarmItem = getAlarmItemNode(node);

	if(containsClass(alarmItem, "disabled")){
		removeClass(alarmItem, "disabled");
	}
	else{
		addClass(alarmItem, "disabled");
	
	}
	
	alarmItemSaveVar[alarmItem.value - 1].active = false;
}

function toggleAlarmOptions(node, edit){
	var alarmItem = getAlarmItemNode(node);

	var alarmItemEditArrows = alarmItem.getElementsByClassName("alarmItemEditArrow");
	
	if(edit === true){
		addClass(node, "opened")
		//node.className.baseVal = "alarmItemArrowImg opened";
		
		if(node.parentNode.className === "alarmItemDropDownArrow"){
			node.parentNode.nextElementSibling.style.display = "block";
			
			for(i=0; i < alarmItemEditArrows.length; i++){
				removeClass(alarmItemEditArrows[i], "none");
				addClass(alarmItemEditArrows[i], "inline-block");
			}
			 
			alarmItemSaveVar[alarmItem.value - 1].edit = true;
		}
	}
	else{
		node.className.baseVal = "alarmItemArrowImg";
		removeClass(node, "opened")
		
		if(node.parentNode.className === "alarmItemDropDownArrow"){
			node.parentNode.nextElementSibling.style.display = "none";
			
 			for(i=0; i < alarmItemEditArrows.length; i++){
				removeClass(alarmItemEditArrows[i], "inline-block");
				addClass(alarmItemEditArrows[i], "none");
			}
			
			alarmItemSaveVar[alarmItem.value - 1].edit = false;
		}
	}
}

function editAlarmItem(node){
	var alarmItem = getAlarmItemNode(node);
	
	var valueInnerHTML = Number(node.parentNode.children[0].innerHTML);
	var itemValue = node.getAttribute("value");
	
	if(itemValue === "hUp"){
		var value = 0;
		if(valueInnerHTML === 24){
			value = 0;
		}
		else{
			value = valueInnerHTML + 1;
		}

		updateAlarmItemTime(node.parentNode.children[0], value);
		
		alarmItemSaveVar[alarmItem.value - 1].hours = node.parentNode.children[0].innerHTML;
		
	}
	
	if(itemValue === "hDown"){
		var value = 0;
		if(valueInnerHTML === 0){
			value = 24;
		}
		else{
			value = valueInnerHTML - 1;
		}

		updateAlarmItemTime(node.parentNode.children[0], value);
		
		alarmItemSaveVar[alarmItem.value - 1].hours = node.parentNode.children[0].innerHTML;
	}
	
	if(itemValue === "mUp"){
		var value = 0;
		if(valueInnerHTML === 59){
			value = 0;
		}
		else{
			value = valueInnerHTML + 1;
		}

		updateAlarmItemTime(node.parentNode.children[0], value);
		
		alarmItemSaveVar[alarmItem.value - 1].minutes = node.parentNode.children[0].innerHTML;
	}
	
	if(itemValue === "mDown"){
		var value = 0;
		if(valueInnerHTML === 0){
			value = 59;
		}
		else{
			value = valueInnerHTML - 1;
		}

		updateAlarmItemTime(node.parentNode.children[0], value);
		
		alarmItemSaveVar[alarmItem.value - 1].minutes = node.parentNode.children[0].innerHTML;
	}
	
}

function saveAlarmItemNote(node){
	var alarmItem = getAlarmItemNode(node);
	
	alarmItemSaveVar[alarmItem.value - 1].note = node.parentNode.children[1].value;
	console.log(alarmItemSaveVar);
}

function deleteAlarmItem(){
	var deleteZero = false;
	var itemDeleted = false;
	for(i=alarmItemSaveVar.length - 1; i >= 0 ; i--){
		if(alarmItemSaveVar[i].selected === true){
			if(i == 0){
				deleteZero = true;
				//Hier an message für kein item ausgewählt arbeiten
				itemDeleted = true;
			}
			else{
				alarmItemSaveVar.splice(i, 1);
			}
		}
	}
	
	if(deleteZero){
		alarmItemSaveVar.shift();
	}
	
	for(c=0; c< alarmItemSaveVar.length; c++){
		alarmItemSaveVar[c].row =  c + 1; 
		alarmItemSaveVar[c].dom.value = c + 1;
	}
	
	alarmItemCounter = alarmItemSaveVar.length;
	
	console.log(alarmItemSaveVar);
	
	var selectedAlarmItems = document.getElementsByClassName("alarmItem selected");
	
	for(i=0; i < selectedAlarmItems.length;){
		selectedAlarmItems[0].nextSibling.parentNode.removeChild(selectedAlarmItems[0].nextSibling);
		selectedAlarmItems[i].parentNode.removeChild(selectedAlarmItems[i]);
	}
}
