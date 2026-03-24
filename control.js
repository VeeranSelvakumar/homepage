fetch("maintenance.json")
.then(res=>res.json())
.then(data=>{

/* FULL SITE MAINTENANCE */

if(data.site === "OFF"){
window.location.href="maintenance.html";
return;
}

/* PAGE SERVICE CHECK */

const page = location.pathname.split("/").pop().replace(".html","");

if(data.services && data.services[page] === "OFF"){
window.location.href="maintenance.html";
}

});