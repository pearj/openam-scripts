// ==UserScript==
// @name       OpenAM keyboard shortcuts
// @namespace  OpenamKeyboardShortcuts
// @version    0.9.1
// @description  OpenAM keyboard shortcuts
// @match      http://*/opensso/*
// @match      https://*/opensso/*
// @match      http://*/openam/*
// @copyright  2014+, Joel Pearson
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js
// @require		  https://raw.githubusercontent.com/ccampbell/mousetrap/1.4.6/mousetrap.min.js
// @require		  https://raw.githubusercontent.com/ccampbell/mousetrap/1.4.6/plugins/global-bind/mousetrap-global-bind.min.js
// @require		  http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js
// @resource   jqUI_CSS http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/themes/smoothness/jquery-ui.css
// @resource    IconSet1  http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/themes/smoothness/images/ui-icons_222222_256x240.png
// @resource    IconSet2  http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/themes/smoothness/images/ui-icons_454545_256x240.png
// @resource    IconSet3  http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/themes/smoothness/images/ui-icons_888888_256x240.png
// @grant       GM_getResourceURL
// @grant       GM_getResourceText
// @grant       GM_addStyle
// @grant       GM_setValue
// @grant       GM_getValue
// ==/UserScript==

loadJQueryUI();

GM_addStyle(".fixedDialog { position: fixed; overflow: visible;} .selectedSearchElement { border: 2px solid red }");

$(document.body).append('<div id="dialog" title="Change me" style="display:none"><div class="ui-widget"><label for="gm_label">Label: </label><input id="gm_autocomplete"></div></div>');

Mousetrap.bind('c', function() { 
	// Clear nav path
    GM_setValue('navigation', null);
    alert('Nav path cleared');
});

Mousetrap.bind('<', function() { 
	// Click back to button
    $("input[type=submit][value*='Back']").click();
});

Mousetrap.bind('/', function(e) { 
    e.preventDefault();
	// Focus the search box
    var searchButton = $("input[type=submit][value='Search']").first();
    searchButton.parent().parent().find("input[type=text]").focus();
});

var agents = [
    {
        label: 'IPA_EXTERNAL > Agents > J2EE',
        navigation: [
            {
                type: 'tab',
                label: 'J2EE'
            },
            {
                type: 'tab',
                label: 'Agents'
            },
            {
                type: 'link',
                label: 'IPA_EXTERNAL'
            },
            {
                
                type: 'tab',
                label: 'Access Control'
            }
        ]
    },
    {
        label: 'IPA_INTERNAL > Agents > J2EE',
        navigation: [
            {
                type: 'tab',
                label: 'J2EE'
            },
            {
                type: 'tab',
                label: 'Agents'
            },
            {
                type: 'link',
                label: 'IPA_INTERNAL'
            },
            {
                
                type: 'tab',
                label: 'Access Control'
            }
        ]
    }
];

function followNavigationPath(path) {
    var checkBack = $("input[type=submit][value*='Back']");
    if (checkBack.length > 0 && path[path.length -1].label == "Access Control") {
        console.log("Found a back button before starting a navigation path, so click it");
        GM_setValue('navigation', JSON.stringify(path));
        checkBack.click();
        return;
    }
    var curStep = path.pop();
    
    if ($("div.Tab1SelTxtNew:contains('Access Control')").length > 0 && curStep.label == "Access Control") {
        // We're already on the access control tab, so skip that step.
        curStep = path.pop();
    }
    
    if (path.length === 0) {
        console.log("End of navigation path, clearing the storage");
        GM_setValue('navigation', null);
    }
    else {
        GM_setValue('navigation', JSON.stringify(path));
    }
    
    if (curStep.type == 'tab') {
        $('a.Tab1Lnk, a.Tab2Lnk').filter(":contains('" + curStep.label + "')").each(function(id, elem) {
            elem.click();
        });
    }
    else if (curStep.type == 'link') {
        $("a.TblNavLnk:contains('" + curStep.label + "')").each(function(id, elem) {
            elem.click();
        });
    }
}

$(function() {
    var navigation = GM_getValue('navigation', null);
    if (navigation !== null) {
        console.log(navigation);
        var path = JSON.parse(navigation);
        followNavigationPath(path);
    }
    
    if ($("a.Tab1Lnk:contains('Access Control'), div.Tab1SelTxtNew:contains('Access Control'), input[type=submit][value*='Back']").length > 0) {
        Mousetrap.bind('a', function(e) {
            e.preventDefault();
            autocompleteDialog("Choose a J2EE Agent realm", "Realm: ", agents);
        });
    }
    
    // Choose a tblNavLink
    if ($('a.TblNavLnk').length > 0) {
        
        var realms = [];
        $('a.TblNavLnk').each(function(id, elem) {
            var text = $(elem).text();
            realms.push({value: text, label: text, element: elem});
        });
        
        Mousetrap.bind('n', function(e) { 
            e.preventDefault();
            autocompleteDialog("Choose a Nav Link", "Nav Link: ", realms);
        });   

    }
    
    // Choose a tab
    if ($('a.Tab1Lnk, a.Tab2Lnk').length > 0) {
        
        var tabs1 = [];
        $('a.Tab1Lnk, a.Tab2Lnk').each(function(id, elem) {
            var text = $(elem).text();
            tabs1.push({value: text, label: text, element: elem});
        });
        
        Mousetrap.bind('t', function(e) { 
            e.preventDefault();
            autocompleteDialog("Choose an OpenAM tab", "Tabs: ", tabs1);
        });   
        
    }
    
    // Choose a button
    if ($('input[type=submit]').length > 0) {
        
        var buttons = [];
        $('input[type=submit]').each(function(id, elem) {
            var text = $(elem).val();
            buttons.push({value: text, label: text, element: elem});
        });
        
        var buttonBind = function(e) { 
            e.preventDefault();
            autocompleteDialog("Choose an OpenAM button", "Button: ", buttons);
        };
        Mousetrap.bind('b', buttonBind);   
        Mousetrap.bindGlobal('alt+b', buttonBind);   
        
    }
    
    // Select a form field via Label
    if ($('label').length > 0) {
        
        var labels = [];
        $('label').each(function(id, elem) {
            var elemId = $(elem).attr("for");
            var text = $(elem).text();
            var formElem = $('#'+elemId);
            
            // Find labels that are erroneously referencing form element name
            if (formElem.length === 0 && elemId) {
                formElem = $(elem).closest("form").find('input[name="'+elemId+'"]');
            }
            labels.push({value: text, label: text, element: elem, formElement: formElem});
        });
        
        var formLabelBind = function(e) { 
            e.preventDefault();
            autocompleteDialog("Choose an OpenAM form label", "Form Label: ", labels);
        };   
        Mousetrap.bind('f', formLabelBind);
        Mousetrap.bindGlobal('ctrl+alt+f', formLabelBind);
        
    }
});

