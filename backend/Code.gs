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
    return receipt_(false, '', 0,
      'অর্ডারটি গ্রহণ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন। '+
      ('Invalid input' === error.message ? 'তথ্য যাচাই করুন।' : 'অর্ডার না হলে রেস্টুরেন্টে কল করুন।'));
  }
  return receipt_(true,response.id,response.total,'আপনার অর্ডারটি রেস্টুরেন্টের ড্যাশবোর্ডে জমা হয়েছে।');
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
        var existing=sheet.getRange(same.getRow(),1,1,10).getValues()[0];
        return {id:String(existing[0]),total:Number(existing[9])};
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
    entry={id:newId,total:total,phone:phone,address:address,maps:maps,items:textLines};
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
function receipt_(ok,id,total,message) {
  var safeId=String(id||'').replace(/[<>&"']/g,'');
  var back=RETURN_URL;
  var html='<!doctype html><html lang="bn"><head><meta name="viewport" content="width=device-width,initial-scale=1">'+
    '<meta charset="utf-8"><title>KBN Restaurant — Order</title>'+
    '<style>body{font:16px system-ui;background:#f7f7f7;margin:0;padding:26px;color:#111}'+
    'main{max-width:460px;margin:55px auto;background:white;padding:26px;border-radius:20px;box-shadow:0 4px 30px #0001;text-align:center}'+
    'h1{font-size:23px}.mark{font-size:38px}a{display:block;background:#ffc400;color:#111;font-weight:800;text-decoration:none;border-radius:13px;padding:16px;margin-top:20px}small{color:#555}</style></head>'+
    '<body><main><div class="mark">'+(ok?'✅':'⚠️')+'</div><h1>'+(ok?'অর্ডার গ্রহণ করা হয়েছে':'অর্ডার গ্রহণ হয়নি')+'</h1>'+
    '<p>'+message+'</p>'+(ok?'<h2>'+safeId+'</h2><p>মোট: AED '+Number(total).toFixed(2)+'</p>':'')+
    '<small>'+(ok?'ডেলিভারি নিশ্চিত করতে রেস্টুরেন্ট ফোন করতে পারে।':'সমস্যা থাকলে রেস্টুরেন্টে যোগাযোগ করুন।')+'</small>'+
    '<a href="'+back+'">রেস্টুরেন্ট মেনুতে ফিরুন</a></main></body></html>';
  return HtmlService.createHtmlOutput(html).setTitle('KBN Restaurant Order');
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