({
    getExistingSalesOrderLines : function(component) {
        var self = this;
        var action = component.get('c.getExistingSalesOrderLines');
        action.setParams({salesOrderLine : component.get('v.parentSalesOrderLine')});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                var resultObj = result.getReturnValue();
                component.set('v.salesOrderLines',resultObj);
                resultObj.forEach(function(element){
                    if (!$A.util.isUndefinedOrNull(element.form)) {
                        self.showForm(component,element);
                    }
                });
                self.updateFilterLookup(component);
                self.addTotal(component);
            }
        });
        $A.enqueueAction(action);
    },
    addTotal : function(component) {
        var solArr = [];
        component.get('v.salesOrderLines').forEach(function(element){
           solArr.push(element.salesOrderLineId)
        });
        var action = component.get('c.totalUpSalesOrderLines');
        action.setParams({sols : JSON.stringify(solArr)});
        action.setCallback(this,function(result){
            component.find('total').set('v.value',result.getReturnValue());
            var compEvent = $A.get('e.ROEApi:ScheduleItemCompTotalUpdateEvent');
            compEvent.setParams({parentSalesOrderLine : component.get('v.parentSalesOrderLine'),total : result.getReturnValue()});
            compEvent.fire();
        });
        $A.enqueueAction(action);
    },
    getPriceRule : function(component,priceRuleId,modifyDataBoolean,salesOrderItem) {
        var self = this;
        var action = component.get('c.getPriceRuleObj');
        action.setParams({priceRuleId : priceRuleId});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                component.set('v.priceRuleObj',result.getReturnValue());
                if (modifyDataBoolean) {
                    self.modifyData(component,salesOrderItem);
                }
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    createLookupField : function(component) {
        component.set('v.uniqueIdentifier',this.generateId(8));
        component.set('v.lookupFilter', "EventApi__Event__c = '" + component.get('v.event') + "' AND EventApi__Is_Active__c = true AND EventApi__Disable_Registration__c = false AND EventApi__End_Date__c >= TODAY");
        $A.createComponent('markup://Framework:InputFields',
            {
                'aura:id' : 'lookupSCItem',
                value : component.get('v.scheduleItem'),
                fieldType : 'lookup',
                group : component.get('v.uniqueIdentifier'),
                label : '',
                labelStyleClasses : 'slds-hide',
                fireChangeEvent : true,
                otherAttributes : {advanced : true , types : {
                    EventApi__Schedule_Item__c : {fieldNames :['Name','ROEApi__Event_Display_Name__c','ROEApi__Event_Name__c'] , filter : component.get('v.lookupFilter'),
                    initialLoadFilter : component.get('v.lookupFilter')+' ORDER By EventApi__Start_Date__c DESC'}
                }}
            },function(cmp) {
                cmp.set('v.value',component.get('v.scheduleItem'));
                component.set('v.scheduleItemGlobalId',cmp.getGlobalId());
                var divComponent = component.find("scheduleItemLookup");
                var divBody = divComponent.get("v.body");
                divBody.unshift(cmp);
                divComponent.set('v.body',divBody);
            });
    },
    generateId : function (len) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        for( var i=0; i < len; i++ ) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    },
    getSCItemInfo : function(component,scItem) {
        var action = component.get('c.getSCItemInfo');
        action.setParams({item : scItem});
        action.setCallback(this,function(result){
            component.set('v.ticketsAvailable', result.getReturnValue());
            $A.util.removeClass(component.find('statusSCItem'), 'slds-hidden');
            component.find('registerScheduleItemButton').set('v.disable',false);
        });
        $A.enqueueAction(action);
    },
    removeForm : function (component,formUniqueIdentifier) {
        var divComponent = component.find("form");
        var formIndex = null;
        divComponent.get('v.body').forEach(function(element,index){
            if (element.get('v.formUniqueIdentifier') === formUniqueIdentifier) {
                formIndex = index;
            }
        });

        if (!$A.util.isUndefinedOrNull(formIndex)) {
            var divBody = divComponent.get('v.body');
            divBody.splice(formIndex,1);
            divComponent.set('v.body',divBody);
            var formCompletedObj = component.get('v.formCompletedObj');
            delete formCompletedObj[formUniqueIdentifier];
            component.set('v.formCompletedObj',formCompletedObj);
            this.calculateCompleteness(component);
        }
    },
    updateFilterLookup : function(component) {
        var filter = component.get('v.lookupFilter');
        var scheduleItems = [];
        var salesOrderLines = component.get('v.salesOrderLines');
        salesOrderLines.forEach(function(element){
            if (!$A.util.isUndefinedOrNull(element.scheduleItemId)) {
                scheduleItems.push(element.scheduleItemId);
            }
        });
        if (scheduleItems.length > 0) {
            filter += " AND ID NOT IN ('"+scheduleItems.join("','")+"')";
        }
        var inputCom = $A.getComponent(component.get('v.scheduleItemGlobalId'));
        inputCom.setOtherAttributes({types : {
            EventApi__Schedule_Item__c : {fieldNames :['Name','ROEApi__Event_Display_Name__c','ROEApi__Event_Name__c'] , filter : filter,
                initialLoadFilter : filter+' ORDER By EventApi__Start_Date__c DESC'}
        },clearExisting : true});
        $A.util.addClass(component.find('statusSCItem'),'slds-hidden');
    },
    showForm : function (component,itemObj) {
        if (!$A.util.isUndefinedOrNull(itemObj.form) && itemObj.form.length > 0) {
            $A.createComponent('markup://ROEApi:Form',
                {
                    form: itemObj.form,
                    subjectId: itemObj.salesOrderLineId,
                    subjectLookupField: 'OrderApi__Sales_Order_Line__c',
                    'aura:id': itemObj.salesOrderLineId,
                    formResponseId: itemObj.formResponseId,
                    formUniqueIdentifier: itemObj.salesOrderLineId
                }, function (cmp) {
                    var divComponent = component.find("form");
                    var divBody = divComponent.get("v.body");
                    divBody.push(cmp);
                    divComponent.set('v.body', divBody);
                });
        }
    },
    calculateCompleteness : function(component) {
        var formsCompleted = true;
        var formCompletedObj = component.get('v.formCompletedObj');
        for (var property in formCompletedObj) {
            if (formCompletedObj.hasOwnProperty(property)) {
                if (!formCompletedObj[property]) {
                    formsCompleted = false;
                }
            }
        }
        var compEvent = $A.get('e.ROEApi:ScheduleItemsCompletenessUpdateEvent');
        compEvent.setParams({salesOrderLine : component.get('v.parentSalesOrderLine'),
        scheduleItemsComplete : formsCompleted});
        compEvent.fire();
    },
    handlePriceOverrideEvent : function(component) {
        var priceOverridden = false;
        component.get('v.salesOrderLines').forEach(function(element){
            if (!$A.util.isUndefinedOrNull(element.priceOverride) && element.priceOverride) {
                priceOverridden = true;
            }
        });
        if (priceOverridden) {
            $A.util.removeClass(component.find('newPriceHeading'),'slds-hidden');
        }
        else {
            $A.util.addClass(component.find('newPriceHeading'),'slds-hidden');
        }
    },
    handleFieldUpdateEvent: function(component, event) {
        if (event.getParam('fieldId') === 'lookupSCItem' && event.getParam('group') == component.get('v.uniqueIdentifier')) {
            if ($A.util.isUndefinedOrNull(component.get('v.scheduleItem').lookupSCItem) || component.get('v.scheduleItem').lookupSCItem === '') {
                component.set('v.ticketsAvailable',0);
                $A.util.addClass(component.find('statusSCItem'),'slds-hidden');
            }
            else {
                this.getSCItemInfo(component,component.get('v.scheduleItem').lookupSCItem);
            }
        }
    },
    registerScheduleItem : function(component) {
        var action = component.get('c.addScheduleItemSOL');
        action.setParams({
            item : component.get('v.scheduleItem').lookupSCItem,
            salesOrder : component.get('v.salesOrder'),
            parentSalesOrderLine : component.get('v.parentSalesOrderLine')
        })
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                var inputCom = $A.getComponent(component.get('v.scheduleItemGlobalId'));
                inputCom.clearValue();
                var salesOrderLines = component.get('v.salesOrderLines');
                salesOrderLines.push(result.getReturnValue());
                component.set('v.salesOrderLines',salesOrderLines);
                this.addTotal(component);
                this.updateFilterLookup(component);
                this.showForm(component,result.getReturnValue());
                component.find('registerScheduleItemButton').stopIndicator(true);
            }
        });
        $A.enqueueAction(action);
    },
    handleTotalUpdateEvent : function(component,event) {
        if (event.getParam('uniqueIdentifier') === component.get('v.uniqueIdentifier')) {
            this.addTotal(component);
        }
    },
    removeScheduleItem : function(component, event) {
        var action = component.get('c.deleteSalesOrderLine');
        action.setParams({salesOrderLine : event.target.dataset.salesorderline});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
        });
        $A.enqueueAction(action);
        this.removeForm(component,event.target.dataset.salesorderline);
        var salesOrderLines = component.get('v.salesOrderLines');
        salesOrderLines.splice(event.target.dataset.index,1);
        component.set('v.salesOrderLines',salesOrderLines);
        this.addTotal(component);
        this.updateFilterLookup(component);
    },
    handleFormSubmitEvent : function (component,event) {
        var formIdentifier = event.getParam('formIdentifier');
        var salesOrderLines = component.get('v.salesOrderLines');
        var hasSOL = false;
        salesOrderLines.forEach(function(element){
            if (element.salesOrderLineId === formIdentifier) {
                hasSOL = true;
            }
        });

        if (hasSOL) {
            var formCompletedObj = component.get('v.formCompletedObj');
            formCompletedObj[formIdentifier] = event.getParam('formComplete');
            component.set('v.formCompletedObj',formCompletedObj);
            this.calculateCompleteness(component);
        }

    }
})