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

listen(document, "click", clickHandler);

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
