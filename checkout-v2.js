/* KBN Restaurant — mobile-first accordion checkout (GitHub Pages) */
(function () {
  'use strict';
  const labels={
    bn:{
      stepOrder:'১. অর্ডারের সারাংশ',stepDelivery:'২. ডেলিভারি তথ্য',stepConfirm:'৩. অর্ডার করুন',
      items:'টি খাবার',phone:'মোবাইল নম্বর *',deliveryHint:'শুধু ফোন নম্বর এবং লোকেশন বা ঠিকানা দিলেই হবে।',
      yourName:'আপনার নাম (ঐচ্ছিক)',yourAddress:'বিল্ডিং / ফ্ল্যাট / দোকান (ঐচ্ছিক)',yourMaps:'Google Maps লিংক (ঐচ্ছিক)',
      optionalMore:'আরও তথ্য (ঐচ্ছিক)',manualLocation:'লোকেশন লিংক হাতে লিখুন / পেস্ট করুন',
      next:'পরের ধাপ: অর্ডার নিশ্চিত করুন',submit:'অর্ডার সাবমিট করুন',
      unconfigured:'অনলাইন অর্ডার সার্ভার সংযোগের কাজ বাকি। আপাতত নিচের বিকল্প দিয়ে অর্ডার পাঠানো যাবে।',
      fallback:'সাময়িক বিকল্প: WhatsApp অর্ডার',ready:'অর্ডার সরাসরি রেস্টুরেন্টের ড্যাশবোর্ডে জমা হবে।',
      sending:'অর্ডার পাঠানো হচ্ছে…',confirm:'অর্ডার জমা হলে একটি Order Slip দেখাবে। এরপর চাইলে WhatsApp-এ শেয়ার করুন।',
      phoneError:'সঠিক মোবাইল নম্বর দিন।',locationError:'লোকেশন নিন অথবা একটি ডেলিভারি ঠিকানা লিখুন।',
      mapError:'সঠিক Google Maps লিংক দিন অথবা ঘরটি খালি রাখুন।',
      noItems:'কার্টে অন্তত একটি খাবার যোগ করুন।', empty:'কার্ট খালি। মেনু থেকে খাবার যোগ করুন।',
      orderTitle:'আপনার অর্ডার', optionalNotes:'বিশেষ নির্দেশনা (ঐচ্ছিক)',
      reviewTitle:'ডেলিভারির তথ্য',reviewPhone:'ফোন',reviewLocation:'লোকেশন / ঠিকানা',reviewMissing:'এখনো যোগ করা হয়নি',
      subOrder:'খাবার ও মোট দাম দেখুন',subDelivery:'ফোন ও লোকেশন',subConfirm:'রেস্টুরেন্টে সরাসরি পাঠান',waUnavailable:'রেস্টুরেন্টের WhatsApp নম্বর পাওয়া যাচ্ছে না।',apiUnavailable:'অনলাইন অর্ডার সেবা আপাতত পাওয়া যাচ্ছে না। অনুগ্রহ করে রেস্টুরেন্টে কল করুন।',limit:'এক অর্ডারে সর্বোচ্চ ২৫ ধরনের খাবার, প্রতিটির সর্বোচ্চ ৩০টি এবং মোট ৯৯টি খাবার দেওয়া যাবে।',sending:'অর্ডার পাঠানো হচ্ছে…'
    },
    en:{
      stepOrder:'1. Order summary',stepDelivery:'2. Delivery details',stepConfirm:'3. Place order',
      items:'items',phone:'Mobile number *',deliveryHint:'Just add your phone and a location or address.',
      yourName:'Your name (optional)',yourAddress:'Building / apartment / shop (optional)',yourMaps:'Google Maps link (optional)',
      optionalMore:'More details (optional)',manualLocation:'Paste a Maps link manually',
      next:'Next: Confirm order',submit:'Place order',
      unconfigured:'Online order service is not connected yet. You can temporarily use the alternative below.',
      fallback:'Temporary alternative: WhatsApp order',ready:'Orders are saved directly to the restaurant dashboard.',
      sending:'Submitting order…',confirm:'After your order is saved, a receipt will appear with an optional WhatsApp share link.',
      phoneError:'Enter a valid phone number.',locationError:'Share your location or provide a delivery address.',
      mapError:'Enter a valid Google Maps link or leave it blank.',
      noItems:'Add at least one food item to your cart.',empty:'Your cart is empty. Add items from the menu.',
      orderTitle:'Your order',optionalNotes:'Special instructions (optional)',
      reviewTitle:'Delivery details',reviewPhone:'Phone',reviewLocation:'Location / address',reviewMissing:'Not added yet',
      subOrder:'Review your food and total',subDelivery:'Phone and location',subConfirm:'Send directly to restaurant',waUnavailable:'The restaurant WhatsApp number is unavailable.',apiUnavailable:'Online ordering is currently unavailable. Please call the restaurant.',limit:'Maximum 25 different items, 30 of each, and 99 total per order.',sending:'Submitting order…'
    }
  };
  const $=id=>document.getElementById(id);
  const text=k=>labels[lang]?.[k]||labels.bn[k]||k;
  const phoneOk=v=>/^[+\d\s()\-]+$/.test(v)&&v.replace(/\D/g,'').length>=8&&v.replace(/\D/g,'').length<=15;
  const endpoint=()=>String(config.orderApiUrl||'').trim();
  const endpointOk=url=>/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec(?:\?.*)?$/.test(url);
  let submitting=false;
  function requestId(){
    const key='kbn-pending-request-id';
    const cartKey=JSON.stringify(Object.keys(cart).sort().map(id=>[id,cart[id]]));
    try{
      const old=sessionStorage.getItem(key);
      if(sessionStorage.getItem('kbn-pending-cart-key')===cartKey&&old&&/^[A-Za-z0-9_-]{12,90}$/.test(old))return old;
    }catch(_){} 
    const id=typeof crypto!=='undefined'&&typeof crypto.randomUUID==='function'
      ?crypto.randomUUID():'kbn_'+Date.now()+'_'+Math.random().toString(36).slice(2,14);
    try{sessionStorage.setItem(key,id);sessionStorage.setItem('kbn-pending-cart-key',cartKey)}catch(_){}
    return id;
  }
  function stepLabels() {
    document.querySelectorAll('[data-checkout-label]').forEach(el=>{el.textContent=text(el.dataset.checkoutLabel)});
    document.querySelectorAll('[data-checkout-subtitle]').forEach(el=>{el.textContent=text('sub'+el.dataset.checkoutSubtitle.slice(4))});
    const n=cartCount(),summary=$('stepOrderMini');
    if(summary)summary.textContent=n+' '+text('items')+' · '+money(cartTotal());
    if($('confirmCount'))$('confirmCount').textContent=n+' '+text('items');
    if($('confirmTotal'))$('confirmTotal').textContent=money(cartTotal());
    updateConfirmReview();
    if($('cartEmptyNotice'))$('cartEmptyNotice').textContent=text('empty');
    if($('apiNotice'))$('apiNotice').textContent=text('confirm');
    if($('sendOrder')){
      $('sendOrder').textContent=submitting?text('sending'):text('submit');
      $('sendOrder').disabled=submitting;
    }
    if($('checkoutArea'))$('cartEmptyNotice').hidden=cartCount()>0;
  }
  function clearValidation() {
    clearCheckoutError();
    for(const id of ['customerPhoneError','customerMapsError','customerLocationError']){
      const el=$(id);if(el){el.hidden=true;el.textContent=''}
    }
    for(const id of ['customerPhone','customerMaps','customerAddress']){
      $(id)?.removeAttribute('aria-invalid');
    }
  }
  function clearOneError(...ids){
    for(const id of ids){
      const el=$(id);if(el){el.hidden=true;el.textContent=''}
    }
    if(ids.includes('customerPhoneError'))$('customerPhone')?.removeAttribute('aria-invalid');
    if(ids.includes('customerMapsError'))$('customerMaps')?.removeAttribute('aria-invalid');
    if(ids.includes('customerLocationError'))$('customerAddress')?.removeAttribute('aria-invalid');
  }
  function updateConfirmReview(){
    const phone=$('customerPhone')?.value.trim()||'';
    const address=$('customerAddress')?.value.trim()||'';
    const link=mapsUrl($('customerMaps')?.value.trim()||'');
    if($('confirmPhone'))$('confirmPhone').textContent=text('reviewPhone')+': '+(phone||text('reviewMissing'));
    if($('confirmLocation'))$('confirmLocation').textContent=text('reviewLocation')+': '+(address||(link?(lang==='bn'?'Google Maps লোকেশন':'Google Maps location'):text('reviewMissing')));
  }
  function openStep(id,scroll=true){
    for(const step of document.querySelectorAll('details.kbn-step'))step.open=step.id===id;
    if(scroll)requestAnimationFrame(()=>$(id)?.scrollIntoView({block:'start',behavior:'smooth'}));
  }
  function raise(key,focusId,errorId){
    openStep('stepDelivery',false);
    clearOneError('customerPhoneError','customerMapsError','customerLocationError');
    const message=text(key);
    const inline=$(errorId);
    if(inline){inline.textContent=message;inline.hidden=false}
    else {$('checkoutError').hidden=false;$('checkoutError').textContent=message}
    const focus=$(focusId);
    if(errorId==='customerMapsError')$('locationManual').open=true;
    if(focus?.matches('input,textarea'))focus.setAttribute('aria-invalid','true');
    if(key==='locationError')$('customerAddress').setAttribute('aria-invalid','true');
    requestAnimationFrame(()=>{
      const el=$(errorId)||focus;
      if(el&&!el.hidden)el.scrollIntoView({block:'center',behavior:'smooth'});
      if(focus)focus.focus({preventScroll:true});
    });
  }
  function validateDelivery(){
    clearValidation();
    const phone=$('customerPhone').value.trim(),
      address=$('customerAddress').value.trim(),
      rawMap=$('customerMaps').value.trim(),
      map=mapsUrl(rawMap);
    if(!phoneOk(phone)){raise('phoneError','customerPhone','customerPhoneError');return null}
    if(rawMap&&!map){raise('mapError','customerMaps','customerMapsError');return null}
    if(!address&&!map){raise('locationError','useCurrentLocation','customerLocationError');return null}
    return {phone,address,maps:map,name:$('customerName').value.trim(),notes:$('customerNotes').value.trim()};
  }
  function submitOrder(){
    if(submitting)return;
    if(!cartCount()){alert(text('noItems'));openStep('stepOrder');return}
    const d=validateDelivery();if(!d)return;
    updateConfirmReview();
    const url=endpoint();
    if(!endpointOk(url)){
      $('apiNotice').textContent=text('apiUnavailable');
      $('apiNotice').setAttribute('data-state','error');
      return;
    }
    const items=menu.filter(x=>cart[x.id]&&x.available&&x.price!==null)
      .map(x=>({id:String(x.id),quantity:Number(cart[x.id])}));
    if(items.length===0||items.length>25||items.some(x=>!Number.isInteger(x.quantity)||x.quantity<1||x.quantity>30)||cartCount()>99){
      $('apiNotice').textContent=text('limit');
      $('apiNotice').setAttribute('data-state','error');
      return;
    }
    const form=$('kbnOrderForm');
    if(!form||!$('kbnOrderPayload'))return;
    $('apiNotice').removeAttribute('data-state');
    $('kbnOrderPayload').value=JSON.stringify({
      source:'KBN Website',
      requestId:requestId(),
      phone:d.phone,name:d.name,address:d.address,maps:d.maps,notes:d.notes,items
    });
    form.action=url;
    submitting=true;
    stepLabels();
    // A regular form POST navigates to the Google Apps Script receipt.
    // No success state is shown until Apps Script has saved the order.
    form.submit();
  }
  function init() {
    if(!$('stepDelivery'))return;
    Object.assign(TRANSLATIONS.bn,{yourName:labels.bn.yourName,yourAddress:labels.bn.yourAddress,yourMaps:labels.bn.yourMaps});
    Object.assign(TRANSLATIONS.en,{yourName:labels.en.yourName,yourAddress:labels.en.yourAddress,yourMaps:labels.en.yourMaps});
    const oldSetLanguage=setLanguage;
    setLanguage=function(next){oldSetLanguage(next);stepLabels()};
    const oldRenderCart=renderCart;
    renderCart=function(){oldRenderCart();stepLabels()};
    for(const d of document.querySelectorAll('details.kbn-step')){
      d.addEventListener('toggle',()=>{if(d.open){for(const other of document.querySelectorAll('details.kbn-step'))if(other!==d)other.open=false}});
    }
    $('nextStepConfirm').onclick=()=>{if(validateDelivery()){updateConfirmReview();openStep('stepConfirm')}};
    $('sendOrder').onclick=submitOrder;
    $('customerPhone').addEventListener('input',()=>{clearOneError('customerPhoneError');clearCheckoutError()});
    $('customerAddress').addEventListener('input',()=>{clearOneError('customerLocationError');clearCheckoutError()});
    $('customerMaps').addEventListener('input',()=>{clearOneError('customerMapsError','customerLocationError');clearCheckoutError()});
    const gpsStatus=$('locationStatus');
    if(gpsStatus&&typeof MutationObserver!=='undefined'){
      new MutationObserver(()=>{if(gpsStatus.dataset.state==='success')clearOneError('customerMapsError','customerLocationError')}).observe(gpsStatus,{attributes:true,attributeFilter:['data-state']});
    }
    window.addEventListener('pageshow',()=>{submitting=false;stepLabels()});
    stepLabels();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();