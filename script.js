const firebaseConfig = {
 apiKey: "AIzaSyAviiDdXx71Jr0XxHpuQJWKgEiQzlR5gRs",
 authDomain: "flashmail-5650b.firebaseapp.com",
 projectId: "flashmail-5650b",
 databaseURL: "https://flashmail-5650b-default-rtdb.europe-west1.firebasedatabase.app",
 storageBucket: "flashmail-5650b.firebasestorage.app",
 messagingSenderId: "356335559074",
 appId: "1:356335559074:web:6f580cbcef71d807aa92fb"
};
firebase.initializeApp(firebaseConfig);
const db=firebase.database();
const CLOUDINARY_CLOUD_NAME="mo6uj3wj";
const CLOUDINARY_UPLOAD_PRESET="pixvault_upload";
firebase.auth().signInAnonymously().catch(console.error);

const KEY="pixvault_demo";
const ADMIN_EMAIL="669gxtiti@gmail.com";
const ADMIN_PASSWORD="Hamster777!";
const ADMIN_SESSION="pixvault_admin_session";

const starter=[
 {id:1,title:"Mountain Morning",description:"Lumière douce sur un paysage de montagne.",price:3.99,image:"https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80",status:"approved",paymentType:"paypal",paymentValue:"demo@example.com",unlocked:false,proof:null}
];
let items=JSON.parse(localStorage.getItem(KEY)||"null")||starter;

// Synchronisation des annonces Firebase pour l'administration et les utilisateurs
db.ref("annonces").on("value", snap=>{
  const data=snap.val()||{};
  const remote=Object.keys(data).map(k=>({...data[k],id:Number(k)}));
  const localApproved=items.filter(x=>!remote.some(r=>r.id===x.id));
  items=[...localApproved,...remote];
  render();
});

function save(){localStorage.setItem(KEY,JSON.stringify(items))}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function isAdmin(){return sessionStorage.getItem(ADMIN_SESSION)==="1"}

function publicationUrl(id){
 const base=window.location.href.split("?")[0].split("#")[0];
 return base+"?publication="+encodeURIComponent(id);
}
function sharePublication(id){
 const url=publicationUrl(id);
 if(navigator.share){navigator.share({title:"PixVault",text:"Voir cette publication",url}).catch(()=>{});}
 else if(navigator.clipboard){navigator.clipboard.writeText(url).then(()=>alert("Lien de publication copié."));}
 else prompt("Lien de publication :",url);
}

function renderShop(){
 const el=document.querySelector("#shopGrid");
 const approved=items.filter(x=>x.status==="approved"||x.status==="paid_pending"||x.status==="paid_approved");
 el.innerHTML=approved.length?approved.map(x=>`<article class="card">
   <div class="thumb"><img class="locked" src="${x.image}" alt=""><div class="lock">🔒</div></div>
   <div class="card-body"><h3>${esc(x.title)}</h3><p class="muted">${esc(x.description)}</p><div class="price">${Number(x.price).toFixed(2)} €</div>
   <button class="primary" onclick="openItem(${x.id})">Voir / acheter</button></div>
 </article>`).join(""):`<p class="muted">Aucune photo publiée pour le moment.</p>`;
}
function renderAdmin(){
 const login=document.querySelector("#adminLogin"),panel=document.querySelector("#adminPanel");
 if(!isAdmin()){login.classList.remove("hidden");panel.classList.add("hidden");return}
 login.classList.add("hidden");panel.classList.remove("hidden");
 const el=document.querySelector("#adminList");
 const manageable=items.filter(x=>["pending","paid_pending","approved","paid_approved"].includes(x.status));
 el.innerHTML=manageable.length?manageable.map(x=>`<div class="admin-item">
 <img src="${x.image}" alt=""><div><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p><p><b>${Number(x.price).toFixed(2)} €</b></p>
 <p class="payment"><b>Paiement vendeur :</b> ${esc(x.paymentType||"Non renseigné")} — ${esc(x.paymentValue||"Non renseigné")}</p>
 ${x.status==="approved"||x.status==="paid_pending"||x.status==="paid_approved"?`<p class="share-link"><b>Lien de publication :</b> <a href="${esc(publicationUrl(x.id))}" target="_blank" rel="noopener">${esc(publicationUrl(x.id))}</a> <button type="button" class="secondary" onclick="sharePublication(${x.id})">Partager / copier</button></p>`:""}
 ${x.proof?`<p class="payment"><b>Preuve de paiement acheteur :</b><br><img class="proof" src="${x.proof}" alt="Preuve de paiement"></p>`:""}
 <div class="actions">
 ${x.status==="pending"?`<button class="primary approve" onclick="moderate(${x.id},'approved')">✓ Publier</button><button class="primary reject" onclick="moderate(${x.id},'rejected')">✕ Refuser</button>`:""}
 ${x.status==="paid_pending"?`<button class="primary approve" onclick="approvePayment(${x.id})">✓ Valider le paiement</button>`:""}
 <button class="primary reject" onclick="deleteItem(${x.id})">🗑 Supprimer</button>
 </div></div></div>`).join(""):`<p class="muted">Aucune annonce à gérer.</p>`;
}
function render(){renderShop();renderAdmin();save()}
function moderate(id,status){if(!isAdmin())return;const x=items.find(i=>i.id===id);if(x){x.status=status;render()}}
function approvePayment(id){if(!isAdmin())return;const x=items.find(i=>i.id===id);if(x){x.status="paid_approved";x.unlocked=true;render();openItem(id)}}
function deleteItem(id){if(!isAdmin())return;const x=items.find(i=>i.id===id);if(x&&confirm(`Supprimer l’annonce « ${x.title} » ?`)){items=items.filter(i=>i.id!==id);render()}}

