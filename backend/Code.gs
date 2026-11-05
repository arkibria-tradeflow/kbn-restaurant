/**
 * KBN Restaurant — Orders backend
 * Paste this full file into Extensions > Apps Script of the PRIVATE Orders Sheet.
 * Deploy a Web App: execute as Me; access Anyone.
 * Menu prices are ALWAYS recalculated from the separate menu sheet.
 * Script Properties (only for optional approved WhatsApp Business Cloud API):
 *   WA_TOKEN, WA_PHONE_ID, WA_ALERT_TO, WA_TEMPLATE_NAME,
 *   WA_TEMPLATE_LANG, WA_OPTIN_CONFIRMED=true
 */
var ORDER_SHEET_ID = '18oODmgnzwak5XsszFbB67rG3qat1lDroua8V0BTq2V8';
var MENU_SHEET_ID = '1Lb1q6TPS1ccpvId6BT93ew5cyWcMDEQtEpOK-6vi97g';
var RETURN_URL = 'https://arkibria-tradeflow.github.io/kbn-restaurant/';
var RESTAURANT_WHATSAPP = '971547429022';
var TZ = 'Asia/Dubai';

function doGet() {
  return HtmlService.createHtmlOutput(
    '<!doctype html><html lang="bn"><meta name="viewport" content="width=device-width,initial-scale=1">'+
    '<title>KBN Orders</title><body style="font-family:system-ui;padding:24px">'+
    '<h2>KBN Restaurant Order Service</h2><p>Backend is ready to receive checkout orders.</p>'+
    '<p>Customer and order information is available only in the private Orders spreadsheet.</p>'+
    '<a href="'+RETURN_URL+'">Return to KBN Restaurant</a></body></html>'
  );
}

function doPost(e) {
  var response;
  try {
    response = acceptOrder_(e);
  } catch (error) {
    console.error('Order submission failed: ' + String(error));
    return receipt_(false, null,
      'অর্ডারটি গ্রহণ করা যায়নি। তথ্য যাচাই করুন অথবা রেস্টুরেন্টে যোগাযোগ করুন।');
  }
  return receipt_(true,response,'আপনার অর্ডারটি রেস্টুরেন্টে জমা হয়েছে।');
}

