({
    createData: function (component) {
        var action = component.get('c.apex_createData');

        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                    component.find('createDataBtn').stopIndicator();
                });
            }
            else {
                component.find('createDataBtn').stopIndicator();
                component.find('toastMessages').showMessage('Sample Data Created Successfully.','Success');
            }
        });
        $A.enqueueAction(action);
    },

    cleanData: function (component) {
            var action = component.get('c.apex_cleanData');
            action.setCallback(this,function(result){
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function(error){
                        component.find('toastMessages').showMessage('',error.message,false,'error');
                        component.find('cleanDataBtn').stopIndicator();
                    });
                }
                else {
                    component.find('cleanDataBtn').stopIndicator();
                    this.closeModal(component);
                    component.find('toastMessages').showMessage('Sample Data Deleted Successfully.', 'Success');
                }
            });
            $A.enqueueAction(action);
        },

        fireComponentLoadedEvent : function(component) {
            var compEvent = $A.get('e.OneClick:ComponentLoadedEvent');
            compEvent.fire();
        },

        closeModal: function (component) {
            var modal = component.find('modal');
            var backdrop = component.find('backdrop');
            var b = document.body;

            $A.util.removeClass(modal, 'slds-fade-in-open');
            $A.util.removeClass(backdrop, 'slds-backdrop_open');
            b.style = 'overflow: auto';
        },

        openModal: function(component) {
            var modal = component.find('modal');
            var backdrop = component.find('backdrop');
            var b = document.body;

            $A.util.addClass(modal, 'slds-fade-in-open');
            $A.util.addClass(backdrop, 'slds-backdrop_open');
            b.style = 'overflow:hidden';
        }

})