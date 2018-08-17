({
    doInit : function (component) {
        var step = component.get('v.step');
        if (step.isCompleted) {
            $A.util.addClass(component.find('stepItem'),'slds-is-completed"');
            $A.util.addClass(component.find('stepButton'),'slds-is-completed slds-button--icon slds-progress__marker--icon');
        }
        else {
            $A.util.removeClass(component.find('stepItem'),'slds-is-completed"');
            $A.util.removeClass(component.find('stepButton'),'slds-is-completed slds-button--icon slds-progress__marker--icon');
        }
        if (step.isCurrentStep) {
            $A.util.addClass(component.find('stepItem'),'fonteva-slds-current-step');
            $A.util.addClass(component.find('stepButton'),'fonteva-slds-current-step');
            $A.util.removeClass(component.find('stepItem'),'slds-is-completed');
            $A.util.removeClass(component.find('stepButton'),'slds-is-completed slds-button--icon slds-progress__marker--icon');
        }
    },
    changeStep : function (component) {
        if (component.get('v.step.isCompleted')) {
            var currentStep = component.get('v.step');
            var processEvent = $A.get('e.LTE:RegistrationProcessChangeEvent');
            processEvent.setParams({action : 'jumpToStep',component : currentStep.component,salesOrderObj : component.get('v.salesOrderObj')});
            processEvent.fire();
        }
    },
    handleChangeStep : function (component, event) {
        var stepId = event.getParam('stepId');
        var fireShowComponentEvent = $A.util.isEmpty(event.getParam('fireShowComponentEvent')) ? true : event.getParam('fireShowComponentEvent');
        var initialPurchase = $A.util.isEmpty(event.getParam('initialPurchase')) ? true : event.getParam('initialPurchase');

        //If Agenda is first step (while navigating through manage my reg)
        if (!$A.util.isEmpty(component.get('v.steps')) && component.get('v.steps').length === 2) {
            stepId += 1;
        }
        if (stepId === component.get('v.step.number')) {
            this.changeStep(component, fireShowComponentEvent, initialPurchase);
        }
    }
})