({
    setImageAttributes : function(component) {
        component.find('imageUrl').setOtherAttributes({
            maximumFileSize : 15242880,
            allowedMimeTypes:["image/png","image/jpeg","image/jpg","image/gif","image/bmp","image/tiff"],
            croppingParams : {
                enableExif : true,
                viewport: {
                    width: 274,
                    height: 274,
                    type: 'square'
                },
                boundary: {
                    width: 400,
                    height: 400
                }
            },
            croppingResultParams : {
                type: "blob",
                size: {width : 274, height : 274},
                format : "jpeg",
                circle : false
            },
            allowCropping : true,
            additionalModalClass : 'sponsor-image-modal'});
    },
    closeModal: function(component) {
        var deleteModal = component.find('deleteModal');
        deleteModal.hideModal();

        var sponsorsModal = component.find('sponsorsModal');
        var modalBackdrop = component.find('modalBackdrop');
        $A.util.removeClass(sponsorsModal, 'slds-fade-in-open');
        $A.util.removeClass(modalBackdrop, 'slds-backdrop--open');


        var compEvent = $A.get('e.EventApi:AddSelectorEvent');
        compEvent.setParams({operation : 'remove',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
        compEvent.fire();
    },
    openModal: function(component) {
        var sponsorsModal = component.find('sponsorsModal');
        var modalBackdrop = component.find('modalBackdrop');
        $A.util.addClass(sponsorsModal, 'slds-fade-in-open');
        $A.util.addClass(modalBackdrop, 'slds-backdrop--open');

        var modalBody = document.getElementById("sponsorBody");
        modalBody.scrollTop = 0;

        var compEvent = $A.get('e.EventApi:AddSelectorEvent');
        compEvent.setParams({operation : 'add',classes : 'slds-sidebar--modal-open',idTarget :['side-nav-div','topNavDiv']});
        compEvent.fire();
        var self = this;
        setTimeout($A.getCallback(function(){
            self.getCustomFields(component);
        }),2000);
    },
    fetchAdditionalFields: function(component) {
        var action = component.get('c.getAdditionalSponsorFields');
        action.setCallback(this, function(response) {
            var fields = response.getReturnValue() || [];
            component.set('v.additionalFields', fields);

        });
        $A.enqueueAction(action);
    },
    getSponsors : function (component) {
        var action = component.get('c.getSponsors');
        action.setParams({eventId: component.get('v.eventObj.eventId')});
        action.setCallback(this,function(response){
            component.set('v.eventObj.sponsors',JSON.parse(response.getReturnValue()));
            $A.util.addClass(component.find('loader'), 'hidden');
            $A.util.removeClass(component.find('mainBody'), 'hidden');
            this.getCustomFields(component);
        });
        $A.enqueueAction(action);
    },
    getCustomFields : function (component) {
        if (!component.get('v.customFieldsFound')) {
            component.find('fieldUIApi').getFieldsFromLayout('EventApi__Sponsor__c');
        }
    }
})