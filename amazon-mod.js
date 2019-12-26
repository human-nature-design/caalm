// remove sponsored products in search 
var sponsored_count = document.querySelectorAll('[data-component-type="s-impression-logger"]').length

for(var i=0; i<sponsored_count; i++){

    document.querySelector('[data-component-type="s-impression-logger"]').parentNode.parentNode.parentNode.remove();
}


