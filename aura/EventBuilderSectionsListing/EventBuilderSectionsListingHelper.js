/* global $ */
/* global _ */
/* global Sortable */
({
    doInit : function(component) {
      this.loadSections(component);
    },
    loadSections : function(component) {
        var action = component.get('c.getSections');
        action.setParams({eventId : component.get('v.eventId')});
        action.setCallback(this,function(response){
            if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                var result = response.getReturnValue();
                component.set('v.sections', result.sections);
                component.set('v.eventQuantity', result.ticketQuantityAvailable || 0);
                this.calculateTotalCapacity(component);
                this.buildSectionComps(component);
            }
        });
        $A.enqueueAction(action);
    },
    addNewSection : function (component) {
        var action = component.get('c.createNewSection');
        action.setParams({eventId : component.get('v.eventId')});
        action.setCallback(this,function(response){
            if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                var section = response.getReturnValue();
                if (section.id === '') {
                    section.id = null;
                }
                section.displayOrder = component.get('v.sections').length +1;
                var compEvent = $A.get('e.EventApi:CreateEditSectionEvent');
                compEvent.setParams({
                    identifier : 'EBSections',
                    section : section,
                    timeout : 0,
                    sectionTotal : component.get('v.sectionTotal'),
                    eventQuantity : component.get('v.eventQuantity')
                });
                compEvent.fire();
            }
        });
        $A.enqueueAction(action);
    },
    buildSectionComps : function (component) {
        var self = this;
        if (component.get('v.sections').length === 0) {
            var divComponent = component.find("sectionListings");
            divComponent.set("v.body", []);
            $A.util.addClass(component.find('loader'), 'hidden');
            $A.util.removeClass(component.find('mainBody'), 'hidden');
        }
        else {
            var componentsToCreate = [];
            component.set('v.sectionTotal',_.sumBy(component.get('v.sections'), 'seats'));
            component.get('v.sections').forEach(function (element) {
                componentsToCreate.push(['EventApi:EventBuilderSection', {section: element,
                    eventObj: _.cloneDeep(component.get('v.eventObj')),
                    reloadSections : component.get('c.doInit'),
                    eventQuantity : component.get('v.eventQuantity'),
                    sectionTotal : component.get('v.sectionTotal')}])
            });
            $A.createComponents(componentsToCreate,
                function (components, status) {
                    if (status === "SUCCESS") {
                        var divComponent2 = component.find("sectionListings");
                        divComponent2.set("v.body", components);
                        $A.util.addClass(component.find('loader'), 'hidden');
                        $A.util.removeClass(component.find('mainBody'), 'hidden');
                        setTimeout($A.getCallback(function(){
                            self.sortableOrder(component);
                        }),250)
                    }
                });
        }
    },
    sortableOrder : function(component) {
        var self = this;
        if (!$A.util.isEmpty(document.getElementById('sectionsContainers'))) {
            Sortable.create(document.getElementById('sectionsContainers'), {
                ghostClass: "item--ghost",
                animation: 200,
                draggable: '.event-section',
                onEnd: $A.getCallback(function () {
                    var existingSteps = [];
                    var displayOrderArray = [];
                    $('#sectionsContainers').children().each(function (index) {
                        var stepRowId = $(this).data('id');
                        if (stepRowId !== null && $.inArray(stepRowId, existingSteps) === -1) {
                            displayOrderArray.push({'id': stepRowId, 'index': index});
                            existingSteps.push(stepRowId);
                        }
                    });
                    self.updateDisplayOrder(component, displayOrderArray);
                })
            });
        }
    },
    updateDisplayOrder : function(component, displayOrderArray) {
        var action = component.get('c.updateEventSectionDisplayOrder');
        action.setParams({
            'displayOrderObjJSON' : JSON.stringify(displayOrderArray)
        });
        action.setCallback(this,function(response){
            if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error) {
                    component.find('toastMessages').showMessage('', error.message,false,'error','topCenter');
                });
            }
        });
        $A.enqueueAction(action);
    },
    calculateTotalCapacity : function (component) {
        var showWarning = false;
        var sections = component.get('v.sections');
        component.set('v.sectionTotal',_.sumBy(sections, 'seats'));

        var compEvent = $A.get('e.EventApi:EventBuilderSidebarEvent');
        if (!$A.util.isEmpty(component.get('v.eventQuantity')) && !$A.util.isEmpty(component.get('v.sectionTotal'))) {
            showWarning = component.get('v.eventQuantity') !== component.get('v.sectionTotal');
        }
        if ($A.util.isEmpty(sections) || sections.length === 0) {
            showWarning = false;
        }
        compEvent.setParams({
          id: 'seatings',
          hasWarning : showWarning
        });
        compEvent.fire();

    },
    updateNewButtonStatus: function (component) {
       var newButton = component.find('newSectionButton');
       if (component.get('v.eventObj.currentEventStatus.isActive')) {
           newButton.getElement().setAttribute('disabled', 'disabled');
       } else {
           newButton.getElement().removeAttribute('disabled');
       }
    }

})