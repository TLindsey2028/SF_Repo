({
	getPriceRules : function(component) {
		var self = this;
		var action = component.get('c.getPriceRules');
		action.setParams({sObjId : component.get('v.sObjId'),priceRuleId : component.get('v.priceRuleId'),forceCreatePriceRule : component.get('v.forceCreatePriceRule')});
		action.setCallback(this,function(result){
			if (result.getState() === 'SUCCESS') {
				self.buildPriceRulesDisplay(component,result.getReturnValue());
			}
			else {
				self.logMessages(component,result);
			}
		});
		$A.enqueueAction(action);
	},
    buildPriceRulesDisplay : function(component,priceRules) {
	    var self = this;
        if (priceRules.length > 0) {
            component.set('v.itemName',priceRules[0].itemName);
            component.set('v.sObjId', priceRules[0].itemId);
            if (!$A.util.isEmpty(priceRules[0].itemClassId) && $A.util.isEmpty(priceRules[0].itemId)) {
                component.set('v.sObjId', priceRules[0].itemClassId);
            }
        }
        self.clearUpValues(priceRules);
        component.set('v.priceRuleConfigs',priceRules);
        setTimeout($A.getCallback(function(){
            try {
                self.setActivePriceRule(component);
            }
            catch (err) {}
            self.fireComponentLoadedEvent(component);
        }),500);
    },
    clearUpValues : function(priceRules) {
	    priceRules.forEach(function(element,index){
            if (element.maxQuantity === 0) {
                   priceRules[index].maxQuantity = null;
            }
            if (element.minQuantity === 0) {
                priceRules[index].minQuantity = null;
            }
            if (element.maxNumAvailable === 0) {
                priceRules[index].maxNumAvailable = null;
            }
            if (element.limitPerAccount === 0) {
                priceRules[index].limitPerAccount = null;
            }
            if (element.limitPerContact === 0) {
                priceRules[index].limitPerContact = null;
            }
            if (element.startDate === '') {
                priceRules[index].startDate = null;
            }
            if (element.endDate === '') {
                priceRules[index].endDate = null;
            }
            if (element.id === '') {
                priceRules[index].id = null;
            }
            if (element.availableSubscriptionPlans === '') {
                priceRules[index].availableSubscriptionPlans = null;
            }

        });
    },
	logMessages : function(component,response) {
		response.getError().forEach(function(error){
			component.find('toastMessages').showMessage('',error.message,false,'error');
		});
	},
	showPriceRule : function(component,priceRuleId) {
        var compEvents = $A.get("e.Framework:ShowComponentEvent");
        compEvents.setParams({componentName: priceRuleId});
        compEvents.fire();
	},
	setActivePriceRule : function(component) {
		var items = component.find('priceRuleList').getElement().getElementsByTagName("li");
		if (items.length > 1) {
			if (component.get('v.priceRuleId') == '') {
				items[items.length - 1].setAttribute('class','active');
				this.showPriceRule(component,'FON_PR_Create');
			}
			else if ($A.util.isEmpty(component.get('v.priceRuleId'))) {
                items[0].setAttribute('class', 'active');
                this.showPriceRule(component,items[0].dataset.id.substring(0,15));
            }
			else {
				for (var i = 0 ; i < items.length ; i++)
				{
					if (items[i].dataset.id.substring(0,15) === component.get('v.priceRuleId').substring(0,15)) {
						items[i].setAttribute('class', 'active');
						this.showPriceRule(component,component.get('v.priceRuleId').substring(0,15));
						break;
					}
				}
			}
		}
		else {
			items[0].setAttribute('class','active');
			this.showPriceRule(component,items[0].dataset.id);
		}
        $A.util.removeClass(component.find('saving-span'),'saving');
        $A.util.addClass(component.find('saving-span'),'notSaving hidden');
	},
	fireComponentLoadedEvent : function(component) {
        $A.util.removeClass(component.find('mainWrapperDiv'),'hidden');
        var compEvent = $A.get('e.OrderApi:ComponentLoadedEvent');
        compEvent.fire();
    },
    savePriceRules : function(component, saveType) {
        $A.util.removeClass(component.find('saving-span'),'notSaving hidden');
        $A.util.addClass(component.find('saving-span'),'saving');
        var priceRules = component.find('priceRule');
        if (!$A.util.isArray(priceRules)) {
            priceRules = [priceRules];
        }
        var allValidated = true;
        priceRules.forEach(function(element){
            element.validate();
            if (!element.get('v.validated')) {
                allValidated = false;
            }
        });

        if (!allValidated) {
            component.find('toastMessages').showMessage('',$A.get('$Label.OrderApi.Validation_Failed_Price_Rules'),false,'error');
            $A.util.removeClass(component.find('saving-span'),'saving');
            $A.util.addClass(component.find('saving-span'),'notSaving hidden'); 
        }
        else {
            var priceRules = _.cloneDeep(component.get('v.priceRuleConfigs'));
            var priceRulesToSave = priceRules.splice(0,5);
            this.actionToSavePriceRules(component,saveType,priceRulesToSave,priceRules);
        }
    },
    actionToSavePriceRules : function (component,saveType,priceRulesToSave,priceRulesLeftToSave) {
	    var self = this;
        var action = component.get('c.savePriceRules');
        action.setParams({
            priceRulesJSON: JSON.stringify(priceRulesToSave),
            sObjId: component.get('v.sObjId'),
            newPriceRuleId: component.get('v.priceRuleId')
        });
        action.setCallback(this, function (result) {
            if (result.getState() === 'SUCCESS') {
                if ($A.util.isUndefinedOrNull(priceRulesLeftToSave) || (!$A.util.isUndefinedOrNull(priceRulesLeftToSave) && priceRulesLeftToSave.length === 0)) {
                    self.finishPriceRuleSaving(component,saveType,result.getReturnValue());
                }
                else {
                    var priceRulesToSave = priceRulesLeftToSave.splice(0,5);
                    self.actionToSavePriceRules(component,saveType,priceRulesToSave,priceRulesLeftToSave);
                }
            }
            else {
                self.logMessages(component, result);
                $A.util.removeClass(component.find('saving-span'),'saving');
                $A.util.addClass(component.find('saving-span'),'notSaving hidden');
            }
        });
        $A.enqueueAction(action);
    },
    finishPriceRuleSaving : function(component,saveType,returnValueId) {
        if (saveType === 'saveExit') {
            var navEvt = $A.get("e.force:navigateToSObject");
            if (!$A.util.isEmpty(navEvt)) {
                navEvt.setParams({
                    "recordId": component.get('v.sObjId')
                });
                navEvt.fire();
            }
            else {
                if (!$A.util.isUndefinedOrNull(component.get('v.retUrl'))) {
                    window.location = '/' + decodeURIComponent(component.get('v.retUrl'));
                } else {
                    UrlUtil.navToSObject(component.get('v.sObjId'));
                }
            }
        } else {
            if (saveType === 'save') {
                if(!$A.util.isEmpty(returnValueId)) {
                    component.set('v.priceRuleId', returnValueId);
                }
                $A.util.removeClass(component.find('saving-span'),'saving');
                $A.util.addClass(component.find('saving-span'),'notSaving hidden');
            } else if (saveType === 'saveNew') {
                component.set('v.priceRuleId', '');
                this.getPriceRules(component);
            }
            component.set('v.priceRuleConfigs',component.get('v.priceRuleConfigs'));
        }
    },
    cancelPriceRule : function (component) {
        var navEvt = $A.get("e.force:navigateToSObject");
        if (!$A.util.isEmpty(navEvt)) {
            navEvt.setParams({
                "recordId": component.get('v.sObjId')
            });
            navEvt.fire();
        }
        else {
            if (!$A.util.isUndefinedOrNull(component.get('v.retUrl'))) {
                window.location = '/' + decodeURIComponent(component.get('v.retUrl'));
            } else if (!$A.util.isUndefinedOrNull(component.get('v.sObjId'))) {
                UrlUtil.navToSObject(component.get('v.sObjId'));
            }
            else {
                window.history.back();
            }
        }
    }
})