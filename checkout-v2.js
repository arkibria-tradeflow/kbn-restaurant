/* KBN Restaurant — mobile-first accordion checkout (GitHub Pages) */
(function () {
  'use strict';
  const labels={
    bn:{
      stepOrder:'১. অর্ডারের সারাংশ',stepDelivery:'২. ডেলিভারি তথ্য',stepConfirm:'৩. অর্ডার নিশ্চিত করুন',
      items:'টি খাবার',phone:'মোবাইল নম্বর *',deliveryHint:'শুধু ফোন নম্বর এবং লোকেশন বা ঠিকানা দিলেই হবে।',
      yourName:'আপনার নাম (ঐচ্ছিক)',yourAddress:'বিল্ডিং / ফ্ল্যাট / দোকান (ঐচ্ছিক)',yourMaps:'Google Maps লিংক (ঐচ্ছিক)',
      optionalMore:'আরও তথ্য (ঐচ্ছিক)',manualLocation:'লোকেশন লিংক হাতে লিখুন / পেস্ট করুন',
      next:'পরের ধাপ: অর্ডার নিশ্চিত করুন',submit:'অর্ডার সাবমিট করুন',
      unconfigured:'অনলাইন অর্ডার সার্ভার সংযোগের কাজ বাকি। আপাতত নিচের বিকল্প দিয়ে অর্ডার পাঠানো যাবে।',
      fallback:'সাময়িক বিকল্প: WhatsApp অর্ডার',ready:'অর্ডার সরাসরি রেস্টুরেন্টের ড্যাশবোর্ডে জমা হবে।',
      sending:'অর্ডার পাঠানো হচ্ছে…',confirm:'অর্ডার পাঠালে রেস্টুরেন্ট ফোনে নিশ্চিত করতে পারে।',
      phoneError:'সঠিক মোবাইল নম্বর দিন।',locationError:'লোকেশন নিন অথবা একটি ডেলিভারি ঠিকানা লিখুন।',
      mapError:'সঠিক Google Maps লিংক দিন অথবা ঘরটি খালি রাখুন।',
      noItems:'কার্টে অন্তত একটি খাবার যোগ করুন।', empty:'কার্ট খালি। মেনু থেকে খাবার যোগ করুন।',
      orderTitle:'আপনার অর্ডার', optionalNotes:'বিশেষ নির্দেশনা (ঐচ্ছিক)'
    },
    en:{
      stepOrder:'1. Order summary',stepDelivery:'2. Delivery details',stepConfirm:'3. Confirm order',
      items:'items',phone:'Mobile number *',deliveryHint:'Just add your phone and a location or address.',
      yourName:'Your name (optional)',yourAddress:'Building / apartment / shop (optional)',yourMaps:'Google Maps link (optional)',
      optionalMore:'More details (optional)',manualLocation:'Paste a Maps link manually',
      next:'Next: Confirm order',submit:'Submit order',
      unconfigured:'Online order service is not connected yet. You can temporarily use the alternative below.',
      fallback:'Temporary alternative: WhatsApp order',ready:'Orders are saved directly to the restaurant dashboard.',
      sending:'Submitting order…',confirm:'The restaurant may call to confirm delivery.',
      phoneError:'Enter a valid phone number.',locationError:'Share your location or provide a delivery address.',
      mapError:'Enter a valid Google Maps link or leave it blank.',
      noItems:'Add at least one food item to your cart.',empty:'Your cart is empty. Add items from the menu.',
      orderTitle:'Your order',optionalNotes:'Special instructions (optional)'
    }
  };
  const $=id=>document.getElementById(id);
  const text=k=>labels[lang]?.[k]||labels.bn[k]||k;
  const endpoint=()=>String(config.orderApiUrl||'').trim();
  const hasApi=()=>/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec(?:\?.*)?$/.test(endpoint());
  const phoneOk=v=>/^[+\d\s()\-]+$/.test(v)&&v.replace(/\D/g,'').length>=8&&v.replace(/\D/g,'').length<=15;
  function stepLabels() {
    document.querySelectorAll('[data-checkout-label]').forEach(el=>{el.textContent=text(el.dataset.checkoutLabel)});
    const n=cartCount(),summary=$('stepOrderMini');
    if(summary)summary.textContent=n+' '+text('items')+' · '+money(cartTotal());
    if($('confirmCount'))$('confirmCount').textContent=n+' '+text('items');
    if($('confirmTotal'))$('confirmTotal').textContent=money(cartTotal());
    if($('cartEmptyNotice'))$('cartEmptyNotice').textContent=text('empty');
    const configured=hasApi();
    if($('apiNotice'))$('apiNotice').textContent=configured?text('ready'):text('unconfigured');
    if($('legacyWhatsapp'))$('legacyWhatsapp').hidden=configured;
    if($('sendOrder')){$('sendOrder').textContent=configured?text('submit'):(lang==='bn'?'অনলাইন অর্ডার সংযোগ বাকি':'Online ordering not connected yet');$('sendOrder').disabled=!configured;}
    if($('checkoutArea'))$('cartEmptyNotice').hidden=cartCount()>0;
  }
  function validateDelivery() {
    clearCheckoutError();
    const phone=$('customerPhone').value.trim(),
      address=$('customerAddress').value.trim(),
      rawMap=$('customerMaps').value.trim(),
      map=mapsUrl(rawMap);
    if(!phoneOk(phone)){raise('phoneError','customerPhone');return null}
    if(rawMap&&!map){raise('mapError','customerMaps');$('locationManual').open=true;return null}
    if(!address&&!map){raise('locationError','useCurrentLocation');return null}
    return {phone,address,maps:map,name:$('customerName').value.trim(),notes:$('customerNotes').value.trim()};
  }
  function raise(key,focusId) {
    const e=$('checkoutError');e.hidden=false;e.textContent=text(key);
    const f=$(focusId);
    if(f){if(f.matches('input,textarea'))f.setAttribute('aria-invalid','true');f.focus();f.scrollIntoView({block:'center',behavior:'smooth'})}
  }
  function openStep(id) {
    for(const step of document.querySelectorAll('details.kbn-step'))step.open=step.id===id;
    $(id).scrollIntoView({block:'start',behavior:'smooth'});
  }
  function newRequestId() {
    const key='kbn-request-v2';
    let val='';
    try{val=sessionStorage.getItem(key)||''}catch(_){}
    if(!val){
      val=window.crypto?.randomUUID?.() || ('kbn_'+Date.now()+'_'+Math.random().toString(36).slice(2,14));
      try{sessionStorage.setItem(key,val)}catch(_){}
    }
    return val;
  }
  function temporarilySendWhatsApp() {
    const d=validateDelivery();if(!d)return;
    if(!cartCount()){raise('noItems','stepOrder');return}
    const digits=String(config.whatsapp||'').replace(/\D/g,'');
    if(!/^\d{8,15}$/.test(digits))return;
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
  function submitOrder() {
    if(!cartCount()){raise('noItems','stepOrder');return}
    const details=validateDelivery();
    if(!details){openStep('stepDelivery');return}
    if(!hasApi()){$('apiNotice').textContent=text('unconfigured');$('apiNotice').scrollIntoView({block:'center'});return}
    const payload={
      source:'KBN Website',requestId:newRequestId(),
      phone:details.phone,name:details.name,address:details.address,maps:details.maps,notes:details.notes,
      items:menu.filter(x=>cart[x.id]).map(x=>({id:x.id,quantity:cart[x.id]}))
    };
    if(!payload.items.length)return;
    const f=document.createElement('form');
    f.method='POST';f.action=endpoint();f.target='_self';f.acceptCharset='UTF-8';
    const p=document.createElement('input');p.type='hidden';p.name='payload';p.value=JSON.stringify(payload);f.appendChild(p);
    const hp=document.createElement('input');hp.type='hidden';hp.name='website';hp.value='';f.appendChild(hp);
    document.body.appendChild(f);
    $('sendOrder').disabled=true;$('sendOrder').textContent=text('sending');
    f.submit(); // Standard browser POST: no opaque CORS response and no false success.
  }
  function init() {
    if(!$('stepDelivery'))return;
    Object.assign(TRANSLATIONS.bn,{yourName:labels.bn.yourName,yourAddress:labels.bn.yourAddress,yourMaps:labels.bn.yourMaps});
    Object.assign(TRANSLATIONS.en,{yourName:labels.en.yourName,yourAddress:labels.en.yourAddress,yourMaps:labels.en.yourMaps});
    const oldSetLanguage=setLanguage;
    setLanguage=function(next){oldSetLanguage(next);stepLabels()};
    const oldRenderCart=renderCart;
    renderCart=function(){oldRenderCart();stepLabels()};
    const oldPersist=persist;
    persist=function(){try{sessionStorage.removeItem('kbn-request-v2')}catch(_){}oldPersist()};
    for(const d of document.querySelectorAll('details.kbn-step')){
      d.addEventListener('toggle',()=>{if(d.open){for(const other of document.querySelectorAll('details.kbn-step'))if(other!==d)other.open=false}});
    }
    $('nextStepConfirm').onclick=()=>{if(validateDelivery())openStep('stepConfirm')};
    $('sendOrder').onclick=submitOrder;
    $('legacyWhatsapp').onclick=temporarilySendWhatsApp;
    $('customerPhone').addEventListener('input',clearCheckoutError);
    $('customerAddress').addEventListener('input',clearCheckoutError);
    $('customerMaps').addEventListener('input',clearCheckoutError);
    window.addEventListener('pageshow',()=>{stepLabels()});
    stepLabels();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();