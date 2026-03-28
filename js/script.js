document.getElementById("pageTitle").innerText = SERVICE_CONFIG.title;
document.getElementById("pageDesc").innerText  = SERVICE_CONFIG.description;
/*Right Click Disabled*/
document.addEventListener("contextmenu", e => e.preventDefault());
document.onkeydown = function(e) {
    if (e.keyCode == 123) return false;
    if (e.ctrlKey && e.shiftKey && e.keyCode == 73) return false;
    if (e.ctrlKey && e.shiftKey && e.keyCode == 74) return false;
    if (e.ctrlKey && e.keyCode == 85) return false;
    if (e.ctrlKey && e.keyCode == 83) return false;
};
/*End Right Click Disabled*/
const form = document.getElementById("dynamicForm");
const loading = document.getElementById("loading");
const pageTitle = document.getElementById("pageTitle");
const pageDesc = document.getElementById("pageDesc");
const paymentPage = document.getElementById("paymentPage");
const paidPage = document.getElementById("paidPage");
const paidBadge = document.getElementById("paidBadge");
const upiRef = document.getElementById("upiRef");


/* Fields */

let contactHTML = `
<h3 style="grid-column:1/-1;position:relative;">
Contact Details
<span class="info-icon">?</span>
<span class="tooltip-text">
Veeran Tech Point உங்களை தொடர்பு கொள்ள பயன்படும் தகவல்கள். 
சரியான Mobile Number மற்றும் Email Address வழங்கவும்.
</span>
</h3>`;

let requiredHTML = `
<h3 style="grid-column:1/-1;position:relative;">
Required Details
<span class="info-icon">?</span>
<span class="tooltip-text">
இந்த தகவல்கள் அரசாங்க சேவைக்கு
தேவையான விவரங்கள் ஆகும்.
தயவுசெய்து சரியான தகவல்களை
உள்ளிடவும்
</span>
</h3>`;

let documentHTML = "";

if(
  SERVICE_CONFIG.fields.some(f=>f.section==="document") ||
  (SERVICE_CONFIG.files && SERVICE_CONFIG.files.length > 0)
){

  documentHTML += `
  <h3 style="grid-column:1/-1;">
    Required Files
  </h3>`;

  // 👉 1. FIRST → document fields (dropdowns)
  SERVICE_CONFIG.fields.forEach(f=>{
    if(f.section === "document"){

      let html = `
      <div class="form-group">
        <label class="${f.required ? 'required-label' : ''}">
          ${f.label}${f.required ? " *" : ""}
        </label>

        <select name="${f.id}" ${f.required?"required":""}>
          <option value="">-- Select --</option>
          ${(f.options || []).map(o=>`<option>${o}</option>`).join("")}
        </select>
      </div>`;

      documentHTML += html;
    }
  });

  // 👉 2. LAST → file upload (photo)
  SERVICE_CONFIG.files.forEach(f=>{

    let fileInput = `
    <div class="form-group">
      <label class="${f.required ? 'required-label' : ''}">
        ${f.label}${f.required ? " *" : ""}
      </label>
      <input type="file" data-id="${f.id}" accept="image/jpeg" ${f.required?"required":""}>
    </div>`;

    documentHTML += fileInput;
  });

}
SERVICE_CONFIG.fields.forEach(f=>{

let html = `
<div class="form-group">
<label class="${f.required ? 'required-label' : ''}">
${f.label}${f.required?"  ":""}
</label>`;

if(f.type==="select"){

html+=`<select name="${f.id}" ${f.required?"required":""}>
<option value="">-- Select --</option>
${(f.options || []).map(o=>`<option>${o}</option>`).join("")}
</select>`;

}else{

let extra = "";

if(f.id==="aadhaarnumber"){
extra=`
inputmode="numeric"
maxlength="4"
oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,4)"
placeholder="Last 4 digit of Aadhaar Number"
`;
}

if(f.type==="tel"){
extra=`
inputmode="numeric"
maxlength="10"
oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,10)"
`;
}

html+=`<input type="${f.type}" name="${f.id}" ${f.required?"required":""} ${extra}>`;

}

html+=`</div>`;

if(f.section==="contact"){
contactHTML+=html;
}
else if(f.section==="required"){
requiredHTML+=html;
}


});

