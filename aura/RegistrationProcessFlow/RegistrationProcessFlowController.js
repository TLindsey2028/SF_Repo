({
    doInit : function (component,event,helper) {
        component.set('v.itemCount',0);
        helper.doInit(component,false);
    },
    rebuildSteps : function(component,event,helper) {
        helper.doInit(component,true);
    },
    handleRegistrationProcessChangeEvent : function(component,event,helper) {
        if (!component.get('v.purchaseComplete')) {
            helper.handleRegistrationProcessChangeEvent(component, event.getParams());
        }
    },
    handleRegistrationProcessSetGlobalObjectsEvent : function (component,event) {
        var attendeeObj = event.getParam('attendeeObj');
        if (attendeeObj) {
            component.set('v.attendeeObj', attendeeObj);
        }
        if (!$A.util.isEmpty(event.getParam('salesOrderObj'))) {
            component.set('v.salesOrderObj',event.getParam('salesOrderObj'));
            if($A.util.isEmpty(component.find('timerMd').get('v.body')[0])) {
                $A.createComponent('markup://LTE:RegistrationTimer',{
                    salesOrder : component.get('v.salesOrderObj.id'),
                    event : component.get('v.eventObj.id'),
                    timerLength : component.get('v.timerLength')
                },function(cmp){
                    component.find('timerMd').set('v.body',[cmp]);
                })
            }
        }
    },
    handleRegistrationProcessCompleteEvent : function(component,event,helper) {
        $A.util.addClass(component.find('timerCancel'),'slds-hide');
        component.find('timerMd').set('v.body', []);
        var steps = component.get('v.steps');
        steps = _.map(steps, function(step){
            step.isCurrentStep = false;
            step.isCompleted = true;
            return step;
        });
        component.set('v.steps', steps);
        helper.doInit(component);
        helper.buildProgressBar(component,steps);
        component.set('v.purchaseComplete',true);
    },
    fireCancelRegEvent : function() {
        var compEvent = $A.get('e.LTE:EventCancelRegistrationEvent');
        compEvent.setParams({showMainComponent : true});
        compEvent.fire();
    },
    cancelReg: function(component) {
        component.find('cancelPrompt').showModal();
    },
    handleDisableProgressFlowBarEvent : function(component, event) {
        if (event.getParam('setDisable')) {
            $A.util.addClass(component.find('fontevaSLDSProgressBar'),'slds-hide');
        } else {
            $A.util.removeClass(component.find('fontevaSLDSProgressBar'),'slds-hide');
        }
    },
    openModal : function (component, event ) {
        var compEvent = $A.get("e.LTE:EventRegistrationFlowSummaryEvent");

        compEvent.fire();

    },
    handleUpdateShoppingCartItemCountEvent : function(component, event) {
        var itemCount = component.get('v.itemCount');
        if (!$A.util.isEmpty(event.getParam('count')) && Number.isInteger(event.getParam('count'))) {
            itemCount = event.getParam('count');
            component.set('v.itemCount', itemCount);
        }
    },
    handleFieldChangeEvent : function (component,event,helper) {
        if (!helper.suppressNavEvent && event.getParam('group') === 'mobilePicklist' && event.getParam('fieldId') === 'mobileSteps' && !component.get('v.purchaseComplete')) {
            helper.handleRegistrationProcessChangeEvent(component,{component : event.getParam('value'), action : 'jumpToStep'})
        }
    }
})