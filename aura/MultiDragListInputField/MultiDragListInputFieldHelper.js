({
	buildSortable : function(component, id, allowSort) {
	    var selector = '[id="' + component.getGlobalId() + '_' + id + '"]';
	    var self = this;
	    var checkCreateComponent = function() {
		    if (!component.isValid()) {
		        return false;
		    }
			if ($A.util.isUndefinedOrNull(document.querySelector(selector))) {
			    return true;
			}
            self.buildSortableComponent(component, selector, allowSort);
            return false;
        }
        if (checkCreateComponent()) {
            var intervalContext = setInterval($A.getCallback(function () {
                var result = checkCreateComponent();
                if (!result) {
                    clearInterval(intervalContext);
                }
            }), 100);
        }
	},
	buildSortableComponent : function(component, selector, allowSort) {
        var firstListId = component.getGlobalId() + '_firstList';
        var secondListId = component.getGlobalId() + '_secondList';
        var toggleClasses = function(sel) {
            try {
                document.getElementById(secondListId).classList[sel]('dragdrop-dashed');
                document.getElementById(firstListId).classList[sel]('dragdrop-dashed');
            } catch(e) {
                console && console.log('Sortable component: ', e);
            }
        }
        Sortable.create(document.querySelector(selector), {
            ghostClass: "item--ghost",
            animation: 200,
            group: component.getGlobalId(),
            sort: allowSort,
            draggable: '.'+component.get('v.uniqueId'),
            onStart: $A.getCallback(function () {
                toggleClasses('add');
            }),
            onEnd: $A.getCallback(function () {
                toggleClasses('remove');
                if (!component.isValid()) {
                    return;
                }

                var secondListComponent = component.find('secondList');
                if (!secondListComponent) {
                    return;
                }

                var selectedValues = [];
                try {
                    secondListComponent.getElement().childNodes.forEach(function(element) {
                        if (!$A.util.isEmpty(element) && !$A.util.isEmpty(element.dataset) && element.dataset.id !== 'hidden') {
                            selectedValues.push({label: element.dataset.name, value: element.dataset.id});
                        }
                    });
                }
                catch (err) {
                    console && console.log('Sortable component: ', err);
                }
                component.set('v.value', selectedValues);
            })
        });
	},
	filterFields : function (component) {
		var filterText = component.find('filterFieldsInput').get('v.value');
		var options = component.find('availableOptions');
		if (!$A.util.isArray(options)) {
			options = [options];
		}

		if (!$A.util.isUndefinedOrNull(filterText) && filterText.trim().length > 0) {
			$A.util.removeClass(component.find('removeIcon'),'slds-hide');
			$A.util.addClass(component.find('searchIcon'),'slds-hide');
		}
		else {
			$A.util.removeClass(component.find('searchIcon'),'slds-hide');
			$A.util.addClass(component.find('removeIcon'),'slds-hide');
		}
		options.forEach(function(element){
		  var htmlElement = element.getElement();
		  if (!htmlElement.dataset.id || htmlElement.dataset.id === 'hidden') {
		    return;
      }
			if (htmlElement.parentElement.parentElement.id.indexOf('firstList') > -1) {
				if ($A.util.isUndefinedOrNull(filterText) || (!$A.util.isUndefinedOrNull(filterText) && filterText.trim().length === 0)) {
					$A.util.removeClass(htmlElement, 'hidden');
				}
				else if (htmlElement.dataset.name.toLowerCase().indexOf(filterText.toLowerCase().trim()) === -1) {
					$A.util.addClass(htmlElement, 'hidden');
				}
				else {
					$A.util.removeClass(htmlElement, 'hidden');
				}
			}
		});
	},
    generateId : function (len) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        for( var i=0; i < len; i++ ) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }
})