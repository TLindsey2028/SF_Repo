({
    updateAssignment : function (component) {
        var action = component.get('c.updateAssignmentRole');
        action.setParams({assignmentId : component.get('v.item').assignmentId,role : component.get('v.item').role});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    component.find('toastMessages').showMessage('', error.message, false, 'error');
                });
            }
            else {

            }
        });
        $A.enqueueAction(action);
    }
})