function acceptOrder_(e) {
  var raw = e && e.parameter && e.parameter.payload;
  var honeypot = e && e.parameter && e.parameter.website;
  if (honeypot || !raw || raw.length > 16000) throw new Error('Invalid input');
  var body;
  try { body=JSON.parse(raw); } catch (_) { throw new Error('Invalid input'); }
  if (!body || body.source !== 'KBN Website' || !/^[A-Za-z0-9_-]{12,90}$/.test(String(body.requestId||''))) {
    throw new Error('Invalid input');
  }

  var requestId=String(body.requestId);
  var phone=String(body.phone||'').trim().slice(0,25);
  var phoneDigits=phone.replace(/\D/g,'');
  var name=clean_(body.name,80);
  var address=clean_(body.address,250);
  var maps=String(body.maps||'').trim().slice(0,1000);
  var notes=clean_(body.notes,350);
  if (!/^[+\d\s()-]+$/.test(phone) || phoneDigits.length < 8 || phoneDigits.length > 15) {
    throw new Error('Invalid input');
  }
  if (!address && !maps) throw new Error('Invalid input');
  if (maps && !validMap_(maps)) throw new Error('Invalid input');
  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 25) {
    throw new Error('Invalid input');
  }
  var chosen = {}, qty = 0;
  body.items.forEach(function(line) {
    var id=String(line.id||'');
    var n=Number(line.quantity);
    if (!/^[A-Za-z0-9_-]{2,30}$/.test(id) || !Number.isInteger(n) || n<1 || n>30 || chosen[id]) {
      throw new Error('Invalid input');
    }
    chosen[id]=n;qty+=n;
  });
  if (qty>99) throw new Error('Invalid input');

  var lock=LockService.getScriptLock();
  if (!lock.tryLock(15000)) throw new Error('Busy');
  var entry,rowIndex;
  try {
    var sheet=SpreadsheetApp.openById(ORDER_SHEET_ID).getSheetByName('Orders');
    if (!sheet) throw new Error('Orders tab missing');
    var last=sheet.getLastRow();
    if (last>=2) {
      var same=sheet.getRange(2,13,last-1,1).createTextFinder(requestId).matchEntireCell(true).findNext();
      if (same) {
        var existing=sheet.getRange(same.getRow(),1,1,16).getValues()[0];
        return {
          id:String(existing[0]),createdAt:existing[1],status:String(existing[2]||'New'),
          phone:String(existing[3]||''),name:String(existing[4]||''),
          address:String(existing[5]||''),maps:String(existing[6]||''),
          items:String(existing[7]||'').split('\n'),qty:Number(existing[8]),
          total:Number(existing[9])
        };
      }
    }
    var throttle=CacheService.getScriptCache();
    var throttleKey='KBNPHONE_'+phoneDigits;
    if (throttle.get(throttleKey)) throw new Error('Rate limited');

    var menu=SpreadsheetApp.openById(MENU_SHEET_ID).getSheetByName('Menu Items').getDataRange().getValues();
    var priceBook={};
    for (var k=1;k<menu.length;k++){
      var r=menu[k],id=String(r[0]||'').trim(),price=Number(r[5]),available=/^(yes|true|1)$/i.test(String(r[6]||'yes'));
      if (id && r[5]!=='' && Number.isFinite(price) && price>=0 && available)
        priceBook[id]={name:String(r[3]||r[2]||id),price:price};
    }
    var textLines=[],total=0;
    Object.keys(chosen).forEach(function(id) {
      if (!priceBook[id]) throw new Error('Invalid input');
      var x=priceBook[id],count=chosen[id],cost=Math.round(x.price*count*100)/100;
      textLines.push(count+' × '+x.name+' — AED '+cost.toFixed(2));
      total+=cost;
    });
    total=Math.round(total*100)/100;
    if (total > 100000) throw new Error('Invalid input');

    var now=new Date(),newId='KBN-'+Utilities.formatDate(now,TZ,'yyyyMMdd-HHmmss')+'-'+String(Math.floor(Math.random()*9000)+1000);
    var row=[
      newId,now,'New',safeCell_(phone),safeCell_(name),safeCell_(address),safeCell_(maps),
      safeCell_(textLines.join('\n')),qty,total,safeCell_(notes),'KBN Website',
      requestId,'Pending','',now
    ];
    sheet.appendRow(row);
    SpreadsheetApp.flush();
    rowIndex=sheet.getLastRow();
    throttle.put(throttleKey,'1',45);
    entry={id:newId,createdAt:now,status:'New',total:total,qty:qty,
      phone:phone,name:name,address:address,maps:maps,items:textLines};
  } finally {
    lock.releaseLock();
  }
  if (entry) {
    try {
      var alert=notifyWhatsApp_(entry);
      var sh=SpreadsheetApp.openById(ORDER_SHEET_ID).getSheetByName('Orders');
      sh.getRange(rowIndex,14,1,2).setValues([[alert.status,alert.details]]);
    } catch (ex) {
      console.error('WhatsApp alert failed: '+String(ex));
      try {
        SpreadsheetApp.openById(ORDER_SHEET_ID).getSheetByName('Orders')
          .getRange(rowIndex,14,1,2).setValues([['Failed','Notification error; order remains stored']]);
      }catch(_){}
    }
  }
  return entry;
}

