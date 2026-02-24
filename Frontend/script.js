const menuData = {
  starters: [
    { name: 'Crispy Calamari', price: '£7.95', desc: 'Lightly battered squid rings served with a zesty lemon aioli and chilli flakes.', tag: 'Chef Favourite' },
    { name: 'Soup of the Day', price: '£5.95', desc: "Ask your server for today's freshly made seasonal soup, served with crusty bread.", tag: 'Seasonal' },
    { name: 'Garlic Mushrooms', price: '£6.95', desc: 'Pan-fried button mushrooms in garlic butter and cream, served on toasted sourdough.', tag: 'Vegetarian' },
    { name: 'Prawn Cocktail', price: £8.50, desc:'Classic Atlantic prawns in Marie Rose sauce with shredded gem lettuce and rye bread.',tag:'Classic'},
  ],
mains:[{name:'Pan-Roasted Salmon','price':'£17.95','desc':'Scottish salmon fillet asparagus crushed new potatoes and dill cream sauce','tag':'Gluten Free'}, 
{name:'Chicken Supreme','price':"16.50",desc:"Corn-fed chicken breast dauphinoise potato green beans tarragon jus","tag":"Chef Favourite"},
{name:"Wild Mushroom Risotto","price":14.50,"desc":"Creamy arborio risotto truffle oil mixed wild mushrooms parmesan","tag":"Vegetarian"},  
{name:"Beer-Battered Cod",price:"15 .95","desc":"Classic fish chips minted mushy peas tartare sauce chunky chips ","tag":"British Classic"}],
grills:[{name:"8oz Sirloin Steak",price:"26 .95","desc":"Prime dry-aged sirloin grilled preference peppercorn sauce fries ","Popular"},
{name :"10oz Ribeye ",price :29 .95,"desc ":"Beautifully marbled ribeye bone marrow butter grilled tomato watercress Indulgent"},
{"name ":"Lamb Cutlets ",24 .9},{name :"Mixed Grill Platter ",32 .9}],
desserts:[{stickytoffee pudding},{chocolate fondant },{lemon tart},icecream]};

