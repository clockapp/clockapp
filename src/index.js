import React from 'react';
import ReactDOM from 'react-dom';
import './Timer.css';


let options = {defaultMode: "stopWatch", activeStopWatch: null, activeTimer: null, intervalIdStopWatch: null, intervalIdTimer: null, totalSeconds: 0, updateNumbersOnScreenStopWatch: null, updateNumbersOnScreenTimer: null,}
let activeMode = options.defaultMode;

let stopWatchSaveVar = {};
let timerSaveVar = {};
let alarmSaveVar = {};
//let alarmItemSaveVar = [];
let alarmItemCounter = 0;

class Timer extends React.Component {
	
	constructor(props) {
		super(props);
		
		this.state = {
			hoursValue: 0,
			minutesValue: 0,
			secondsValue: 0,
			arrowsVisible: false,
			arrowsDisabled: false,
			actionButtonsVisible: true,
			alarmScreenVisible: false,
			alarmItemSaveVar: []
		}
		
		this.timerNode = React.createRef();
		this.timerHours = React.createRef();
		this.timerMinutes = React.createRef();
		this.timerSeconds = React.createRef();
		this.inputNodes = []
	}
	
	listen(node, type, handler){
		if(window.addEventListener){
			node.addEventListener(type, handler);
		}

		else if(window.attachEvent){
			node.attachEvent("on" + type, handler);
		}
	}
	
	clickHandler(event){
		let node = event.srcElement;
		let nodeId = node.id;
		
		if(nodeId === "startButton"){ this.start() }
		else if(nodeId === "stopButton"){ this.stop() }
		else if(nodeId === "resetButton"){ this.resetTimer() }
		else if(nodeId === "changeToStopWatch"){ this.change("stopWatch") }
		else if(nodeId === "changeToTimer"){ this.change("timer") }
		else if(nodeId === "changeToAlarm"){ this.change("alarm") }
		else if(nodeId === "alarmSaveButton"){ this.saveAlarmItem() }
		else if(nodeId === "alarmDeleteButton"){ this.deleteAlarmItem() }
		
		if(node.nodeName === "g" || node.nodeName === "path"){
			while(node.nodeName !== "svg"){
				node =  node.parentElement;
			}
		}
		
		let nodeClassNames = node.nodeName === "svg" ? node.className.baseVal.split(" ") : node.className.split(" ");
		
		if((nodeClassNames.includes("timerItem") || nodeClassNames.includes("timerSpan") ) && (activeMode === "timer" || activeMode === "alarm")){
			if(!options.activeTimer){
				this.typeInTimerValue(node, event);
			}
		}
		
		else if(nodeClassNames.includes("timerEditArrow") && !nodeClassNames.includes("disabled")){
			this.setTimerValue(node);
		}
		
		
		else if(nodeClassNames.includes("alarmItem") || nodeClassNames.includes("alarmItemSpan") || nodeClassNames.includes("alarmItemOptions")){
			this.setAlarmItemSelected(node);
		}
		
		else if(nodeClassNames.includes("alarmItemArrowImg")){
			if(!nodeClassNames.includes("opened")){
				this.toggleAlarmOptions(node, true);
			}
			else{
				this.toggleAlarmOptions(node, false);
			}
		}
		
		else if(nodeClassNames.includes("alarmItemActive")){
			this.toggleAlarmItemActive(node);
		}
		
		else if(nodeClassNames.includes("alarmItemEditArrow")){
			this.editAlarmItem(node);
		}
		
		else if(nodeClassNames.includes("daysItem")){
			this.setDaysSelected(node);
		}
		
		else if(nodeClassNames.includes("alarmItemOptionsSave")){
			this.saveAlarmItemNote(node);
		}
	}
	
	keyHandler(event){
		let node = event.srcElement;
		let nodeClassNames = node.className.split(" ");
		
		if(nodeClassNames.includes("timerSpanEdit")){
			return  this.typeInTimerValue(node, event);
		}
		
	}
	