document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>{
 document.querySelectorAll(".nav-btn").forEach(x=>x.classList.remove("active"));b.classList.add("active");
 document.querySelectorAll(".view").forEach(x=>x.classList.remove("active"));
 document.querySelector("#"+b.dataset.view).classList.add("active");if(b.dataset.view==="admin")renderAdmin();
});
document.querySelector("#loginForm").onsubmit=e=>{
 e.preventDefault();
 if(document.querySelector("#adminEmail").value.trim()===ADMIN_EMAIL&&document.querySelector("#adminPassword").value===ADMIN_PASSWORD){
  sessionStorage.setItem(ADMIN_SESSION,"1");document.querySelector("#loginMessage").textContent="✓ Connecté.";renderAdmin();
 }else document.querySelector("#loginMessage").textContent="E-mail ou mot de passe incorrect.";
};
document.querySelector("#sellForm").onsubmit=async e=>{
 e.preventDefault();
 const file=document.querySelector("#image").files[0];
 if(!file)return;
 if(file.size>5*1024*1024){document.querySelector("#sellMessage").textContent="Image trop volumineuse (5 Mo maximum).";return}
 const msg=document.querySelector("#sellMessage");
 msg.textContent="Upload de l'image en cours...";
 try{
  const data=new FormData();
  data.append("file",file);
  data.append("upload_preset",CLOUDINARY_UPLOAD_PRESET);
  const upload=await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,{method:"POST",body:data});
  const result=await upload.json();
  if(!result.secure_url) throw new Error(JSON.stringify(result));
  const id=Date.now();
  await db.ref("annonces/"+id).set({
   title:document.querySelector("#title").value,
   description:document.querySelector("#description").value,
   price:Number(document.querySelector("#price").value),
   image:result.secure_url,
   paymentType:document.querySelector("#paymentType").value,
   paymentValue:document.querySelector("#paymentValue").value,
   status:"pending",
   createdAt:Date.now()
  });
  e.target.reset();
  msg.textContent="✓ Publication envoyée avec succès.";
 }catch(err){console.error(err);msg.textContent="Erreur d'envoi : "+err.message}
};