function clean_(val,max) {
  return String(val==null?'':val).trim().replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,' ').slice(0,max);
}
function safeCell_(value) {
  var s=String(value||'');
  return /^[=+\-@]/.test(s) ? "'"+s : s;
}
function validMap_(value) {
  var match=/^https:\/\/([^\/?#:]+)([^?#]*)/i.exec(String(value||''));
  if (!match) return false;
  var host=match[1].toLowerCase(),path=match[2]||'';
  return /(^|\.)google\.(com|[a-z]{2}|com\.[a-z]{2}|co\.[a-z]{2})$/.test(host) ||
    host==='maps.app.goo.gl' || (host==='goo.gl' && path.indexOf('/maps')===0);
}
function escapeHtml_(value) {
  return String(value==null?'':value).replace(/[&<>"']/g, function(c) {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}
/**
 * Render an actual server-confirmed receipt, never a browser-generated
 * "success" state. The optional WhatsApp button is shown only for orders
 * that were saved in the private Orders sheet.
 */
function receipt_(ok,order,message) {
  var isValid=ok && order && String(order.id||'');
  var html=[];
  var home=RETURN_URL;
  html.push('<!doctype html><html lang="bn"><head><meta charset="utf-8">');
  html.push('<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">');
  html.push('<title>KBN Restaurant — Order Receipt</title>');
  html.push('<style>');
  html.push('*{box-sizing:border-box}body{margin:0;background:#f8f8f7;color:#272122;font:15px/1.55 system-ui,-apple-system,"Segoe UI",Arial,sans-serif}');
  html.push('header{background:linear-gradient(110deg,#78000b,#98000e);color:#fff;padding:15px 18px;display:flex;align-items:center;justify-content:center;gap:12px}');
  html.push('header img{width:45px;height:45px;background:#fff9e9;border-radius:10px;object-fit:contain;padding:3px}');
  html.push('header strong{font-size:18px;line-height:1.2}header small{display:block;font-size:11px;opacity:.85}');
  html.push('main{max-width:520px;margin:24px auto;padding:0 14px 32px}');
  html.push('.receipt{background:#fff;border:1px solid #e6e0dc;border-radius:18px;overflow:hidden;box-shadow:0 4px 18px #32000b12}');
  html.push('.success{padding:22px 18px 12px;text-align:center}.success .mark{width:48px;height:48px;display:grid;place-items:center;margin:auto auto 12px;border-radius:50%;background:#e8f5ed;color:#16633d;font-size:28px}');
  html.push('.failure .mark{background:#fff0ea;color:#a12525}.success h1{font-size:23px;line-height:1.3;margin:0 0 6px;color:#222}.success p{color:#656263;font-size:13px;margin:0}');
  html.push('.slip{padding:0 18px 20px}.slip-head{display:flex;justify-content:space-between;gap:12px;border-top:1px dashed #ddd5d1;border-bottom:1px dashed #ddd5d1;padding:14px 0;margin:15px 0}');
  html.push('.slip-head b{display:block;color:#78000c;font-size:16px}.slip-head small{display:block;color:#6f6b69;font-size:11px;margin-top:3px}.status{background:#e8f5ed;color:#175d3f;font-size:11px;font-weight:800;padding:5px 9px;border-radius:30px;align-self:start;white-space:nowrap}');
  html.push('.section-title{font-weight:850;font-size:13px;color:#4a4143;margin:13px 0 7px}.items{padding:0;margin:0;list-style:none}');
  html.push('.items li{padding:9px 0;border-bottom:1px solid #eee9e6;font-size:13px;overflow-wrap:anywhere}');
  html.push('.total{display:flex;justify-content:space-between;align-items:center;gap:10px;border-radius:11px;background:#fff0d5;color:#79000b;padding:13px;margin:14px 0;font-weight:900}');
  html.push('.total b{font-size:21px}.delivery{border:1px solid #eee8e6;border-radius:11px;padding:12px 14px;font-size:13px;color:#5a5454;overflow-wrap:anywhere}.delivery p{margin:5px 0}');
  html.push('.actions{padding:0 18px 20px;display:grid;gap:10px}.button{display:flex;align-items:center;justify-content:center;min-height:49px;text-decoration:none;border-radius:12px;padding:12px 14px;text-align:center;font-size:14px;font-weight:850}');
  html.push('.wa{background:#128453;color:#fff}.back{background:#fff;border:1px solid #a1071a;color:#85000d}.error{font-size:13px;color:#9d2222;margin:10px 18px 20px}');
  html.push('.note{text-align:center;color:#757172;font-size:12px;line-height:1.5;padding:13px 4px;margin:0}');
  html.push('@media print{header,.actions,.note{display:none!important}main{margin:0;padding:0}.receipt{box-shadow:none;border:1px solid #bbb}}');
  html.push('</style></head><body>');
  html.push('<header><img src="'+home+'assets/kbn-logo.svg" alt="KBN Logo"><span><strong>KBN Restaurant</strong><small>বাংলাদেশি খাবার</small></span></header>');
  html.push('<main><div class="receipt"><div class="success'+(isValid?'':' failure')+'"><span class="mark">'+(isValid?'✓':'!')+'</span>');
  html.push('<h1>'+(isValid?'অর্ডার জমা হয়েছে':'অর্ডার জমা হয়নি')+'</h1><p>'+escapeHtml_(message)+'</p></div>');
  if (isValid) {
    var safeId=escapeHtml_(order.id);
    var total=Number(order.total||0);
    var lineItems=Array.isArray(order.items)?order.items:[];
    var orderDate=order.createdAt instanceof Date?order.createdAt:new Date();
    var time=Utilities.formatDate(orderDate,TZ,'dd MMM yyyy, hh:mm a');
    html.push('<div class="slip"><div class="slip-head"><div><small>অর্ডার নম্বর</small><b>'+safeId+'</b><small>'+escapeHtml_(time)+' · Dubai</small></div><span class="status">Submitted</span></div>');
    html.push('<div class="section-title">অর্ডারের বিবরণ</div><ul class="items">');
    lineItems.forEach(function(line){if(line)html.push('<li>'+escapeHtml_(line)+'</li>');});
    html.push('</ul><div class="total"><span>মোট ('+Number(order.qty||0)+'টি খাবার)</span><b>AED '+total.toFixed(2)+'</b></div>');
    html.push('<div class="section-title">ডেলিভারির তথ্য</div><div class="delivery">');
    html.push('<p>ফোন: '+escapeHtml_(order.phone)+'</p>');
    if(order.name)html.push('<p>নাম: '+escapeHtml_(order.name)+'</p>');
    if(order.address)html.push('<p>ঠিকানা: '+escapeHtml_(order.address)+'</p>');
    if(order.maps)html.push('<p>GPS: <a href="'+escapeHtml_(order.maps)+'" target="_blank" rel="noopener noreferrer">Google Maps দেখুন</a></p>');
    html.push('</div></div>');
    var digits=String(RESTAURANT_WHATSAPP||'').replace(/\D/g,'');
    var waLines=['*KBN Restaurant — অর্ডার '+String(order.id)+'*',''];
    waLines=waLines.concat(lineItems);
    waLines.push('','*মোট: AED '+total.toFixed(2)+'*','ফোন: '+String(order.phone||''));
    if(order.address)waLines.push('ডেলিভারি: '+String(order.address));
    if(order.maps)waLines.push('Google Maps: '+String(order.maps));
    waLines.push('','অর্ডারটি ওয়েবসাইটে ইতোমধ্যে জমা হয়েছে। অনুগ্রহ করে দ্রুত নিশ্চিত করুন।');
    var waLink=/^\d{8,15}$/.test(digits)?'https://wa.me/'+digits+'?text='+encodeURIComponent(waLines.join('\n')):'';
    html.push('<div class="actions">');
    if(waLink)html.push('<a class="button wa" href="'+escapeHtml_(waLink)+'" target="_blank" rel="noopener noreferrer">WhatsApp-এ শেয়ার করুন (ঐচ্ছিক)</a>');
    html.push('<a class="button back" href="'+home+'?newOrder=1" target="_top">নতুন অর্ডার করুন</a></div>');
    html.push('<p class="note">WhatsApp-এ শেয়ার করা ঐচ্ছিক। এটি অর্ডার জমা হওয়ার বিকল্প নয়। রেস্টুরেন্ট থেকে নিশ্চিতকরণের জন্য যোগাযোগ করা হতে পারে।</p>');
  } else {
    html.push('<p class="error">অর্ডার নম্বর তৈরি হয়নি। আবার অর্ডার পাঠানোর আগে তথ্য যাচাই করুন।</p>');
    html.push('<div class="actions"><a class="button back" href="'+home+'" target="_top">মেনুতে ফিরে যান</a></div>');
  }
  html.push('</div></main></body></html>');
  return HtmlService.createHtmlOutput(html.join('')).setTitle('KBN Restaurant — Order Receipt');
}
/**
 * OPTIONAL: Requires a Meta-approved utility template to the consenting
 * restaurant recipient. Unapproved or absent credentials leave order saved
 * and mark alert Not configured.
 * Suggested template body:
 * New KBN order {{1}}. Items: {{2}}. Total AED {{3}}.
 * Delivery/contact: {{4}}. Review the private Orders Dashboard.
 */
function notifyWhatsApp_(order) {
  var p=PropertiesService.getScriptProperties();
  var token=p.getProperty('WA_TOKEN'),sender=p.getProperty('WA_PHONE_ID'),
    receiver=p.getProperty('WA_ALERT_TO'),template=p.getProperty('WA_TEMPLATE_NAME'),
    language=p.getProperty('WA_TEMPLATE_LANG')||'en_US';
  if (!token || !sender || !receiver || !template ||
      p.getProperty('WA_OPTIN_CONFIRMED')!=='true') {
    return {status:'Not configured',details:'Meta WhatsApp Cloud API template/opt-in not configured'};
  }
  if (!/^\d{8,15}$/.test(receiver)) return {status:'Failed',details:'Invalid WA_ALERT_TO'};
  var summary=order.items.join('; ').slice(0,400);
  var delivery=(order.phone+' | '+(order.address||'')+' | '+(order.maps||'')).slice(0,450);
  var request={
    messaging_product:'whatsapp',to:receiver,type:'template',
    template:{name:template,language:{code:language},components:[{type:'body',parameters:[
      {type:'text',text:order.id},{type:'text',text:summary},
      {type:'text',text:order.total.toFixed(2)},{type:'text',text:delivery}
    ]}]}
  };
  var response=UrlFetchApp.fetch('https://graph.facebook.com/v22.0/'+encodeURIComponent(sender)+'/messages',{
    method:'post',contentType:'application/json',headers:{Authorization:'Bearer '+token},
    payload:JSON.stringify(request),muteHttpExceptions:true
  });
  var status=response.getResponseCode();
  return status>=200&&status<300
    ?{status:'Sent',details:'WhatsApp Cloud API accepted: '+status}
    :{status:'Failed',details:'Meta API HTTP '+status+'; check execution logs'};
}
/** Bound spreadsheet simple trigger: records manual order status edits. */
function onEdit(e) {
  if (!e||!e.range||e.range.getSheet().getName()!=='Orders'||
      e.range.getColumn()!==3||e.range.getRow()<2||e.range.getNumRows()!==1) return;
  var next=String(e.value||'');
  if (['New','Accepted','Preparing','Out for Delivery','Delivered','Cancelled'].indexOf(next)<0) return;
  var book=e.source;
  var row=e.range.getRow();
  var orderId=book.getSheetByName('Orders').getRange(row,1).getValue();
  if (!orderId) return;
  var time=new Date();
  book.getSheetByName('Orders').getRange(row,16).setValue(time);
  book.getSheetByName('Order Events').appendRow([
    time,String(orderId),String(e.oldValue||''),next,
    Session.getActiveUser().getEmail()||'Sheet editor'
  ]);
}