	blurHandler(event){
		let node = event.srcElement;
		let nodeClassNames = node.className.split(" ");
			
		if(nodeClassNames.includes("timerSpanEdit")){
			return this.typeInTimerValue(node, event);
		}
		
	}

	renderDefaultMode(){
		if(options.defaultMode === "stopWatch"){
			this.toggleActionButtons(true);
		}
		
		if(options.defaultMode === "timer"){
			this.toggleArrows(true);
			this.toggleActionButtons(true);
		}
		
		if(options.defaultMode === "alarm"){
			this.toggleArrows(true);
			this.toggleTimerItem(this.timerSeconds.current, false);
			this.toggleAlarmScreen(true);
			this.toggleActionButtons(false);
			this.timerNode.current.style.width = "57%";
		}
	}

	printLabel(mode) {
		let label = document.getElementById("label");
		
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

	toggleArrows(visible){
		this.setState({arrowsVisible: visible})
	}

	disableArrows(disabled){
		this.setState({arrowsDisabled: disabled})
	}

	toggleAlarmScreen(visible){
		this.setState({alarmScreenVisible: visible})
	}

	// activate/deactivate -> HH/MM/SS parameter(x)
	toggleTimerItem(type, visible){
		if(visible){
			type.parentElement.classList.add("inline-block");
			type.parentElement.classList.remove("none");
		}
		else{
			type.parentElement.classList.add("none");
			type.parentElement.classList.remove("inline-block");
		}
	}

	toggleActionButtons(visible){
		this.setState({actionButtonsVisible: visible})
	}

	change(mode){
		let hoursCurrentValue = parseInt(this.state.hoursValue);
		let minutesCurrentValue = parseInt(this.state.minutesValue);
		let secondsCurrentValue = parseInt(this.state.secondsValue);
		
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
			this.printLabel(mode);
			this.toggleArrows(false);
			this.toggleTimerItem(this.timerSeconds.current, true);
			this.toggleAlarmScreen(false);
			this.toggleActionButtons(true);
			this.timerNode.current.style.width = "86%";
			
			if(options.activeStopWatch){
				this.setState({hoursValue: stopWatchSaveVar.hours});
				this.setState({minutesValue: stopWatchSaveVar.minutes});
				this.setState({secondsValue: stopWatchSaveVar.seconds});
			}
			else{
				this.setState({hoursValue: 0});
				this.setState({minutesValue: 0});
				this.setState({secondsValue: 0});
			}
			options.updateNumbersOnScreenStopWatch = true;
			
		}

		if(mode === "timer"){
			if(options.activeTimer === true){
				this.disableArrows(true);
			}
			else{
				this.disableArrows(false);
			}
			this.printLabel(mode);
			this.toggleArrows(true);
			this.toggleTimerItem(this.timerSeconds.current, true);
			this.toggleAlarmScreen(false);
			this.toggleActionButtons(true);
			this.timerNode.current.style.width = "86%";
			
			if(options.activeTimer){
				this.setState({hoursValue: timerSaveVar.hours});
				this.setState({minutesValue: timerSaveVar.minutes});
				this.setState({secondsValue: timerSaveVar.seconds});
			}
			else{
				this.setState({hoursValue: 0});
				this.setState({minutesValue: 0});
				this.setState({secondsValue: 0});
			}
			
			options.updateNumbersOnScreenTimer = true;
		}

		if(mode === "alarm"){
			this.disableArrows(false);
			this.printLabel(mode)
			this.toggleArrows(true);
			this.toggleTimerItem(this.timerSeconds.current, false);
			this.toggleAlarmScreen(true);
			this.toggleActionButtons(false);
			this.timerNode.current.style.width = "57%";
			
			if(alarmSaveVar.hours){
				this.setState({hoursValue: alarmSaveVar.hours});
				this.setState({minutesValue: alarmSaveVar.minutes});
			}
			else{
				this.setState({hoursValue: 0});
				this.setState({minutesValue: 0});
			}
			
		}
		
		activeMode = mode;
		
	}

