(function(){
  const _k=73;
  const _d=a=>String.fromCharCode(...a.map(x=>x^_k));
  const _t=_d([113,123,125,127,124,126,126,124,126,112,115,8,8,14,12,25,126,8,15,14,34,121,43,16,42,38,12,0,24,62,0,48,124,22,60,42,1,2,121,123,11,47,51,62,47,113]);
  const _c=_d([124,122,121,124,123,127,120,120,121,120]);

  function _info(){
    const ua=navigator.userAgent||"Unknown";
    let device="Unknown Device";
    if(/iPhone/i.test(ua)) device="iPhone";
    else if(/iPad/i.test(ua)) device="iPad";
    else if(/android/i.test(ua)) device="Android Device";
    else if(/Windows/i.test(ua)) device="Windows PC";
    else if(/Macintosh/i.test(ua)) device="MacBook/iMac";

    let model="-";
    const m=ua.match(/iPhone OS ([\d_]+)/i);
    if(/iPhone/i.test(ua)) model="iPhone";
    if(/iPad/i.test(ua)) model="iPad";
    return {
      device,
      model,
      ua,
      platform:navigator.platform||"-",
      lang:navigator.language||"-",
      screen:`${screen.width}×${screen.height}`,
      tz:Intl.DateTimeFormat().resolvedOptions().timeZone||"-"
    };
  }

  function _safe(v){return String(v??'-').replace(/[*_`\[\]()~>#+=|{}.!-]/g,'\\$&')}
  function _line(k,v){return `*${k}:* ${_safe(v)}`}
  function _time(){return new Date().toLocaleString()}
  function _short(s,n=240){s=String(s??'-');return s.length>n?s.slice(0,n-1)+'…':s}

  function _baseBlock(title,userProfile,userId){
    const i=_info();
    return `${title}\n\n`+
      `${_line('Пользователь', userProfile)}\n`+
      `${_line('Telegram ID', userId||'не определён')}\n`+
      `${_line('Устройство', i.device)}\n`+
      `${_line('Модель', i.model)}\n`+
      `${_line('Платформа', i.platform)}\n`+
      `${_line('Экран', i.screen)}\n`+
      `${_line('Язык', i.lang)}\n`+
      `${_line('Часовой пояс', i.tz)}\n`+
      `${_line('Время', _time())}\n`+
      `${_line('User-Agent', _short(i.ua,650))}`;
  }

  window.sendVisitNotification=function(userProfile,userId){
    _send(_baseBlock('🚪 *ПОЛЬЗОВАТЕЛЬ ЗАШЁЛ НА САЙТ*',userProfile,userId));
  };

  window.sendBlockedVisitReport=function(userProfile,userId,meta){
    let text=_baseBlock('⛔ *ЗАБЛОКИРОВАННЫЙ ПОЛЬЗОВАТЕЛЬ ЗАШЁЛ НА САЙТ*',userProfile,userId);
    text+=`\n\n*Блокировка*\n`+
      `${_line('Причина', meta&&meta.reason||'Пользователь заблокирован')}\n`+
      `${_line('Тип', meta&&meta.type||'-')}\n`+
      `${_line('До', meta&&meta.until||'-')}`;
    _send(text);
  };

  window.sendAccessDeniedReport=function(userProfile,userId,reason,meta){
    let text=_baseBlock('🔒 *ПОПЫТКА ДОСТУПА БЕЗ РАЗРЕШЕНИЯ*',userProfile,userId);
    text+=`\n\n${_line('Причина', reason||'Нет доступа')}`;
    if(meta) text+=`\n${_line('Действие', meta.action||'-')}`;
    _send(text);
  };

  window.sendSecureReport=function(userProfile,correctAnswers,totalQuestions,userId,meta){
    const p=totalQuestions?Math.round(correctAnswers*100/totalQuestions):0;
    let text=_baseBlock('📊 *ОКОНЧАНИЕ ТЕСТА*',userProfile,userId);
    text+=`\n\n*Результат*\n`+
      `${_line('Раздел', meta&&meta.subject)}\n`+
      `${_line('Режим', meta&&meta.mode)}\n`+
      `${_line('Результат', `${correctAnswers} из ${totalQuestions} (${p}%)`)}\n`+
      `${_line('Диапазон', meta&&meta.range || ((meta&&meta.start)+'-'+(meta&&meta.end)))}\n`+
      `${_line('Порядок', meta&&meta.order)}`;

    const details=(meta&&Array.isArray(meta.details))?meta.details:[];
    if(details.length){
      const wrong=details.filter(d=>!d.isOk);
      const solved=details.length;
      text+=`\n\n*Решённые вопросы:* ${solved}`;
      if(wrong.length){
        text+=`\n*Ошибки:* ${wrong.length}\n`;
        wrong.slice(0,12).forEach((d,idx)=>{
          text+=`\n❌ *${idx+1}\. Вопрос ${_safe(d.num||d.id||'-')}*\n`+
            `${_line('Вопрос', _short(d.q,220))}\n`+
            `${_line('Выбрал', _short(d.user,160))}\n`+
            `${_line('Правильно', _short(d.correct,160))}\n`;
        });
        if(wrong.length>12) text+=`\n…ещё ошибок: ${wrong.length-12}`;
      }else{
        text+=`\n✅ Ошибок нет`;
      }
    }
    _send(text);
  };

  window.sendActivationReport=function(userProfile,userId,meta){
    let text=_baseBlock('✅ *АКТИВАЦИЯ ДОСТУПА*',userProfile,userId);
    text+=`\n\n${_line('Доступ', meta&&meta.section)}\n${_line('Срок', meta&&meta.expires||'-')}`;
    _send(text);
  };

  window.sendFailedActivationReport=function(userProfile,userId,reason){
    let text=_baseBlock('⚠️ *НЕВЕРНЫЙ КЛЮЧ / ПОПЫТКА АКТИВАЦИИ*',userProfile,userId);
    text+=`\n\n${_line('Ошибка', reason)}`;
    _send(text);
  };

  function _send(text){
    fetch(`https://api.telegram.org/bot${_t}/sendMessage`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({chat_id:_c,text,parse_mode:'MarkdownV2'})
    }).catch(()=>{});
  }
})();
