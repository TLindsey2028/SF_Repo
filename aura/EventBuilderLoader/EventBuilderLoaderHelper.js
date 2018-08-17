({
    showLoadingIconClass: function(container, type, items) {
        for (var element in items) {
            $A.util.removeClass(container, items[element]);
        }
        $A.util.addClass(container, type);
    },
    showFillIconClass: function(container, type, items) {
        for (var element in items) {
            $A.util.removeClass(container, items[element] + '-fill');
        }
        $A.util.addClass(container, type + '-fill');
    },
    fill: function(component, type) {
        var container = component.find('container');
        var items = component.get('v.items');
        this.showFillIconClass(container, type, items);
    },
    showThumbnail: function(component, type) {
        var icon = component.find(type);
        $A.util.addClass(icon, 'animate init');
    },
    draw: function(component) {
        var type = component.get('v.type');
        var displayText = component.get('v.displayText');
        var container = component.find('container');
        var items = component.get('v.items');
        this.showLoadingIconClass(container, type, items);
        component.set('v.loadState', $A.get("$Label.EventApi.Building_Event_Loader") + ' ' + displayText + $A.get("$Label.EventApi.Ellipsis_Event_Builder"));
    },
    close: function(component) {
        var type = component.get('v.type');
        component.find('event-' + type).displaySVG('event-' + type);
        this.fill(component, type);
        this.showThumbnail(component, type);
    },
    showEventCompleteScreen: function(component) {
        var loadFrame = component.find('loaderFrame');
        $A.util.addClass(loadFrame, 'close-loader');
        var compEvent = $A.get('e.EventApi:CompleteLoaderEvent');
        compEvent.fire();
        setTimeout($A.getCallback(function() {
            loadFrame = component.find('loaderFrame');
            $A.util.addClass(loadFrame, 'hidden');
        }), 2000);
    },
})