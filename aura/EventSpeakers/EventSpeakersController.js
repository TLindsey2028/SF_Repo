/* global FontevaHelper */
({
    doInit : function(component,event,helper) {
        if (component.get('v.openAsModal')) {
            helper.openSpeakerModal(component, event);
        } else {
            helper.getSpeakers(component);
        }
    },
    showSpeaker : function(component,event, helper) {
        helper.openSpeakerModal(component, event);
    },
    hideSpeaker : function(component) {
        $A.util.removeClass(component.find('slds-modal--speaker'),'slds-fade-in-open');
        $A.util.addClass(component.find('slds-modal--speaker'),'hidden');
        $A.util.removeClass(component.find('speakerBackdrop'),'slds-backdrop--open');
        FontevaHelper.enableBodyScroll();
    },
    nextSpeaker : function(component,event,helper) {
        event.preventDefault();
        helper.nextSpeaker(component);
    },
    prevSpeaker : function(component,event,helper) {
        event.preventDefault();
        helper.prevSpeaker(component);
    }
})