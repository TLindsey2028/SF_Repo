/* global FontevaHelper */
({
    doInit : function(component,event,helper) {
        // window.location.hash = 'tickets';
        var stepCount = 0;
        var ticketStep = 'EventRegistrationTicketSelection';
        if (component.get('v.eventObj.isInvitationOnly')) {
            ticketStep = 'EventRegistrationAttendeeSelection';
        }
        var steps = [
            {name : $A.get('$Label.LTE.Reg_Process_Select_Tickets'),number : stepCount,isCompleted : false,isCurrentStep : true, component : 'LTE:' + ticketStep}
        ];
        stepCount++;
        if (component.get('v.eventObj.sessionsEnabled')) {
            steps.push({name : $A.get('$Label.LTE.Reg_Process_Agenda'),number : stepCount ,isCompleted : false,isCurrentStep : false ,component : 'LTE:' + 'EventAgenda'});
            stepCount++;
        }
        steps.push({name : $A.get('$Label.LTE.Reg_Process_Payment'),number : stepCount ,isCompleted : false,isCurrentStep : false, component : 'LTE:'+'EventRegistrationCheckoutSummary'});

        if (component.get('v.eventObj.sessionsEnabled') && component.get('v.agendaOnly')) {
            steps.shift();
            steps[0].isCurrentStep = true;
            steps[0].number = 0;
            steps[1].number = 1;
        }
        component.find('regProcessFlow').set('v.steps',steps);
        component.find('regProcessFlow').rebuildSteps();
        var compName = 'markup://LTE:' + 'EventRegistrationTicketSelection';
        var data =  {
                attendeeObj : component.get('v.attendeeObj'),
                usr: component.get('v.usr'),
                eventObj: component.get('v.eventObj'),
                siteObj: component.get('v.siteObj'),
                storeObj: component.get('v.storeObj'),
                showRegisterButton : false,
                salesOrderObj: component.get('v.salesOrderObj'),
                readOnly : false
        };
        if (!$A.util.isEmpty(component.get('v.secondaryCompName'))) {
            compName = component.get('v.secondaryCompName');
            var processEvent = $A.get('e.LTE:RegistrationProcessSetGlobalObjectsEvent');
            processEvent.setParams({
                salesOrderObj: component.get('v.salesOrderObj')
            });
            processEvent.fire();
            if (compName.indexOf('EventAgenda') > -1 ) {
                data.readOnly = component.get('v.readOnly');
                data.initialPurchase = component.get('v.initialPurchase');
            } else if (compName.indexOf('EventRegistrationCheckoutSummary') > -1) {
                var paymentSuccessReturnObj = {componentName : 'markup://LTE:EventPaymentReceipt',
                    componentParams : {
                        salesOrder : component.get('v.salesOrderObj.id'),
                        identifier : 'EventWrapper'
                    }
                };
                var environmentKey = component.get('v.storeObj.environmentKey');
                if (!environmentKey) {
                    environmentKey = component.get('v.environmentKey');
                }
                if (steps.length === 3) {
                    steps[0].isCurrentStep = false;
                    steps[0].isCompleted = true;
                    steps[1].isCurrentStep = false;
                    steps[1].isCompleted = true;
                    steps[2].isCurrentStep = true;
                    steps[2].isCompleted = false;
                }
                else if (steps.length === 2) {
                    steps[0].isCurrentStep = false;
                    steps[0].isCompleted = true;
                    steps[1].isCurrentStep = true;
                    steps[1].isCompleted = false;
                }
                var returnObj = {componentName : 'markup://LTE:EventRegistrationCheckoutSummary',
                    componentParams : {
                        attendeeObj : component.get('v.attendeeObj'),
                        usr : component.get('v.usr'),
                        eventObj : component.get('v.eventObj'),
                        siteObj : component.get('v.siteObj'),
                        storeObj : component.get('v.storeObj'),
                        salesOrder : component.get('v.salesOrder'),
                        salesOrderObj : component.get('v.salesOrderObj'),
                        identifier : 'EventRegistrationWrapper'
                    }
                };
                component.find('regProcessFlow').set('v.steps',steps);
                component.find('regProcessFlow').rebuildSteps();
                data.paymentSuccessReturnObj = paymentSuccessReturnObj;
                data.salesOrderId = component.get('v.salesOrderObj.id');
                data.environmentKey = environmentKey;
                data.returnObj = returnObj;
                data.isCommunityView = true;
                data.dateFormat = component.get('v.salesOrderObj.dateFormat');
                data.showHeaderButtons = false;
                data.enableSavePayment = true;
                data.gatewayToken = component.get('v.storeObj.gateway');
                data.identifier = 'EventRegistrationWrapper';
                data.showOfflinePayment = component.get('v.storeObj.enableInvoicePayment');
            }
        }
        FontevaHelper.showComponent(component, compName, data, helper.divId, true);
    },
    handleSwitchComponent : function(component,event,helper) {
        if (event.getParam('componentParams').identifier === 'EventRegistrationWrapper') {
            var componentParams = _.cloneDeep(event.getParam('componentParams'));
            var compName = event.getParam('componentName');
            if (!$A.util.isEmpty(componentParams.secondaryCompName)) {
                compName = componentParams.secondaryCompName;
                delete componentParams.secondaryCompName;
                var processEvent = $A.get('e.LTE:RegistrationProcessSetGlobalObjectsEvent');
                processEvent.setParams({
                    salesOrderObj: componentParams.salesOrderObj
                });
                processEvent.fire();
            }
            FontevaHelper.showComponent(component, compName, componentParams,helper.divId,true);
        }
    }
})