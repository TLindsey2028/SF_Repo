/* global $ */
/* global _ */
({
  showTabTab: function(component, tab) {
    var currentTab = component.get('v.currentTabOpen');

    $A.util.removeClass(component.find(currentTab+'Label'),'slds-active');
    $A.util.addClass(component.find(tab+'Label'),'slds-active');

    $A.util.removeClass(component.find(currentTab), 'slds-show');
    $A.util.addClass(component.find(currentTab), 'slds-hide');

    $A.util.addClass(component.find(tab), 'slds-show');
    $A.util.removeClass(component.find(tab), 'slds-hide');

    this.updateSharingForLookups(component);
    component.set('v.currentTabOpen',tab);
  },
  setupTimeDuration: function(component) {
    var durationObj = component.get('v.durationObj');
	var twentyFourHour = false;
    component.find('startAMPM').setSelectOptions([{"label":"", "value":""}, {"label" : "AM","value" : "AM"},{"label" : "PM","value" : "PM"}], durationObj.start12hr);
    var sixtyMinArr = [{"label":"", "value":""}];
    for (var counter = 0 ; counter < 60 ; counter++) {
      var counterStr = counter.toString();
      this.buildTimeArr(sixtyMinArr,counterStr, '');
    }
    component.find('startMin').setSelectOptions(sixtyMinArr, durationObj.startMin);
    var durationMin = _.cloneDeep(
        _.filter(sixtyMinArr, function(e) {
            return parseInt(e.value, 10) % 15 === 0;
        }));
    durationMin.unshift({"label":"", "value":""});
    component.find('durationMin').setSelectOptions(durationMin, durationObj.durationMin);
	var arrayLoopInd = (twentyFourHour) ? 24 : 12;
		var hourArr = [{"label":"", "value":""}];
		_.map(Array(arrayLoopInd), function(_, index) {
		  index++;
      var label = index < 10 ? '0' + index : index.toString();
      return {"label":label, "value":index.toString()}
    }).forEach(function(el) { hourArr.push(el)});
		var hour24Arr = [{"label":"", "value":""}];
		_.map(Array(25), function(_, index) { 
      var label = index < 10 ? '0' + index : index.toString();
      return {"label":label, "value":index.toString()}
    }).forEach(function(el) { hour24Arr.push(el)});

	if (twentyFourHour) {
        component.find('startHour').setSelectOptions(_.slice(hourArr, 0, 27), durationObj.startHour);
    } else {
        component.find('startHour').setSelectOptions(_.slice(hourArr, 0, 14), durationObj.startHour);
    }

    component.find('durationHour').setSelectOptions(hour24Arr, durationObj.durationHour);
    if (!component.get('v.durationObj').durationMin) {
        component.set('v.durationObj.durationMin', '0');
    }
    if (!component.get('v.durationObj').durationHour) {
        component.set('v.durationObj.durationHour', '0');
    }

  },
	buildTimeArr : function(baseArr, value, postfix) {
		var label = value;
		if (value < 10) {
			label = '0' + label;
		}
    if (postfix) {
      label += ' ' + postfix;
    }
		baseArr.push({"label":label, "value":value});
	},
	validateComponents: function(component, components) {
    return _.chain(components)
      .map(function(cmpName) { return component.find(cmpName) } )
      .map(function(cmp) {
        cmp.validate();
        return cmp.get('v.validated');
      }).every().value();

	},
	updateDuration: function(component) {

    if ($A.util.isEmpty(component.get('v.durationObj.durationHour')) ||
        $A.util.isEmpty(component.get('v.durationObj.durationMin')) ||
        $A.util.isEmpty(component.get('v.durationObj.startAMPM')) ||
        $A.util.isEmpty(component.get('v.durationObj.startDate')) ||
        $A.util.isEmpty(component.get('v.durationObj.startHour')) ||
        $A.util.isEmpty(component.get('v.durationObj.startMin'))) {
      component.set('v.endDateFormattedValue', '');
      return;
    }
    var eventScheduleItem = component.get('v.eventScheduleItem') || {};
    var durationObj = component.get('v.durationObj') || {};

    eventScheduleItem.startDateObj = moment(durationObj.startDate + ' ' + durationObj.startHour + ':' + durationObj.startMin + ' ' + durationObj.startAMPM, 'YYYY-MM-DD h:mm A')
    eventScheduleItem.duration = moment.duration({
        minutes: durationObj.durationMin * 1,
        hours: durationObj.durationHour * 1
    });
    var endDate = moment(eventScheduleItem.startDateObj).add(eventScheduleItem.duration);
    eventScheduleItem.endDateObj = endDate;
    component.set('v.endDateFormattedValue', endDate.format('Do MMMM YYYY  |  h:mm A'));
    component.set('v.eventScheduleItem', eventScheduleItem);
  },
  validateCurrentTab: function(component) {
    var currentTab = component.get('v.currentTabOpen');
    switch(currentTab) {
      case 'descriptionTab': return this.validateDescriptionTab(component);
      case 'attachFormTab': return true;
      case 'accountingTab': return this.validateDeferredRevenue(component) && this.validateTaxClass(component);
      default: return false;
    }
  },
  validateDescriptionTab: function(component) {
    var components = ['scheduleItemName', 'roomLocation', 'allowConflicts','quantity','price','scheduleItemDisplayName'];
    var isValid = this.validateComponents(component, components);
    if (!isValid) {
        document.getElementById('descriptionTab').scrollIntoView();
    }
      components = ['durationHour', 'durationMin', 'startAMPM', 'startDate', 'startHour','startMin'];
      var durationValidated = this.validateComponents(component, components);
      if (!durationValidated && isValid) {
          document.getElementById('eventStartDate').scrollIntoView();
      }
      isValid &= durationValidated;

    isValid &= this.validateDurationObject(component);
    isValid &= this.validateEnableWaitlist(component);
    return isValid;
  },

  validateEnableWaitlist : function(component) {
      component.find('quantity').clearErrorMessages();
      var eventScheduleItem = component.get('v.eventScheduleItem');
      if (eventScheduleItem.enableWaitlist && (isNaN(eventScheduleItem.quantity))) {
        component.find('quantity').setErrorMessages([{message : $A.get('$Label.EventApi.Event_Enable_Waitlist')}]);
        return false;
      }
      return true;
      },


  validateDurationObject : function(component) {
    var durationMin = parseInt(component.get('v.durationObj').durationMin,10);
    var durationHour = parseInt(component.get('v.durationObj').durationHour,10);
    if (!component.get('v.durationObj').durationMin) {
        durationMin = 0;
    }
    if (!component.get('v.durationObj').durationHour) {
        durationHour = 0;
    }
    if ((durationHour === 0 || $A.util.isUndefinedOrNull(durationHour)) && (durationMin === 0 || $A.util.isUndefinedOrNull(durationMin))) {
        component.find('durationHour').setErrorMessages([{message : $A.get('$Label.EventApi.Event_Duration_Validation')}]);
        return false;
    } else {
        return true;
    }
  },
  activateDeactivateField : function(component, fieldId, disable, otherAttributes) {
    if ($A.util.isEmpty(otherAttributes)) {
      otherAttributes = component.find(fieldId).get('v.otherAttributes');
    }
    otherAttributes.disabled = disable;
    component.find(fieldId).setOtherAttributes(otherAttributes,false);
  },
  getRevenueRecognitionRuleSelectOptions : function(component) {
    var action = component.get('c.getRevenueRecognitionRuleOptions');
    action.setCallback(this,function(response){
      if (response.getState() === 'SUCCESS') {
        component.find('revenueRecognitionRule').setSelectOptions(JSON.parse(response.getReturnValue()));
      }
    });
    $A.enqueueAction(action);
  },
  getRevenueRecognitionTermRuleSelectOptions : function(component) {
    var action = component.get('c.getRevenueRecognitionTermRuleOptions');
    action.setCallback(this,function(response){
      if (response.getState() === 'SUCCESS') {
        component.find('revenueRecognitionTermRule').setSelectOptions(JSON.parse(response.getReturnValue()));
      }
    });
    $A.enqueueAction(action);
  },
  validateDeferredRevenue : function(component) {
    component.find('deferredRevenueAccount').clearErrorMessages();
    var eventScheduleItem = component.get('v.eventScheduleItem') || {};
    if (eventScheduleItem.deferRevenue && ($A.util.isEmpty(eventScheduleItem.deferredRevenueAccount) ||
      eventScheduleItem.deferredRevenueAccount === '')) {
      component.find('deferredRevenueAccount').setErrorMessages([{message : 'Deferred Revenue Account Required'}]);
      return false;
    } else if (eventScheduleItem.deferRevenue && eventScheduleItem.revenueRecognitionTermRule && eventScheduleItem.revenueRecognitionTermRule === 'Flex Day') {
        if (!eventScheduleItem.flexDayOfMonth) {
            component.find('flexDayOfMonth').setErrorMessages([{message : 'Flex Day of Month Required if Revenue Recognition Term Rule is Flex Day'}]);
            return false;
        } else if (eventScheduleItem.flexDayOfMonth  <= 0 || eventScheduleItem.flexDayOfMonth > 31) {
            component.find('flexDayOfMonth').setErrorMessages([{message : 'Value must be between 1 and 31'}]);
            return false;
        }
    } else if ((eventScheduleItem.flexDayOfMonth) && (eventScheduleItem.flexDayOfMonth  <= 0 || eventScheduleItem.flexDayOfMonth > 31)) {
        component.find('flexDayOfMonth').setErrorMessages([{message : 'Value must be between 1 and 31'}]);
        return false;
    }
    return true;
  },
  validateDuration : function(component) {
    var eventScheduleItem = component.get('v.eventScheduleItem') || {};
    if (eventScheduleItem.duration) {
      if (eventScheduleItem.duration._data.hours < 0 || eventScheduleItem.duration._data.days < 0) {
        component.find('durationHour').setErrorMessages([{message : 'Value must be greater than 0'}]);
        return false;
      }
    } else {
      component.find('durationHour').setErrorMessages([{message : 'Duration is required'}]);
      return false;
    }
    return true;
  },
  validateTaxClass : function(component) {
    component.find('taxClass').clearErrorMessages();
    var eventScheduleItem = component.get('v.eventScheduleItem') || {};
    if (eventScheduleItem.isTaxable && ($A.util.isEmpty(eventScheduleItem.taxClass) ||
      eventScheduleItem.taxClass === '')) {
      component.find('taxClass').setErrorMessages([{message : 'Tax Class required if taxable is enabled'}]);
      return false;
    }
    return true;
  },
  clearDurationObj: function(component) {
    var durationObj = {
      startDateObj: '',
      endDateObj: '',
      startDate : '',
      startHour: '',
      startMin: '',
      startAMPM: '',
      durationHour: '',
      durationMin: '',
      start12hr: ''
    };
    component.set('v.durationObj', durationObj);
  },
    updateSharingForLookups : function (component) {
        component.find('taxClass').setOtherAttributes({filter : "OrderApi__Is_Tax__c = true AND OrderApi__Business_Group__c = \'"+component.get('v.eventObj.businessGroup')+"\'"},false);
        component.find('deferredRevenueAccount').setOtherAttributes({filter : "OrderApi__Business_Group__c = \'"+component.get('v.eventObj.businessGroup')+"\'"},false);
        component.find('incomeAccount').setOtherAttributes({filter : "OrderApi__Business_Group__c = \'"+component.get('v.eventObj.businessGroup')+"\'"},false);
        component.find('arAccount').setOtherAttributes({filter : "OrderApi__Business_Group__c = \'"+component.get('v.eventObj.businessGroup')+"\'"},false);
        component.find('refundAccount').setOtherAttributes({filter : "OrderApi__Business_Group__c = \'"+component.get('v.eventObj.businessGroup')+"\'"},false);
        component.find('adjustmentAccount').setOtherAttributes({filter : "OrderApi__Business_Group__c = \'"+component.get('v.eventObj.businessGroup')+"\'"},false);
    },
    createSpeakerLookup : function (component) {
      $A.createComponent('Framework:InputFields',{
          group : 'speakerTemp',
          fieldType : 'lookup',
          'aura:id' : 'speakers',
          label : 'Speaker',
          value : component.get('v.eventScheduleItem'),
          otherAttributes : {type : 'EventApi__Speaker__c',filter : "EventApi__Event__c = '"+component.get('v.eventObj.eventId')+"'",otherMethods : {maxItems : 1000}},
          helpText : 'Select a speaker for the session. Only speakers that are attached to this event will be available to select.'
      },function (cmp){
          cmp.set('v.value',component.get('v.eventScheduleItem'));
          component.set('v.speakerGlobalId',cmp.getGlobalId());
          component.find('speakerScheduleItem').set('v.body',[cmp]);
      });
    },
    getCustomFields : function (component) {
        if (!component.get('v.customFieldsFound')) {
            component.find('fieldUIApi').getFieldsFromLayout('EventApi__Schedule_Item__c');
        }
    }
})