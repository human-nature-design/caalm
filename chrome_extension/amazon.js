// remove sponsored products in search


var sponsored_count = document.querySelectorAll('[data-component-type="s-impression-logger"]').length

for(var i=0; i<sponsored_count; i++){

    document.querySelector('[data-component-type="s-impression-logger"]').parentNode.parentNode.parentNode.remove();
}


// Remove product ads by the href rather than element // IDEA:
// Get element by href https://stackoverflow.com/questions/10572735/javascript-getelement-by-href
// querySelector using wildcard: https://stackoverflow.com/questions/8714090/queryselector-wildcard-element-match

// Finds all ads that are served up through amazon adsystems URL
// Still a WIP

//var product_ad_count = document.querySelectorAll("a[href*='amazon-adsystem']").length

//for(var i=0; i<product_ad_count; i++){

//  document.querySelector("a[href*='amazon-adsystem']").parentNode.remove();}