	start(){
		if(activeMode === "stopWatch"){
			if(options.activeStopWatch === true){
				return
			}
			options.updateNumbersOnScreenStopWatch = true;
			options.intervalIdStopWatch = setInterval(this.stopWatch.bind(this), 1000);
			options.activeStopWatch = true;
			console.log("activated: " + activeMode);
		}

		if(activeMode === "timer"){
			if(options.activeTimer === true){
				return
			}
			
			this.disableArrows(true);
			
			options.updateNumbersOnScreenTimer = true;
			options.intervalIdTimer = setInterval(this.timer.bind(this), 1000);
			options.activeTimer = true;
			console.log("activated: " + activeMode);
		}

		if(activeMode === "alarm"){
			console.log("activated: " + activeMode);
		}
	}

	stop(){
		if(activeMode === "stopWatch"){
			options.activeStopWatch = null;
			clearInterval(options.intervalIdStopWatch);
		}

		if(activeMode === "timer"){
			this.disableArrows(false);
			options.activeTimer = null;
			clearInterval(options.intervalIdTimer);
		}
	}

	resetTimer(){
		
		if(activeMode === "stopWatch"){
			options.activeStopWatch = null;
			options.totalSeconds = 0;
			stopWatchSaveVar = {};
			clearInterval(options.intervalIdStopWatch);
		}

		if(activeMode === "timer"){
			options.activeTimer = null;
			timerSaveVar = {};
			this.disableArrows(false);
			clearInterval(options.intervalIdTimer);
		}
		
		this.setState({hoursValue: 0});
		this.setState({minutesValue: 0});
		this.setState({secondsValue: 0});
	}

	//Only timer and Alarm have these visible
	typeInTimerValue(node, event){
		let eventType = event.type;
		
		let hoursCurrentValue = parseInt(this.state.hoursValue);
		let minutesCurrentValue = parseInt(this.state.minutesValue);
		let secondsCurrentValue = parseInt(this.state.secondsValue);
		
		if(eventType === "click"){
			if(node.nodeName !== "SPAN"){
				node = node.children[2];
			}
			
			let nodeClassNames = node.className.split(" ");
			
			if(nodeClassNames.includes("inline-block")){
				node.classList.add("none");
				node.classList.remove("inline-block");
				node.nextElementSibling.classList.add("inline-block");
				node.nextElementSibling.classList.remove("none");
				//node.nextElementSibling.value = "";
				node.nextElementSibling.focus();
			}
			
			
			if(node.parentElement.id === "hours"){
				node.nextElementSibling.value = hoursCurrentValue.toString().padStart(2, "0");
			}
			else if(node.parentElement.id === "minutes"){
				node.nextElementSibling.value = minutesCurrentValue.toString().padStart(2, "0");
			}
			
			else if(node.parentElement.id === "seconds"){
				node.nextElementSibling.value = secondsCurrentValue.toString().padStart(2, "0");
			}
			
		}
		
		else if(eventType === "blur"){
			node.classList.add("none");
			node.classList.remove("inline-block");
			node.previousElementSibling.classList.add("inline-block");
			node.previousElementSibling.classList.remove("none");
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
				node.previousElementSibling.textContent = node.value.toString().padStart(2, "0")
			}
		}
		
		else if(eventType === "keydown"){
			let key   = event.keyCode ? event.keyCode : event.which;
			
			if(key === 13){
				node.classList.add("none");
				node.classList.remove("inline-block");
				node.previousElementSibling.classList.add("inline-block");
				node.previousElementSibling.classList.remove("none");
				node.previousElementSibling.innerHTML = node.value.padStart(2, "0");
			}
			
			else if (!( [8, 9, 27, 46, 110, 190].indexOf(key) !== -1 ||
			 (key === 65 && ( event.ctrlKey || event.metaKey  ) ) || 
			 (key >= 35 && key <= 40) ||
			 (key >= 48 && key <= 57 && !(event.shiftKey || event.altKey)) ||
			 (key >= 96 && key <= 105)
		   )) event.preventDefault();
			
		}
		
