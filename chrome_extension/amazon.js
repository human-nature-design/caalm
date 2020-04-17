// remove sponsored products in search


var sponsored_count = document.querySelectorAll('[data-component-type="s-impression-logger"]').length

for(var i=0; i<sponsored_count; i++){

    document.querySelector('[data-component-type="s-impression-logger"]').parentNode.parentNode.parentNode.remove();
}






// Remove product ads

// Top product ad
document.querySelector("a[href*='amazon-adsystem']").parentNode.parentNode.remove();

//Bottom product ads
document.querySelector("a[href*='amazon-adsystem']").parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.remove()

// Prime, Kindle, and other Amazon content in search
const amazon_spon_count = document.getElementsByClassName("a-size-base a-link-normal a-text-bold").length

for(var i=0; i<amazon_spon_count; i++){

  document.querySelector(".a-size-base.a-link-normal.a-text-bold").parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.remove();
}
