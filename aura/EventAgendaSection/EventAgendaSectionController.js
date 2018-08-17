({
    doInit : function (component,event,helper) {
        helper.doInit(component);
    },
    toggleAccordion : function(component) {
        $A.util.toggleClass(component.find('itemListDiv'), 'hidden');
        $A.util.toggleClass(component.find('sessionChevron'), 'rotate');
    },
    handleFieldChangeEvent : function(component, event, helper) {
        if (event.getParam('group') === 'eventAgenda' && event.getParam('fieldId') === 'daySelected') {
            helper.checkDateSelected(component, event.getParam('value'));
        }
    },
    handleSectionItemEvent : function(component, event, helper) {
        if (!$A.util.isEmpty(event.getParam('itemIds'))) {
            var itemIds = _.chain(component.get('v.session.items')).map(function(item) {
                return item.id;
            }).value();
            if (_.intersection(event.getParam('itemIds'), itemIds).length > 0) {
                $A.util.removeClass(component.find('sessionDiv'), 'hidden');
            } else {
                $A.util.addClass(component.find('sessionDiv'), 'hidden');
            }
        } else {
            $A.util.addClass(component.find('sessionDiv'), 'hidden');
        }
    }
})