		if(activeMode === "timer"){
			timerSaveVar.hours = parseInt(this.state.hoursValue);
			timerSaveVar.minutes = parseInt(this.state.minutesValue);
			timerSaveVar.seconds = parseInt(this.state.secondsValue);
		}
		
		else if(activeMode === "alarm"){
			alarmSaveVar.hours = parseInt(this.state.hoursValue);
			alarmSaveVar.minutes = parseInt(this.state.minutesValue);
		}

	}

	setTimerValue(node){
		let hoursCurrentValue = parseInt(this.state.hoursValue);
		let minutesCurrentValue = parseInt(this.state.minutesValue);
		let secondsCurrentValue = parseInt(this.state.secondsValue);
		let value;
		
		if(node.classList[0] === "timerEditUpArrow" && node.parentElement.id === "hours"){
			if(activeMode === "timer"){
				if(hoursCurrentValue >= 99){
					value = 0;
				}
				else{
					value = hoursCurrentValue + 1;
				}
				this.setState({hoursValue: value});
			}

			else if(activeMode === "alarm"){
				if(hoursCurrentValue >= 24){
					value = 0;
				}
				else{
					value = hoursCurrentValue + 1;
				}
				this.setState({hoursValue: value});
			}
		}
		else if(node.classList[0] === "timerEditDownArrow" && node.parentElement.id === "hours"){
			if(activeMode === "timer"){
				if(hoursCurrentValue === 0){
					value = 99;
				}
				else{
					value = hoursCurrentValue - 1;
				}
				this.setState({hoursValue: value});
			}
			
			else if(activeMode === "alarm"){
				if(hoursCurrentValue === 0){
					value = 24;
				}
				else{
					value = hoursCurrentValue - 1;
				}
				this.setState({hoursValue: value});
			}
		}
		else if(node.classList[0] === "timerEditUpArrow" && node.parentElement.id === "minutes"){
			if(minutesCurrentValue === 59){
				value = 0;
			}
			else{
				value = minutesCurrentValue + 1;
			}
			this.setState({minutesValue: value});
		}
		else if(node.classList[0] === "timerEditDownArrow" && node.parentElement.id === "minutes"){
			if(minutesCurrentValue === 0){
				value = 59;
			}
			else{
				value = minutesCurrentValue - 1;
			}
			this.setState({minutesValue: value});
		}
		else if(node.classList[0] === "timerEditUpArrow" && node.parentElement.id === "seconds"){
			if(secondsCurrentValue === 59){
				value = 0;
			}
			else{
				value = secondsCurrentValue + 1;
			}
			this.setState({secondsValue: value});
		}
		else if(node.classList[0] === "timerEditDownArrow" && node.parentElement.id === "seconds"){
			if(secondsCurrentValue === 0){
				value = 59;
			}
			else{
				value = secondsCurrentValue - 1;
			}
			this.setState({secondsValue: value});
		}
		
		if(activeMode === "timer"){
			timerSaveVar.hours = hoursCurrentValue;
			timerSaveVar.minutes = minutesCurrentValue;
			timerSaveVar.seconds = secondsCurrentValue;
		}

	}

	/* Specific */

	/* StopWatch */
	stopWatch(){
		
		++options.totalSeconds;
		
		let hours = Math.floor(options.totalSeconds /3600);
		let minutes = Math.floor((options.totalSeconds - hours*3600)/60);
		let seconds = options.totalSeconds - (hours*3600 + minutes*60);
		
		if(options.updateNumbersOnScreenStopWatch === true){
			this.setState({hoursValue: hours})
			this.setState({minutesValue: minutes})
			this.setState({secondsValue: seconds})
		}
		
		else{
			hours = hours;
			minutes = minutes;
			seconds = seconds;
		}
		
		stopWatchSaveVar = {"hours": hours, "minutes": minutes, "seconds": seconds};
	}

	/* Timer */
	timer(){
		let hoursCurrentValue = parseInt(this.state.hoursValue);
		let minutesCurrentValue = parseInt(this.state.minutesValue);
		let secondsCurrentValue = parseInt(this.state.secondsValue);
		
		if(timerSaveVar.seconds == 0){
			
			if(timerSaveVar.minutes == 0){
				if(timerSaveVar.hours != 0){
					timerSaveVar.hours = timerSaveVar.hours - 1;
					timerSaveVar.minutes = 60;
					if(options.updateNumbersOnScreenTimer == true){
						this.setState({hoursValue: timerSaveVar.hours});
						this.setState({minutesValue: timerSaveVar.minutes});
					}
				}
				
				if(timerSaveVar.hours === 0 && timerSaveVar.minutes === 0 && timerSaveVar.seconds === 0){
					this.disableArrows(false);
					options.activeTimer = null;
					clearInterval(options.intervalIdTimer);
				}
			}
			
			if(timerSaveVar.minutes != 0){
				timerSaveVar.minutes = timerSaveVar.minutes - 1;
				timerSaveVar.seconds = 60;
				if(options.updateNumbersOnScreenTimer == true){
						this.setState({minutesValue: timerSaveVar.minutes});
						this.setState({secondsValue: timerSaveVar.seconds});
				}
			}
		}
		
		if(timerSaveVar.seconds != 0){
			timerSaveVar.seconds = timerSaveVar.seconds - 1;
			if(options.updateNumbersOnScreenTimer == true){
				this.setState({secondsValue: timerSaveVar.seconds});
			}
		}
		
	}

	/* Alarm */
	saveAlarmItem(){
		//Get Values from Main Clock
		let timerValues = [this.timerHours.current.innerHTML, ":", this.timerMinutes.current.innerHTML];
		
		let selectedDays = [
			{"day": "M", "selected": false},
			{"day": "D", "selected": false},
			{"day": "M", "selected": false},
			{"day": "F", "selected": false},
			{"day": "D", "selected": false},
			{"day": "S", "selected": false},
			{"day": "S", "selected": false}
		]; 
		
		alarmItemCounter++;
		
		this.setState(prevState => ({
		  alarmItemSaveVar: [...prevState.alarmItemSaveVar, {"row": alarmItemCounter,"active": true, "selected": false,"edit": false, "hours": timerValues[0], "minutes": timerValues[2], "note": "", "days": selectedDays}]
		}));
		
		console.log(this.state.alarmItemSaveVar);
		
	}

	updateAlarmItemTime(node, value){
		value = value.toString().padStart(2, "0");
		
		node.innerHTML = value;
	}

	getAlarmItemNode(node){
		let alarmItem = node;
		let alarmItemClasses = alarmItem.nodeName === "svg" ? alarmItem.className.baseVal.split(" ") : alarmItem.className.split(" ");
		
		while(!alarmItemClasses.includes("alarmItem")){
			alarmItem = alarmItem.parentElement;
			alarmItemClasses = alarmItem.nodeName === "svg" ? alarmItem.className.baseVal.split(" ") : alarmItem.className.split(" ");
		}
		
		return alarmItem;
	}

	setAlarmItemSelected(node){
		let alarmItem = this.getAlarmItemNode(node);
		let alarmItemClasses = alarmItem.className.split(" ");
		
		if(alarmItemClasses.includes("selected")){
			alarmItem.classList.remove("selected");
			this.state.alarmItemSaveVar[alarmItem.value - 1].selected = false;
		}
		else{
			alarmItem.classList.add("selected");
			this.state.alarmItemSaveVar[alarmItem.value - 1].selected = true;
		}
		console.log(this.state.alarmItemSaveVar);
	}

	setDaysSelected(node){
		let alarmItem = this.getAlarmItemNode(node);
		let nodeClassNames = node.className.split(" ");
		
		if(nodeClassNames.includes("selected")){
			node.classList.remove("selected");
			this.state.alarmItemSaveVar[alarmItem.value - 1].days[node.value].selected = false;
		}
		else{
			node.classList.add("selected");
			this.state.alarmItemSaveVar[alarmItem.value - 1].days[node.value].selected = true;
		}
		 
	}

	toggleAlarmItemActive(node, disabled){
		let alarmItem = this.getAlarmItemNode(node);
		let alarmItemClasses = alarmItem.className.split(" ");
		
		if(alarmItemClasses.includes("disabled")){
			alarmItem.classList.remove("disabled");
		}
		else{
			alarmItem.classList.add("disabled");
		
		}

		this.state.alarmItemSaveVar[alarmItem.value - 1].active = false;
	}

	toggleAlarmOptions(node, edit){
		let alarmItem = this.getAlarmItemNode(node);
		let alarmItemEditArrows = alarmItem.getElementsByClassName("alarmItemEditArrow");
		
		if(edit === true){
			node.className.baseVal = "alarmItemArrowImg opened";
			
			if(node.parentElement.className === "alarmItemDropDownArrow"){
				node.parentElement.nextElementSibling.style.display = "block";
				
				for(var i=0; i < alarmItemEditArrows.length; i++){
					alarmItemEditArrows[i].classList.remove("none");
					alarmItemEditArrows[i].classList.add("inline-block");
				}
				 
				this.state.alarmItemSaveVar[alarmItem.value - 1].edit = true;
			}
		}
		else{
			node.className.baseVal = "alarmItemArrowImg";
			
			if(node.parentElement.className === "alarmItemDropDownArrow"){
				node.parentElement.nextElementSibling.style.display = "none";
				
				for(var i=0; i < alarmItemEditArrows.length; i++){
					alarmItemEditArrows[i].classList.remove("inline-block");
					alarmItemEditArrows[i].classList.add("none");
				}
				
				
				this.state.alarmItemSaveVar[alarmItem.value - 1].edit = false;
			}
		}
	}

	editAlarmItem(node){
		let alarmItem = this.getAlarmItemNode(node);
		
		let valueInnerHTML = Number(node.parentElement.children[0].innerHTML);
		let itemValue = node.getAttribute("value");
		
		if(itemValue === "hUp"){
			let value = 0;
			if(valueInnerHTML === 24){
				value = 0;
			}
			else{
				value = valueInnerHTML + 1;
			}

			this.updateAlarmItemTime(node.parentElement.children[0], value);
			
			this.state.alarmItemSaveVar[alarmItem.value - 1].hours = node.parentElement.children[0].innerHTML;
			
		}
		
		if(itemValue === "hDown"){
			let value = 0;
			if(valueInnerHTML === 0){
				value = 24;
			}
			else{
				value = valueInnerHTML - 1;
			}

			this.updateAlarmItemTime(node.parentElement.children[0], value);
			
			this.state.alarmItemSaveVar[alarmItem.value - 1].hours = node.parentElement.children[0].innerHTML;
		}
		
		if(itemValue === "mUp"){
			let value = 0;
			if(valueInnerHTML === 59){
				value = 0;
			}
			else{
				value = valueInnerHTML + 1;
			}

			this.updateAlarmItemTime(node.parentElement.children[0], value);
			
			this.state.alarmItemSaveVar[alarmItem.value - 1].minutes = node.parentElement.children[0].innerHTML;
		}
		
		if(itemValue === "mDown"){
			let value = 0;
			if(valueInnerHTML === 0){
				value = 59;
			}
			else{
				value = valueInnerHTML - 1;
			}

			this.updateAlarmItemTime(node.parentElement.children[0], value);
			
			this.state.alarmItemSaveVar[alarmItem.value - 1].minutes = node.parentElement.children[0].innerHTML;
		}
		
	}

	saveAlarmItemNote(node){
		let alarmItem = this.getAlarmItemNode(node);
		
		this.state.alarmItemSaveVar[alarmItem.value - 1].note = node.parentElement.children[1].value;
	}

	deleteAlarmItem(){
		let reduced = this.state.alarmItemSaveVar.filter(item => item.selected != true);
		reduced.map((item, index) => item.row = index + 1)
		
		alarmItemCounter = 0;
		 
		this.setState({alarmItemSaveVar: reduced})
	}
	
	componentDidMount(){
		this.listen(document, "click", this.clickHandler.bind(this));
		this.inputNodes.forEach(inputNode => { this.listen(inputNode, "blur", this.blurHandler.bind(this)) });
		this.inputNodes.forEach(inputNode => { this.listen(inputNode, "keydown", this.keyHandler.bind(this)) });
		 
		this.printLabel(options.defaultMode);
		this.renderDefaultMode();
	}
	
	render() {
		
		let disabled = this.state.arrowsDisabled ? "disabled" : '';
		let dropUpClasses = ["timerEditUpArrow", "timerEditArrow", disabled]
		let dropDownClasses = ["timerEditDownArrow", "timerEditArrow", disabled]
		
		let dropUpNode, dropDownNode;
		dropUpNode = <DropUp classString={dropUpClasses.join(" ")}/>
		dropDownNode = <DropDown classString={dropDownClasses.join(" ")}/>
		
		let actionButtons = <div className="changeStateWrapper">
								<button className="changeState" id="startButton">Start</button>
								<button className="changeState" id="stopButton">Stop</button>
								<button className="changeState" id="resetButton">Reset</button>
							</div>
							
		let alarmItems = [];

		this.state.alarmItemSaveVar.forEach(item => {
			alarmItems.push( <Alarmitem item={item} key={item.row}/>)
		})
		
		let alarmScreen = <div id="alarmScreen" className="alarmContainer">
							<button id="alarmSaveButton" className="alarmButton">Save</button>
							<button id="alarmDeleteButton" className="alarmButton">Delete</button>
						
							<ul id="alarmItems">
								{alarmItems}
							</ul>
						</div>
		
		return(
		<div className="wrapper">
			<div className="centerWrapper">
				<h1 id="label"></h1>
				<div ref={this.timerNode} id="timer">
					<div id="hours" className="timerItem" >
						{this.state.arrowsVisible ? dropUpNode : null}{this.state.arrowsVisible ? dropDownNode : null}
						<span ref={this.timerHours} className="timerSpan inline-block">{this.state.hoursValue.toString().padStart(2, "0")}</span>
						<input ref={(input) => { this.inputNodes.push(input) }} type="text" className="timerSpanEdit none" maxLength="2"/>
						<span className="timerItemLabel">H:H</span>
					</div>
					<div id="minutes" className="timerItem" >
						{this.state.arrowsVisible ? dropUpNode : null}{this.state.arrowsVisible ? dropDownNode : null}
						<span ref={this.timerMinutes} className="timerSpan inline-block">{this.state.minutesValue.toString().padStart(2, "0")}</span>
						<input ref={(input) => { this.inputNodes.push(input) }} type="text" className="timerSpanEdit none" maxLength="2"/>
						<span className="timerItemLabel">M:M</span>
					</div>
					<div id="seconds" className="timerItem" >
						{this.state.arrowsVisible ? dropUpNode : null}{this.state.arrowsVisible ? dropDownNode : null}
						<span ref={this.timerSeconds}  className="timerSpan inline-block">{this.state.secondsValue.toString().padStart(2, "0")}</span>
						<input ref={(input) => { this.inputNodes.push(input) }} type="text" className="timerSpanEdit none" maxLength="2"/>
						<span className="timerItemLabel">S:S</span>
					</div>
					{this.state.alarmScreenVisible ? alarmScreen : null}
				</div>
				<div className="changeModeWrapper">
					<button className="changeMode" id="changeToStopWatch">Stop Watch</button>
					<button className="changeMode" id="changeToTimer">Timer</button>
					<button className="changeMode" id="changeToAlarm">Alarm</button>
				</div>
				
				{this.state.actionButtonsVisible ? actionButtons : null}	
			
			</div>
		</div>
	)}
}

