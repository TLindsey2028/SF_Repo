({
    doTetherInit : function(component) {
        var contentDiv = '<div class="'+component.getGlobalId()+'_popover popover-wrapping-div" id="'+component.getGlobalId()+'_popover}" style="z-index: 100000;">';
        contentDiv += '<div class="slds">';
        contentDiv += '<div class="slds-m-left--small">';
        contentDiv += '<div class="popover-wrapper slds-rise-from_ground">';
        contentDiv += '<div id="help" class="slds-show">';
        contentDiv += '<div class="slds-popover slds-popover--tooltip slds-nubbin--left" role="tooltip">';
        contentDiv += '<div class="slds-popover__body slds-nubbin--left">';
        contentDiv += '<div>';
        contentDiv += '<p class="slds-tooltip--help-text">'+component.get('v.helpText')+'</p>';
        contentDiv += '</div>';
        contentDiv += '</div>';
        contentDiv += '</div>';
        contentDiv += '</div>';
        contentDiv += '</div>';
        contentDiv += '</div>';
        contentDiv += '</div>';
        contentDiv += '</div>';
        var tt = new Tooltip({
            content:  contentDiv,
            target: document.querySelector('[id="' + component.getGlobalId() + '_icon"]'),
            classes: 'tooltip-tether-arrows',
            position: 'right middle',
        });
    }
})