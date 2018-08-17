({
	// Your renderer method overrides go here
	afterRender : function(component,helper) {
		helper.registrationStyleArr(component);
		helper.getEventCategoryDefault(component);
		$A.run(function(){
			setTimeout(function(){
				$('#modalEventSelector').modal('show');
			},500);
		})
	}
})