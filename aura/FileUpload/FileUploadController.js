({
	doInit : function(component,event,helper) {
        helper.doInit(component);
	},
	uploadFileToServer : function(component,event,helper) {
		helper.uploadFileToServer(component,event);
	},
	setErrorMessages : function(component,event,helper) {
		helper.setErrorMessages(component,event);
	},
    handleInputFieldClearErrorMessagesEvent : function(component,event) {
        if (event.getParam('fieldId') === component.getGlobalId()) {
            var inputCom = component.find('errorInput');
            inputCom.hideMessages();
        }
    },
	uploadFile : function(component,event,helper) {
		document.getElementById(component.getGlobalId() +'_file').click();
		var inputCom = component.find('errorInput');
		inputCom.hideMessages();
	},
	saveUrl : function(component,event,helper) {
		helper.saveUrl(component,event);
	},
	loadExistingValue : function(component,event,helper) {
		helper.loadExistingValue(component);
	},
	clearExistingValue : function(component,event,helper) {
		try {
			helper.clearExistingValue(component);
			var inputCom = component.find('errorInput');
			inputCom.hideMessages();
		}
		catch (err) {

		}
	},
    closeModal : function(component,event,helper) {
       helper.closeModal(component);
	},
    openLightBox : function (component,event,helper) {
		helper.openLightBox(component);
	},
	saveCroppedFiled : function(component) {

	}
})