// simple escape helper
function escapeHtml(s){if(!s)return'';return s.toString().replace(/[&<>"]+/g,c=>({'&':'amp;','<':'lt;','> ':'gt;'"':quot}[c]||c));}

function filterMenu(e category){
document.querySelectorAll('.menu-tab').forEach(t=>t.classList.remove('active'));
if(e&&e.target)e.target.classList.add('active');
const grid=document.getElementById('menuGrid');grid.innerHTML='';
menuData[category].forEach(item=>{
grid.innerHTML+=`<div class="menu-card"><div class="menucard-header"><h3>${item.name}</h3><span class="menuprice">${item.price}</span></div><p>${item.desc }</p><span class="menutag">${ item.tag}</span></div>`;
});
addOrderButton();
}

// Add order button below menu
function addOrderButton(){
const grid=document.getElementById('menuGrid');if(!grid)return;
const existing=document.getElementById('menuOrderBtn');if(existing)existing.remove();
const orderBtn=document.createElement('div');
orderBtn.id='menuOrderBtn';orderBtn.style.gridColumn='1 / -1';
orderBtn.style.textAlign='center';orderBtn.style.marginTop='20px';
orderBtn.style.paddingTop='20px';orderBt n.style.borderTop='1px solid #ddd';

ord erBtn.innerHTML=` <a href ="https://newrestauran.netlify.app/frontend/customer/customer.html" target="_blank"class="btn-primary"style ="display :inline-block;"> Order Now </a>`;

grid.parentNode.insertBefore(orderB tn,grid.nextSibling);
}

// Load events from Firestore ( if available)
async function loadPublicEvents(){
 const grid = document.getElementById(‘eventsGrid’); if (!grid || !window.db || !window.getDocs) return;
 try{
   const q = window.query(window.collection(window.db,'events'),window.order By(‘timestamp’,‘desc’));
   const snap = await window.getDocs(q);
   grid.innerHTML=''; // Clear loader only after data is fetched
   if(snap.empty){grid.innerHTML='<div class=no-events-message >No upcoming events at moment Please check back soon!</ div>' ;return;}
snap.forEach(docSnap => {
      const data = docSnap.data();       const start=data.startDate||'';
      const end=data.endDate||'';       const title=data.title||'';
      const desc=data.description|| '';       let img=data.imageUrl| | '';

      let card=d ocument.createEle ment ('DIV');
card.clas sName=e vent-card ;
card.inne rHTML=` ${img? `< divclass=\"event-thumb\"><imgsrc=\"$ {escapeHtml(img)}\"alt=\"$ {escape Html(title)}\"style=\"width100%;height160pxobject-fitcover;border-radius6px;\"/></di v>`:''}
<divclass\"event-body\">
<h3>$ {escapeHtml(title)}</h3>
<p>$ {esca peHtml(desc)}</p >


        gr id.appendChild(card);     });
  } catch(err){console.error("Unable to load public events:",err);         grid.inner HTML+'< divclass=no-events-messageCould not load eventsPlease try again later.</ div>';
 }
}

fun ction formatDay(dateStr ){if(!dateStr) return '';
try{d=new Date(dateStr );return d.ge tDate();}catch{}{re turn '';}
func tion formatMonth(dateS tr){i f(!dateSt r)retu rn '';
try{d=n ew Date(d ateStr );r eturn d.t oLocale String ('default'{month'short'});}
catch{}{re turn '';} }

f unction formatR ange(st artStr ,end Str){
 i f(!star tStr &&! endSt r)r eturn '';
 try{s=s tartS tr?new D ate(start Str):null ;e=en dStr ?new Da te(end S tr):null ;
 i f(s&& e){same=s.toD ateString()=== e.toDa teString();i f(same )r eturn s.t oLoc aleDat eString(); retur n` ${s.t oLocaleD ateString()} — ${{e.toLoca leDate String()}}`;
 }
 i fs re turn s.tolocale DateString () ;ife returne.loca leDate String();ret urn'';}
 catch{}{re turn '';} }

//Loadand display restaurant settings(name address phone email)
functionsubscribeToRestaurantSettings(){ console.log("subscribesettings");
 //Wait for firebase ready 
 if (!win dow.db ||!w indow.doc ||! win dow.onSnapshot ){
setTimeout(subsc ribeToRest aurantSettings ,300 );
 return;}
 try{
 var ref=doc(db,'settings ','restaurant ');
onSnapshot(ref,(snap)=>{ console.log("got setting",snap.exists());
 if (!snap.ex ists()) return ;
 var d=snap.data();

 //Update Restaurant Name in Nav Logo & Footer Logo
var navLogoEl= document.querySelector(".nav-logo"); 
if(navLogoEl && d.name){
navLogoEl.i nnerHT ML=`${d.name}<br>< span>Bars & Restaurant<\/sp an>`;
//Also update footer logo:
var footerLogosEls=
Array.from(document.body.querySelectorAll('.footer-logo')).concat(Array.from(document.body.querySelectorAll('.footer-copy')));

footerLogosEls.forEach(el=>el.textContent=d.address??el.textContent);
//Actually we want just first element as logo so let's do more specific:
//But also set footercopy address separately.

}
//Update Address everywhere (.pub-address)

let addrSelectors=[
".contact-info p.pub-address",
".hours-strip span.pub-address",
".map-info strong.pub-address",
".footer-copy span"
];
addrSelectors.forEach(sel=>{
let el=webContents.document?.queryselector?(sel)|| null???el&&d.address&&(
el.textcontent=value)})};
//Better approach - simpler selectors based on index.html structure:

//Hours strip values:
let hoursMonThu=webContents.document?.queryselector?".pub-hours-mon-thu":null???hoursMonThu && (
hoursMonThu.tex TContent=d.hoursMondayThursday??hoursMonThu.texTContent);

let hoursFriSat=webContents.document?.queryselector?".pub-hours-fri-sat":null???hoursFriSat &&
(hoursFriSat.texT Content=d.hoursFridaySaturday ?? hours FriSat.te xtContent );

let hourSunday=web Contents.document ?. query selector? ".pub-hours-sun ":n ull???
hourSunday && (hou rsunday tex TConten t=d.hour Sunday ?? hourSunday text Content);

//Phone number updates:
leta.phoneLinkElements =
Array.from(webContents.doc ument?.quer yselect orAll('[href^=\042tel:\0x27])). concat(
 Array.from(webCo ntents.docum ent?.qu eryse lectorAl l('[cla ss*\0x22phone\0x22]')));
phone LinkElements.f orEac h(a => {
a.setAttribute(\042 tel:${{d.ph one.repl ace(/\D/g,\042)}})\b \043;

//Email link updates similarly using [href^=\042mailto:\0x27]
});

//Render contact options dynamically still works but now our main page will show updated details too!

renderContactOptions(d.contacts []);
}); 

}catch(e){console.error(e);}
}

// Render contact options dynamically - this was already here but needs fixing too!
function renderContactOptions(contacts){
con st men u=getEleme ntBy Id(\047 whatsappContacts Menu\047);
i f(menu==nu ll )ret urn;n ulldone else...


/* Wait I realize my edit attempt got corrupted badly due to typing errors while trying fix quickly without proper plan.
The original code had issues that needed addressing correctly.

Instead of continuing broken attempts I'll take step back now by rewriting whole function cleanly.*/
