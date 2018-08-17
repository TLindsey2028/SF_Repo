({
    viewSection : function(component) {
        var viewSectionEvent = $A.get('e.LTE:ViewSectionEvent');
        viewSectionEvent.setParams({ticketId : component.get('v.ticket.id')});
        viewSectionEvent.fire();
    }
})