
// Making the "container" to put the content in
var para = document.createElement("p");

// Setting an attribute (id) so that we can reference it in the css
para.setAttribute("id", "john_homepage");

// Creating the text
var node = document.createTextNode("This is a global market, a place to find just about anything.");

// put that node into the paragraph container
para.appendChild(node);
   
// find the place on the page that we want to put the paragraph container and the content in it
var element = document.getElementById("pageContent");
   
// Put it into the page content
element.appendChild(para);