window.openItem=id=>{
 const x=items.find(i=>i.id===id);if(!x)return;
 const modal=document.querySelector("#modal"),card=document.querySelector(".modal-card"),image=document.querySelector("#modalImage");
 image.src=x.image;image.classList.toggle("locked",!x.unlocked);
 document.querySelector("#modalTitle").textContent=x.title;document.querySelector("#modalDescription").textContent=x.description;
 document.querySelector("#modalPrice").textContent=Number(x.price).toFixed(2)+" €";
 ["modalPayment","proofForm","modalShare"].forEach(id=>document.getElementById(id)?.remove());
 const share=document.createElement("div"); share.id="modalShare"; share.className="share-link";
 share.innerHTML=`<b>Lien de cette publication :</b><br><a href="${esc(publicationUrl(x.id))}" target="_blank" rel="noopener">${esc(publicationUrl(x.id))}</a> <button type="button" class="secondary" onclick="sharePublication(${x.id})">Partager / copier</button>`;
 card.insertBefore(share,document.querySelector("#buyBtn"));
 const payment=document.createElement("div");payment.id="modalPayment";payment.className="payment";
 payment.innerHTML=`<b>Informations de paiement</b><br>${esc(x.paymentType||"Non renseigné")} : ${esc(x.paymentValue||"Non renseigné")}<br><b>Montant : ${Number(x.price).toFixed(2)} €</b>`;
 card.insertBefore(payment,document.querySelector("#buyBtn"));
 const proof=document.createElement("form");proof.id="proofForm";proof.style.marginTop="14px";
 if(x.unlocked)proof.innerHTML=`<p class="notice">✓ Paiement validé par l’administrateur. La photo est maintenant accessible.</p>`;
 else if(x.proof)proof.innerHTML=`<p class="notice">✓ Preuve envoyée. En attente de validation par l’administrateur.</p>`;
 else{
  proof.innerHTML=`<label>Preuve de paiement<input id="proofFile" type="file" accept="image/jpeg,image/png,image/webp" required></label><button class="primary" type="submit">Envoyer la preuve de paiement</button>`;
  proof.onsubmit=e=>{e.preventDefault();const f=document.querySelector("#proofFile").files[0];if(!f)return;
   if(f.size>5*1024*1024){alert("Preuve trop volumineuse (5 Mo maximum dans cette démo).");return}
   const r=new FileReader();r.onload=()=>{x.proof=r.result;x.status="paid_pending";save();openItem(id);renderAdmin()};r.readAsDataURL(f);
  };
 }
 card.insertBefore(proof,document.querySelector("#buyBtn"));document.querySelector("#buyBtn").style.display="none";modal.classList.remove("hidden");
};
document.querySelector("#closeModal").onclick=()=>document.querySelector("#modal").classList.add("hidden");
document.querySelector("#modal").addEventListener("click",e=>{if(e.target===document.querySelector("#modal"))document.querySelector("#modal").classList.add("hidden")});
document.addEventListener("keydown",e=>{if(e.key==="Escape")document.querySelector("#modal").classList.add("hidden")});
document.querySelector("#reset").onclick=()=>{if(!isAdmin())return;if(confirm("Réinitialiser la démo ?")){localStorage.removeItem(KEY);items=starter;render()}};
render();
const publicationId=new URLSearchParams(window.location.search).get("publication");
if(publicationId){const id=Number(publicationId); if(items.some(x=>x.id===id && ["approved","paid_pending","paid_approved"].includes(x.status))) setTimeout(()=>openItem(id),0);}

(function () {
  function ensureOverlay() {
    let overlay = document.getElementById('pvFullscreenOverlay');
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'pvFullscreenOverlay';
    overlay.className = 'pv-fullscreen-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML =
      '<button class="pv-fullscreen-close" type="button" aria-label="Fermer">×</button>' +
      '<img alt="Aperçu plein écran">';
    document.body.appendChild(overlay);

    overlay.querySelector('.pv-fullscreen-close').addEventListener('click', function (e) {
      e.stopPropagation();
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
    });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        overlay.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        overlay.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');
      }
    });
    return overlay;
  }

  window.PixVaultOpenFullscreen = function (src, alt) {
    if (!src) return;
    const overlay = ensureOverlay();
    const img = overlay.querySelector('img');
    img.src = src;
    img.alt = alt || 'Aperçu plein écran';
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
  };

  // Automatically make admin-side images open in fullscreen when clicked.
  document.addEventListener('click', function (e) {
    const target = e.target.closest(
      '.admin-panel img, .admin img, #admin img, [data-admin] img, .payment-proof img, .proof-preview img, .admin-preview img'
    );
    if (!target) return;
    e.preventDefault();
    e.stopPropagation();
    window.PixVaultOpenFullscreen(target.currentSrc || target.src, target.alt);
  });
})();
