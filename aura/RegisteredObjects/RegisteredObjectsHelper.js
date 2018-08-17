({
    buildLoadData : function(component) {
		var action = component.get("c.getRegisteredObjects");
		 action.setCallback(this, function(response) {
			 if (response.getState() === 'SUCCESS') {
                $('.row-loading-span').addClass('hide-loading-span');
                component.set('v.objects',JSON.parse(response.getReturnValue()));
				setTimeout($A.getCallback(function(){
					component.set('v.loading',false);
				}),250);
			 }
		 });
		 $A.enqueueAction(action);
	},
	loadExistingData : function(component,objToEditId) {
		var objToEdit = null;
		if ($A.util.isEmpty(objToEditId)) {
		    objToEdit = {};
		}
		else {
		    var objects = component.get('v.objects');
            objects.forEach(function(obj,index){
                if (obj.sObjectName === objToEditId) {
                    objToEdit = obj;
                }
            });
        }
		if (!$A.util.isUndefinedOrNull(objToEdit)) {
            var compEvents = $A.get("e.Framework:RefreshInputField");
            compEvents.setParams({group :'regObj', data : objToEdit});
            compEvents.fire();
        }
	},
	loadAllObjects : function(component) {
		var action = component.get("c.getAllObjectNames");
		 action.setCallback(this, function(response) {
			 if (response.getState() === 'SUCCESS') {
				 var objects = JSON.parse(response.getReturnValue());
				 component.set('v.availableObjects',objects);
				 component.find('sObjectName').setSelectOptions(objects,objects[0].value);
			 }
		 });
		 $A.enqueueAction(action);
	},
	buildBaseObj : function(component) {
		component.set('v.registeredObj',{});
		var compEvents = $A.get("e.Framework:RefreshInputField");
		compEvents.setParams({group : 'regObj', data : {},refresh : true});
		compEvents.fire();
	},
	validateForm : function(inputObj,component) {
		var isFormValid;
		component.find('namespace').validate();
		if (!component.find('namespace').get('v.validated')) {
			isFormValid = false;
		}
		component.find('apexClass').validate();
		if (!component.find('apexClass').get('v.validated')) {
			isFormValid = false;
		}
		if ($A.util.isUndefinedOrNull(inputObj.sObjectName)) {
			var objects = component.get('v.availableObjects');
			component.find('sObjectName').updateValue(objects[0].value);
		}
		if (typeof isFormValid === 'undefined') {
			isFormValid = true;
		}
		return isFormValid;
	},
	showModal : function(component,event,helper) {
        var modal = component.find('modalAdminObject');
        var backdrop = component.find('modalBackdrop');
        $A.util.addClass(modal,'slds-fade-in-open');
        $A.util.addClass(backdrop,'slds-backdrop--open');
    },
})