({
	doInit : function(component, event, helper) {
		helper.buildLoadData(component);
		component.set('v.renderModal',false);
		helper.getLabelStrings(component);
	},
	nextPage : function(component, event, helper) {
		event.preventDefault();
		var currentPage = component.get("v.currentPageNum");
		var totalPages = component.get("v.totalPages");
		currentPage++;
		if (currentPage <= totalPages) {
			component.set('v.currentPageNum', currentPage);
			helper.loadPage(component);
		}
	},
	previousPage : function(component, event, helper) {
		event.preventDefault();
		var currentPage = component.get("v.currentPageNum");
		if (currentPage > 1) {
			currentPage--;
			component.set('v.currentPageNum', currentPage);
			helper.loadPage(component);
		}
	},
	showModal : function(component,event,helper) {
		var currentInstallingPackage = event.currentTarget.dataset.id;
		var applications = component.get("v.AllpackagesMap");
		var installType = event.currentTarget.dataset.type;
		var installingPackage = applications[currentInstallingPackage];
		if (!$A.util.isUndefinedOrNull(installingPackage)) {
			installingPackage.installType = installType;
			component.set('v.installingPackage', installingPackage);
			component.set('v.renderModal',true);
			$('#modalUploadPackage').modal('show');
		}
	},
	install : function(component, event, helper) {
		event.preventDefault();
		helper.installPackage(component, event);
	},
	showReleaseNotes : function(component,event,helper) {
		event.preventDefault();
		var applications = component.get("v.AllpackagesMap");
		var releaseNotePackage = applications[event.currentTarget.dataset.id];
		if (!$A.util.isUndefinedOrNull(releaseNotePackage)) {
		if (releaseNotePackage.releaseNotesUrl == null ||
			releaseNotePackage.releaseNotesUrl === '' ||
			releaseNotePackage.releaseNotesUrl === 'undefined') { // per Kruti, the string literal "undefined" might come back from Mongo.
			var releaseNotes = releaseNotePackage.releaseNotes;
			releaseNotes.forEach(function(element){
				element.versionNumber = element.version.replace('\.','');
			});
			component.set('v.releaseNotes',releaseNotes);
			component.set('v.packageName',releaseNotePackage.name);
			$('#releaseNotesModal').modal('show');
		}
		else{
		    window.open(releaseNotePackage.releaseNotesUrl);
        }
		}
	},
	showComponent : function(component, event, helper) {
        var compEvents = $A.get("e.Framework:ShowComponentEvent");
        compEvents.setParams({ componentName : event.currentTarget.dataset.name,settingId : event.currentTarget.dataset.id });
        compEvents.fire();
    }
})