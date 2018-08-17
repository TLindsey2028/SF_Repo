/* global _ */
({
    editSection : function(component) {
        var compEvent = $A.get('e.EventApi:CreateEditSectionEvent');
        compEvent.setParams({identifier : 'EBSections',
            section : _.cloneDeep(component.get('v.section')),
            eventQuantity : component.get('v.eventQuantity'),
            timeout : 0,
            sectionTotal : component.get('v.sectionTotal') - component.get('v.section.seats')
        });
        compEvent.fire();
    },
    deleteSectionShowModal : function (component) {
        var withSeatsRegistered = '<div class="slds-grid slds-m-bottom--small"><div class="slds-col slds-size--1-of-1 slds-grid--align-center"><img src="/resource/Framework__SLDS_Icons/icons/utility/warning_60.png" width="52" /></div></div>';

        if (component.get('v.section.registeredSeats') > 0) {
            withSeatsRegistered += '<div class="slds-grid"><div class="slds-col slds-size--1-of-1 slds-grid--align-center slds-text-heading--medium">This section cannot be deleted. There are <strong>'+component.get('v.section.registeredSeats')+'</strong> registered attendees in this section.</div></div>';
            component.find('cannotDeleteSectionPrompt').updateMessage(withSeatsRegistered);
            component.find('cannotDeleteSectionPrompt').showModal();
        }
        else {
            withSeatsRegistered += '<div class="slds-grid"><div class="slds-col slds-size--1-of-1 slds-grid--align-center slds-text-heading--medium">Are you sure you want to delete this Section?</div></div>';
            component.find('deleteSectionPrompt').updateMessage(withSeatsRegistered);
            component.find('deleteSectionPrompt').showModal();
        }
        this.showBackdrop('add');
    },
    deleteSection : function (component) {
        var self = this;
        var action = component.get('c.deleteSectionObj');
        action.setParams({section : component.get('v.section.id')});
        action.setCallback(this,function(response){
            if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                $A.enqueueAction(component.get('v.reloadSections'));
                component.find('deleteSectionPrompt').hideModal();
                component.find('cannotDeleteSectionPrompt').hideModal();
                self.showBackdrop('remove');
            }
        });
        $A.enqueueAction(action);
    },
    showBackdrop : function(operation) {
        var compEvent = $A.get('e.EventApi:AddSelectorEvent');
        compEvent.setParams({
            operation: operation,
            classes: 'slds-sidebar--modal-open',
            idTarget: ['side-nav-div', 'topNavDiv']
        });
        compEvent.fire();
    },
    closeModal : function (component) {
        component.find('deleteSectionPrompt').hideModal();
        component.find('cannotDeleteSectionPrompt').hideModal();
        this.showBackdrop('remove');
    }
})