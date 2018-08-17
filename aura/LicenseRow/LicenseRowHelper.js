({
	buildRow : function(component) {
	    component.find('packageName').setSelectOptions(component.get('v.packageOptions'));
        component.find('licenseName').setSelectOptions(component.get('v.licenseOptions'));
    }
})