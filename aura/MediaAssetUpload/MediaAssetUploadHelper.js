/* global $ */
/* global Clipboard */
({
   mimeTypes : {
        "ai":"application/postscript",
        "aif":"audio/x-aiff",
        "aifc":"audio/x-aiff",
        "aiff":"audio/x-aiff",
        "asc":"text/plain",
        "atom":"application/atom+xml",
        "au":"audio/basic",
        "avi":"video/x-msvideo",
        "bcpio":"application/x-bcpio",
        "bin":"application/octet-stream",
        "bmp":"image/bmp",
        "cdf":"application/x-netcdf",
        "cgm":"image/cgm",
        "class":"application/octet-stream",
        "cpio":"application/x-cpio",
        "cpt":"application/mac-compactpro",
        "csh":"application/x-csh",
        "css":"text/css",
        "dcr":"application/x-director",
        "dif":"video/x-dv",
        "dir":"application/x-director",
        "djv":"image/vnd.djvu",
        "djvu":"image/vnd.djvu",
        "dll":"application/octet-stream",
        "dmg":"application/octet-stream",
        "dms":"application/octet-stream",
        "doc":"application/msword",
        "docx":"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "dtd":"application/xml-dtd",
        "dv":"video/x-dv",
        "dvi":"application/x-dvi",
        "dxr":"application/x-director",
        "eot":"application/vnd.ms-fontobject",
        "eps":"application/postscript",
        "etx":"text/x-setext",
        "exe":"application/octet-stream",
        "ez":"application/andrew-inset",
        "gif":"image/gif",
        "gram":"application/srgs",
        "grxml":"application/srgs+xml",
        "gtar":"application/x-gtar",
        "hdf":"application/x-hdf",
        "hqx":"application/mac-binhex40",
        "htm":"text/html",
        "html":"text/html",
        "ice":"x-conference/x-cooltalk",
        "ico":"image/x-icon",
        "ics":"text/calendar",
        "ief":"image/ief",
        "ifb":"text/calendar",
        "iges":"model/iges",
        "igs":"model/iges",
        "jnlp":"application/x-java-jnlp-file",
        "java":"text/x-java-source,java",
        "jp2":"image/jp2",
        "jpe":"image/jpeg",
        "jpeg":"image/jpeg",
        "jpg":"image/jpeg",
        "js":"application/x-javascript",
        "kar":"audio/midi",
        "latex":"application/x-latex",
        "lha":"application/octet-stream",
        "lzh":"application/octet-stream",
        "m3u":"audio/x-mpegurl",
        "m4a":"audio/mp4a-latm",
        "m4b":"audio/mp4a-latm",
        "m4p":"audio/mp4a-latm",
        "m4u":"video/vnd.mpegurl",
        "m4v":"video/x-m4v",
        "mac":"image/x-macpaint",
        "man":"application/x-troff-man",
        "mathml":"application/mathml+xml",
        "me":"application/x-troff-me",
        "mesh":"model/mesh",
        "mid":"audio/midi",
        "midi":"audio/midi",
        "mif":"application/vnd.mif",
        "mov":"video/quicktime",
        "movie":"video/x-sgi-movie",
        "mp2":"audio/mpeg",
        "mp3":"audio/mpeg",
        "mp4":"video/mp4",
        "mpe":"video/mpeg",
        "mpeg":"video/mpeg",
        "mpg":"video/mpeg",
        "mpga":"audio/mpeg",
        "ms":"application/x-troff-ms",
        "msh":"model/mesh",
        "mxu":"video/vnd.mpegurl",
        "nc":"application/x-netcdf",
        "oda":"application/oda",
        "ogg":"application/ogg",
        "pbm":"image/x-portable-bitmap",
        "pct":"image/pict",
        "pdb":"chemical/x-pdb",
        "pdf":"application/pdf",
        "pgm":"image/x-portable-graymap",
        "pgn":"application/x-chess-pgn",
        "pic":"image/pict",
        "pict":"image/pict",
        "png":"image/png",
        "pnm":"image/x-portable-anymap",
        "pnt":"image/x-macpaint",
        "pntg":"image/x-macpaint",
        "ppm":"image/x-portable-pixmap",
        "ppt":"application/vnd.ms-powerpoint",
        "pptx":"application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "ps":"application/postscript",
        "qt":"video/quicktime",
        "qti":"image/x-quicktime",
        "qtif":"image/x-quicktime",
        "ra":"audio/x-pn-realaudio",
        "ram":"audio/x-pn-realaudio",
        "ras":"image/x-cmu-raster",
        "rdf":"application/rdf+xml",
        "rgb":"image/x-rgb",
        "rm":"application/vnd.rn-realmedia",
        "roff":"application/x-troff",
        "rtf":"text/rtf",
        "rtx":"text/richtext",
        "sgm":"text/sgml",
        "sgml":"text/sgml",
        "sh":"application/x-sh",
        "shar":"application/x-shar",
        "silo":"model/mesh",
        "sit":"application/x-stuffit",
        "skd":"application/x-koan",
        "skm":"application/x-koan",
        "skp":"application/x-koan",
        "skt":"application/x-koan",
        "smi":"application/smil",
        "smil":"application/smil",
        "snd":"audio/basic",
        "so":"application/octet-stream",
        "spl":"application/x-futuresplash",
        "src":"application/x-wais-source",
        "srt":"text/srt",
        "sv4cpio":"application/x-sv4cpio",
        "sv4crc":"application/x-sv4crc",
        "svg":"image/svg+xml",
        "swf":"application/x-shockwave-flash",
        "sql":"text/sql",
        "t":"application/x-troff",
        "tar":"application/x-tar",
        "tcl":"application/x-tcl",
        "tex":"application/x-tex",
        "texi":"application/x-texinfo",
        "texinfo":"application/x-texinfo",
        "tif":"image/tiff",
        "tiff":"image/tiff",
        "tff":"application/x-font-ttf",
        "tr":"application/x-troff",
        "tsv":"text/tab-separated-values",
        "txt":"text/plain",
        "ustar":"application/x-ustar",
        "vcd":"application/x-cdlink",
        "vrml":"model/vrml",
        "vxml":"application/voicexml+xml",
        "wav":"audio/x-wav",
        "wbmp":"image/vnd.wap.wbmp",
        "wbmxl":"application/vnd.wap.wbxml",
        "wml":"text/vnd.wap.wml",
        "wmlc":"application/vnd.wap.wmlc",
        "wmls":"text/vnd.wap.wmlscript",
        "wmlsc":"application/vnd.wap.wmlscriptc",
        "woff":"application/x-font-woff",
        "woff2":"application/x-font-woff",
        "wrl":"model/vrml",
        "xbm":"image/x-xbitmap",
        "xht":"application/xhtml+xml",
        "xhtml":"application/xhtml+xml",
        "xls":"application/vnd.ms-excel",
        "xlsx":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "xml":"application/xml",
        "xpm":"image/x-xpixmap",
        "xsl":"application/xml",
        "xslt":"application/xslt+xml",
        "xul":"application/vnd.mozilla.xul+xml",
        "xwd":"image/x-xwindowdump",
        "xyz":"chemical/x-xyz",
        "zip":"application/zip"
    },
    getMediaCollectionName : function(component) {
        var self = this;
        var action = component.get('c.getMediaCollectionName');
        action.setParams({mediaAssetCollection : component.get('v.mediaAssetCollection')});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                component.set('v.collectionName',result.getReturnValue());
            }
            self.fireComponentLoadedEvent(component);
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    saveAssetObj : function(component) {
        var action = component.get('c.saveAssetObj');
        var mediaAssetObj = component.get('v.mediaAssetObj');
        mediaAssetObj.fileName =  mediaAssetObj.path.substring(mediaAssetObj.path.lastIndexOf('/')+1);
        mediaAssetObj.extension = mediaAssetObj.fileName.slice((Math.max(0, mediaAssetObj.fileName.lastIndexOf(".")) || Infinity) + 1);
        mediaAssetObj.mimeType = this.mimeTypes[mediaAssetObj.extension.toLowerCase()];
        if ($A.util.isEmpty(mediaAssetObj.mimeType)) {
            mediaAssetObj.mimeType = 'application/octet-stream';
        }
        action.setParams({mediaAssetCollection : component.get('v.mediaAssetCollection'),
                          mediaAssetObj : JSON.stringify(mediaAssetObj)});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                $A.util.removeClass(component.find('uploadedFileTable'),'slds-hidden');
                var mediaAssetObjs = component.get('v.mediaAssetObjs');
                mediaAssetObjs.push(result.getReturnValue());
                component.set('v.mediaAssetObjs',mediaAssetObjs);
                component.find('path').updateValue(null);
                component.find('title').updateValue(null);
                component.find('shortDescription').updateValue(null);
                setTimeout($A.getCallback(function(){
                    new Clipboard('.copyUrl'); //NOPMD
                }),1000);
            }
            component.find('saveButton').stopIndicator();
        });
        $A.enqueueAction(action);
    },
    validateForm : function(inputObj,component) {
        var isFormValid;
        component.find('path').validate();
        component.find('title').validate();
        if (component.find('path').get('v.validated') && component.find('title').get('v.validated')) {
            isFormValid = true;
        }
        else {
            isFormValid = false;
        }
        if (isFormValid === undefined) {
            isFormValid = true;
        }
        return isFormValid;
    },
    fireComponentLoadedEvent : function(component) {
        $A.util.removeClass(component.find('mainWrapperDiv'),'hidden');
        var compEvent = $A.get('e.PagesApi:ComponentLoadedEvent');
        compEvent.fire();
    }
})