form.innerHTML = contactHTML + requiredHTML + documentHTML;


/* Files */


// ✅ CONSENT FIRST
form.insertAdjacentHTML(
"beforeend",
`<div style="grid-column:1/-1; margin-top:15px;">
  <label style="display:flex; align-items:flex-start; gap:10px; cursor:pointer; line-height:1.5;">
    
    <input type="checkbox" id="consent" required style="margin-top:4px;">

    <span style="text-align:justify; color:red">
      நான் வழங்கும் அனைத்து தகவல்களும் சரியானவை என்று உறுதிப்படுத்துகிறேன்.  
      Veeran Tech Point ஒரு தனியார் சேவை மையமாக இருந்து, அரசு சேவைகளுக்கான விண்ணப்பத்தை சமர்ப்பிக்க உதவி மட்டுமே செய்கிறது.  
      நான் சேவை கட்டணத்தை செலுத்த ஒப்புக்கொள்கிறேன்.  

      <br><br>

      I confirm that all the information provided by me is true and correct.  
      Veeran Tech Point is a private service provider and only assists in submitting applications for government services.  
      I agree to pay the applicable service charges.
    </span>

  </label>
</div>`
);

form.insertAdjacentHTML(
"beforeend",
`<div style="grid-column:1 / -1;">
<button type="submit">Submit Application</button>
</div>`
);


/* UPI LINK */
document.getElementById("upiBtn").href =
`upi://pay?pa=rselvakumar906@okaxis&pn=Selvakumar&am=${PAYMENT_AMOUNT}&cu=INR`;




/* Payment restore */
if(APPLICATION_ID){
  showPaymentPage();
}


/* Page Functions */

function showPaymentPage(){
  form.style.display="none";
  pageTitle.style.display="none";
  pageDesc.style.display="none";
  paymentPage.style.display="block";

  generateQR();   // 🔥 Auto generate
}

function showPaidPage(){
  paymentPage.style.display="none";
  paidPage.style.display="block";
}


/* FORM SUBMIT */

form.addEventListener("submit", async e=>{

  if(!document.getElementById("consent").checked){
    alert("Please accept the terms and consent");
    loading.style.display="none";
    return;
  }

  e.preventDefault();
  loading.style.display="flex";

  const fd = new FormData();

  fd.append("service", SERVICE_CONFIG.serviceKey);
  fd.append("config", JSON.stringify(SERVICE_CONFIG));

  for(const f of SERVICE_CONFIG.fields){

    const val = form.querySelector(`[name="${f.id}"]`).value;

    if(f.required && !val){
      alert("Please fill: " + f.label);
      loading.style.display="none";
      return;
    }

    fd.append(f.id, val);
  }

  const toBase64 = file => new Promise(resolve=>{
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });


for(const f of SERVICE_CONFIG.files){

  const input = form.querySelector(`input[data-id="${f.id}"]`);
  const file = input.files[0];

  if(file){

    if(file.type !== "image/jpeg"){
      alert(f.label + " must be JPG format only");
      loading.style.display="none";
      return;
    }

    if(file.size > 2 * 1024 * 1024){
      alert(f.label + " must be less than 2MB");
      loading.style.display="none";
      return;
    }

    const base64 = await toBase64(file);
    fd.append(f.id, base64);

  }else{

    if(f.required){
      alert("Please upload: " + f.label);
      loading.style.display="none";
      return;
    }

    fd.append(f.id, "");
  }
}
  try{

    const res = await fetch(
      "https://script.google.com/macros/s/AKfycbxTB-uYmJedcd3MVHsLyYJ6wC6p6M_v66V8owddPEQvRF8n7a5XhWHDlID8vCkG753MKA/exec",
      {
        method:"POST",
        body:fd
      }
    );
    const data = await res.json();

    APPLICATION_ID = data.appId;

    localStorage.setItem("APPLICATION_ID", APPLICATION_ID);

    alert("Application submitted. Please complete payment.");

    showPaymentPage();

  }catch(err){

    alert("Submission failed. Please try again.");

  }

  loading.style.display="none";

});


