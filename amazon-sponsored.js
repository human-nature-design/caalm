// Counts the number of times that this data component shows up on the page
var sponsored_count = document.querySelectorAll('[data-component-type="s-impression-logger"]').length

// s-impression-logger 4 layers down from the parent div that holds sponsored posts. 
// For each div that has this type of data, find the parent, then delete (remove) it from the page
for(var i=0; i<sponsored_count; i++){

    document.querySelector('[data-component-type="s-impression-logger"]').parentNode.parentNode.parentNode.remove();
}
