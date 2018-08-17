({
    saveSection : function (component) {
        if (this.validateFields(component)) {
            var self = this;
            var action = component.get('c.saveSectionObject');
            action.setParams({sectionJSON: JSON.stringify(component.get('v.section'))});
            action.setCallback(this, function (response) {
                if (response.getState() === 'ERROR') {
                    response.getError().forEach(function (error) {
                        component.find('toastMessages').showMessage('', error.message, false, 'error');
                    });
                }
                else {
                    var compEvent = $A.get('e.EventApi:ReloadSectionListing');
                    var result = response.getReturnValue();
                    component.set('v.eventQuantity', result.ticketQuantityAvailable);
                    compEvent.setParams({sections : result.sections, eventQuantity: result.ticketQuantityAvailable});
                    compEvent.fire();
                    self.closeModal(component);
                }
                component.find('saveClose').stopIndicator();
            });
            $A.enqueueAction(action);
        }
        else {
            component.find('saveClose').stopIndicator();
        }
    },
    validateFields : function (component) {
        component.find('name').validate();
        component.find('seats').validate();

        if (component.find('name').get('v.validated') && component.find('seats').get('v.validated')) {
            var seats = component.get('v.section.seats');
            if (component.get('v.eventQuantity') < (seats + component.get('v.sectionTotal'))) {
                component.find('seats').setErrorMessages([{message: 'Section capacity cannot exceed available tickets.'}]);
                return false;
            }
            return true;
        }
        return false;
    },
    setCroppingAttributes : function (component) {
        var otherAttributes = {
            maximumFileSize : 15242880,
            generatePrefix : true,
            allowedMimeTypes:["image/png","image/jpeg","image/jpg","image/gif","image/bmp","image/tiff"],
            croppingParams : {
                enableExif : true,
                enforceBoundary: false,
                viewport: {
                    width: 300,
                    height: 150,
                },
                boundary: {
                    width: 800,
                    height: 250
                }
            },
            croppingResultParams : {
                type: "blob",
                size: {width : 600, height : 300},
                format : "png",
                circle : false
            },
            allowCropping : true,
            additionalModalClass : 'banner-image-modal'
        };
        component.find('image').setOtherAttributes(otherAttributes);
    },
    handleFileUploadCropEvent : function (component,event) {
        if (event.getParam('fieldId') === 'image' || event.getParam('fieldId') === 'description') {
            if (event.getParam('action') === 'open') {
                var compEvent = $A.get('e.EventApi:AddSelectorEvent');
                compEvent.setParams({
                    operation: 'add',
                    classes: 'slds-sidebar--modal-open',
                    idTarget: ['side-nav-div', 'topNavDiv']
                });
                compEvent.fire();
            }
            else {
                var compEvent2 = $A.get('e.EventApi:AddSelectorEvent');
                compEvent2.setParams({
                    operation: 'remove',
                    classes: 'slds-sidebar--modal-open',
                    idTarget: ['side-nav-div', 'topNavDiv']
                });
                compEvent2.fire();
            }
        }
    },
    showModal : function(component) {
        var sectionsCreateEdit = component.find('sectionsCreateEdit');
        $A.util.addClass(sectionsCreateEdit, 'slds-fade-in-open');
        var modalBackdrop = component.find('modalBackdrop');
        $A.util.addClass(modalBackdrop, 'slds-backdrop--open');
        component.find('name').updateValue(component.get('v.section.name'));
        if ($A.util.isEmpty(component.get('v.section.seats')) || component.get('v.section.seats') === 0) {
            component.find('seats').updateValue(null);
        }
        else {
            component.find('seats').updateValue(component.get('v.section.seats'));
        }

        component.find('image').updateValue(component.get('v.section.image'));
        component.find('description').updateValue(component.get('v.section.description'));
        var compEvent = $A.get('e.EventApi:AddSelectorEvent');
        compEvent.setParams({operation : 'add',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
        compEvent.fire();
    },
    closeModal : function(component) {
        var sectionsCreateEdit = component.find('sectionsCreateEdit');
        $A.util.removeClass(sectionsCreateEdit, 'slds-fade-in-open');
        var modalBackdrop = component.find('modalBackdrop');
        $A.util.removeClass(modalBackdrop, 'slds-backdrop--open');
        var compEvent = $A.get('e.EventApi:AddSelectorEvent');
        compEvent.setParams({operation : 'remove',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
        compEvent.fire();
    },
    checkMakeReadonly: function(component) {
        var disabled = component.get('v.eventObj.currentEventStatus.isActive');
        var setOtherAttributes = function(that) {
            that && that.setOtherAttributes({disabled: disabled}, false);
        };
        var setDisabled = function(name) {
            _.flatten([component.find(name)]).forEach(setOtherAttributes);
        };
        ['name', 'seats', 'image', 'description', 'isEnabled'].forEach(setDisabled);
    }
})