function autocompleteDialog(title, label, source) {
    console.log(title, label, source);
    $('#dialog label').html(label);
    
    var lastFocusedElement = null;
    var formElementFocus = null;
    $( "#dialog" ).dialog({
        open: function () {
            $( '#gm_autocomplete' ).val("").autocomplete({
                source: source,
                delay: 0,
                autoFocus: true,
                select: function(event, ui) {
                    console.log(ui);
                    if (ui.item.formElement) {
                        formElementFocus = ui.item.formElement;
                    }
                    if (ui.item.navigation) {
                        followNavigationPath(ui.item.navigation);
                    }
                    else {
                    	ui.item.element.click();
                    }
                    $( "#dialog" ).dialog("close");
                },
                focus: function(event, ui) {
                    if (ui.item.navigation) {
                        return;
                    }
                    if (lastFocusedElement) {
                        $(lastFocusedElement).removeClass("selectedSearchElement");
                    }
                    
                    $(ui.item.element).addClass("selectedSearchElement");
                    lastFocusedElement = ui.item.element;
                    ensureElementVisible(ui.item.element);
                },
            });
        },
        close: function() {
            if (lastFocusedElement) {
                $(lastFocusedElement).removeClass("selectedSearchElement");
            }
            if (formElementFocus) {
                formElementFocus.focus();
                formElementFocus = null;
            }
        },
        title: title,
        dialogClass: "fixedDialog"
    });
}


function ensureElementVisible(elem) {
    elem = $(elem);
	var elemTop = elem.offset().top;
	var elemHeight = elem.height();
	var windowTop = $(window).scrollTop();
	var windowHeight = $(window).height();
    
    var extraHeight = 200;

	var newScroll = 0;
	if (elemTop + (elemHeight * 2)  > windowTop + windowHeight) {
		newScroll = elemTop - (elemHeight * 2) - extraHeight;
	}
	else if (elemTop - (elemHeight * 2) < windowTop) {
		newScroll = elemTop - (elemHeight * 2) - extraHeight;
	}
	if (newScroll) {
		$('html, body').animate({
			scrollTop: newScroll
		}, 0);
	}
}

function loadJQueryUI() {
    
    // Taken from http://stackoverflow.com/questions/11528541/why-doesnt-my-jquery-ui-script-execute-in-greasemonkey-it-runs-in-the-firebug
    /*--- Process the jQuery-UI, base CSS, to work with Greasemonkey (we are not on a server)
    and then load the CSS.

    *** Kill the useless BG images:
        url(images/ui-bg_flat_0_aaaaaa_40x100.png)
        url(images/ui-bg_flat_75_ffffff_40x100.png)
        url(images/ui-bg_glass_55_fbf9ee_1x400.png)
        url(images/ui-bg_glass_65_ffffff_1x400.png)
        url(images/ui-bg_glass_75_dadada_1x400.png)
        url(images/ui-bg_glass_75_e6e6e6_1x400.png)
        url(images/ui-bg_glass_95_fef1ec_1x400.png)
        url(images/ui-bg_highlight-soft_75_cccccc_1x100.png)

    *** Rewrite the icon images, that we use, to our local resources:
        url(images/ui-icons_222222_256x240.png)
        becomes
        url("' + GM_getResourceURL ("IconSet1") + '")
        etc.
*/
    var iconSet1    = GM_getResourceURL ("IconSet1");
    var iconSet2    = GM_getResourceURL ("IconSet2");
    var jqUI_CssSrc = GM_getResourceText ("jqUI_CSS");
    jqUI_CssSrc     = jqUI_CssSrc.replace (/url\(images\/ui\-bg_.*00\.png\)/g, "");
    jqUI_CssSrc     = jqUI_CssSrc.replace (/images\/ui-icons_222222_256x240\.png/g, iconSet1);
    jqUI_CssSrc     = jqUI_CssSrc.replace (/images\/ui-icons_454545_256x240\.png/g, iconSet2);
    jqUI_CssSrc     = jqUI_CssSrc.replace (/images\/ui-icons_888888_256x240\.png/g, iconSet2);
    
    GM_addStyle (jqUI_CssSrc);
}
