/* KBN Restaurant — mobile-first accordion checkout (GitHub Pages) */
(function () {
  'use strict';
  const labels={
    bn:{
      stepOrder:'১. অর্ডারের সারাংশ',stepDelivery:'২. ডেলিভারি তথ্য',stepConfirm:'৩. অর্ডার নিশ্চিত করুন',
      items:'টি খাবার',phone:'মোবাইল নম্বর *',deliveryHint:'শুধু ফোন নম্বর এবং লোকেশন বা ঠিকানা দিলেই হবে।',
      yourName:'আপনার নাম (ঐচ্ছিক)',yourAddress:'বিল্ডিং / ফ্ল্যাট / দোকান (ঐচ্ছিক)',yourMaps:'Google Maps লিংক (ঐচ্ছিক)',
      optionalMore:'আরও তথ্য (ঐচ্ছিক)',manualLocation:'লোকেশন লিংক হাতে লিখুন / পেস্ট করুন',
      next:'পরের ধাপ: অর্ডার নিশ্চিত করুন',submit:'হোয়াটসঅ্যাপে অর্ডার শেয়ার করুন',
      unconfigured:'অনলাইন অর্ডার সার্ভার সংযোগের কাজ বাকি। আপাতত নিচের বিকল্প দিয়ে অর্ডার পাঠানো যাবে।',
      fallback:'সাময়িক বিকল্প: WhatsApp অর্ডার',ready:'অর্ডার সরাসরি রেস্টুরেন্টের ড্যাশবোর্ডে জমা হবে।',
      sending:'অর্ডার পাঠানো হচ্ছে…',confirm:'WhatsApp খুলবে। অর্ডার পাঠাতে সেখানে Send চাপুন।',
      phoneError:'সঠিক মোবাইল নম্বর দিন।',locationError:'লোকেশন নিন অথবা একটি ডেলিভারি ঠিকানা লিখুন।',
      mapError:'সঠিক Google Maps লিংক দিন অথবা ঘরটি খালি রাখুন।',
      noItems:'কার্টে অন্তত একটি খাবার যোগ করুন।', empty:'কার্ট খালি। মেনু থেকে খাবার যোগ করুন।',
      orderTitle:'আপনার অর্ডার', optionalNotes:'বিশেষ নির্দেশনা (ঐচ্ছিক)',
      reviewTitle:'ডেলিভারির তথ্য',reviewPhone:'ফোন',reviewLocation:'লোকেশন / ঠিকানা',reviewMissing:'এখনো যোগ করা হয়নি',
      subOrder:'খাবার ও মোট দাম দেখুন',subDelivery:'ফোন ও লোকেশন',subConfirm:'WhatsApp-এ পাঠান',waUnavailable:'রেস্টুরেন্টের WhatsApp নম্বর পাওয়া যাচ্ছে না।'
    },
    en:{
      stepOrder:'1. Order summary',stepDelivery:'2. Delivery details',stepConfirm:'3. Confirm order',
      items:'items',phone:'Mobile number *',deliveryHint:'Just add your phone and a location or address.',
      yourName:'Your name (optional)',yourAddress:'Building / apartment / shop (optional)',yourMaps:'Google Maps link (optional)',
      optionalMore:'More details (optional)',manualLocation:'Paste a Maps link manually',
      next:'Next: Confirm order',submit:'Share order on WhatsApp',
      unconfigured:'Online order service is not connected yet. You can temporarily use the alternative below.',
      fallback:'Temporary alternative: WhatsApp order',ready:'Orders are saved directly to the restaurant dashboard.',
      sending:'Submitting order…',confirm:'WhatsApp will open with your order. Tap Send there to place it.',
      phoneError:'Enter a valid phone number.',locationError:'Share your location or provide a delivery address.',
      mapError:'Enter a valid Google Maps link or leave it blank.',
      noItems:'Add at least one food item to your cart.',empty:'Your cart is empty. Add items from the menu.',
      orderTitle:'Your order',optionalNotes:'Special instructions (optional)',
      reviewTitle:'Delivery details',reviewPhone:'Phone',reviewLocation:'Location / address',reviewMissing:'Not added yet',
      subOrder:'Review your food and total',subDelivery:'Phone and location',subConfirm:'Send via WhatsApp',waUnavailable:'The restaurant WhatsApp number is unavailable.'
    }
  };
  const $=id=>document.getElementById(id);
  const text=k=>labels[lang]?.[k]||labels.bn[k]||k;
  const phoneOk=v=>/^[+\d\s()\-]+$/.test(v)&&v.replace(/\D/g,'').length>=8&&v.replace(/\D/g,'').length<=15;
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
    if($('sendOrder')){$('sendOrder').textContent=text('submit');$('sendOrder').disabled=false;}
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
  function shareOrderWhatsApp() {
    if(!cartCount()){alert(text('noItems'));openStep('stepOrder');return}
    const d=validateDelivery();if(!d)return;
    updateConfirmReview();
    const digits=String(config.whatsapp||'').replace(/\D/g,'');
    if(!/^\d{8,15}$/.test(digits)){alert(text('waUnavailable'));return}
    const lines=['*'+config.name+' — নতুন অর্ডার*','',
      ...menu.filter(x=>cart[x.id]).map(x=>cart[x.id]+' × '+(x.name_bn||x.name_en)+' — '+money(cart[x.id]*x.price)),
      '','*মোট: '+money(cartTotal())+'*','', 'ফোন: '+d.phone];
    if(d.name)lines.push('নাম: '+d.name);
    if(d.address)lines.push('ডেলিভারি: '+d.address);
    if(d.maps)lines.push('Google Maps: '+d.maps);
    if(d.notes)lines.push('নির্দেশনা: '+d.notes);
    const url='https://wa.me/'+digits+'?text='+encodeURIComponent(lines.join('\n'));
    const w=window.open(url,'_blank','noopener,noreferrer');if(!w)location.href=url;
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
    $('sendOrder').onclick=shareOrderWhatsApp;
    $('customerPhone').addEventListener('input',()=>{clearOneError('customerPhoneError');clearCheckoutError()});
    $('customerAddress').addEventListener('input',()=>{clearOneError('customerLocationError');clearCheckoutError()});
    $('customerMaps').addEventListener('input',()=>{clearOneError('customerMapsError','customerLocationError');clearCheckoutError()});
    const gpsStatus=$('locationStatus');
    if(gpsStatus&&typeof MutationObserver!=='undefined'){
      new MutationObserver(()=>{if(gpsStatus.dataset.state==='success')clearOneError('customerMapsError','customerLocationError')}).observe(gpsStatus,{attributes:true,attributeFilter:['data-state']});
    }
    window.addEventListener('pageshow',()=>{stepLabels()});
    stepLabels();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();