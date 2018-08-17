({
    changeTab : function (component,formResponse) {
        this.findEnableDiv(component,formResponse,'tabHeader','active');
        this.findEnableDiv(component,formResponse,'formDiv','slds-hide');
    },
    findEnableDiv: function (component,formResponse,auraId,cssClass) {
        var tabs = component.find(auraId);
        if (!$A.util.isArray(tabs)) {
            tabs = [tabs];
        }

        var tabToActivate;
        tabs.forEach(function(tab){
            if (cssClass === 'slds-hide') {
                $A.util.addClass(tab, cssClass);
            }
            else {
                $A.util.removeClass(tab, cssClass);
            }
            if (tab.getElement().dataset.response === formResponse) {
                tabToActivate = tab;
            }
        });
        if (!$A.util.isUndefinedOrNull(tabToActivate)) {
            if (cssClass === 'slds-hide') {
                $A.util.removeClass(tabToActivate, cssClass);
            }
            else {
                $A.util.addClass(tabToActivate, cssClass);
            }
        }
    },
    saveForms : function (component) {
        var forms = component.find('formCmp');
        if ($A.util.isEmpty(forms)) {
            return true;
        }
        if (!$A.util.isArray(forms)) {
            forms = [forms];
        }

        var self = this;
        var validated = true;
        forms.forEach(function(form,index){
            if (!form.submitForm()) {
                self.showIconForIndex(component,form.get('v.formUniqueIdentifier'));
                validated = false;
            }
        });

        return validated;
    },
    showIconForIndex : function (component,formResponseId) {
        var errorIcons = component.find('errorIcon');
        if (!$A.util.isArray(errorIcons)) {
            errorIcons = [errorIcons];
        }
        errorIcons.forEach(function(errorIcon) {
            if (errorIcon.getElement().dataset.response === formResponseId) {
                $A.util.removeClass(errorIcon,'slds-hide');
            }
        })
    },
    closeModal : function (component) {
        $A.util.removeClass(component.find('modalContainer'),'slds-fade-in-open');
        $A.util.removeClass(component.find('attendeeBackdrop'),'slds-backdrop--open');
        FontevaHelper.enableBodyScroll();
    },
    checkFormSubmitted : function (component) {
        var formSubmitted = _.every(_.flatten([component.find('formCmp')]), function(element) {
            return element.get('v.saveStatus') === 0;
        });
        if (formSubmitted) {
           component.set('v.formsSaved',true);
        }
    },
    validateSubmitFieldsAttendeeFields : function (component) {
        try {
            component.find('firstName').validate();
            component.find('lastName').validate();
            component.find('email').validate();
            if (component.find('firstName').get('v.validated') && component.find('lastName').get('v.validated') && component.find('email').get('v.validated')) {
                var self = this;
                var updateAttendeePromise = ActionUtils.executeAction(this, component, 'c.updateAttendeeObj', {
                    attendeeJSON: JSON.stringify(component.get('v.attendeeObj')),
                    regGroupId: component.get('v.attendeeObj.regGroupId'),
                    primaryContactId: component.get('v.usr.contactId'),
                    eventId: component.get('v.eventObj.id')
                });
                updateAttendeePromise.then(
                    $A.getCallback(function (result) {
                        var attendees = result.records;
                        component.set('v.attendees', attendees);

                        var compEvent = $A.get('e.LTE:MyAttendeesLoadedEvent');
                        compEvent.setParams({attendees: attendees});
                        compEvent.fire();

                        var attendeeEvent = $A.get('e.LTE:ReloadAttendeesEvent');
                        attendeeEvent.setParams({attendees : attendees});
                        attendeeEvent.fire();
                        component.set('v.attendeeSaved',true);
                        var forms = component.find('formCmp');
                        if ($A.util.isEmpty(forms)) {
                            self.closeModal(component);
                        }
                    }));
                return true;
            }
            return false;
        }
        catch (err) {
            return false;
        }
    },
    cacheAttendeeInfo : function(component) {
        FontevaHelper.cacheItem('attendees',component.get('v.attendees'));
    }
})