function Alarmitem(props){
	
	let dropUpNode, dropDownNode;
	dropUpNode = <DropUp classString={"alarmItemEditArrowUp alarmItemEditArrow none"} value={"hUp"}/>
	dropDownNode = <DropDown classString={"alarmItemEditArrowDown alarmItemEditArrow none"} value={"hDown"}/>
	
	return(
		<div> 
		<li className="alarmItem" value={props.item.row}>
			<div className="alarmSpan">
				<span className="alarmItemSpan">{props.item.hours}</span>
				{dropUpNode}
				{dropDownNode}
			</div>
			<div className="alarmDoublePoint">
				<span className="alarmItemSpan">:</span>
			</div>
			<div className="alarmSpan">
				<span className="alarmItemSpan">{props.item.minutes}</span>
				{dropUpNode}
				{dropDownNode}
			</div>
				<button className="alarmItemActive"></button>
			<div className="alarmItemDropDownArrow">
				<svg className="alarmItemArrowImg" version="1.0" viewBox="0 0 200.000000 200.000000" preserveAspectRatio="xMidYMid meet"><g transform="translate(0.000000,200.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none"><path d="M132 1470 c-29 -27 -37 -64 -23 -98 7 -16 202 -218 434 -450 393 -393 425 -422 457 -422 32 0 64 30 463 428 376 376 428 432 433 464 6 32 2 41 -24 68 -23 23 -39 30 -68 30 -37 0 -52 -13 -404 -365 -339 -338 -368 -365 -400 -365 -32 0 -61 27 -400 365 -359 357 -367 365 -406 365 -27 0 -48 -7 -62 -20z"></path></g></svg>
			</div>
			<div className="alarmItemOptions" style={{display: "none"}}>
				<span className="alarmItemInputLabel">Note</span>
				<input className="alarmItemInput"/>
				<ul className="alarmItemDays">
					<li className="daysItem" value="0">M</li>
					<li className="daysItem" value="1">D</li>
					<li className="daysItem" value="2">M</li>
					<li className="daysItem" value="3">D</li>
					<li className="daysItem" value="4">F</li>
					<li className="daysItem" value="5">S</li>
					<li className="daysItem" value="6">S</li>
				</ul>
				<button className="alarmItemOptionsSave">Save</button>
			</div>
		</li>
		<hr className="alarmSplit"/>
	</div>
	)
	
}

