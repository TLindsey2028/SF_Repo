({
	buildTimezoneObj : function(component) {
		var action = component.get('c.getEventTimezones');
		var self = this;
		action.setCallback(this,function(response){
			component.find('timezone').setSelectOptions(JSON.parse(response.getReturnValue()));
			component.find('start12hr').setSelectOptions([{"label" : "AM","value" : "AM"},{"label" : "PM","value" : "PM"}],component.get('v.durationObj').start12hr);
			component.find('end12hr').setSelectOptions([{"label" : "AM","value" : "AM"},{"label" : "PM","value" : "PM"}],component.get('v.durationObj').end12hr);
			self.buildMinArr(component,component.get('v.durationObj').startMin,component.get('v.durationObj').endMin);
			self.refreshTimeFields(component,false);
		});
		$A.enqueueAction(action);
	},
	buildHourArr : function(component,startHour,endHour) {
		var hourArr = [];
		var twentyFourHourArr = [];
		for (var counter = 0 ; counter < 24 ; counter++) {
			var counterStr = counter.toString();
			if (counter === 0) {
				this.buildTimeArr(twentyFourHourArr,counterStr,false);
			}
			else if (counter > 0 && counter < 13) {
				 this.buildTimeArr(twentyFourHourArr,counterStr,false);
				 this.buildTimeArr(hourArr,counterStr,false);
			}
			else if (counter >= 13) {
				this.buildTimeArr(twentyFourHourArr,counterStr,false);
			}
		}

		if (!$A.util.isEmpty(component.get('v.durationObj')) && component.get('v.durationObj').twentyFourHour) {
			component.find('startHour').setSelectOptions(twentyFourHourArr, twentyFourHourArr[0]);
			setTimeout($A.getCallback(function(){
				component.find('startHour').updateValue(startHour);
			}),500);
			component.find('endHour').setSelectOptions(twentyFourHourArr,endHour);
			setTimeout($A.getCallback(function(){
				component.find('endHour').updateValue(endHour);
			}),500);
		}
		else {
			component.find('startHour').setSelectOptions(hourArr, hourArr[0]);
			setTimeout($A.getCallback(function(){
				component.find('startHour').updateValue(startHour);
			}),500);
			component.find('endHour').setSelectOptions(hourArr,endHour);
			setTimeout($A.getCallback(function(){
				component.find('endHour').updateValue(endHour);
			}),500);
		}
	},
	buildMinArr : function (component,startMin,endMin) {
		var sixtyMinArr = [];
		for (var counter = 0 ; counter < 60 ; counter++) {
			var counterStr = counter.toString();

			this.buildTimeArr(sixtyMinArr,counterStr,true);
		}
		component.find('startMin').setSelectOptions(sixtyMinArr,startMin);
		component.find('endMin').setSelectOptions(sixtyMinArr,endMin);
	},
	buildTimeArr : function(baseArr,value,updateValue) {
		var label = value;
		if (value < 10) {
			label = '0' + label;
			if (updateValue) {
				value = '0'+value;
			}
		}
		baseArr.push({"label":label, "value":value});
	},
	buildStartEndDate : function(component) {
		var durObj = component.get('v.durationObj');

		var startHour = parseInt(durObj.startHour,10);
		var endHour = parseInt(durObj.endHour,10);

		if (!durObj.twentyFourHour) {
			if (durObj.start12hr === 'PM' && startHour !== 12) {
				startHour += 12;
			}
			if (durObj.end12hr === 'PM' && endHour !== 12) {
				endHour += 12;
			}
			if (durObj.start12hr === 'AM' && startHour === 12) {
				startHour = 0;
			}
			if (durObj.end12hr === 'AM' && endHour === 12) {
				endHour = 0;
			}
		}
		var startDate = new moment(durObj.startDate+' '+startHour+':'+durObj.startMin+':00','YYYY-MM-DD HH:mm:ss');
		var endDate = new moment(durObj.endDate+' '+endHour+':'+durObj.endMin+':00','YYYY-MM-DD HH:mm:ss');
		return {startDate : startDate,endDate : endDate};
	},
	buildDurationLength : function (component) {
		var errorMessages = [];
		var dateObjs = this.buildStartEndDate(component);
		var startDate = dateObjs.startDate;
		var endDate = dateObjs.endDate;
		var duration = moment.duration(endDate.diff(startDate));
		var displayYears = parseInt(duration.years(),10);
		var displayMonths = parseInt(duration.months(),10);
		var displayDays = parseInt(duration.days(),10);
		var displayHours = parseInt(duration.hours(),10);
		var displayMins = parseInt(duration.minutes(),10);
		if(startDate.format() === 'Invalid date' || endDate.format() === 'Invalid date') {
			component.find('durationErrorInput').set('v.errors', [{message: $A.get('$Label.EventApi.Invalid_Duration_Event_Builder')}]);
			return;
		}
		// Months
		if ( displayYears === 0 ) {
			component.set('v.durationYears', '');
			$A.util.removeClass(component.find('displayMonths'), "slds-text--error");
		}
		else if ( displayYears < 0) {
			errorMessages.push({
				message: component.get('v.durationYears') + ' is required'
			});
			if ( displayYears === -1 ) {
				component.set('v.durationYears', displayYears + ' ' + 'year' + ' ');
			}
			else if ( displayMonths < -1 ) {
				component.set('v.durationYears', displayYears + ' ' + 'years' + ' ');
			}
			$A.util.addClass(component.find('displayYears'), "slds-text--error");
		}
		else if ( displayYears === 1 ) {
			component.set('v.durationYears', displayYears + ' ' + 'year' + ' ');
			$A.util.removeClass(component.find('displayYears'), "slds-text--error");
		}
		else if ( displayYears > 1 ) {
			component.set('v.durationYears', displayYears + ' ' + 'years' + ' ');
			$A.util.removeClass(component.find('displayYears'), "slds-text--error");
		}
		// Months
		if ( displayMonths === 0 ) {
			component.set('v.durationMonths', '');
			$A.util.removeClass(component.find('displayMonths'), "slds-text--error");
		}
		else if ( displayMonths < 0) {
			errorMessages.push({
				message: component.get('v.durationMonths') + ' is required'
			});
			if ( displayMonths === -1 ) {
				component.set('v.durationMonths', displayMonths + ' ' + 'month' + ' ');
			}
			else if ( displayMonths < -1 ) {
				component.set('v.durationMonths', displayMonths + ' ' + 'months' + ' ');
			}
			$A.util.addClass(component.find('displayMonths'), "slds-text--error");
		}
		else if ( displayMonths === 1 ) {
			component.set('v.durationMonths', displayMonths + ' ' + 'month' + ' ');
			$A.util.removeClass(component.find('displayMonths'), "slds-text--error");
		}
		else if ( displayMonths > 1 ) {
			component.set('v.durationMonths', displayMonths + ' ' + 'months' + ' ');
			$A.util.removeClass(component.find('displayMonths'), "slds-text--error");
		}
		// Days
		if ( displayDays === 0 ) {
			component.set('v.durationDays', '');
			$A.util.removeClass(component.find('displayDays'), "slds-text--error");
		}
		else if ( displayDays < 0) {
			errorMessages.push({
          message: component.get('v.durationDays') + ' is required'
      });
			if ( displayDays === -1 ) {
				component.set('v.durationDays', displayDays + ' ' + 'day' + ' ');
			}
			else if ( displayDays < -1 ) {
				component.set('v.durationDays', displayDays + ' ' + 'days' + ' ');
			}
			$A.util.addClass(component.find('displayDays'), "slds-text--error");
		}
		else if ( displayDays === 1 ) {
			component.set('v.durationDays', displayDays + ' ' + 'day' + ' ');
			$A.util.removeClass(component.find('displayDays'), "slds-text--error");
		}
		else if ( displayDays > 1 ) {
			component.set('v.durationDays', displayDays + ' ' + 'days' + ' ');
			$A.util.removeClass(component.find('displayDays'), "slds-text--error");
		}

		// Hours
		if ( displayHours === 0 ) {
			component.set('v.durationHours', '');
			$A.util.removeClass(component.find('displayHours'), "slds-text--error");
		}
		else if ( displayHours < 0) {
			if ( displayHours === -1 ) {
				component.set('v.durationHours', displayHours + ' ' + 'hour' + ' ');
			}
			else if ( displayHours < -1 ) {
				component.set('v.durationHours', displayHours + ' ' + 'hours' + ' ');
			}
			$A.util.addClass(component.find('displayHours'), "slds-text--error");
		}
		else if ( displayHours === 1 ) {
			component.set('v.durationHours', displayHours + ' ' + 'hour' + ' ');
			$A.util.removeClass(component.find('displayHours'), "slds-text--error");
		}
		else if ( displayHours > 1 ) {
			component.set('v.durationHours', displayHours + ' ' + 'hours' + ' ');
			$A.util.removeClass(component.find('displayHours'), "slds-text--error");
		}

		// Mins
		if ( displayMins === 0 ) {
			component.set('v.durationMins', '');
			$A.util.removeClass(component.find('displayMins'), "slds-text--error");
		}
		else if ( displayMins < 0) {
			var minuteDisplay =  displayMins + ' ' + 'minutes';
			if ( displayMins === -1 ) {
				minuteDisplay =  displayMins + ' minute';
			}
			component.set('v.durationMins', minuteDisplay);
			$A.util.addClass(component.find('displayMins'), "slds-text--error");
		}
		else if ( displayMins === 1 ) {
			component.set('v.durationMins', displayMins + ' minute');
			$A.util.removeClass(component.find('displayMins'), "slds-text--error");
		}
		else if ( displayMins > 1 ) {
			component.set('v.durationMins', displayMins + ' minutes');
			$A.util.removeClass(component.find('displayMins'), "slds-text--error");
		}

		if (displayDays === 0 && displayHours === 0 && displayMins === 0) {
			component.set('v.durationHours', displayHours + ' ' + 'hours' + ' ');
		}

		this.validateDuration(component);
	},
	validateDuration : function(component) {
		var isValid = true;
		if ($A.util.isEmpty(component.get('v.durationObj').timezone)) {
			component.set('v.validated',isValid);
			return;
		}
		if ($A.util.isEmpty(component.get('v.durationObj').startDate) || component.get('v.durationObj').startDate === 'Invalid date') {
			isValid = false;
			component.find('durationErrorInput').set('v.errors',[{message : $A.get('$Label.EventApi.Invalid_Duration_Event_Builder')}]);
		}
		else {
			var dayHasError = $A.util.hasClass(component.find('displayDays'), "slds-text--error");
			var hourHasError = $A.util.hasClass(component.find('displayHours'), "slds-text--error");
			var minHasError = $A.util.hasClass(component.find('displayMins'), "slds-text--error");
			var dateObjs = this.buildStartEndDate(component);
			var startDate = dateObjs.startDate;
			var endDate = dateObjs.endDate;
			if (dayHasError || hourHasError || minHasError) {
				isValid = false;
				component.find('durationErrorInput').set('v.errors', [{message: $A.get('$Label.EventApi.Invalid_Duration_Event_Builder')}]);
			}
			else {
				component.find('durationErrorInput').set('v.errors', null);
			}
			var timezone = component.get('v.durationObj').timezone.replace(/.*?\s/, '');
			var startTimezoneTime = moment.tz(startDate.format('YYYY-MM-DD HH:mm'), timezone);
			var endTimezoneTime = moment.tz(endDate.format('YYYY-MM-DD HH:mm'), timezone);
			var durationObj = component.get('v.durationObj');
			durationObj.gmtStartTime = startTimezoneTime.tz('GMT').format();
			durationObj.gmtEndTime = endTimezoneTime.tz('GMT').format();
		}
		component.set('v.validated',isValid);
	},
    refreshTimeFields : function(component,overwriteAMPM) {
		var self = this;
        var startHour = parseInt(component.get('v.durationObj').startHour,10);
        var endHour = parseInt(component.get('v.durationObj').endHour,10);
        var start12HrValue = component.get('v.durationObj').start12hr;
        var end12HrValue = component.get('v.durationObj').end12hr;
        if (component.get('v.durationObj').twentyFourHour) {
            $A.util.addClass(component.find('start12hrContainer'), "hidden");
            $A.util.addClass(component.find('end12hrContainer'), "hidden");
            if (start12HrValue === 'PM' && startHour !== 12) {
                startHour += 12;
            }
            else if (start12HrValue === 'AM' && startHour === 12) {
                startHour = 0;
            }
            if (end12HrValue === 'PM' && endHour !== 12) {
                endHour += 12;
            }
            else if (end12HrValue === 'AM' && endHour === 12) {
                endHour = 0;
            }
        }
        else {
            $A.util.removeClass(component.find('start12hrContainer'), "hidden");
            $A.util.removeClass(component.find('end12hrContainer'), "hidden");
            if (startHour >= 12) {
                start12HrValue = 'PM';
            } else {
                start12HrValue = 'AM';
            }
            if (endHour >= 12) {
                end12HrValue = 'PM';
            } else {
                end12HrValue = 'AM';
            }
            if (startHour > 12) {
                startHour -= 12;
            }
            if (endHour > 12) {
                endHour -= 12;
            }
            if (startHour === 0) {
                startHour = 12;
            }
            if (endHour === 0) {
                endHour = 12;
            }

            if (overwriteAMPM) {
				component.find('start12hr').updateValue(start12HrValue, false);
				component.find('end12hr').updateValue(end12HrValue, false);
			}
        }
        this.buildHourArr(component,startHour.toString(),endHour.toString());
		window.setTimeout(
			$A.getCallback(function() {
				self.buildDurationLength(component);
			}), 500
		);
    }
})