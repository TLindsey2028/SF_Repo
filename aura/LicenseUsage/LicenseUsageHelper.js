({
	initializeScreen : function(component) {
        var action = component.get("c.getPreferencesData");
        action.setCallback(this, function(response) {
            if (response.getState() === 'SUCCESS') {
                var receivedOrgData = JSON.parse(response.getReturnValue());
                component.find("selectedPackages").setOtherAttributes({availableValues: [], selectedValues : receivedOrgData.selectedPackages});
                component.set("v.preferences", {selectedPackages: receivedOrgData.selectedPackages, selectedLicenses: receivedOrgData.selectedLicenses});
                var self = this;
                setTimeout($A.getCallback(function(){
                    self.loadUserCounts(component, true);
                }),500);
            }
        });
        $A.enqueueAction(action);
	},
	loadUserCounts : function(component, addNewRow) {
	    var action = component.get("c.getLicenseUsageByPackage");
	    var licenseCounts = component.get("v.licenseRows");
        action.setParam("installedPackages", JSON.stringify(component.get("v.preferences").selectedPackages));
        action.setParam("licenseCounts", JSON.stringify(licenseCounts));
        action.setCallback(this, function(response) {
            if (response.getState() === 'SUCCESS') {
                $('.row-loading-span').addClass('hide-loading-span');
                component.set('v.licenseUsages',JSON.parse(response.getReturnValue()));
                setTimeout($A.getCallback(function(){
                    component.set('v.loading',false);
                }),250);
                if(typeof licenseCounts === "undefined" || licenseCounts === null) {
                    licenseCounts = [{packageName: '', licenseName: '', count: ''}];
                } else if(typeof licenseCounts[0].packageName !== "undefined" && licenseCounts[0].licenseName !== null && addNewRow){
                    licenseCounts.push({packageName: '', licenseName: '', count: ''});
                }
                component.set("v.licenseRows", licenseCounts);
                if(addNewRow) {
                    this.createRowComponent(component, licenseCounts.length - 1, false);
                }
            }
        });
        $A.enqueueAction(action);
    },
    createRowComponent : function(component, counter, hasDeleteButton) {
        $A.createComponent(
            "markup://Framework:LicenseRow",
            {
                licenseRow : component.get('v.licenseRows')[counter],
                licenseOptions : JSON.parse(JSON.stringify(component.get("v.preferences").selectedLicenses)), // Pass by value
                packageOptions : JSON.parse(JSON.stringify(component.get("v.preferences").selectedPackages)), // Pass by value
                group : (Date.now() * Math.random()).toString(),
                showDeleteButton : hasDeleteButton
            },
            function(licenseRowCmp, status, message) {
                var licenseRowPlaceholder = component.find("licensePlaceholder");
                var licenseRowPlaceholderBody = licenseRowPlaceholder.get("v.body");
                licenseRowCmp.set("v.licenseRow", component.get('v.licenseRows')[licenseRowPlaceholderBody.length]);
                licenseRowPlaceholderBody.push(licenseRowCmp);
                licenseRowPlaceholder.set("v.body",licenseRowPlaceholderBody);
            }
        );

    }
})