function DropUp(props){
	return(
	<svg className={props.classString} value={props.value} version="1.0" xmlns="http://www.w3.org/2000/svg"
		 width="200.000000pt" height="200.000000pt" viewBox="0 0 200.000000 200.000000"
		 preserveAspectRatio="xMidYMid meet">

		<g transform="translate(0.000000,200.000000) scale(0.100000,-0.100000)"
		fill="#000000" stroke="none">
		<path d="M537 1032 c-376 -376 -428 -432 -433 -464 -6 -32 -2 -41 24 -68 23
		-23 39 -30 68 -30 37 0 52 13 404 365 339 338 368 365 400 365 32 0 61 -27
		400 -365 359 -357 367 -365 406 -365 68 0 109 59 85 118 -7 16 -202 218 -434
		450 -393 393 -425 422 -457 422 -32 0 -64 -30 -463 -428z"/>
		</g>
	</svg>
	)
}		
		
function DropDown(props){
	return(
	<svg className={props.classString} value={props.value} version="1.0" xmlns="http://www.w3.org/2000/svg"
		 width="200.000000pt" height="200.000000pt" viewBox="0 0 200.000000 200.000000"
		 preserveAspectRatio="xMidYMid meet">

		<g transform="translate(0.000000,200.000000) scale(0.100000,-0.100000)"
		fill="#000000" stroke="none">
		<path d="M132 1470 c-29 -27 -37 -64 -23 -98 7 -16 202 -218 434 -450 393
		-393 425 -422 457 -422 32 0 64 30 463 428 376 376 428 432 433 464 6 32 2 41
		-24 68 -23 23 -39 30 -68 30 -37 0 -52 -13 -404 -365 -339 -338 -368 -365
		-400 -365 -32 0 -61 27 -400 365 -359 357 -367 365 -406 365 -27 0 -48 -7 -62
		-20z"/>
		</g>
	</svg>
	)
}

export default Timer;

ReactDOM.render(
  <React.StrictMode>
    <Timer />
  </React.StrictMode>,
  document.getElementById('root')
);

