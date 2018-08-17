/* global FontevaHelper */
({
    getSpeakers : function(component) {
        var speakers = FontevaHelper.getCacheItem(component.get('v.eventObj.id')+'_speakers');
        if (!$A.util.isEmpty(speakers) && !component.get('v.isPreview')) {
            component.set('v.speakers', speakers);
        }
        else {
            var action = component.get('c.getSpeakers');
            action.setParams({eventId: component.get('v.eventObj.id')});
            action.setCallback(this, function (result) {
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function (error) {
                        FontevaHelper.showErrorMessage(error.message);
                    });
                }
                else {
                    var speakers = result.getReturnValue();
                    component.set('v.speakers', speakers);
                    FontevaHelper.cacheItem(component.get('v.eventObj.id')+'_speakers', speakers);
                }
            });
            $A.enqueueAction(action);
        }
    },
    checkSpeakerIndex : function(component) {
        if ($A.util.isEmpty(component.get('v.speakerIndex')) || component.get('v.speakerIndex') < 0) {
            component.set('v.speakerIndex',0);
        }
    },
    prevSpeaker : function(component) {
        this.checkSpeakerIndex(component);
        var speakerIndex = parseInt(component.get('v.speakerIndex'),10);
        if (speakerIndex === 0) {
            speakerIndex = component.get('v.speakers').length - 1;
        } else {
            speakerIndex--;
        }
        var newSpeakerObj = component.get('v.speakers')[speakerIndex];
        component.set('v.speakerIndex',speakerIndex);
        this.infoFade(component);
        setTimeout($A.getCallback(function () {
            // for fade animation
            $A.util.addClass(component.find('speakerInfo'),'slds-hide');
            $A.util.removeClass(component.find('speakerInfo'),'slds-hide');
            component.set('v.speakerObj',newSpeakerObj);
        }), 150);
    },
    nextSpeaker : function(component) {
        this.checkSpeakerIndex(component);
        var speakerIndex = parseInt(component.get('v.speakerIndex'),10);
        if (speakerIndex === (component.get('v.speakers').length - 1)) {
            speakerIndex = 0;
        } else {
            speakerIndex++;
        }
        var newSpeakerObj = component.get('v.speakers')[speakerIndex];
        component.set('v.speakerIndex',speakerIndex);
        this.infoFade(component);
        setTimeout($A.getCallback(function () {
            // for fade animation
            $A.util.addClass(component.find('speakerInfo'),'slds-hide');
            $A.util.removeClass(component.find('speakerInfo'),'slds-hide');
            component.set('v.speakerObj',newSpeakerObj);
        }), 150);
    },
    openSpeakerModal : function(component, event) {
        event.preventDefault();
        if (!component.get('v.openAsModal')) {
            component.set('v.speakerObj',component.get('v.speakers')[event.currentTarget.dataset.index]);
            component.set('v.speakerIndex',event.currentTarget.dataset.index);
        }
        component.find('slds-modal--speaker').getElement().scrollTop = 0;
        $A.util.removeClass(component.find('slds-modal--speaker'),'hidden');
        $A.util.addClass(component.find('slds-modal--speaker'),'slds-fade-in-open');
        $A.util.addClass(component.find('speakerBackdrop'),'slds-backdrop--open');
        FontevaHelper.disableBodyScroll();
        setTimeout($A.getCallback(function(){
            component.find('speakerModalContent').getElement().focus();
        }),500)
    },
    infoFade : function (component) {
        var frame = component.find('speakerInfo');
        $A.util.removeClass(frame,'fadeIn');
        $A.util.addClass(frame,'fadeOut');
        setTimeout($A.getCallback(function () {
            $A.util.removeClass(frame,'fadeOut');
            $A.util.addClass(frame, 'fadeIn');
        }), 150);

    }
})