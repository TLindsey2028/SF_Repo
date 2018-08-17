({
	buildSortable : function(component,id) {
		Sortable.create(document.querySelector('[id="' + component.getGlobalId() + '_'+id+'"]'),
			{ghostClass: "item--ghost",
				animation: 200,
				sort: true,
				draggable : '.slds-picklist__item',
				onEnd: function (/**Event*/evt) {
					var selectedValues = [];
					$('[id="' + component.getGlobalId() + '_firstList"]').children().each(function(){
						var dataId = $(this).data('id');
						component.get('v.value').forEach(function(element){
							if(element.value === dataId) {
								selectedValues.push(element);
							}
						});
					});
					component.set('v.value',selectedValues);
				}
		});
	}
})