({
    updateProcessBar : function(component,nextStepCompName) {
        var steps = [];
        var compEvent = $A.get('e.LTE:RegistrationProcessChangeEvent');
        if (nextStepCompName.indexOf('EventAgenda') > -1) {
            steps = [
                {name : $A.get('$Label.LTE.Reg_Process_Select_Tickets'),number : 0,isCompleted : true,isCurrentStep : false,component : 'LTE:EventRegistrationAttendeeSelection'},
                {name : $A.get('$Label.LTE.Reg_Process_Agenda'),number : 1 ,isCompleted : false,isCurrentStep : true,component : 'LTE:EventAgenda'},
                {name : $A.get('$Label.LTE.Reg_Process_Payment'),number : 2 ,isCompleted : false,isCurrentStep : false}
            ];
            compEvent.setParams({steps : steps,salesOrderObj : component.get('v.salesOrderObj')});
            compEvent.fire();
        }
        else if (nextStepCompName.indexOf('EventRegistrationCheckoutSummary') > - 1 && component.get('v.eventObj.sessionsEnabled')) {
            steps = [
                {name : $A.get('$Label.LTE.Reg_Process_Select_Tickets'),number : 0,isCompleted : true,isCurrentStep : false,component : 'LTE:EventRegistrationAttendeeSelection'},
                {name : $A.get('$Label.LTE.Reg_Process_Agenda'),number : 1 ,isCompleted : true,isCurrentStep : false,component : 'LTE:EventAgenda'},
                {name : $A.get('$Label.LTE.Reg_Process_Payment'),number : 2 ,isCompleted : false,isCurrentStep : true}
            ];
            compEvent.setParams({steps : steps,salesOrderObj : component.get('v.salesOrderObj')});
            compEvent.fire();
        }
        else if (nextStepCompName.indexOf('EventRegistrationCheckoutSummary') > - 1) {
            steps = [
                {name : $A.get('$Label.LTE.Reg_Process_Select_Tickets'),number : 0,isCompleted : true,isCurrentStep : false,component : 'LTE:EventRegistrationAttendeeSelection'},
                {name : $A.get('$Label.LTE.Reg_Process_Payment'),number : 1 ,isCompleted : false,isCurrentStep : true}
            ];
            compEvent.setParams({steps : steps,salesOrderObj : component.get('v.salesOrderObj')});
            compEvent.fire();
        }
    }
})