/* PAYMENT CONFIRM */

async function finalConfirm(e){

  const btn = e.target;

  btn.disabled = true;

  const ref = upiRef.value.trim();

  if(!/^[0-9]{12}$/.test(ref)){

    alert("Please enter valid 12 digit UPI reference");

    btn.disabled=false;

    return;
  }


  const fd = new FormData();

  fd.append("action","confirmPayment");
  fd.append("appId",APPLICATION_ID);
  fd.append("upiRef",ref);
  fd.append("amount",PAYMENT_AMOUNT);


  try{

    const res = await fetch(
      "https://script.google.com/macros/s/AKfycbxTB-uYmJedcd3MVHsLyYJ6wC6p6M_v66V8owddPEQvRF8n7a5XhWHDlID8vCkG753MKA/exec",
      {
        method:"POST",
        body:fd
      }
    );

    const data = await res.json();

    if(data.status==="SUCCESS"){

      paidBadge.innerText="PAID";
      paidBadge.style.background="#28a745";

      localStorage.removeItem("APPLICATION_ID");

      if(data.whatsappAdmin){
        window.open(data.whatsappAdmin,"_blank");
      }

      location.href="identity.html";

    }else{

      alert(data.message);

      btn.disabled=false;
    }

  }catch(err){

    alert("Payment confirmation error");

    btn.disabled=false;

  }

}
function validateUpiRef() {
  const upi = document.getElementById("upiRef").value;

  if (!/^\d{12}$/.test(upi)) {
    alert("Please enter valid 12 digit UPI Reference Number");
    return false;
  }
  return true;
}
const UPI_ID = "rselvakumar906@okaxis";
const NAME = "Selvakumar";

const upiLink =
`upi://pay?pa=${UPI_ID}&pn=${NAME}&am=${PAYMENT_AMOUNT}&cu=INR`;

/* Button link */
document.getElementById("upiBtn").href = upiLink;
document.querySelector("#upiBtn button").innerText =
`Pay ₹${PAYMENT_AMOUNT} Now`;

/* QR Code Generate */
new QRCode(document.getElementById("upiQR"), {
  text: upiLink,
  width: 260,
  height: 260
});
function confirmReset(){
  const ok = confirm(
    "⚠️ This will clear your saved data.\n\nDo you want to start a new application?"
  );

  if(ok){
    localStorage.clear();   // browser saved data delete
    location.reload();     // fresh start
  }
}

function resetApplication(){
  localStorage.removeItem("APPLICATION_ID");
  location.reload();
}
function generateQR() {
  const gender = document.querySelector('[name="gender"]')?.value || "";

  const upiString = `upi://pay?pa=rselvakumar906@okaxis&pn=Selvakumar&am=${PAYMENT_AMOUNT}&cu=INR&note=${encodeURIComponent(gender)}`;

  // Generate QR via API
  const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiString)}`;

  qrImage.src = qrURL;
  qrImage.style.display = "block";

  // Update pay button href
  upiBtn.href = upiString;
  upiBtn.querySelector("button").innerText = `Pay ₹${PAYMENT_AMOUNT} Now`;
}
  // Attach listener after gender field is created
function attachGenderListener(){
    const genderSelect = document.querySelector('[name="gender"]');
    if(genderSelect){
      genderSelect.addEventListener("change", generateQR);

      // generate QR if value already selected
      if(genderSelect.value) generateQR();
    }
  }

  // Call after dynamic form is generated
  attachGenderListener();

  window.addEventListener("load", function(){

    const appId = localStorage.getItem("APPLICATION_ID");

    if(appId){
      showPaymentPage();
    }

});
