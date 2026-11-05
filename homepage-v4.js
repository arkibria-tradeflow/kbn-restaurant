/* KBN Homepage — slider + food-type / meal-time sections, same menu & cart source */
(function(){
  'use strict';
  const slides=[
    {img:'./menu-images/chicken-biryani-v3.jpg',category:'Rice & Biryani',bn:{tag:'KBN Restaurant-এ স্বাগতম',title:'চিকেন বিরিয়ানি',sub:'দেশি খাবারের পরিচিত স্বাদ, আপনার পছন্দের মেনুতে'},en:{tag:'Welcome to KBN Restaurant',title:'Chicken Biryani',sub:'Explore our Bengali favourites and order with ease'}},
    {img:'./menu-images/gorur-kala-bhuna.jpg',category:'Meat',bn:{tag:'মাংসের আইটেম',title:'গরুর কালা ভুনা',sub:'মাংসের পছন্দের পদগুলো এক জায়গায়'},en:{tag:'Meat Specials',title:'Beef Kala Bhuna',sub:'Discover our selection of Bengali meat dishes'}},
    {img:'./menu-images/sorisha-ilish.jpg',category:'Fish',bn:{tag:'মাছের আইটেম',title:'সরিষা ইলিশ মাছ',sub:'বাংলাদেশি মাছের নানা পদের আয়োজন'},en:{tag:'Fish Dishes',title:'Mustard Hilsa Curry',sub:'Enjoy the flavours of Bengali fish dishes'}}
  ];
  const meals=[
    {key:'breakfast',icon:'🌅',img:'./menu-images/parota-v1.webp',bn:'সকালের নাশতা',en:'Breakfast'},
    {key:'lunch',icon:'☀️',img:'./menu-images/gorur-rosha.jpg',fallback:'./menu-images/chicken-biryani-v3.jpg',bn:'দুপুরের খাবার',en:'Lunch'},
    {key:'dinner',icon:'🌙',img:'./menu-images/chicken-biryani-v3.jpg',bn:'রাতের খাবার',en:'Dinner'}
  ];
  const dict={
    bn:{byType:'খাবারের ধরন অনুযায়ী',byMeal:'খাবারের সময় অনুযায়ী',seeAll:'সব দেখুন',showLess:'কম দেখুন',order:'অর্ডার করুন',empty:'এই বিভাগে খাবার পাওয়া যায়নি',heroCta:'এখনই অর্ডার করুন',rice:'প্রতিটি আইটেমের সাথে ভাত ও ডাল ফ্রি',whatsapp:'WhatsApp-এ অর্ডার',steps:'খাবার বাছুন · লোকেশন দিন · WhatsApp-এ পাঠান',menuHeading:'খাবার খুঁজুন'},
    en:{byType:'Browse by food type',byMeal:'Browse by meal time',seeAll:'See all',showLess:'Show less',order:'Order now',empty:'No dishes available in this group',heroCta:'Order now',rice:'Free rice and dal with every item',whatsapp:'Order on WhatsApp',steps:'Choose food · Share location · Send via WhatsApp',menuHeading:'Browse dishes'}
  };
  const $=id=>document.getElementById(id);
  const L=k=>dict[lang]?.[k]||dict.bn[k]||k;
  let mode='type',activeSlide=0,autoplay=null,paused=false;
  const expanded=new Set();
  function validMeal(item,k){return /^(yes|true|1)$/i.test(String(item[k]||''))}
  function itemMatches(item,key){return mode==='type'?item.category===key:validMeal(item,key)}
  function groupName(group){return mode==='type'?categoryLabel(group):meals.find(m=>m.key===group)?.[lang==='bn'?'bn':'en']||group}
  function groupIcon(group){return mode==='type'?(CAT_ICON[group]||'🍽️'):(meals.find(m=>m.key===group)?.icon||'🍽️')}
  function foodCard(item){
    const q=cart[item.id]||0;
    const name=lang==='bn'&&item.name_bn?item.name_bn:item.name_en;
    const purchasable=item.price!==null;
    const control=!purchasable?'':q
      ?'<div class="home-food-qty" aria-label="'+safe(name)+'"><button type="button" data-home-delta="-1" data-home-id="'+safe(item.id)+'" aria-label="'+(lang==='bn'?'একটি কমান':'Decrease quantity')+'">−</button><b>'+q+'</b><button type="button" data-home-delta="1" data-home-id="'+safe(item.id)+'" aria-label="'+(lang==='bn'?'একটি বাড়ান':'Increase quantity')+'">+</button></div>'
      :'<button type="button" class="home-food-add" data-home-delta="1" data-home-id="'+safe(item.id)+'"><span aria-hidden="true">🛒</span> '+safe(L('order'))+'</button>';
    return '<article class="home-food-card"><img src="'+safe(photo(item))+'" alt="'+safe(name)+'" loading="lazy"><div class="home-food-detail"><h3>'+safe(name)+'</h3><div class="home-food-price">'+safe(priceLabel(item))+'</div>'+control+'</div></article>';
  }
  function getGroups(){return mode==='type'?['Meat','Fish','Rice & Biryani','Vegetables','Bhorta','Snacks & Drinks'].filter(cat=>menu.some(item=>item.available&&item.category===cat)) :meals.filter(m=>menu.some(item=>item.available&&validMeal(item,m.key))).map(m=>m.key)}
  function groupMarkup(key,index){
    const dishes=menu.filter(i=>i.available&&itemMatches(i,key));
    const expandedNow=expanded.has(mode+'|'+key);
    const shown=expandedNow?dishes:dishes.slice(0,4);
    const name=groupName(key);
    return '<section class="home-food-section" id="home-section-'+mode+'-'+safe(key.replace(/[^a-z0-9]+/gi,'-'))+'" data-group="'+safe(key)+'"><div class="home-food-heading"><h2><span class="home-section-symbol" aria-hidden="true">'+groupIcon(key)+'</span><span class="home-section-title">'+safe(name)+'</span></h2><button type="button" class="home-seeall" data-home-expand="'+safe(key)+'" '+(dishes.length<=4?'hidden':'')+'>'+safe(expandedNow?L('showLess'):L('seeAll'))+' <span aria-hidden="true">'+(expandedNow?'↑':'→')+'</span></button></div><div class="home-food-grid">'+shown.map(foodCard).join('')+'</div></section>';
  }
  function renderChips(){
    const groups=getGroups();
    const el=$('homeCategoryChips');if(!el)return;
    el.innerHTML=groups.map(key=>{
      const name=groupName(key);
      if(mode==='type')return '<button type="button" class="home-chip '+(key===groups[0]?'active':'')+'" data-home-jump="'+safe(key)+'"><span class="home-chip-icon" aria-hidden="true">'+groupIcon(key)+'</span><span>'+safe(name)+'</span></button>';
      const meal=meals.find(m=>m.key===key);
      return '<button type="button" class="home-chip home-meal-chip" data-home-jump="'+safe(key)+'"><img src="'+safe(meal.img)+'" onerror="this.onerror=null;this.src='+String.fromCharCode(39)+safe(meal.fallback||'./menu-images/parota-v1.webp')+String.fromCharCode(39)+'" alt="" loading="lazy"><span class="home-chip-icon" aria-hidden="true">'+meal.icon+'</span><span>'+safe(name)+'</span></button>';
    }).join('');
  }
  function renderSections(){
    const el=$('homeFoodSections');if(!el)return;
    if(!menu.length){el.innerHTML='';updateCartCue();return}
    el.innerHTML=getGroups().map(groupMarkup).join('');
    if(typeof attachImageFallbacks==='function')attachImageFallbacks();
    updateCartCue();
  }
  function updateCartCue(){
    const cue=$('homeCartCue');if(!cue)return;
    const qty=cartCount();
    cue.hidden=!qty;
    const count=$('homeCartCount'),cost=$('homeCartTotal');
    if(count)count.textContent=String(qty);
    if(cost)cost.textContent=money(cartTotal());
  }
  function renderSlide(){
    if(!$('homeSliderImage'))return;
    const s=slides[activeSlide],copy=s[lang==='bn'?'bn':'en'];
    $('homeSliderImage').src=s.img;
    $('homeSliderImage').alt=copy.title;
    $('homeSlideTag').textContent=copy.tag;
    $('homeSlideTitle').textContent=copy.title;
    $('homeSlideSub').textContent=copy.sub;
    $('homeSlideAction').textContent=L('heroCta')+'  →';
    $('homeSliderDots').innerHTML=slides.map((x,i)=>'<button type="button" data-home-slide="'+i+'" aria-label="'+(lang==='bn'?'স্লাইড ':'Slide ')+(i+1)+'" aria-current="'+(i===activeSlide?'true':'false')+'" class="'+(i===activeSlide?'active':'')+'"></button>').join('');
  }
  function selectSlide(n){
    activeSlide=(n+slides.length)%slides.length;
    renderSlide();
  }
  function stopAutoplay(){if(autoplay){clearInterval(autoplay);autoplay=null}}
  function startAutoplay(){
    if(autoplay||paused||document.hidden||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
    autoplay=setInterval(()=>selectSlide(activeSlide+1),5500);
  }
  function render(){
    if(!$('home'))return;
    if($('homeTypeTab')){$('homeTypeTab').setAttribute('aria-selected',String(mode==='type'));$('homeTypeTab').classList.toggle('active',mode==='type')}
    if($('homeMealTab')){$('homeMealTab').setAttribute('aria-selected',String(mode==='meal'));$('homeMealTab').classList.toggle('active',mode==='meal')}
    if($('homeTypeTab'))$('homeTypeTab').textContent=onPhone()?(lang==='bn'?'খাবারের ধরন':'Food type'):'▱  '+L('byType');
    if($('homeMealTab'))$('homeMealTab').textContent=onPhone()?(lang==='bn'?'খাবারের সময়':'Meal time'):'▦  '+L('byMeal');
    if($('homeSectionIntro'))$('homeSectionIntro').textContent=L('menuHeading');
    if($('homeFreeRice'))$('homeFreeRice').textContent=L('rice');
    if($('homeWhatsText'))$('homeWhatsText').textContent=L('whatsapp');
    if($('homeHowTo'))$('homeHowTo').textContent=L('steps');
    renderSlide();renderChips();renderSections();
    if($('homeAddress'))$('homeAddress').textContent=config.address;
    if($('homePhone'))$('homePhone').textContent=config.phone;
    if($('homeCall'))$('homeCall').href=config.phone?'tel:'+config.phone:'#';
    if($('homeMapLink'))$('homeMapLink').href=$('mapsLink')?.href||config.mapsUrl||'#';
    const digits=String(config.whatsapp||'').replace(/\D/g,'');
    if($('homeWhatsLink'))$('homeWhatsLink').href=digits?'https://wa.me/'+digits:'#';
  }
  function switchMode(next){if(next!=='type'&&next!=='meal')return;mode=next;render();$('homeBrowse').scrollIntoView({block:'start',behavior:'smooth'})}
  function jumpToGroup(key){
    const section=Array.from(document.querySelectorAll('.home-food-section')).find(s=>s.dataset.group===key);
    if(section)section.scrollIntoView({block:'start',behavior:'smooth'});
  }
  function openSliderMenu(){
    category=slides[activeSlide].category;
    navigate('menu');
  }
  function handleHomeClick(e){
    const add=e.target.closest('[data-home-delta]');
    if(add){const id=add.dataset.homeId,delta=Number(add.dataset.homeDelta);changeQty(id,delta);renderSections();return}
    const expand=e.target.closest('[data-home-expand]');
    if(expand){const key=mode+'|'+expand.dataset.homeExpand;expanded.has(key)?expanded.delete(key):expanded.add(key);renderSections();return}
    const jump=e.target.closest('[data-home-jump]');
    if(jump){document.querySelectorAll('.home-chip').forEach(b=>b.classList.toggle('active',b===jump));jumpToGroup(jump.dataset.homeJump);return}
    const slide=e.target.closest('[data-home-slide]');
    if(slide){selectSlide(Number(slide.dataset.homeSlide));return}
    if(e.target.closest('#homeSliderPrev')){selectSlide(activeSlide-1);return}
    if(e.target.closest('#homeSliderNext')){selectSlide(activeSlide+1);return}
    if(e.target.closest('#homeSlideAction')){openSliderMenu();return}
    if(e.target.closest('#homeTypeTab')){switchMode('type');return}
    if(e.target.closest('#homeMealTab')){switchMode('meal');return}
    if(e.target.closest('#homeCartCue')){navigate('cart');return}
  }
  function initHome(){
    const root=$('home');if(!root)return;
    root.addEventListener('click',handleHomeClick);
    const slider=$('homeSlider');
    if(slider){
      slider.addEventListener('mouseenter',()=>{paused=true;stopAutoplay()});
      slider.addEventListener('mouseleave',()=>{paused=false;startAutoplay()});
      slider.addEventListener('focusin',()=>{paused=true;stopAutoplay()});
      slider.addEventListener('focusout',()=>{paused=false;startAutoplay()});
      let touchX=null;
      slider.addEventListener('touchstart',ev=>{touchX=ev.changedTouches[0].screenX;paused=true;stopAutoplay()},{passive:true});
      slider.addEventListener('touchend',ev=>{if(touchX!==null){const dx=ev.changedTouches[0].screenX-touchX;if(Math.abs(dx)>45)selectSlide(activeSlide+(dx<0?1:-1));touchX=null}paused=false;startAutoplay()},{passive:true});
    }
    document.addEventListener('visibilitychange',()=>{document.hidden?stopAutoplay():startAutoplay()});
    render();startAutoplay();
  }
  window.KBNHome={render,renderSections,updateCartCue};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initHome,{once:true});else initHome();
})();