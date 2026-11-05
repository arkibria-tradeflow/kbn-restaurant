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
      subOrder:'খাবার ও মোট দাম দেখুন',subDelivery:'ফোন ও লোকেশন',subConfirm:'রেস্টুরেন্টে সরাসরি পাঠান',waUnavailable:'রেস্টুরেন্টের WhatsApp নম্বর পাওয়া যাচ্ছে না।',retry:'আবার পাঠান',checkStatus:'অর্ডারের অবস্থা পরীক্ষা করুন',checking:'অর্ডার জমা হয়েছে কি না যাচাই করছি…',pendingNotice:'এখনও অর্ডার নিশ্চিত করা যায়নি। একই অর্ডার আবার পাঠাতে পারেন অথবা অবস্থা পরীক্ষা করুন।',serviceRequired:'Order Confirmation Service আপডেট হয়নি বা সংযোগ পাওয়া যাচ্ছে না। অর্ডার পাঠানো হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।',receiptTitle:'অর্ডার জমা হয়েছে',receiptNote:'রেস্টুরেন্টের ড্যাশবোর্ডে জমা হয়েছে।',receiptId:'অর্ডার নম্বর',receiptItems:'অর্ডারের বিবরণ',receiptTotal:'মোট',receiptDelivery:'ডেলিভারির তথ্য',receiptWhats:'WhatsApp-এ শেয়ার করুন (ঐচ্ছিক)',receiptAnother:'নতুন অর্ডার করুন',receiptDisclaimer:'দ্রুত নিশ্চিতকরণের জন্য WhatsApp-এ শেয়ার করতে পারেন।',apiUnavailable:'অনলাইন অর্ডার সেবা আপাতত পাওয়া যাচ্ছে না। অনুগ্রহ করে রেস্টুরেন্টে কল করুন।',limit:'এক অর্ডারে সর্বোচ্চ ২৫ ধরনের খাবার, প্রতিটির সর্বোচ্চ ৩০টি এবং মোট ৯৯টি খাবার দেওয়া যাবে।',sending:'অর্ডার পাঠানো হচ্ছে…'
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
      subOrder:'Review your food and total',subDelivery:'Phone and location',subConfirm:'Send directly to restaurant',waUnavailable:'The restaurant WhatsApp number is unavailable.',retry:'Resend order',checkStatus:'Check order status',checking:'Checking whether your order was saved…',pendingNotice:'Order not yet verified. You can check status or resend the same order.',serviceRequired:'The Order Confirmation Service is not updated or cannot be reached. Your order has not been sent. Please try again.',receiptTitle:'Order submitted',receiptNote:'Saved to the restaurant dashboard.',receiptId:'Order number',receiptItems:'Order details',receiptTotal:'Total',receiptDelivery:'Delivery details',receiptWhats:'Share on WhatsApp (optional)',receiptAnother:'Place another order',receiptDisclaimer:'WhatsApp sharing is optional and may speed up confirmation.',apiUnavailable:'Online ordering is currently unavailable. Please call the restaurant.',limit:'Maximum 25 different items, 30 of each, and 99 total per order.',sending:'Submitting order…'
    }
  };
  const $=id=>document.getElementById(id);
  const text=k=>labels[lang]?.[k]||labels.bn[k]||k;
  const phoneOk=v=>/^[+\d\s()\-]+$/.test(v)&&v.replace(/\D/g,'').length>=8&&v.replace(/\D/g,'').length<=15;
  const endpoint=()=>String(config.orderApiUrl||'').trim();
  const endpointOk=url=>/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec(?:\?.*)?$/.test(url);
  let submitting=false, pending=null, confirmed=null, transportTimer=null, statusRequest=null, pollAttempts=0;
  function requestId(){
    // Every NEW order gets a fresh token. Only a saved pending order is
    // retried with its original token; never reuse a legacy completed order.
    const id=typeof crypto!=='undefined'&&typeof crypto.randomUUID==='function'
      ?crypto.randomUUID():'kbn_'+Date.now()+'_'+Math.random().toString(36).slice(2,14);
    try{sessionStorage.setItem('kbn-pending-request-id',id)}catch(_){}
    return id;
  }
  const checkoutStore='kbn-order-pending-v2';
  function showStatus(message,needsCheck=false,error=false){
    const box=$('kbnSubmissionStatus');
    if(!box)return;
    box.hidden=false;
    $('kbnSubmissionText').textContent=message;
    $('kbnCheckStatus').hidden=!needsCheck;
    box.dataset.state=error?'error':'pending';
  }
  function hideStatus(){
    if($('kbnSubmissionStatus'))$('kbnSubmissionStatus').hidden=true;
  }
  function cleanStatusRequest(){
    if(!statusRequest)return null;
    const state=statusRequest;
    statusRequest=null;
    clearTimeout(state.timer);
    state.script.remove();
    return state;
  }
  function cancelPolling(){
    clearTimeout(transportTimer);transportTimer=null;
    cleanStatusRequest();
  }
  function readPending(){
    try{
      const x=JSON.parse(sessionStorage.getItem(checkoutStore)||'null');
      return x&&x.payload&&/^[A-Za-z0-9_-]{12,90}$/.test(x.payload.requestId)
        &&Array.isArray(x.snapshot?.items)?x:null;
    }catch(_){return null}
  }
  function savePending(){
    try{if(pending)sessionStorage.setItem(checkoutStore,JSON.stringify(pending));else sessionStorage.removeItem(checkoutStore)}catch(_){}
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
    if($('apiNotice')&&!pending)$('apiNotice').textContent=text('confirm');
    if($('sendOrder')){
      $('sendOrder').textContent=submitting?text('sending'):(pending?text('retry'):text('submit'));
      $('sendOrder').disabled=submitting;
    }
    if($('checkoutArea')){
      $('cartEmptyNotice').hidden=confirmed?true:cartCount()>0;
      $('checkoutArea').hidden=Boolean(confirmed)||cartCount()===0;
    }
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
  function changeReceiptLanguage(){
    if(!confirmed)return;
    const snapshot=confirmed.snapshot;
    $('kbnReceiptHeading').textContent=text('receiptTitle');
    $('kbnReceiptNote').textContent=text('receiptNote');
    $('kbnReceiptIdLabel').textContent=text('receiptId');
    $('kbnReceiptId').textContent=confirmed.orderId;
    $('kbnReceiptStatus').textContent='Submitted';
    $('kbnReceiptDate').textContent=confirmed.receivedAt+' · Dubai';
    $('kbnReceiptItemsLabel').textContent=text('receiptItems');
    const list=$('kbnReceiptItems');
    list.replaceChildren();
    snapshot.items.forEach(item=>{
      const li=document.createElement('li');
      const name=lang==='bn'&&item.name_bn?item.name_bn:item.name_en;
      const itemName=document.createElement('span');
      itemName.textContent=item.quantity+' × '+name;
      const itemPrice=document.createElement('strong');
      itemPrice.textContent=money(item.quantity*item.price);
      li.append(itemName,itemPrice);
      list.appendChild(li);
    });
    $('kbnReceiptTotalLabel').textContent=text('receiptTotal')+' ('+confirmed.qty+' '+text('items')+')';
    $('kbnReceiptTotal').textContent=money(confirmed.total);
    $('kbnReceiptDeliveryLabel').textContent=text('receiptDelivery');
    $('kbnReceiptPhone').textContent=text('reviewPhone')+': '+snapshot.phone;
    $('kbnReceiptAddress').textContent=text('reviewLocation')+': '+(snapshot.address|| (snapshot.maps?(lang==='bn'?'Google Maps লোকেশন':'Google Maps location'):'—'));
    const map=$('kbnReceiptMaps');
    map.hidden=!snapshot.maps;
    if(snapshot.maps){map.href=snapshot.maps;map.textContent=lang==='bn'?'Google Maps-এ লোকেশন দেখুন':'View location on Google Maps'}
    const wa=$('kbnReceiptWhats');
    const digits=String(config.whatsapp||'').replace(/\D/g,'');
    wa.hidden=!/^\d{8,15}$/.test(digits);
    if(!wa.hidden){
      const lines=['*KBN Restaurant — '+confirmed.orderId+'*',''];
      snapshot.items.forEach(x=>lines.push(x.quantity+' × '+(x.name_bn||x.name_en)+' — '+money(x.quantity*x.price)));
      lines.push('','*'+text('receiptTotal')+': '+money(confirmed.total)+'*','Phone: '+snapshot.phone);
      if(snapshot.address)lines.push('Delivery: '+snapshot.address);
      if(snapshot.maps)lines.push('Google Maps: '+snapshot.maps);
      if(snapshot.notes)lines.push('Notes: '+snapshot.notes);
      lines.push('',lang==='bn'?'অর্ডারটি ওয়েবসাইটে ইতোমধ্যে জমা হয়েছে। অনুগ্রহ করে নিশ্চিত করুন।':'This order has already been submitted on the website. Please confirm.');
      wa.href='https://wa.me/'+digits+'?text='+encodeURIComponent(lines.join('\n'));
    }
    wa.textContent=text('receiptWhats');
    $('kbnAnotherOrder').textContent=text('receiptAnother');
    $('kbnReceiptDisclaimer').textContent=text('receiptDisclaimer');
  }
  function confirmSavedOrder(data){
    if(!pending||!data||data.requestId!==pending.payload.requestId||data.found!==true)return;
    if(!/^KBN-[A-Za-z0-9-]{10,60}$/.test(String(data.orderId||'')))return;
    if(!Number.isFinite(Number(data.total))||Number(data.total)<0)return;
    cancelPolling();
    confirmed={
      orderId:String(data.orderId),receivedAt:String(data.receivedAt||''),
      qty:Number(data.qty)||pending.snapshot.items.reduce((sum,i)=>sum+i.quantity,0),
      total:Number(data.total),snapshot:pending.snapshot
    };
    submitting=false;
    pending=null;savePending();
    try{sessionStorage.removeItem('kbn-pending-request-id')}catch(_){}
    cart={};persist();updateBadge();
    $('kbnReceipt').hidden=false;
    $('cart').classList.add('kbn-show-receipt');
    $('checkoutArea').hidden=true;
    $('cartEmptyNotice').hidden=true;
    hideStatus();
    changeReceiptLanguage();
    navigate('cart');
    requestAnimationFrame(()=>$('kbnReceipt').scrollIntoView({block:'start',behavior:'smooth'}));
  }
  function finishLookup(data){
    const lookup=cleanStatusRequest();
    if(!lookup||!pending)return;
    if(data&&data.requestId!==pending.payload.requestId)return;
    if(data&&data.found===true){confirmSavedOrder(data);return}
    if(lookup.preflight){
      if(data&&data.found===false&&!data.serviceError){postPending();return}
      submitting=false;stepLabels();
      showStatus(text('serviceRequired'),false,true);
      return;
    }
    if(pollAttempts<12){
      transportTimer=setTimeout(()=>{transportTimer=null;pollAttempts++;lookupStatus(false)},2600);
      return;
    }
    submitting=false;stepLabels();
    showStatus(text('pendingNotice'),true,true);
  }
  function lookupStatus(preflight){
    if(!pending||statusRequest||!endpointOk(endpoint()))return;
    const params=new URLSearchParams({
      action:'status',requestId:pending.payload.requestId,
      _:String(Date.now())
    });
    const url=endpoint()+(endpoint().includes('?')?'&':'?')+params.toString();
    const script=document.createElement('script');
    script.async=true;
    script.referrerPolicy='no-referrer';
    const state={script,preflight,timer:null};
    statusRequest=state;
    state.timer=setTimeout(()=>{if(statusRequest===state)finishLookup(null)},8500);
    script.onerror=()=>{if(statusRequest===state)finishLookup(null)};
    script.onload=()=>{if(statusRequest===state)finishLookup(null)};
    script.src=url;
    document.head.appendChild(script);
  }
  window.KBNOrderStatus=function(data){
    if(!pending||!statusRequest||!data||data.requestId!==pending.payload.requestId)return;
    finishLookup(data);
  };
  function postPending(){
    if(!pending)return;
    const form=$('kbnOrderForm');
    const iframe=$('kbnOrderTransport');
    if(!form||!iframe){submitting=false;stepLabels();return}
    form.action=endpoint();
    form.target='kbnOrderTransport';
    $('kbnOrderPayload').value=JSON.stringify(pending.payload);
    $('apiNotice').removeAttribute('data-state');
    submitting=true;stepLabels();
    showStatus(text('checking'),false,false);
    try{form.submit()}catch(e){
      submitting=false;stepLabels();showStatus(text('serviceRequired'),true,true);return;
    }
    pollAttempts=0;
    transportTimer=setTimeout(()=>{transportTimer=null;pollAttempts++;lookupStatus(false)},1600);
  }
  function submitOrder(){
    if(submitting)return;
    if(!pending){
      if(!cartCount()){alert(text('noItems'));openStep('stepOrder');return}
      const d=validateDelivery();if(!d)return;
      updateConfirmReview();
      const items=menu.filter(x=>cart[x.id]&&x.available&&x.price!==null)
        .map(x=>({id:String(x.id),quantity:Number(cart[x.id])}));
      if(items.length===0||items.length>25||items.some(x=>!Number.isInteger(x.quantity)||x.quantity<1||x.quantity>30)||cartCount()>99){
        $('apiNotice').textContent=text('limit');
        $('apiNotice').setAttribute('data-state','error');
        return;
      }
      const snapshot={
        phone:d.phone,name:d.name,address:d.address,maps:d.maps,notes:d.notes,
        items:items.map(i=>{
          const x=menu.find(x=>x.id===i.id);
          return {id:i.id,quantity:i.quantity,name_bn:x.name_bn,name_en:x.name_en,price:x.price};
        })
      };
      pending={
        payload:{source:'KBN Website',requestId:requestId(),
          phone:d.phone,name:d.name,address:d.address,maps:d.maps,notes:d.notes,items},
        snapshot
      };
      savePending();
    }
    if(!endpointOk(endpoint())){
      submitting=false;stepLabels();
      showStatus(text('apiUnavailable'),false,true);
      return;
    }
    cancelPolling();
    submitting=true;stepLabels();
    // Confirm backend support before POST. Older deployments do not implement
    // a read-only status lookup, so they must not create unverifiable orders.
    showStatus(text('checking'),false,false);
    lookupStatus(true);
  }
  function init() {
    if(!$('stepDelivery'))return;
    Object.assign(TRANSLATIONS.bn,{yourName:labels.bn.yourName,yourAddress:labels.bn.yourAddress,yourMaps:labels.bn.yourMaps});
    Object.assign(TRANSLATIONS.en,{yourName:labels.en.yourName,yourAddress:labels.en.yourAddress,yourMaps:labels.en.yourMaps});
    const oldSetLanguage=setLanguage;
    setLanguage=function(next){oldSetLanguage(next);stepLabels();changeReceiptLanguage();};
    const oldRenderCart=renderCart;
    renderCart=function(){
      oldRenderCart();stepLabels();
      if(confirmed){
        $('cart').classList.add('kbn-show-receipt');
        $('checkoutArea').hidden=true;
        $('cartEmptyNotice').hidden=true;
        $('kbnReceipt').hidden=false;
      }
    };
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
    $('kbnCheckStatus').onclick=()=>{
      if(!pending)return;
      cancelPolling();pollAttempts=0;submitting=true;stepLabels();
      showStatus(text('checking'),false,false);
      lookupStatus(false);
    };
    $('kbnAnotherOrder').onclick=()=>{
      cancelPolling();
      pending=null;confirmed=null;submitting=false;savePending();
      try{sessionStorage.removeItem('kbn-pending-request-id')}catch(_){}
      cart={};persist();updateBadge();
      for(const id of ['customerName','customerPhone','customerAddress','customerMaps','customerNotes']){
        if($(id))$(id).value='';
      }
      $('kbnReceipt').hidden=true;
      $('cart').classList.remove('kbn-show-receipt');
      $('locationManual').open=false;$('deliveryOptional').open=false;
      $('stepOrder').open=false;$('stepDelivery').open=true;$('stepConfirm').open=false;
      clearValidation();hideStatus();renderCart();navigate('menu');
    };
    pending=readPending();
    if(pending){
      openStep('stepConfirm',false);
      submitting=true;stepLabels();
      showStatus(text('checking'),false,false);
      transportTimer=setTimeout(()=>{transportTimer=null;pollAttempts++;lookupStatus(false)},650);
    }
    window.addEventListener('pageshow',()=>{
      if(pending&&!confirmed&&!statusRequest&&!transportTimer){
        pollAttempts=0;submitting=true;stepLabels();
        lookupStatus(false);
      }
      stepLabels();
    });
    stepLabels();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();