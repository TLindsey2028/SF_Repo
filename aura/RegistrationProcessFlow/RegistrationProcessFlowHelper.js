({
    doInit : function(component,buildProgressBar) {

        window.onbeforeunload = $A.getCallback(function() {
            return $A.get('$Label.LTE.Abandon_Registration');
        });

        var self = this;
        var data = {
            steps : component.get('v.steps'),
            attendeeObj : component.get('v.attendeeObj'),
            eventObj : component.get('v.eventObj'),
            usr : component.get('v.usr'),
            siteObj : component.get('v.siteObj'),
            storeObj : component.get('v.storeObj'),
            salesOrderObj : component.get('v.salesOrderObj')
        };
        var componentsToCreate = [];
        component.get('v.steps').forEach(function(element){
            var dataToSend = _.cloneDeep(data);
            dataToSend.step = element;
            componentsToCreate.push(['LTE:RegistrationProcessStep',dataToSend]);
        });
        $A.createComponents(componentsToCreate,
            function(components, status){
                if (status === "SUCCESS") {
                    $A.util.removeClass(component.find('fontevaSLDSProgressBar'),'slds-hide');
                    FontevaHelper.showMainData();

                    if (components.length === 2) {
                        $A.util.addClass(component.find('progressWrapper'),'slds-progress--2');
                    }
                    else {
                        $A.util.addClass(component.find('progressWrapper'),'slds-progress--3');
                    }
                    var divComponent = component.find("processSteps");
                    divComponent.set("v.body",components);
                    if (buildProgressBar) {
                        self.buildProgressBar(component,component.get('v.steps'));
                    }
                }
                else if (status === "INCOMPLETE") {
                    // console.log("No response from server or client is offline.")
                }
                else if (status === "ERROR") {
                }
                $A.util.removeClass(component.find('progressBar'),'hidden');
            }
        );
    },
    buildProgressBar : function(component,steps) {
        var navSteps = [];
        var lastWasCompleted = false;
        var completedSteps = _.sumBy(steps,  function(o) {
            if (o.number === 0 && !o.isCompleted) {
                navSteps.push({'label' : o.name,'value' : o.component});
            }
            if (o.isCompleted) {
                navSteps.push({'label' : o.name,'value' : o.component});
                lastWasCompleted = true;
                return 1;
            }
            if (lastWasCompleted) {
                navSteps.push({'label' : o.name,'value' : o.component});
                lastWasCompleted = false;
            }
            return 0;
        });
        if (navSteps.length > 1) {
            component.set('v.showPicklist',true);
            if (!$A.util.isEmpty(component.find('mobileSteps'))) {
                this.suppressNavEvent = true;
                component.find('mobileSteps').setSelectOptions(navSteps,navSteps[navSteps.length -1].value);
                this.suppressNavEvent = false;
            }
        }
        else {
            component.set('v.currentStepName',navSteps[0].label);
            component.set('v.showPicklist',false);
        }

        var numberOfSteps = steps.length - 1;
        var percentagePerStep = 100 / numberOfSteps;
        var width = percentagePerStep * completedSteps;
        var bar = component.find('progressBarWidth');
        if (completedSteps > numberOfSteps) {
            width = 100;
        }
        if (!$A.util.isEmpty(bar) && !$A.util.isEmpty(bar.getElement())) {
            bar.getElement().setAttribute('style', 'width : ' + width + '%;height : 4px!important');
        }
    },
    handleRegistrationProcessChangeEvent : function(component,params) {
        if (this.changing) return;
        this.changing = true;
        var steps = component.get('v.steps');
        if (!$A.util.isUndefinedOrNull(params.salesOrderObj)) {
            component.set('v.salesOrderObj', params.salesOrderObj);
        }
        // if cart has only waitlist tickets, jump to checkout page
        var salesOrderObj = component.get('v.salesOrderObj');
        if (params.action === 'next' && _.isArray(salesOrderObj.lines) && _.isArray(salesOrderObj.waitlistEntries) && salesOrderObj.lines.length === 0 && salesOrderObj.waitlistEntries.length > 0) {
            params.action = 'jumpToStep';
            params.component = 'LTE:EventRegistrationCheckoutSummary';
        } else if (params.action === 'previous' && _.isArray(salesOrderObj.lines) && _.isArray(salesOrderObj.waitlistEntries) && salesOrderObj.lines.length === 0 && salesOrderObj.waitlistEntries.length > 0) {
            params.action = 'jumpToStep';
            params.component = 'LTE:EventRegistrationTicketSelection';
        }

        // if (!salesOrderObj.hasAtleastOneActiveAgenda) {
        //     var index = _.findIndex(steps,{component : 'LTE:'+'EventAgenda'});
        //     if (index > -1 ) {
        //         steps.splice(index, 1);
        //     }
        // }

        var stepCalculated = false;
        if (params.action === 'next') {
            this.calculateNextStep(component, steps);
            stepCalculated = true;
        }
        else if (params.action === 'previous') {
            this.calculatePreviousStep(component, steps);
            stepCalculated = true;
        }
        else if (params.action === 'jumpToStep') {
            this.calculateJumpToStep(component,steps,params.component);
            stepCalculated = true;
        }
        if (stepCalculated) {
            var currentIndex = this.getCurrentStep(component, steps);
            this.navigateToStep(component, steps[currentIndex], params.action);
            component.set('v.steps', steps);
            this.doInit(component, true);
        }
        this.changing = false;
    },
    getCurrentStep : function (component,steps) {
        return _.findIndex(steps,{isCurrentStep : true});
    },
    addStepDynamically : function (component,stepName,stepComponent,position,steps) {
        var index = _.findIndex(component.get('v.steps'),{component : stepComponent});
        if (index === -1) {
            steps.splice(position,0,{name : stepName,
                number : position,
                isCompleted : false,
                isCurrentStep : false,
                component : stepComponent})
        }

        return steps;
    },
    calculateJumpToStep : function (component,steps,component) {
        var jumpToIndex = _.findIndex(steps,{component : component});
        steps = _.map(steps,function(element,index) {
            if (jumpToIndex <= index) {
                element.isCompleted = false;
                element.isCurrentStep = false;
            } else if (jumpToIndex > index) {
                element.isCompleted = true;
                element.isCurrentStep = false;
            }
            return element;
        });
        steps[jumpToIndex].isCurrentStep = true;
        return steps;
    },
    calculatePreviousStep : function(component,steps) {
        var currentStepIndex = this.getCurrentStep(component,steps);
        steps[currentStepIndex].isCompleted = false;
        steps[currentStepIndex].isCurrentStep = false;
        steps[currentStepIndex  - 1].isCompleted = false;
        steps[currentStepIndex  - 1].isCurrentStep = true;
        return steps;
    },
    calculateNextStep : function(component,steps) {
        var currentStepIndex = this.getCurrentStep(component,steps);
        var salesOrderObj = component.get('v.salesOrderObj');
        if (component.get('v.eventObj.isSeatingEvent') && salesOrderObj.hasTicketsWithSeating) {
            this.addStepDynamically(component,$A.get('$Label.LTE.Event_Seating_Navigation'),'LTE:'+'EventRegistrationSeatingWrapper',1,steps);

        }
        else if (salesOrderObj.hasAvailablePackageItems) {
            this.addStepDynamically(component,$A.get('$Label.LTE.Event_Recommended_Items'),'LTE:'+'EventPackageItems',(steps.length - 1),steps);
        }
        steps[currentStepIndex].isCompleted = true;
        steps[currentStepIndex].isCurrentStep = false;
        steps[currentStepIndex + 1].isCurrentStep = true;
        return steps;
    },
    navigateToStep : function (component,step, action) {
        var compName = step.component;
        var compParams = {
            attendeeObj : component.get('v.attendeeObj'),
            usr: component.get('v.usr'),
            eventObj: component.get('v.eventObj'),
            siteObj: component.get('v.siteObj'),
            initialPurchase : component.get('v.initialPurchase'),
            readOnly : false,
            storeObj: component.get('v.storeObj'),
            salesOrderObj: _.cloneDeep(component.get('v.salesOrderObj')),
            identifier: 'EventRegistrationWrapper',
            direction: action
        };
        var compEvent = $A.get('e.Framework:ShowComponentEvent');
        compEvent.setParams({
            componentName: compName,
            componentParams: compParams
        });
        compEvent.fire();
    }
})