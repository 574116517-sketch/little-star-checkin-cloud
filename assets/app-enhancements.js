/* 离线增强版：独立加载，避免和基础页面脚本相互阻断。 */
(() => {
  'use strict';
  const E = {};
  const $ = (q, root = document) => root.querySelector(q);
  const $$ = (q, root = document) => [...root.querySelectorAll(q)];
  const fireAsset = 0;
  const roster = [
    { asset: 0, name: '云纹焰兽', type: '火属性', gift: true, art: 'assets/fire-pet-catalog.jpg' },
    { asset: 14, name: '熔岩小牛', type: '火属性' }, { asset: 27, name: '赤焰蜥', type: '火属性' },
    { asset: 1, name: '水波海猫', type: '水属性' }, { asset: 15, name: '泡泡鱼', type: '水属性' }, { asset: 36, name: '珊瑚鱼', type: '水属性' },
    { asset: 2, name: '叶芽鹿', type: '自然属性' }, { asset: 13, name: '自然树灵', type: '自然属性' }, { asset: 35, name: '翡翠蛇', type: '自然属性' },
    { asset: 8, name: '光辉兔', type: '星光属性' }, { asset: 23, name: '星云水母', type: '星光属性' }, { asset: 62, name: '星辉鲤', type: '星光属性' }
  ];
  const style = document.createElement('style');
  style.textContent = `
    .merge-ready{margin:8px 0 0;padding:7px 9px;border-radius:10px;background:#e7fff4;color:#08734d;font-size:12px;font-weight:900}.material-top{display:flex;align-items:center;gap:5px;padding:7px 8px;border:2px solid #8ce0f4;border-radius:13px;background:#07589d;color:#fff;box-shadow:inset 0 0 0 2px #06477f,0 3px 0 #063a70;font-weight:900;cursor:default}.material-top i{font-style:normal;font-size:18px}.material-top span{display:block;color:#d6f4ff;font-size:10px;line-height:1}.material-top strong{display:block;color:#fff3a4;font-size:17px;line-height:1.1}.top{gap:6px}.top>div:first-child{margin-right:auto}
    .points-system{margin-top:14px}.points-head{display:flex;align-items:center;justify-content:space-between;gap:8px}.points-head h2{margin:0}.points-note{padding:4px 7px;border-radius:999px;background:#fff0a8;color:#8b6400;font-size:11px;font-weight:900}
    .points-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:12px 0}.points-grid>div,.points-grid>button{min-width:0;padding:10px 5px;border:2px solid #a9ddf3;border-radius:13px;background:#f1fbff;text-align:center}.points-grid>button{font:inherit;cursor:pointer}.points-grid span,.points-grid small{display:block;color:#5484a7;font-size:10px;font-weight:800}.points-grid strong{display:block;margin:3px 0;color:#096ab4;font-size:22px;line-height:1.05}
    .growth-box{margin:16px 0;padding:13px;border:2px solid #9bdbf2;border-radius:16px;background:linear-gradient(145deg,#effbff,#d5f3ff)}.growth-title{display:flex;justify-content:space-between;gap:6px;font-weight:900;color:#1069ae}.growth-title b{padding:3px 7px;border-radius:999px;background:#126fba;color:#fff;font-size:11px}.growth-bar{height:13px;margin:11px 0 7px;border:2px solid #8ccbe7;border-radius:99px;background:#d5eef9;overflow:hidden}.growth-bar i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#ffdc55,#ffad40,#40c7df);box-shadow:0 0 12px #ffcb51;transition:width .55s}.growth-box p{margin:0;color:#397da9;font-size:12px;font-weight:800}.growth-cheer{margin-top:6px!important;color:#0c70b8!important}.level-gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:12px 0 9px}.level-icon{position:relative;min-height:105px;border:2px solid #91d8f2;border-radius:12px;background:#edfaff center/cover no-repeat;overflow:hidden}.level-icon b{position:absolute;left:5px;bottom:4px;color:#f34848;font-size:16px;text-shadow:0 1px #fff}.level-icon.locked{filter:grayscale(1);opacity:.56}.level-icon.locked::after{content:'🔒';position:absolute;inset:0;display:grid;place-items:center;background:#12354b66;font-size:20px}.level-icon.active{box-shadow:0 0 14px #ffd957;background-color:#fff6c7}.feed-button{width:100%;margin:4px 0 12px;padding:12px;border:2px solid #8eddf4;border-radius:12px;background:linear-gradient(115deg,#187dcb,#39c7df);color:#fff;font:inherit;font-size:16px;font-weight:1000;box-shadow:0 3px 0 #0c609c;touch-action:manipulation}.feed-button:active{transform:translateY(2px);box-shadow:0 1px 0 #0c609c}.feed-button small{display:block;margin-top:2px;font-size:10px;color:#e4fbff}.pet-sprite.level-up,.world-sprite.level-up{animation:e-level-up .72s ease-out}@keyframes e-level-up{0%{filter:brightness(1);transform:scale(1)}35%{filter:brightness(2) drop-shadow(0 0 18px #fff5a1);transform:scale(1.12)}100%{filter:brightness(1);transform:scale(1)}}.pet-sprite,.world-sprite{overflow:hidden}#homePet,#worldPet{z-index:1!important}.pet-identity,.pet-vitals,.pet-speech,.pet-about,.world-title,.world-speech{z-index:10}.pet-sprite:not(.level-up),.world-sprite:not(.level-up),.pet-world.mood-happy .world-sprite:not(.level-up),.pet-world.mood-expect .world-sprite:not(.level-up),.pet-world.mood-rest .world-sprite:not(.level-up),.pet-world.mood-low .world-sprite:not(.level-up){animation:none!important;transform:none!important}.pet-stage-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none;z-index:3;border-radius:inherit;background:#dff6ff}
    .star-flight.clean{z-index:200;color:#fff5a8;font-size:var(--size);font-family:Arial,sans-serif;line-height:1;text-shadow:0 2px 0 #d68b12,0 0 8px #fff,0 0 17px #ffcd26;filter:drop-shadow(0 0 6px #fff);animation:e-star-fly .9s cubic-bezier(.16,.78,.25,1) forwards;animation-delay:var(--delay)}.star-flight.clean::after{display:none!important}@keyframes e-star-fly{0%{opacity:0;transform:scale(.25) rotate(-20deg)}10%{opacity:1;transform:scale(1.18) rotate(10deg)}80%{opacity:1}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.48) rotate(230deg)}}
    .bank.e-arrive{animation:e-bank .72s ease-out}.bank.e-arrive::after{content:'';position:absolute;inset:-12px;border:2px solid #fff3a0;border-radius:20px;pointer-events:none;animation:e-ring .72s ease-out forwards}@keyframes e-bank{28%{transform:scale(1.15);filter:brightness(1.55) drop-shadow(0 0 14px #fff1a1)}100%{transform:scale(1)}}@keyframes e-ring{to{transform:scale(1.4);opacity:0}}.score-ripple{position:fixed;z-index:199;left:var(--x);top:var(--y);width:16px;height:16px;border:3px solid #fff6a7;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 0 12px #fff,0 0 25px #ffd63f;animation:e-ripple .7s ease-out forwards}@keyframes e-ripple{to{width:105px;height:105px;border-width:1px;opacity:0}}
    .parent-modal,.purchase-modal{position:fixed;z-index:400;inset:0;display:grid;place-items:center;padding:18px;background:#063d6e99}.parent-modal[hidden],.purchase-modal[hidden]{display:none}.modal-card{width:min(355px,100%);padding:19px;border:3px solid #9ce3ff;border-radius:20px;background:#f5fcff;box-shadow:0 16px 45px #052f5c88}.modal-card h2{margin:0;color:#0b66ad}.modal-card p{font-size:12px;color:#4e83a9;line-height:1.55}.modal-card input{width:100%;padding:11px;border:2px solid #96d2ed;border-radius:11px;font:inherit;color:#155f99}.modal-actions{display:flex;gap:8px;margin-top:11px}.modal-actions button{flex:1;padding:10px;border:0;border-radius:11px;background:#dff3ff;color:#126bb2;font:inherit;font-weight:900}.modal-actions .primary{background:#1778c8;color:#fff}.favorite-list{display:flex;gap:5px;flex-wrap:wrap;margin-top:8px}.favorite-list button{max-width:125px;padding:6px;border:1px solid #9dd8ef;border-radius:999px;background:#ebf8ff;color:#176cac;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-weight:800}.favorite-list .remove{color:#c94d75}
    .stats-entry{background:linear-gradient(135deg,#0a68b5,#37b9e1)!important;color:#fff}.stats-entry span,.stats-entry small{display:block;color:#e9fbff}.stats-entry strong{display:block;margin:5px 0;color:#fff3a4;font-size:30px}.stats-entry button{margin-top:9px;padding:8px 10px;border:0;border-radius:10px;background:#fff;color:#0b69b2;font-weight:900}.stats-hero{text-align:center;padding:21px;border-radius:18px;background:linear-gradient(135deg,#0a65b0,#30b9df);color:#eafaff}.stats-hero span{display:block;font-size:12px}.stats-hero strong{display:block;color:#fff2a1;font-size:38px}.stats-list div{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #c6e8f5;color:#337ba9;font-size:13px}.stats-list b{color:#0b69ae}
    .week-switch{display:flex;justify-content:space-between;align-items:center;gap:7px;padding:9px;border:2px solid #a9dcf3;border-radius:13px;background:#e7f7ff}.week-switch b{font-size:12px;color:#0b69b2;text-align:center}.week-switch button{padding:7px 8px;border:0;border-radius:9px;background:#1779c9;color:#fff;font:inherit;font-size:11px;font-weight:900}.parent-actions{display:none;margin-top:8px;grid-template-columns:repeat(2,1fr);gap:5px}.parent-actions.show{display:grid}.parent-actions button{padding:8px 3px;border:1px solid #a2d9f0;border-radius:9px;background:#e6f6ff;color:#0b69b1;font:inherit;font-size:11px;font-weight:900}
    .catalog-toolbar{display:flex;justify-content:space-between;align-items:center;gap:7px;margin:10px 0}.catalog-types{display:flex;gap:5px;overflow:auto}.catalog-types button,.buy-pet{flex:0 0 auto;padding:7px 9px;border:2px solid #9bd8ef;border-radius:10px;background:#e8f7ff;color:#176eaf;font:inherit;font-size:11px;font-weight:900}.catalog-types button.on,.buy-pet{background:#1777c7;color:#fff}.catalog-card{position:relative}.catalog-card.locked{background:#dbe9f1!important;filter:saturate(.45)}.catalog-card.locked .stage-art{background-size:cover!important;background-position:center!important;opacity:.95}.catalog-card.owned .stage-art.fire-art{background-size:cover!important;background-position:center!important}.collect-badge{position:absolute;top:4px;right:5px;z-index:2;width:21px;height:21px;display:grid;place-items:center;border-radius:50%;background:#ffdc62;color:#875b00;font-size:13px;font-weight:1000}.purchase-display{position:relative;width:150px;height:150px;margin:10px auto;border-radius:50%;background:radial-gradient(circle,#fff 0 15%,#ffe570 16% 19%,transparent 20%),conic-gradient(#7cdfff,#fff5a1,#78e0f5,#fff5a1,#7cdfff);animation:e-spin 3s linear infinite}.purchase-display i{position:absolute;inset:16px;border-radius:50%;background:center/cover no-repeat #dff6ff}@keyframes e-spin{to{transform:rotate(360deg)}}.purchase-name{display:block;text-align:center;color:#086ab2;font-size:21px}.ticket-chip{display:block;margin:8px auto;text-align:center;color:#8a6200;font-weight:900}.mood-bubble{position:absolute;right:12px;bottom:10px;z-index:8;max-width:190px;padding:7px 9px;border:2px solid #fff;border-radius:14px;background:#fffef4;color:#1669aa;font-size:12px;font-weight:900;box-shadow:0 3px 0 #0870a944}.mood-bubble::after{content:'';position:absolute;right:25px;bottom:-8px;border:7px solid transparent;border-top-color:#fff}
    .pet-speech,.world-speech,.mood-bubble{overflow:hidden}.world-speech{position:relative}.speech-line{display:block;white-space:nowrap;animation:e-text-in .42s ease-out both}.speech-line.out{position:absolute;left:0;right:0;top:0;animation:e-text-out .3s ease-in both}@keyframes e-text-in{from{transform:translateY(115%)}to{transform:translateY(0)}}@keyframes e-text-out{from{transform:translateY(0)}to{transform:translateY(-115%)}}.level-flash{position:absolute;z-index:30;inset:0;pointer-events:none;background:linear-gradient(115deg,transparent 25%,#fff9 47%,#fff 50%,#fff9 53%,transparent 75%);mix-blend-mode:screen;animation:e-level-flash .72s ease-out forwards}@keyframes e-level-flash{from{opacity:0;transform:translateX(-110%)}25%{opacity:1}to{opacity:0;transform:translateX(110%)}}
  `;
  document.head.appendChild(style);
  const calendarStyle = document.createElement('style');
  calendarStyle.textContent = '.calendar button{position:relative}.calendar .mark{font-size:20px;line-height:22px}.calendar button.done .mark{color:#e6a126}.calendar button.today{outline:1px solid #1482d2;outline-offset:0}';
  document.head.appendChild(calendarStyle);
  const taskStyle = document.createElement('style');
  taskStyle.textContent = '.task-modal{position:fixed;z-index:430;inset:0;display:grid;place-items:center;padding:18px;background:#063d6e99}.task-modal[hidden]{display:none}.task-modal .modal-card{max-height:calc(100vh - 36px);overflow:auto}.task-check-list{display:grid;gap:9px;margin:14px 0}.task-check-row{display:grid;grid-template-columns:30px 1fr;gap:10px;align-items:center;padding:9px;border:1px solid #a9ddeb;border-radius:12px;background:#effaff}.task-box{width:27px;height:27px;border:2px solid #577889;border-radius:2px;background:#f8fdff;color:transparent;font-size:22px;font-weight:1000;line-height:20px;text-align:center}.task-check-row.done{background:#fff5f5;border-color:#f3a6a6}.task-check-row.done .task-box{border-color:#e54242;color:#e52d2d}.task-check-row.done .task-label{color:#d93b3b;text-decoration:line-through;text-decoration-color:#ef3434;text-decoration-thickness:2px}.task-label{color:#1d668e;font-size:14px;font-weight:900;line-height:1.45}.claim-button:disabled{background:#b8d3e0!important;color:#6f8fa2!important;cursor:not-allowed}.task-manager-tabs{display:flex;gap:7px;margin:10px 0}.task-manager-tabs button{flex:1;padding:8px;border:1px solid #9ed6ed;border-radius:9px;background:#e6f6ff;color:#176eaf;font:inherit;font-weight:900}.task-manager-tabs button.on{background:#1778c8;color:#fff}.task-edit-row{display:grid;grid-template-columns:1fr 34px;gap:7px;margin:7px 0}.task-edit-row input{min-width:0}.task-delete{border:0;border-radius:9px;background:#fff0f2;color:#cf4b63;font-size:18px;font-weight:1000}.task-add{display:grid;grid-template-columns:1fr auto;gap:7px;margin-top:10px}.task-add button{padding:8px 10px;border:0;border-radius:9px;background:#1778c8;color:#fff;font:inherit;font-weight:900}.child-adjust-card{display:block!important}.child-adjust-card .stats-list{margin:8px 0}.child-adjust-card .stats-list div{padding:6px 0;font-size:12px}.child-adjust-card .stats-list small{font-size:10px}.parent-adjust-actions{display:flex;gap:8px;margin-top:10px}.parent-adjust-actions .softbtn{flex:1}.adjust-head{display:flex;align-items:center;justify-content:space-between;gap:8px}.adjust-head h2{margin:0}.adjust-summary{display:flex;gap:5px;white-space:nowrap}.adjust-summary b{padding:5px 7px;border-radius:9px;font-size:20px;line-height:1;font-weight:1000}.adjust-summary .plus{background:#e6fff0;color:#149660}.adjust-summary .minus{background:#fff0f2;color:#de4f68}';
  document.head.appendChild(taskStyle);
  const parentRecordStyle = document.createElement('style');
  parentRecordStyle.textContent = '.parent-record-preview{display:grid;gap:4px;margin-top:6px}.parent-record-preview span{display:flex;justify-content:space-between;gap:8px;color:#397da7;font-size:11px;line-height:1.35}.parent-record-preview b{white-space:nowrap;color:#1681bc}.parent-record-preview b.negative{color:#db5f7d}.parent-record-list{display:grid;gap:8px;margin:12px 0}.parent-record-list div{display:grid;grid-template-columns:1fr auto;gap:8px;padding:10px 0;border-bottom:1px solid #c8e8f4;color:#397aa4;font-size:13px}.parent-record-list small{display:block;margin-top:3px;color:#7299b2}.parent-record-list b{align-self:center;color:#1477b8}.parent-record-list b.negative{color:#dd617c}';
  document.head.appendChild(parentRecordStyle);
  const petLayoutStyle = document.createElement('style');
  petLayoutStyle.textContent = '#pet .world-title{padding:3px 12px 0;transform:translateY(-5px)}#pet .world-title h2{margin:0 0 3px}#pet #worldSpeech{display:none!important}/* \u201c\u6211\u7684\u5ba0\u7269\u201d\u4ec5\u4fdd\u7559\u89c6\u9891\u672c\u8eab\u7684\u8868\u6f14\uff0c\u4e0d\u518d\u6dfb\u52a0\u9875\u9762\u7684\u4e0a\u4e0b\u6d6e\u52a8\u3002*/#pet .pet-world #worldPet,#pet .pet-world.mood-happy #worldPet,#pet .pet-world.mood-expect #worldPet,#pet .pet-world.mood-rest #worldPet,#pet .pet-world.mood-low #worldPet{animation:none!important;transform:none!important;opacity:1!important;filter:none!important}#pet .pet-world #worldPet .pet-stage-video{animation:none!important;transform:none!important;opacity:1!important;filter:none!important}';
  document.head.appendChild(petLayoutStyle);
  const petGreetStyle = document.createElement('style');
  petGreetStyle.textContent = '#pet .pet-greet-button{display:block;width:calc(100% - 24px);min-height:46px;margin:10px 12px 5px;padding:10px 12px;font-size:15px}';
  document.head.appendChild(petGreetStyle);
  const videoPerformanceStyle = document.createElement('style');
  videoPerformanceStyle.textContent = '.pet-stage-video{background:transparent!important}';
  document.head.appendChild(videoPerformanceStyle);

  // Persisted state additions. The first fire pet is a gift and is never purchased.
  s.adopted = Array.isArray(s.adopted) ? s.adopted : [];
  // 基础页面可能已经把旧云端的空值渲染成字符串 "undefined"，不能再把它当默认昵称。
  const renderedProfileName = (document.querySelector('#me .profile-name')?.textContent || '').replace('✎', '').trim();
  const initialProfileName = renderedProfileName && !['undefined', 'null'].includes(renderedProfileName.toLowerCase()) ? renderedProfileName : '星星小朋友';
  const savedProfileName = typeof s.profileName === 'string' ? s.profileName.trim() : '';
  s.profileName = savedProfileName && !['undefined', 'null'].includes(savedProfileName.toLowerCase()) ? savedProfileName : initialProfileName;
  s.profileAvatar = typeof s.profileAvatar === 'string' && s.profileAvatar.startsWith('data:image/') ? s.profileAvatar : '';
  if (!s.adopted.includes(fireAsset)) s.adopted.unshift(fireAsset);
  s.petCoupons = Number(s.petCoupons || 0);
  s.favorites = Array.isArray(s.favorites) ? s.favorites : [];
  s.adjustments = Array.isArray(s.adjustments) ? s.adjustments : [];
  s.cashLedger = Array.isArray(s.cashLedger) ? s.cashLedger : [];
  s.weekIndex = Number.isInteger(s.weekIndex) ? s.weekIndex : 0;
  s.weekAwards = s.weekAwards || {};
  s.weekData = Array.isArray(s.weekData) ? s.weekData : [];
  s.redeemed = Math.max(0, Number(s.redeemed || 0));
  s.cashAdjust = Number(s.cashAdjust || 0);
  s.feedUsed = Math.max(0, Number(s.feedUsed || 0));
  s.calendarOffset = Number.isInteger(s.calendarOffset) ? Math.max(-12, Math.min(12, s.calendarOffset)) : 0;
  const defaultTaskTemplates = {
    weekday: [
      { text: '上课不迟到' },
      { text: '学校认真，不被批评' },
      { text: '作业校内完成一半', skipFriday: true },
      { text: '8 点之前完成所有校内作业' },
      { text: '完成校外每日练习（周一、周五算上课）' }
    ],
    weekend: [{ text: '乐读作业完成' }, { text: '校内作业完成' }]
  };
  const normalizeTaskList = (list, fallback) => Array.isArray(list) ? list.map(item => typeof item === 'string' ? { text: item } : { text: String(item.text || ''), skipFriday: !!item.skipFriday }).filter(item => item.text.trim()) : fallback.map(item => ({ ...item }));
  s.taskTemplates = s.taskTemplates || {};
  s.taskTemplates.weekday = normalizeTaskList(s.taskTemplates.weekday, defaultTaskTemplates.weekday);
  s.taskTemplates.weekend = normalizeTaskList(s.taskTemplates.weekend, defaultTaskTemplates.weekend);
  s.taskChecks = s.taskChecks && typeof s.taskChecks === 'object' ? s.taskChecks : {};
  // 云端中仍可能存在早期版本保存的数据。每次从云端恢复后都补齐字段，
  // 防止某个旧字段缺失导致渲染中断，继而让新的加减分无法再次保存。
  E.normalizeState = () => {
    s.done = Array.isArray(s.done) ? Array.from({ length: 7 }, (_, index) => !!s.done[index]) : [false, false, false, false, false, false, false];
    s.extra = Number.isFinite(Number(s.extra)) ? Number(s.extra) : 0;
    s.adopted = Array.isArray(s.adopted) ? [...new Set(s.adopted.map(Number).filter(Number.isFinite))] : [];
    if (!s.adopted.includes(fireAsset)) s.adopted.unshift(fireAsset);
    s.pet = Number.isFinite(Number(s.pet)) ? Number(s.pet) : fireAsset;
    if (!s.adopted.includes(s.pet)) s.pet = fireAsset;
    s.petCoupons = Math.max(0, Number(s.petCoupons || 0));
    s.favorites = Array.isArray(s.favorites) ? s.favorites : [];
    s.adjustments = Array.isArray(s.adjustments) ? s.adjustments : [];
    s.cashLedger = Array.isArray(s.cashLedger) ? s.cashLedger : [];
    s.weekIndex = Math.max(0, Number.isInteger(s.weekIndex) ? s.weekIndex : 0);
    s.weekAwards = s.weekAwards && typeof s.weekAwards === 'object' ? s.weekAwards : {};
    s.weekData = Array.isArray(s.weekData) ? s.weekData.map(week => ({
      done: Array.isArray(week?.done) ? Array.from({ length: 7 }, (_, index) => !!week.done[index]) : [false, false, false, false, false, false, false],
      extra: Number.isFinite(Number(week?.extra)) ? Number(week.extra) : 0,
      adjustments: Array.isArray(week?.adjustments) ? week.adjustments : []
    })) : [];
    s.redeemed = Math.max(0, Number(s.redeemed || 0));
    s.cashAdjust = Number.isFinite(Number(s.cashAdjust)) ? Number(s.cashAdjust) : 0;
    s.feedUsed = Math.max(0, Number(s.feedUsed || 0));
    s.calendarOffset = Number.isInteger(s.calendarOffset) ? Math.max(-12, Math.min(12, s.calendarOffset)) : 0;
    s.taskTemplates = s.taskTemplates && typeof s.taskTemplates === 'object' ? s.taskTemplates : {};
    s.taskTemplates.weekday = normalizeTaskList(s.taskTemplates.weekday, defaultTaskTemplates.weekday);
    s.taskTemplates.weekend = normalizeTaskList(s.taskTemplates.weekend, defaultTaskTemplates.weekend);
    s.taskChecks = s.taskChecks && typeof s.taskChecks === 'object' ? s.taskChecks : {};
    s.checkinScores = s.checkinScores && typeof s.checkinScores === 'object' ? s.checkinScores : {};
    s.checkinRepairs = s.checkinRepairs && typeof s.checkinRepairs === 'object' ? s.checkinRepairs : {};
    const profileName = typeof s.profileName === 'string' ? s.profileName.trim() : '';
    s.profileName = profileName && !['undefined', 'null'].includes(profileName.toLowerCase()) ? profileName : initialProfileName;
    s.profileAvatar = typeof s.profileAvatar === 'string' && s.profileAvatar.startsWith('data:image/') ? s.profileAvatar : '';
    return s;
  };
  window.littleStarNormalizeState = E.normalizeState;
  E.normalizeState();
  // 正式打卡从 2026/9/14（周一）开始。日期每天依据设备本地时间自动推进，
  // 而不是停留在首次打开网页时的“周一”。
  const dayMs = 24 * 60 * 60 * 1000;
  const checkinStart = new Date(2026, 8, 14);
  const localMidnight = () => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), now.getDate()); };
  E.weekDate = index => new Date(checkinStart.getTime() + (s.weekIndex * 7 + index) * dayMs);
  E.currentDate = () => E.weekDate(s.day);
  E.shortDate = date => `${date.getMonth() + 1}/${date.getDate()}`;
  E.syncCurrentDate = () => {
    const elapsed = Math.max(0, Math.floor((localMidnight().getTime() - checkinStart.getTime()) / dayMs));
    const nextWeek = Math.floor(elapsed / 7), nextDay = elapsed % 7;
    let changed = false;
    if (nextWeek !== s.weekIndex) {
      if (typeof E.weekSave === 'function') E.weekSave();
      s.weekIndex = nextWeek;
      const week = s.weekData[nextWeek] || { done: [false, false, false, false, false, false, false], extra: 0, adjustments: [] };
      s.done = [...week.done]; s.extra = Number(week.extra || 0); s.adjustments = Array.isArray(week.adjustments) ? [...week.adjustments] : [];
      changed = true;
    }
    if (nextDay !== s.day) { s.day = nextDay; changed = true; }
    return changed;
  };
  let roleName = '孩子', catalogType = '全部', purchaseAsset = 1;
  // Earlier experimental in-page blocks may exist when an old script partially ran.
  // Remove only those generated blocks before mounting the verified version.
  // 清理基础页遗留的旧材料卡，顶部只保留增强版这一张实时材料卡。
  $$('.points-system, .pet-growth, #pointModal, .mood-chip, .material-bank').forEach(node => node.remove());
  // 本周小星星先记录当周；跨周累计日常积分会汇总本周打卡与家长调整，兑换后才扣除。
  E.checkinKey = (weekIndex, dayIndex) => `${weekIndex}-${dayIndex}`;
  E.checkinScore = (weekIndex, dayIndex) => {
    const score = Number(s.checkinScores?.[E.checkinKey(weekIndex, dayIndex)]);
    return Number.isFinite(score) && score >= 0 ? score : pts[dayIndex];
  };
  E.weekCheckinTotal = (weekIndex, done = []) => (done || []).reduce((sum, isDone, dayIndex) => sum + (isDone ? E.checkinScore(weekIndex, dayIndex) : 0), 0);
  E.weekPoints = () => Math.max(0, E.weekCheckinTotal(s.weekIndex, s.done) + Number(s.extra || 0));
  E.gross = () => E.weekPoints() + s.weekData.reduce((sum, week, index) => index === s.weekIndex ? sum : sum + Math.max(0, E.weekCheckinTotal(index, week.done) + Number(week.extra || 0)), 0);
  E.daily = () => Math.max(0, E.gross() + s.cashAdjust - s.redeemed);
  E.completedGross = () => s.weekData.reduce((sum, week, index) => index === s.weekIndex ? sum : sum + Math.max(0, E.weekCheckinTotal(index, week.done) + Number(week.extra || 0)), 0);
  E.redeemable = () => Math.max(0, E.completedGross() + (s.day >= 5 ? E.weekPoints() : 0) + s.cashAdjust - s.redeemed);
  E.parentTotal = () => Number(s.extra || 0) + s.weekData.reduce((sum, week, index) => index === s.weekIndex ? sum : sum + Number(week.extra || 0), 0);
  // 宠物材料只跟随真实打卡 + 家长调整的累计分；现金累计的手动加减/兑换不改变材料。
  // 本周小星星改为 20/40/60… 的展示单位；1 星星分对应 10 宠物材料。
  E.materialTotal = () => E.gross() * 10;
  E.material = () => Math.max(0, E.materialTotal() - s.feedUsed);
  E.mood = () => { const n = s.done.filter(Boolean).length, recent = s.done.slice(Math.max(0, s.day - 2), s.day + 1).filter(Boolean).length; return n >= 5 && Number(s.extra || 0) >= 0 ? '开心' : (s.day >= 2 && recent === 0 ? '低落' : n ? '期待' : '休息'); };
  E.moodText = () => ({ 开心: '主人，你真棒！我又成长了！', 期待: '主人加油，我陪你完成今天的小约定！', 休息: '我在等你回来一起加分。', 低落: '主人，你不理我了吗？我好饿。' })[E.mood()];
  const speechSets = {
    good: ['主人太厉害啦，我又学到新知识咯！','多亏主人指点，我又进步一点点✨','跟着主人学习，我又解锁新能力啦！','主人超棒，我又收获满满的成长！','谢谢主人，我又变得更厉害了！','主人太优秀，我又跟着长进啦！','有主人在，我又继续成长啦！','主人真厉害，我又学到新东西！','哇，主人太棒，我又升级一点点！','感谢主人，我又收获新的成长！','主人好强，我又向前迈一步啦！','跟着主人，我又学到不一样的知识！','主人真棒，我又丰富自己啦！','多亏主人，我的能力又变强咯！','主人太赞，我又迎来新成长！','主人闪闪发光，我又进步啦！','谢谢主人的引导，我又成长啦！','主人好厉害，我又掌握新技能！','有主人带着，我又持续成长！','主人太棒啦，我又变得更好咯！'],
    low: ['别放弃呀，再试试就好。','一次不行，我们再来。','不要灰心，我陪着你。','慢慢来，你可以的。','遇到困难，别停下。','差一点点，再加把劲。','感到难很正常，我们一起面对。','不用逼自己，我们一小步来。','就算失败，你的努力我看见了。','不想继续可以先休息，我等你。','困难只是暂时，你很有力量。','别怕做错，尝试就很了不起。','我们不追求完美，只要不退缩。','心里难受就说说，我陪着你。','这次卡住了，换个方式试试。','能坚持到现在，已经很棒啦。'],
    absent: ['主人，我在这里陪着你，加油！','主人，要不要我们继续往前走？','主人，别停下，我一直都在。','主人，我们可以慢慢捡起来哦。','主人，准备好了就出发吧。','主人，不要丢下我们的小目标。','主人，我在等你一起努力。','主人，再拾起一点点就好。','主人，我们随时可以重启。','主人，别放弃，我陪着你。']
  };
  let speechKind = '', speechIndex = 0;
  E.speechKind = () => { const latest = s.done.slice(Math.max(0, s.day - 2), s.day + 1); if (s.day >= 2 && latest.length === 3 && latest.every(done => !done)) return 'absent'; return (s.done.filter(Boolean).length >= 3 || E.weekPoints() >= 20) ? 'good' : 'low'; };
  E.showSpeech = advance => { const nextKind = E.speechKind(); if (nextKind !== speechKind) { speechKind = nextKind; speechIndex = 0; } else if (advance) speechIndex = (speechIndex + 1) % speechSets[speechKind].length; const line = speechSets[speechKind][speechIndex]; ['#speech','#worldSpeech','#eBubble'].forEach(selector => { const el = $(selector); if (!el) return; const old = el.querySelector('.speech-line:not(.out)'); if (old && old.textContent === line) return; el.querySelectorAll('.speech-line.out').forEach(node => node.remove()); if (old) { old.classList.add('out'); setTimeout(() => old.remove(), 320); } else el.textContent = ''; const next = document.createElement('span'); next.className = 'speech-line'; next.textContent = line; el.append(next); }); };
  clearInterval(window.__littleStarSpeechTimer); window.__littleStarSpeechTimer = setInterval(() => E.showSpeech(true), 5000);
  E.award = () => { const key = String(s.weekIndex); if (E.weekPoints() >= 400 && !s.weekAwards[key]) { s.weekAwards[key] = true; s.petCoupons += 1; toast('本周满 400 分，获得 1 张宠物券！'); } };
  E.persist = () => { E.award(); save(); };
  // 个人资料：名称与头像都会随家庭数据同步；头像压缩为小尺寸，避免增加加载负担。
  const profileNameButton = $('#me .profile-name');
  const profileAvatar = $('#me .profile-head .avatar');
  profileNameButton.id = 'eProfileName'; profileAvatar.id = 'eProfileAvatar'; profileAvatar.title = '点击修改头像'; profileAvatar.style.cursor = 'pointer';
  const profileStyle = document.createElement('style');
  profileStyle.textContent = '#eProfileAvatar{cursor:pointer}.profile-avatar-preview{width:84px;height:84px;margin:8px auto 13px;border:3px solid #9bdcf2;border-radius:50%;background:#dff5ff center/cover no-repeat;box-shadow:0 3px 0 #8bc7e4}.profile-editor-label{display:block;margin:10px 0 5px;color:#397da9;font-size:12px;font-weight:900}.profile-image-input{width:100%;padding:9px;border:2px dashed #9bd8ef;border-radius:11px;color:#3577a6;font:inherit;font-size:12px}';
  document.head.append(profileStyle);
  const profileModal = document.createElement('div'); profileModal.className = 'parent-modal'; profileModal.hidden = true;
  profileModal.innerHTML = '<div class="modal-card"><h2>编辑个人信息</h2><p>名称和头像会同步到家庭设备。头像会自动压缩，加载更快。</p><div id="eProfilePreview" class="profile-avatar-preview"></div><label class="profile-editor-label" for="eProfileInput">显示名称</label><input id="eProfileInput" maxlength="16" placeholder="输入你的名字"><label class="profile-editor-label" for="eProfileImage">替换头像</label><input id="eProfileImage" class="profile-image-input" type="file" accept="image/*"><div class="modal-actions"><button onclick="closeProfileEditor()">取消</button><button class="primary" onclick="saveProfileEditor()">保存</button></div></div>';
  document.body.append(profileModal);
  let pendingProfileAvatar = '';
  E.paintProfile = avatar => { profileAvatar.style.backgroundImage = avatar ? `url("${avatar}")` : ''; $('#eProfilePreview').style.backgroundImage = avatar ? `url("${avatar}")` : ''; };
  E.renderProfile = () => { const name = typeof s.profileName === 'string' ? s.profileName.trim() : ''; s.profileName = name && !['undefined', 'null'].includes(name.toLowerCase()) ? name : '星星小朋友'; $('#eProfileName').textContent = `${s.profileName} ✎`; E.paintProfile(s.profileAvatar); };
  window.openProfileEditor = () => { pendingProfileAvatar = s.profileAvatar; $('#eProfileInput').value = s.profileName; $('#eProfileImage').value = ''; E.paintProfile(pendingProfileAvatar); profileModal.hidden = false; };
  window.closeProfileEditor = () => { profileModal.hidden = true; E.paintProfile(s.profileAvatar); };
  $('#eProfileImage').addEventListener('change', event => { const file = event.target.files?.[0]; if (!file) return; if (!file.type.startsWith('image/')) return toast('请选择图片文件'); const reader = new FileReader(); reader.onload = () => { const image = new Image(); image.onload = () => { const side = Math.min(180, Math.max(image.width, image.height)), canvas = document.createElement('canvas'); canvas.width = side; canvas.height = side; const context = canvas.getContext('2d'), scale = Math.max(side / image.width, side / image.height), width = image.width * scale, height = image.height * scale; context.drawImage(image, (side - width) / 2, (side - height) / 2, width, height); pendingProfileAvatar = canvas.toDataURL('image/jpeg', .78); E.paintProfile(pendingProfileAvatar); }; image.src = reader.result; }; reader.readAsDataURL(file); });
  window.saveProfileEditor = () => { const name = $('#eProfileInput').value.trim(); if (!name) return toast('请填写显示名称'); s.profileName = name.slice(0, 16); s.profileAvatar = pendingProfileAvatar; profileModal.hidden = true; E.render(); toast('个人信息已保存并同步'); };
  profileNameButton.onclick = window.openProfileEditor; profileAvatar.onclick = window.openProfileEditor;
  // 日历保持简洁：仅日期、完成星星和原有颜色；左右箭头可浏览前后各一年。
  E.renderCalendar = () => { const today = E.currentDate(), month = new Date(today.getFullYear(), today.getMonth() + s.calendarOffset, 1), year = month.getFullYear(), monthIndex = month.getMonth(), current = s.calendarOffset === 0, count = new Date(year, monthIndex + 1, 0).getDate(), first = month.getDay(), cells = []; for (let i = 0; i < first; i++) cells.push('<span class="blank"></span>'); for (let day = 1; day <= count; day++) { const cellDate = new Date(year, monthIndex, day), wi = s.done.findIndex((_, index) => E.weekDate(index).toDateString() === cellDate.toDateString()), done = current && wi >= 0 && !!s.done[wi], isToday = current && cellDate.toDateString() === today.toDateString(); cells.push(`<button class="${done ? 'done' : ''} ${isToday ? 'today' : ''}"><b>${day}</b><span class="mark">${done ? '★' : '·'}</span></button>`); } $('#calendar').innerHTML = cells.join(''); const title = $('.month-select b'); if (title) title.textContent = `${year} 年 ${monthIndex + 1} 月`; $('#monthDone').textContent = current ? s.done.filter(Boolean).length + ' 天' : '0 天'; $('#monthExtra').textContent = current ? Number(s.extra || 0) + ' 分' : '0 分'; const arrows = $$('.month-select button'); if (arrows.length === 2) { arrows[0].disabled = s.calendarOffset <= -12; arrows[1].disabled = s.calendarOffset >= 12; arrows[0].title = '上一个月'; arrows[1].title = '下一个月'; } const recent = $('#recent'); if (recent) recent.innerHTML = current ? `<span>${today.getMonth() + 1} 月 ${today.getDate()} 日（${names[s.day]}）</span><b>${s.done[s.day] ? '+' + E.checkinScore(s.weekIndex, s.day) + ' 颗 ★' : '待完成'}</b>` : '<span>本月暂无打卡记录</span><b>—</b>'; };
  E.changeCalendarMonth = delta => { s.calendarOffset = Math.max(-12, Math.min(12, s.calendarOffset + delta)); E.renderCalendar(); E.persist(); };
  const calendarArrows = $$('.month-select button'); if (calendarArrows.length === 2) { calendarArrows[0].onclick = () => E.changeCalendarMonth(-1); calendarArrows[1].onclick = () => E.changeCalendarMonth(1); }

  // 打卡记录的第二页展示家庭内每一次分数变动：孩子完成打卡、爸爸妈妈加减分、累计积分补加/兑换都会保留。
  const recordCards = $$('#records article.card');
  const familyLedger = document.createElement('article'); familyLedger.className = 'card family-ledger'; familyLedger.hidden = true;
  familyLedger.innerHTML = '<div class="heading"><h2>家庭加减分</h2><span class="sub">全部分数变化</span></div><div id="eFamilyLedger" class="family-ledger-list"></div>';
  recordCards[recordCards.length - 1]?.after(familyLedger);
  const ledgerStyle = document.createElement('style');
  ledgerStyle.textContent = '.family-ledger-list{display:grid;gap:1px;margin-top:10px}.family-ledger-row{display:grid;grid-template-columns:1fr auto;gap:10px;padding:11px 0;border-bottom:1px solid #c7e8f5;color:#397aa4}.family-ledger-row:last-child{border-bottom:0}.family-ledger-row span,.family-ledger-row small{display:block}.family-ledger-row small{margin-top:3px;color:#7299b2;font-size:10px}.family-ledger-row b{align-self:center;font-size:15px;color:#1477b8}.family-ledger-row b.negative{color:#dd617c}.family-ledger-empty{padding:16px 0;color:#7299b2;text-align:center;font-size:13px}';
  document.head.append(ledgerStyle);
  E.weekDateAt = (weekIndex, dayIndex) => new Date(checkinStart.getTime() + (weekIndex * 7 + dayIndex) * dayMs);
  E.familyScoreEntries = () => {
    const entries = [], maxWeek = Math.max(s.weekIndex, s.weekData.length - 1);
    for (let weekIndex = 0; weekIndex <= maxWeek; weekIndex++) {
      const week = weekIndex === s.weekIndex ? { done: s.done, adjustments: s.adjustments } : s.weekData[weekIndex];
      if (!week) continue;
      (week.done || []).forEach((done, dayIndex) => { if (done) { const repair = s.checkinRepairs?.[E.checkinKey(weekIndex, dayIndex)]; entries.push({ order: weekIndex * 100 + dayIndex, label: repair ? `${names[dayIndex]}补打卡` : `${names[dayIndex]}完成打卡`, meta: `${E.shortDate(E.weekDateAt(weekIndex, dayIndex))} · ${repair?.actor || '孩子'}${repair?.reason ? ` · ${repair.reason}` : ''}`, n: E.checkinScore(weekIndex, dayIndex) }); } });
      (week.adjustments || []).forEach((item, position) => entries.push({ order: weekIndex * 100 + 80 - position / 100, label: item.reason || '家长积分调整', meta: `${item.actor || '爸爸妈妈'} · ${item.time || E.shortDate(E.weekDateAt(weekIndex, 0))}`, n: Number(item.n || 0) }));
    }
    (Array.isArray(s.cashLedger) ? s.cashLedger : []).forEach((item, position) => entries.push({ order: (maxWeek + 1) * 100 + 90 - position / 100, label: item.reason || '累计日常积分调整', meta: `${item.actor || '爸爸妈妈'} · ${item.time || ''}`, n: Number(item.n || 0) }));
    return entries.filter(item => Number.isFinite(item.n) && item.n).sort((a, b) => b.order - a.order);
  };
  E.renderFamilyLedger = () => { const host = $('#eFamilyLedger'); if (!host) return; const entries = E.familyScoreEntries(); host.innerHTML = entries.length ? entries.map(item => `<div class="family-ledger-row"><span>${E.escape(item.label)}<small>${E.escape(item.meta)}</small></span><b class="${item.n < 0 ? 'negative' : ''}">${item.n > 0 ? '+' : ''}${item.n} 分</b></div>`).join('') : '<p class="family-ledger-empty">还没有分数变化记录</p>'; };
  window.showRecordTab = tab => { const isFamily = tab === 'family'; recordCards.forEach(card => { card.hidden = isFamily; }); familyLedger.hidden = !isFamily; $$('#records .record-tabs button').forEach((button, index) => { const on = isFamily ? index === 1 : index === 0; button.setAttribute('aria-pressed', on ? 'true' : 'false'); }); if (isFamily) E.renderFamilyLedger(); };
  const recordTabs = $$('#records .record-tabs button'); if (recordTabs.length >= 2) { recordTabs[0].onclick = () => showRecordTab('daily'); recordTabs[1].onclick = () => showRecordTab('family'); }

  const system = document.createElement('article');
  system.className = 'card points-system';
  system.innerHTML = '<div class="points-head"><h2>双积分成长系统</h2><span class="points-note">1 日常分 = 10 材料</span></div><div class="points-grid"><button id="eDailyCard" type="button" onclick="openCashBalanceControl()"><span>累计日常积分</span><strong id="eDaily">0</strong><small id="eDailyHint">含本周积分 · 点击加减</small></button><div><span>宠物材料</span><strong id="eMaterial">0</strong><small>培养宠物</small></div><div><span>宠物券</span><strong id="eCoupons">0</strong><small>满 400 分获得</small></div></div>';
  $('.extra-card').after(system);
  $('.extra-card h2').textContent = '家长调整积分';
  $('.extra-card .extra-help').textContent = '用于每天的鼓励或惩罚，会同步到本周小星星、累计日常积分、宠物材料和本周宠物券判断。';
  $('.extra-card button').textContent = '加分 / 减分';
  $('.extra-card button').onclick = () => openPointControl();
  const parentExtraMarkup = $('.extra-card').innerHTML;
  const materialTop = document.createElement('button'); materialTop.className = 'material-top'; materialTop.type = 'button'; materialTop.title = '宠物材料 = 日常积分 × 10'; materialTop.innerHTML = '<i>✦</i><div><span>宠物材料</span><strong id="eTopMaterial">0</strong></div>';
  $('.top .bank').before(materialTop);
  const ready = document.createElement('div'); ready.className = 'merge-ready'; ready.textContent = '✓ 增强功能已加载：材料分、宠物券、统计、购买与测试周均可试玩'; $('.test-lab').prepend(ready);
  const switcher = document.createElement('div'); switcher.className = 'week-switch'; switcher.innerHTML = '<button onclick="switchTestWeek(-1)">‹ 上一周</button><b id="eWeek">第 1 周<br>9/7 — 9/13</b><button onclick="switchTestWeek(1)">下一周 ›</button>'; $('.test-lab').prepend(switcher);
  const parentActions = document.createElement('div'); parentActions.className = 'parent-actions'; parentActions.innerHTML = '<button onclick="openPointControl()">调整积分</button><button onclick="openRedeemControl()">兑换现金</button><button onclick="showPage(\'stats\')">积分统计</button><button onclick="openPetPurchase()">购买宠物</button><button onclick="resetCurrentWeek()">重置本周</button>'; $('.family-switch').append(parentActions);
  const childTaskActionsMarkup = $('#taskActions').innerHTML;

  E.escape = value => String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char]);
  E.taskGroup = day => day >= 5 ? 'weekend' : 'weekday';
  E.tasksForDay = day => s.taskTemplates[E.taskGroup(day)].filter(task => !(day === 4 && task.skipFriday));
  E.taskKey = () => `${s.weekIndex}-${s.day}`;
  E.taskChecksForToday = () => { const tasks = E.tasksForDay(s.day), key = E.taskKey(), prior = Array.isArray(s.taskChecks[key]) ? s.taskChecks[key] : []; const checks = tasks.map((_, index) => !!prior[index]); s.taskChecks[key] = checks; return checks; };
  const taskModal = document.createElement('div'); taskModal.className = 'task-modal'; taskModal.hidden = true;
  taskModal.innerHTML = '<div class="modal-card"><h2>今天的小约定</h2><p id="eTaskIntro">逐项完成后领取今天的小星星。</p><div id="eTaskCheckList" class="task-check-list"></div><p id="eTaskProgress"></p><div class="modal-actions"><button onclick="closeTaskChecklist()">暂不领取</button><button id="eTaskClaim" class="primary claim-button" onclick="claimTaskStars()" disabled>全部完成，领取星星</button></div></div>';
  document.body.append(taskModal);
  E.renderTaskChecklist = () => { const tasks = E.tasksForDay(s.day), checks = E.taskChecksForToday(); $('#eTaskIntro').textContent = `${names[s.day]}的小约定：每一项完成后打上红勾。`; $('#eTaskCheckList').innerHTML = tasks.map((task, index) => `<div class="task-check-row ${checks[index] ? 'done' : ''}"><button class="task-box" type="button" aria-label="${checks[index] ? '取消完成' : '标记完成'}" onclick="toggleTaskItem(${index})">✓</button><span class="task-label">${E.escape(task.text)}</span></div>`).join('') || '<p class="sub">今天还没有小约定，家长可在管理入口添加。</p>'; const count = checks.filter(Boolean).length; $('#eTaskProgress').textContent = `已完成 ${count} / ${tasks.length} 项`; $('#eTaskClaim').disabled = !tasks.length || !checks.every(Boolean); };
  window.openTaskChecklist = button => { if (s.done[s.day]) return toast('今天已经领取过星星啦！'); E.claimButton = button; E.renderTaskChecklist(); taskModal.hidden = false; };
  window.closeTaskChecklist = () => { taskModal.hidden = true; E.claimButton = null; };
  window.toggleTaskItem = index => { const checks = E.taskChecksForToday(); checks[index] = !checks[index]; s.taskChecks[E.taskKey()] = checks; E.persist(); E.renderTaskChecklist(); };
  window.claimTaskStars = () => { const checks = E.taskChecksForToday(); if (!checks.length || !checks.every(Boolean)) return toast('完成全部小约定后才能领取星星'); const button = E.claimButton, box = button ? button.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight * .7, width: 1, height: 1 }, before = E.weekPoints(), gain = pts[s.day]; s.done[s.day] = true; taskModal.hidden = true; E.claimButton = null; render(); $('#score').innerHTML = String(before).padStart(2, '0') + '<small> 颗</small>'; E.fly(box, gain * 10, () => E.roll(before, E.weekPoints())); toast(`太棒啦！完成全部约定，收到了 ${gain} 分（${gain * 10} 颗星星反馈）。`); };

  let taskManagerGroup = 'weekday';
  const taskManager = document.createElement('div'); taskManager.className = 'parent-modal'; taskManager.hidden = true;
  taskManager.innerHTML = '<div class="modal-card"><h2>管理小约定</h2><p>工作日和周末清单分开设置；修改后，孩子当天打开“我完成啦！”即可看到最新内容。</p><div class="task-manager-tabs"><button id="eTaskWeekday" onclick="selectTaskManagerGroup(\'weekday\')">周一至周五</button><button id="eTaskWeekend" onclick="selectTaskManagerGroup(\'weekend\')">周末</button></div><div id="eTaskManageList"></div><div class="task-add"><input id="eNewTask" type="text" placeholder="输入新的小约定"><button onclick="addTaskTemplate()">添加</button></div><div class="modal-actions"><button class="primary" onclick="closeTaskManager()">完成</button></div></div>';
  document.body.append(taskManager);
  E.renderTaskManager = () => { $('#eTaskWeekday').classList.toggle('on', taskManagerGroup === 'weekday'); $('#eTaskWeekend').classList.toggle('on', taskManagerGroup === 'weekend'); const list = s.taskTemplates[taskManagerGroup]; $('#eTaskManageList').innerHTML = list.map((task, index) => `<div class="task-edit-row"><input value="${E.escape(task.text)}" onchange="updateTaskTemplate(${index}, this.value)"><button class="task-delete" title="删除" onclick="deleteTaskTemplate(${index})">×</button></div>`).join('') || '<p class="sub">暂无条目，可在下方添加。</p>'; $('#eNewTask').value = ''; };
  window.openTaskManager = () => { if (roleName === '孩子') return toast('请切换到爸爸或妈妈测试窗口后管理小约定'); taskManager.hidden = false; E.renderTaskManager(); };
  window.closeTaskManager = () => taskManager.hidden = true;
  window.selectTaskManagerGroup = group => { taskManagerGroup = group; E.renderTaskManager(); };
  window.updateTaskTemplate = (index, value) => { const text = value.trim(); if (!text) return E.renderTaskManager(); s.taskTemplates[taskManagerGroup][index].text = text; E.persist(); E.renderTaskManager(); };
  window.deleteTaskTemplate = index => { s.taskTemplates[taskManagerGroup].splice(index, 1); E.persist(); E.renderTaskManager(); };
  window.addTaskTemplate = () => { const input = $('#eNewTask'), text = input.value.trim(); if (!text) return toast('先输入小约定内容'); s.taskTemplates[taskManagerGroup].push({ text }); E.persist(); E.renderTaskManager(); };

  const growth = document.createElement('div'); growth.className = 'growth-box'; growth.innerHTML = '<div class="growth-title"><span>宠物培养进度</span><b id="eStage">蛋阶段</b></div><div class="growth-bar"><i id="eGrowth"></i></div><p id="eGrowthCopy"></p><p class="growth-cheer" id="eCheer"></p>'; $('#pet .pet-card').prepend(growth);
  const oldGallery = $('#pet .pose-gallery');
  const levels = document.createElement('div'); levels.className = 'level-gallery'; levels.id = 'eLevels'; levels.innerHTML = '<button class="level-icon" data-level="1" type="button" style="background-image:url(\'assets/fire-level-1.png\')"><b>LV1</b></button><button class="level-icon" data-level="2" type="button" style="background-image:url(\'assets/fire-level-2.png\')"><b>LV2</b></button><button class="level-icon" data-level="3" type="button" style="background-image:url(\'assets/fire-level-3.png\')"><b>LV3</b></button>';
  const feed = document.createElement('button'); feed.id = 'eFeed'; feed.className = 'feed-button'; feed.type = 'button'; feed.innerHTML = '喂养 <small>单点消耗 100 材料 · 长按连续喂养</small>';
  oldGallery.replaceWith(levels); levels.after(feed);
  const bubble = document.createElement('div'); bubble.className = 'mood-bubble'; bubble.id = 'eBubble'; $('.pet-world').append(bubble);
  // 打招呼是宠物互动入口，固定放在宠物展示区下方、状态卡之前。
  const greetEntry = $('#pet .pet-card .softbtn.full');
  if (greetEntry) { greetEntry.id = 'ePetGreet'; greetEntry.classList.add('pet-greet-button'); $('.pet-world').after(greetEntry); }
  E.stage = () => s.feedUsed >= 5000 ? 3 : s.feedUsed >= 2500 ? 2 : s.feedUsed >= 1000 ? 1 : 0;
  // 四个阶段各有轻量待机/打招呼视频；只加载当前所在页面、当前等级的一段。
  E.stageVideo = (level, action = 'idle') => `assets/fire-lv${level}-${action}-lite-v2.mp4`;
  E.stagePoster = level => ['assets/fire-pet-egg.jpg', 'assets/fire-pet-stage1.jpg', 'assets/fire-pet-catalog.jpg', 'assets/fire-pet-final.jpg'][level] || 'assets/fire-pet-egg.jpg';
  // 手机上始终只保留当前页面的一段宠物视频，切页立即释放另一段解码与网络资源。
  E.ensureStageVideo = selector => { const host = $(selector); if (!host) return null; let video = host.querySelector('.pet-stage-video'); if (!video) { video = document.createElement('video'); video.className = 'pet-stage-video'; video.muted = true; video.playsInline = true; video.autoplay = true; video.preload = 'auto'; video.poster = 'assets/fire-pet-egg.jpg'; video.setAttribute('playsinline', ''); video.setAttribute('webkit-playsinline', ''); video.setAttribute('disableRemotePlayback', ''); host.append(video); } return video; };
  E.playVideo = (video, source, loop) => { if (!video) return; if (video.dataset.source !== source) { video.dataset.source = source; video.src = source; } video.loop = loop; video.muted = true; const promise = video.play(); if (promise) promise.catch(() => {}); };
  E.activeVideoSelector = () => !$('#home').hidden ? '#homePet' : !$('#pet').hidden ? '#worldPet' : null;
  E.releaseStageVideo = selector => { const video = $(selector)?.querySelector('.pet-stage-video'); if (!video) return; video.pause(); video.removeAttribute('src'); video.load(); video.remove(); };
  E.syncStageVideos = level => { const active = E.activeVideoSelector(); ['#homePet','#worldPet'].forEach(selector => { if (selector === active) { const video = E.ensureStageVideo(selector); video.poster = E.stagePoster(level); E.playVideo(video, E.stageVideo(level), true); } else E.releaseStageVideo(selector); }); };
  E.greet = () => { const level = E.stage(), selector = E.activeVideoSelector(); if (!selector) return; const video = E.ensureStageVideo(selector); video.poster = E.stagePoster(level); E.playVideo(video, E.stageVideo(level, 'greet'), false); video.onended = () => E.playVideo(video, E.stageVideo(E.stage()), true); toast(`云纹焰兽正在表演 LV${level} 的打招呼动画！`); };
  E.levelFlash = () => { $('.pet-home, .pet-world') && $$('.pet-home, .pet-world').forEach(host => { const flash = document.createElement('i'); flash.className = 'level-flash'; host.append(flash); setTimeout(() => flash.remove(), 760); }); };
  E.feedOnce = () => { if (s.feedUsed >= 5000) return toast('已经是最终阶段，继续陪伴它吧！'); if (E.material() < 100) return toast('宠物材料不足，完成打卡可获得更多材料'); const before = E.stage(); s.feedUsed += 100; E.render(); if (E.stage() > before) { E.levelFlash(); toast(`升级成功！LV${E.stage()} 已点亮`); } else toast('喂养成功，消耗 100 宠物材料'); };
  let feedHold = null, feedInterval = null, feedLong = false;
  const stopFeedHold = () => { clearTimeout(feedHold); clearInterval(feedInterval); feedHold = null; feedInterval = null; };
  feed.addEventListener('pointerdown', event => { event.preventDefault(); feedLong = false; feedHold = setTimeout(() => { feedLong = true; E.feedOnce(); feedInterval = setInterval(E.feedOnce, 150); }, 380); });
  ['pointerup','pointerleave','pointercancel'].forEach(type => feed.addEventListener(type, event => { event.preventDefault(); const wasLong = feedLong; stopFeedHold(); if (!wasLong && type === 'pointerup') E.feedOnce(); }));

  const modal = document.createElement('div'); modal.className = 'parent-modal'; modal.hidden = true;
  modal.innerHTML = '<div class="modal-card"><h2>家长调整积分</h2><p>这里是本周的鼓励与惩罚账。填写正数加星、负数扣星，会同步本周小星星、累计日常积分、宠物材料和本周宠物券判断。</p><input id="eAdjust" type="number" placeholder="例如 +5 鼓励 / -2 提醒"><input id="eReason" type="text" style="margin-top:8px" placeholder="调整标题，例如：完成阅读奖励"><div id="eFavorites" class="favorite-list"></div><button class="softbtn" style="margin-top:8px;width:100%" onclick="saveFavoriteReason()">☆ 收藏标题和固定分数</button><div class="modal-actions"><button onclick="closePointControl()">取消</button><button class="primary" onclick="applyPointControl()">确认修改</button></div></div>';
  document.body.append(modal);
  window.openPointControl = () => { if (roleName === '孩子') return toast('请切换到爸爸或妈妈测试窗口后管理积分'); modal.hidden = false; $('#eAdjust').value = ''; $('#eReason').value = ''; E.renderFavorites(); };
  window.closePointControl = () => modal.hidden = true;
  E.favoriteData = item => typeof item === 'string' ? { reason: item, n: null } : item;
  E.renderFavorites = () => { $('#eFavorites').innerHTML = s.favorites.map((item, i) => { const x = E.favoriteData(item), label = `${x.reason.slice(0, 6)}${x.reason.length > 6 ? '…' : ''}${Number.isFinite(x.n) ? (x.n > 0 ? ' +' : ' ') + x.n : ''}`; return `<button title="${x.reason}${Number.isFinite(x.n) ? ' · ' + (x.n > 0 ? '+' : '') + x.n + ' 分' : ''}" onclick="useFavorite(${i})">★ ${label}</button><button class="remove" title="删除收藏" onclick="deleteFavorite(${i})">×</button>`; }).join(''); };
  window.useFavorite = i => { const x = E.favoriteData(s.favorites[i]); $('#eReason').value = x.reason || ''; if (Number.isFinite(x.n)) $('#eAdjust').value = x.n; };
  window.deleteFavorite = i => { s.favorites.splice(i, 1); E.persist(); E.renderFavorites(); };
  window.saveFavoriteReason = () => { const reason = $('#eReason').value.trim(), n = Number($('#eAdjust').value); if (!reason) return toast('先输入常用标题'); if (!Number.isFinite(n) || !n) return toast('收藏时请同时填写固定加分或扣分'); const exists = s.favorites.some(item => { const x = E.favoriteData(item); return x.reason === reason && x.n === n; }); if (!exists) s.favorites.push({ reason, n }); E.persist(); E.renderFavorites(); toast(`已收藏：${reason} ${n > 0 ? '+' : ''}${n} 分`); };
  window.applyPointControl = () => { const n = Number($('#eAdjust').value), reason = $('#eReason').value.trim() || '家长积分调整'; if (!Number.isFinite(n) || !n) return toast('请输入有效的加减分'); s.extra = Number(s.extra || 0) + n; s.adjustments.unshift({ n, reason, actor: roleName === '爸爸' || roleName === '妈妈' ? roleName : '家长', time: new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }); s.adjustments = s.adjustments.slice(0, 20); E.render(); closePointControl(); toast(n > 0 ? `已加 ${n} 分` : `已扣除 ${Math.abs(n)} 分`); };
  E.parentAdjustments = () => s.adjustments.filter(item => item.reason !== '现金兑换扣除');
  const childAdjustModal = document.createElement('div'); childAdjustModal.className = 'parent-modal'; childAdjustModal.hidden = true;
  childAdjustModal.innerHTML = '<div class="modal-card"><h2>本周家长调整详情</h2><p>这里记录爸爸妈妈为你添加或扣除的小星星。</p><div id="eChildAdjustList" class="stats-list"></div><div class="modal-actions"><button class="primary" onclick="closeChildAdjustmentDetail()">我知道了</button></div></div>';
  document.body.append(childAdjustModal);
  E.adjustmentRow = item => `<div><span>${E.escape(item.reason)}<small> · ${E.escape(item.actor || '爸爸妈妈')} · ${E.escape(item.time || '')}</small></span><b>${item.n > 0 ? '+' : ''}${item.n} 分</b></div>`;
  window.openChildAdjustmentDetail = () => { const records = E.parentAdjustments(); $('#eChildAdjustList').innerHTML = records.length ? records.map(E.adjustmentRow).join('') : '<div><span>这周还没有家长加分或扣分记录</span><b>—</b></div>'; childAdjustModal.hidden = false; };
  window.closeChildAdjustmentDetail = () => childAdjustModal.hidden = true;
  E.renderAdjustmentCard = () => { const card = $('.extra-card'), isParent = roleName !== '孩子', records = E.parentAdjustments(), recent = records.slice(0, 3), plus = records.reduce((sum, item) => sum + Math.max(0, Number(item.n || 0)), 0), minus = records.reduce((sum, item) => sum + Math.abs(Math.min(0, Number(item.n || 0))), 0); card.classList.add('child-adjust-card'); card.innerHTML = `<div><div class="adjust-head"><h2>家长加分详情</h2><span class="adjust-summary"><b class="plus">+${plus}</b><b class="minus">-${minus}</b></span></div><p class="extra-help">${isParent ? '本周实况加分、扣分会同步显示在这里。' : '爸爸妈妈给你的鼓励和提醒，都会记录在这里。'}</p><div class="stats-list">${recent.length ? recent.map(E.adjustmentRow).join('') : '<div><span>暂时还没有新的记录</span><b>—</b></div>'}</div></div><div class="parent-adjust-actions"><button class="softbtn" onclick="openChildAdjustmentDetail()">查看详情</button>${isParent ? '<button class="softbtn" onclick="openPointControl()">调整积分</button>' : ''}</div>`; };
  // 兑换余额是独立的简洁 UI：不含家长调整标题、收藏和本周星星逻辑。
  const cashModal = document.createElement('div'); cashModal.className = 'parent-modal'; cashModal.hidden = true;
  cashModal.innerHTML = '<div class="modal-card"><h2>累计日常积分</h2><p>显示总累计会包含本周；周一至周五的本周积分不可兑换，到周六、周日本周积分自动可兑换。输入正数补加，输入负数表示兑换扣除；不会改变本周小星星或宠物材料。</p><input id="eCashAdjust" type="number" placeholder="例如 +10 或 -20"><div class="modal-actions"><button onclick="closeCashBalanceControl()">取消</button><button class="primary" onclick="applyCashBalanceControl()">确认修改</button></div></div>';
  document.body.append(cashModal);
  window.openCashBalanceControl = () => { if (roleName === '孩子') return toast('请切换到爸爸或妈妈测试窗口后管理累计积分'); $('#eCashAdjust').value = ''; cashModal.hidden = false; };
  window.closeCashBalanceControl = () => cashModal.hidden = true;
  window.applyCashBalanceControl = () => { const n = Number($('#eCashAdjust').value); if (!Number.isFinite(n) || !n) return toast('请输入有效的加减分'); if (n < 0 && Math.abs(n) > E.redeemable()) return toast('周一至周五不能扣本周积分；周末可兑换本周余额'); s.cashAdjust += n; s.cashLedger.unshift({ n, reason: '累计日常积分调整', actor: roleName === '爸爸' || roleName === '妈妈' ? roleName : '家长', time: new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }); s.cashLedger = s.cashLedger.slice(0, 100); cashModal.hidden = true; E.render(); toast(n > 0 ? `累计日常积分已补加 ${n} 分` : `累计日常积分已扣除 ${Math.abs(n)} 分`); };
  const redeemModal = document.createElement('div'); redeemModal.className = 'parent-modal'; redeemModal.hidden = true;
  redeemModal.innerHTML = '<div class="modal-card"><h2>兑换现金</h2><p>累计日常积分会跨周保留。周一至周五，本周积分不可兑换；到周六、周日本周积分自动可兑换。兑换不扣宠物材料。</p><p>当前可兑换：<b id="eRedeemBalance">0</b> 分</p><input id="eRedeemAmount" type="number" min="1" placeholder="输入本次兑换分数"><div class="modal-actions"><button onclick="closeRedeemControl()">取消</button><button class="primary" onclick="applyRedeemControl()">确认兑换</button></div></div>';
  document.body.append(redeemModal);
  window.openRedeemControl = () => { if (roleName === '孩子') return toast('请切换到爸爸或妈妈测试窗口后兑换'); $('#eRedeemBalance').textContent = E.redeemable(); $('#eRedeemAmount').value = ''; redeemModal.hidden = false; };
  window.closeRedeemControl = () => redeemModal.hidden = true;
  window.applyRedeemControl = () => { const n = Number($('#eRedeemAmount').value); if (!Number.isFinite(n) || n <= 0) return toast('请输入本次兑换分数'); if (n > E.redeemable()) return toast('周一至周五不能兑换本周积分；周末可兑换本周余额'); s.redeemed += n; s.cashLedger.unshift({ n: -n, reason: '现金兑换扣除', actor: roleName === '爸爸' || roleName === '妈妈' ? roleName : '家长', time: new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }); s.cashLedger = s.cashLedger.slice(0, 100); redeemModal.hidden = true; E.render(); toast(`已兑换 ${n} 分，累计余额已扣除`); };

  const stats = document.createElement('section'); stats.id = 'stats'; stats.className = 'screen'; stats.hidden = true;
  stats.innerHTML = '<div class="screen-heading"><button class="icon-btn" onclick="showPage(\'me\')">‹</button><h1>积分总统计</h1><span></span></div><div class="stats-hero"><span>跨周累计可兑换积分</span><strong id="eStatsTotal">0 分</strong><span>只有兑换现金时才从累计余额扣除</span></div><article class="card"><div class="points-grid"><div><span>累计打卡积分</span><strong id="eStatCheck">0</strong></div><div><span>累计家长调整</span><strong id="eStatParent">0</strong></div><div><span>宠物材料</span><strong id="eStatMaterial">0</strong></div></div><div class="modal-actions"><button onclick="openPointControl()">加分 / 减分</button><button class="primary" onclick="openRedeemControl()">兑换现金</button></div></article><article class="card"><h2>本周积分明细</h2><div class="stats-list" id="eLedger"></div></article><article class="card"><h2>家长调整记录</h2><div class="stats-list" id="eAdjustLedger"></div></article>';
  $('#me').after(stats);
  const entry = document.createElement('article'); entry.className = 'card stats-entry'; entry.innerHTML = '<span>✦ 家长控制中心</span><strong id="eMeTotal">0 分</strong><small>查看总分、兑换扣除与调整记录</small><button onclick="showPage(\'stats\')">进入积分总统计</button>'; $('.settings-list').before(entry);
  $('.bank').style.cursor = 'pointer'; $('.bank').title = '打开积分总统计'; $('.bank').onclick = () => showPage('stats');

  const buy = document.createElement('button'); buy.className = 'buy-pet'; buy.textContent = '✦ 购买宠物';
  const toolbar = document.createElement('div'); toolbar.className = 'catalog-toolbar'; toolbar.innerHTML = '<div class="catalog-types"><button class="on" data-t="全部">全部</button><button data-t="火属性">火</button><button data-t="水属性">水</button><button data-t="自然属性">自然</button><button data-t="星光属性">星光</button></div>';
  toolbar.append(buy); $('.pet-search').before(toolbar);
  $$('.catalog-types button').forEach(b => b.onclick = () => { catalogType = b.dataset.t; $$('.catalog-types button').forEach(x => x.classList.toggle('on', x === b)); E.catalog($('.pet-search').value); });
  buy.onclick = () => openPetPurchase();
  const purchase = document.createElement('div'); purchase.className = 'purchase-modal'; purchase.hidden = true;
  purchase.innerHTML = '<div class="modal-card"><h2>召唤新伙伴</h2><p>旋转的星光正在为你展示宠物。购买会消耗 1 张宠物券。</p><div class="purchase-display"><i id="ePurchaseArt"></i></div><strong class="purchase-name" id="ePurchaseName"></strong><span class="ticket-chip" id="eTicket"></span><select id="ePurchaseSelect" style="width:100%;padding:9px;border:2px solid #9cd6ec;border-radius:10px;color:#1268aa;font-weight:900"></select><p id="eBuyHint"></p><div class="modal-actions"><button onclick="closePetPurchase()">稍后再说</button><button class="primary" onclick="purchaseCurrentPet()">确认购买</button></div></div>';
  document.body.append(purchase);
  // 图鉴已精简：只有默认火属性伙伴保留实体图片；其余位置统一显示锁定图标，避免请求已清理的大图。
  E.artStyle = p => p.art ? `background-image:url('${p.art}')` : "background-image:url('assets/catalog-cell-lock.png');background-size:cover;background-position:center";
  E.purchase = () => { const p = roster.find(x => x.asset === purchaseAsset) || roster[1]; $('#ePurchaseArt').style.cssText = E.artStyle(p); $('#ePurchaseName').textContent = p.name; $('#eTicket').textContent = `宠物券余额：${s.petCoupons} 张`; $('#ePurchaseSelect').innerHTML = roster.filter(x => !x.gift).map(x => `<option value="${x.asset}" ${x.asset === p.asset ? 'selected' : ''}>${x.type} · ${x.name}</option>`).join(''); $('#eBuyHint').textContent = s.adopted.includes(p.asset) ? '它已经在你的伙伴队伍里了。' : s.petCoupons ? '本次购买将消耗 1 张宠物券。' : '宠物券不足：本周日常积分满 400 分可获得。'; };
  window.openPetPurchase = asset => { purchaseAsset = Number.isFinite(asset) && asset !== fireAsset ? asset : (roster.find(x => !x.gift && !s.adopted.includes(x.asset)) || roster[1]).asset; purchase.hidden = false; E.purchase(); };
  window.closePetPurchase = () => purchase.hidden = true;
  $('#ePurchaseSelect').onchange = e => { purchaseAsset = Number(e.target.value); E.purchase(); };
  window.purchaseCurrentPet = () => { const p = roster.find(x => x.asset === purchaseAsset); if (s.adopted.includes(p.asset)) { s.pet = p.asset; purchase.hidden = true; E.render(); showPage('pet'); return; } if (!s.petCoupons) return toast('宠物券不足'); s.petCoupons--; s.adopted.push(p.asset); s.pet = p.asset; purchase.hidden = true; E.render(); E.catalog(); toast(`欢迎 ${p.name} 加入！`); };
  window.showOwnedPet = asset => { s.pet = asset; E.render(); showPage('pet'); toast('已收集的伙伴正在陪伴你。'); };
  window.showLockedPet = asset => { openPetPurchase(asset); };
  E.catalogLoaded = false;
  E.catalog = q => { if ($('#catalog').hidden) { E.catalogDirty = true; return; } const list = roster.filter(p => (catalogType === '全部' || p.type === catalogType) && p.name.includes(q || '')); $('#catalogGrid').innerHTML = list.map((p, i) => { const owned = s.adopted.includes(p.asset); if (owned) return `<button class="catalog-card owned" onclick="showOwnedPet(${p.asset})"><span class="collect-badge">✓</span><span class="pet-number">${p.type}</span><span class="stage-art ${p.art ? 'fire-art' : ''}" style="${E.artStyle(p)}"></span><strong>${p.name}</strong><small>${p.gift ? '默认赠送' : '已收集'}</small></button>`; const lock = i % 2 ? 'assets/catalog-cell-lock.png' : 'assets/catalog-cell-question.png'; return `<button class="catalog-card locked" onclick="showLockedPet(${p.asset})"><span class="stage-art" style="background-image:url('${lock}')"></span><strong>???</strong><small>未收集</small></button>`; }).join(''); $('#catalogCount').innerHTML = `已收集 <b>${s.adopted.length}</b> / ${roster.length}<br>彩色为已收集 · 剪影锁定为未收集`; E.catalogLoaded = true; E.catalogDirty = false; };
  window.filterCatalog = q => E.catalog(q);

  E.weekSave = () => { s.weekData[s.weekIndex] = { done: [...s.done], extra: Number(s.extra || 0), adjustments: [...s.adjustments] }; };
  E.weekLoad = i => { E.weekSave(); s.weekIndex = Math.max(0, i); const w = s.weekData[s.weekIndex] || { done: [false, false, false, false, false, false, false], extra: 0, adjustments: [] }; s.done = [...w.done]; s.extra = Number(w.extra || 0); s.adjustments = [...w.adjustments]; s.day = 0; E.render(); toast(`已切换到第 ${s.weekIndex + 1} 周测试`); };
  window.switchTestWeek = d => E.weekLoad(s.weekIndex + d);
  window.resetCurrentWeek = () => { if (roleName === '孩子') return toast('请切换至爸爸或妈妈窗口'); s.done = [false, false, false, false, false, false, false]; s.extra = 0; s.adjustments = []; Object.keys(s.taskChecks).filter(key => key.startsWith(`${s.weekIndex}-`)).forEach(key => delete s.taskChecks[key]); s.day = 0; E.weekSave(); E.render(); toast('本周测试数据已重置'); };
  window.role = button => { roleName = button.textContent.trim(); $$('.family-roles .role').forEach(x => { const on = x === button; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); }); $('.family-switch-label').textContent = `身份体验 · ${roleName}测试窗口`; $('.family-switch p').textContent = roleName === '孩子' ? '孩子可以完成小约定、打卡和查看加减分详情；清单内容由家长管理。' : `${roleName}拥有加减分、兑换扣除、购买宠物与重置本周测试权限；小约定在下方“修改规则”中编辑。`; parentActions.classList.toggle('show', roleName !== '孩子'); E.render(); toast(`已切换至${roleName}测试窗口`); };
  $$('.family-roles .role').forEach(button => { button.onclick = event => { event.preventDefault(); window.role(button); }; });

  // 云端正式版不再依赖已删除的“测试身份”按钮；爸爸/妈妈网址直接进入管理入口。
  const officialRolePanel = document.createElement('section');
  officialRolePanel.className = 'official-role-panel';
  officialRolePanel.hidden = true;
  officialRolePanel.innerHTML = '<div><b id="officialRoleTitle">家长管理入口</b><span>可管理本周加减分、累计日常积分和每日小约定</span></div><div class="official-role-actions"><button type="button" onclick="openPointControl()">调整本周积分</button><button type="button" onclick="openCashBalanceControl()">累计日常积分</button><button type="button" onclick="openTaskManager()">修改每日规则</button></div>';
  $('.top').after(officialRolePanel);
  const officialRoleStyle = document.createElement('style');
  officialRoleStyle.textContent = '.official-role-panel{display:grid;gap:10px;margin:12px 10px 0;padding:13px;border:2px solid #8edcf3;border-radius:16px;background:linear-gradient(135deg,#e7f8ff,#f9fdff);box-shadow:0 4px 0 #aeddec}.official-role-panel[hidden]{display:none}.official-role-panel b,.official-role-panel span{display:block}.official-role-panel b{color:#0a67b0;font-size:16px}.official-role-panel span{margin-top:4px;color:#4d81a7;font-size:12px;line-height:1.45}.official-role-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.official-role-actions button{min-height:40px;padding:6px 4px;border:1px solid #96d7ee;border-radius:10px;background:#f5fcff;color:#0b69b1;font:inherit;font-size:11px;font-weight:900}';
  document.head.append(officialRoleStyle);
  // 爸爸端保留一组明确的“测试与修复”工具。它和孩子页面完全分离，
  // 方便在异常后补回某一天的打卡或手动补回分数。
  const dadRepairPanel = document.createElement('section');
  dadRepairPanel.className = 'dad-repair-panel';
  dadRepairPanel.hidden = true;
  dadRepairPanel.innerHTML = '<div><b>爸爸补打卡与修复</b><span>可按真实日期补打卡、撤销打卡，并填写当天实际分数；所有积分会同步到家庭页面。</span></div><div id="eDadRepairDays" class="dad-repair-days"></div><div class="dad-repair-actions"><button type="button" onclick="openDadCheckinRepair()">选择日期补打卡</button><button type="button" onclick="openPointControl()">手动补回 / 扣除分数</button><button type="button" onclick="dadRepairWeek(-1)">‹ 上一测试周</button><button type="button" onclick="dadRepairWeek(1)">下一测试周 ›</button><button type="button" onclick="littleStarSyncNow()">立即同步</button></div>';
  officialRolePanel.after(dadRepairPanel);
  const dadRepairStyle = document.createElement('style');
  dadRepairStyle.textContent = '.dad-repair-panel{display:grid;gap:10px;margin:12px 10px 0;padding:13px;border:2px dashed #78bee7;border-radius:16px;background:#f5fcff}.dad-repair-panel[hidden]{display:none}.dad-repair-panel b,.dad-repair-panel span{display:block}.dad-repair-panel b{color:#0a67b0;font-size:16px}.dad-repair-panel span{margin-top:4px;color:#4d81a7;font-size:12px;line-height:1.45}.dad-repair-days{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.dad-repair-days button,.dad-repair-actions button{min-height:37px;padding:6px 4px;border:1px solid #96d7ee;border-radius:10px;background:#eaf8ff;color:#0b69b1;font:inherit;font-size:11px;font-weight:900}.dad-repair-days button.done{background:#eff8ed;color:#5a9473;border-color:#a9d8b7}.dad-repair-actions{display:grid;grid-template-columns:repeat(2,1fr);gap:6px}.dad-repair-actions button:first-child{background:#1778c8;color:#fff;border-color:#1778c8}.dad-checkin-fields{display:grid;gap:10px;margin:12px 0}.dad-checkin-fields label{display:grid;gap:5px;color:#397da9;font-size:12px;font-weight:900}.dad-checkin-fields input,.dad-checkin-fields select{box-sizing:border-box;width:100%;padding:10px;border:2px solid #9ad8ef;border-radius:10px;background:#fff;color:#145f99;font:inherit}.dad-checkin-summary{padding:9px 10px;border-radius:10px;background:#edf9ff;color:#337ba9;font-size:12px;line-height:1.5}';
  document.head.append(dadRepairStyle);
  E.renderDadRepairPanel = () => {
    dadRepairPanel.hidden = roleName !== '爸爸';
    if (dadRepairPanel.hidden) return;
    $('#eDadRepairDays').innerHTML = names.map((name, index) => `<button type="button" class="${s.done[index] ? 'done' : ''}" onclick="openDadCheckinRepair(${index})">${s.done[index] ? '✓ ' : '补 '}${name} ${s.done[index] ? '+' + E.checkinScore(s.weekIndex, index) : '+' + pts[index]}</button>`).join('');
  };
  const dadCheckinModal = document.createElement('div');
  dadCheckinModal.className = 'parent-modal';
  dadCheckinModal.hidden = true;
  dadCheckinModal.innerHTML = '<div class="modal-card"><h2>补打卡 / 修改当天分数</h2><p>选择真实日期后，可以补上当天打卡、调整具体分数，或撤销误记的打卡。保存后会同步更新本周小星星、累计积分、宠物材料和家庭记录。</p><div class="dad-checkin-fields"><label>打卡日期<input id="eDadCheckinDate" type="date"></label><label>当天状态<select id="eDadCheckinStatus"><option value="done">已完成（补打卡）</option><option value="undone">未完成 / 撤销打卡</option></select></label><label id="eDadCheckinScoreLabel">当天实际分数<input id="eDadCheckinScore" type="number" min="0" max="1000" step="1"></label><label>说明（可选）<input id="eDadCheckinReason" maxlength="30" placeholder="例如：周二补打卡"></label></div><div id="eDadCheckinSummary" class="dad-checkin-summary"></div><div class="modal-actions"><button type="button" onclick="closeDadCheckinRepair()">取消</button><button type="button" class="primary" onclick="saveDadCheckinRepair()">保存并同步</button></div></div>';
  document.body.append(dadCheckinModal);
  const dateText = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  E.repairDateInfo = value => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
    if (!match) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    if (Number.isNaN(date.getTime()) || dateText(date) !== value || date < checkinStart || date > localMidnight()) return null;
    const elapsed = Math.floor((date.getTime() - checkinStart.getTime()) / dayMs);
    return { date, weekIndex: Math.floor(elapsed / 7), dayIndex: elapsed % 7 };
  };
  E.refreshDadCheckinRepair = () => {
    const info = E.repairDateInfo($('#eDadCheckinDate').value), enabled = $('#eDadCheckinStatus').value === 'done';
    $('#eDadCheckinScore').disabled = !enabled; $('#eDadCheckinReason').disabled = !enabled; $('#eDadCheckinScoreLabel').style.opacity = enabled ? '1' : '.5';
    if (!info) { $('#eDadCheckinSummary').textContent = '请选择从 2026 年 9 月 14 日至今天之间的真实日期。'; return; }
    const week = info.weekIndex === s.weekIndex ? { done: s.done } : s.weekData[info.weekIndex];
    const done = !!week?.done?.[info.dayIndex], current = done ? E.checkinScore(info.weekIndex, info.dayIndex) : pts[info.dayIndex];
    if (document.activeElement !== $('#eDadCheckinScore')) $('#eDadCheckinScore').value = current;
    $('#eDadCheckinSummary').textContent = `${E.shortDate(info.date)} · ${names[info.dayIndex]} · 第 ${info.weekIndex + 1} 周${done ? `，当前已记录 ${current} 分` : `，默认建议 ${pts[info.dayIndex]} 分`}`;
  };
  window.openDadCheckinRepair = index => {
    if (roleName !== '爸爸') return toast('仅爸爸页面可使用补打卡功能');
    const dayIndex = Number.isInteger(index) ? index : s.day;
    const date = E.weekDate(dayIndex), key = E.checkinKey(s.weekIndex, dayIndex), done = !!s.done[dayIndex];
    $('#eDadCheckinDate').min = dateText(checkinStart); $('#eDadCheckinDate').max = dateText(localMidnight()); $('#eDadCheckinDate').value = dateText(date);
    $('#eDadCheckinStatus').value = done ? 'done' : 'done'; $('#eDadCheckinScore').value = done ? E.checkinScore(s.weekIndex, dayIndex) : pts[dayIndex]; $('#eDadCheckinReason').value = s.checkinRepairs?.[key]?.reason || '';
    dadCheckinModal.hidden = false; E.refreshDadCheckinRepair();
  };
  window.closeDadCheckinRepair = () => { dadCheckinModal.hidden = true; };
  window.saveDadCheckinRepair = () => {
    if (roleName !== '爸爸') return toast('仅爸爸页面可使用补打卡功能');
    const info = E.repairDateInfo($('#eDadCheckinDate').value); if (!info) return toast('请选择有效的真实日期');
    const isDone = $('#eDadCheckinStatus').value === 'done', score = Number($('#eDadCheckinScore').value);
    if (isDone && (!Number.isFinite(score) || score < 0 || score > 1000)) return toast('请填写 0 到 1000 之间的当天分数');
    const week = info.weekIndex === s.weekIndex ? { done: s.done } : (s.weekData[info.weekIndex] || { done: [false, false, false, false, false, false, false], extra: 0, adjustments: [] });
    week.done = Array.from({ length: 7 }, (_, i) => !!week.done[i]); week.done[info.dayIndex] = isDone;
    if (info.weekIndex === s.weekIndex) s.done = week.done; else s.weekData[info.weekIndex] = { ...week, done: week.done };
    const key = E.checkinKey(info.weekIndex, info.dayIndex);
    if (isDone) { s.checkinScores[key] = Math.round(score); s.checkinRepairs[key] = { actor: '爸爸', time: new Date().toLocaleString('zh-CN', { hour12: false }), reason: $('#eDadCheckinReason').value.trim() }; }
    else { delete s.checkinScores[key]; delete s.checkinRepairs[key]; }
    dadCheckinModal.hidden = true; E.render();
    toast(isDone ? `已补记 ${E.shortDate(info.date)} ${Math.round(score)} 分，并同步家庭积分` : `已撤销 ${E.shortDate(info.date)} 的打卡记录，并同步家庭积分`);
  };
  $('#eDadCheckinDate').addEventListener('change', E.refreshDadCheckinRepair);
  $('#eDadCheckinStatus').addEventListener('change', E.refreshDadCheckinRepair);
  window.dadRepairWeek = delta => {
    if (roleName !== '爸爸') return toast('仅爸爸页面可浏览测试周');
    E.weekLoad(Math.max(0, s.weekIndex + delta));
    E.renderDadRepairPanel();
  };
  E.updateOfficialRolePanel = () => {
    const isParent = roleName === '爸爸' || roleName === '妈妈';
    officialRolePanel.hidden = !isParent;
    if (isParent) $('#officialRoleTitle').textContent = `${roleName}家长管理入口`;
    document.body.dataset.familyRole = roleName;
    E.renderDadRepairPanel();
  };
  window.setOfficialRole = role => {
    roleName = role === '爸爸' || role === '妈妈' ? role : '孩子';
    E.updateOfficialRolePanel();
    E.render();
  };

  E.baseUI = () => {
    const t = total(), currentDate = E.currentDate(), weekStart = E.weekDate(0), weekEnd = E.weekDate(6), date = `第 ${s.weekIndex + 1} 周 · ${E.shortDate(currentDate)} · ${names[s.day]}`;
    $('#datePill').textContent = date;
    $('#week').innerHTML = names.map((n, i) => `<div class="day ${s.done[i] ? 'done' : 'pending'}"><div class="tile"><span>${n}</span><b>+${pts[i]}</b>${s.done[i] ? '★' : '·'}</div><span class="status">${s.done[i] ? '已完成' : '等你来'}</span></div>`).join('');
    $('#progress').style.width = Math.min(100, t / 400 * 100) + '%';
    E.renderAdjustmentCard(); $('#profileScore').textContent = t; $('#monthDone').textContent = s.done.filter(Boolean).length + ' 天'; $('#monthExtra').textContent = Number(s.extra || 0) + ' 分'; $('#finished').textContent = s.done.filter(Boolean).length; $('#completeDays').textContent = s.done.filter(Boolean).length + ' 天'; $('#streak').textContent = s.done.filter(Boolean).length + ' 天';
    $('#todayText').innerHTML = s.done[s.day] ? '<div class="question">今天已经记录好啦！</div><p>不需要重复打卡。每一个小小的坚持都很棒。</p>' : '<div class="question">今天的小约定，完成了吗？</div><p>完成后打个勾，让小星星飞进你的积分栏吧。</p>';
    const taskActions = $('#taskActions');
    if (roleName === '孩子') { taskActions.innerHTML = childTaskActionsMarkup; taskActions.hidden = !!s.done[s.day]; }
    else { $('#todayText').innerHTML = '<div class="question">小约定规则</div><p>这里展示孩子每天领取星星前需要完成的标签；家长可随时修改。</p>'; taskActions.hidden = false; taskActions.innerHTML = '<button class="softbtn" style="width:100%" onclick="openTaskManager()">修改规则</button>'; }
    const testDayInfo = $('#testDayInfo'), dayTester = $('#dayTester');
    if (testDayInfo) testDayInfo.textContent = `当前：${names[s.day]} · 第 ${s.weekIndex + 1} 周`;
    if (dayTester) dayTester.innerHTML = names.map((n, i) => `<button class="${i === s.day ? 'on' : ''}" onclick="setDay(${i})">${n}<br>${pts[i]}分</button>`).join('');
    const time = $('.weektop time'); if (time) time.textContent = `${E.shortDate(weekStart)} — ${E.shortDate(weekEnd)}`;
  };
  E.render = () => render();
  render = function () {
    E.baseUI();
    E.renderProfile();
    E.award();
    const daily = E.daily(), weekStars = E.weekPoints(), material = E.material(), mood = E.mood();
    $('#score').innerHTML = String(weekStars).padStart(2, '0') + '<small> 颗</small>';
    $('#eDaily').textContent = daily; $('#eDailyHint').textContent = s.day >= 5 ? `含本周 ${E.weekPoints()} 分 · 周末可兑换` : `含本周 ${E.weekPoints()} 分 · 本周不可兑换`; $('#eMaterial').textContent = material; $('#eTopMaterial').textContent = material; $('#eCoupons').textContent = s.petCoupons;
    const eWeek = $('#eWeek'); if (eWeek) eWeek.innerHTML = `第 ${s.weekIndex + 1} 周<br>${E.shortDate(E.weekDate(0))} — ${E.shortDate(E.weekDate(6))}`;
    const currentStage = E.stage(), stageNames = ['蛋阶段','LV1 · 第一阶段','LV2 · 成长阶段','LV3 · 最终阶段'];
    $('#eStage').textContent = stageNames[currentStage]; $('#eGrowth').style.width = Math.min(100, s.feedUsed / 5000 * 100) + '%'; $('#eGrowthCopy').textContent = `已喂养 ${s.feedUsed} / 5000 · 可用材料 ${material} · LV1 需 1000，LV2 需 2500，LV3 需 5000`; $('#eCheer').textContent = currentStage === 3 ? '太棒了！你们已经成长到最终阶段！' : `再喂养 ${[1000,2500,5000][currentStage] - s.feedUsed} 材料，即可点亮 LV${currentStage + 1}！`;
    $$('#eLevels .level-icon').forEach(icon => { const level = Number(icon.dataset.level); const active = currentStage >= level; icon.classList.toggle('active', active); icon.classList.toggle('locked', !active); });
    E.showSpeech(false);
    $('#spirit').textContent = mood === '开心' ? '开心极了' : mood === '低落' ? '非常低落' : mood === '期待' ? '充满期待' : '安静休息'; $('#petSpirit').textContent = $('#spirit').textContent;
    $('#body').textContent = mood === '开心' ? '活力满满' : mood === '低落' ? '需要陪伴' : '精神饱满'; $('#petBody').textContent = $('#body').textContent;
    const active = roster.find(p => p.asset === s.pet) || roster[0];
    if (active.asset === fireAsset || active.art) { const petArt = ['assets/fire-level-egg.png','assets/fire-level-1.png','assets/fire-level-2.png','assets/fire-level-3.png'][currentStage]; ['#homePet', '#worldPet'].forEach(sel => { const el = $(sel); el.style.backgroundImage = `url('${petArt}')`; el.style.backgroundSize = 'cover'; el.style.backgroundPosition = 'center'; if (Number(el.dataset.stage || 0) < currentStage) { el.classList.remove('level-up'); void el.offsetWidth; el.classList.add('level-up'); } el.dataset.stage = String(currentStage); }); E.syncStageVideos(currentStage); }
    $('#homePetName').textContent = active.name; $('#worldPetName').textContent = active.name; $('#homePetType').textContent = active.type + ' · 伙伴精灵'; $('#worldPetType').textContent = active.type + ' · 伙伴精灵';
    const greetButton = $('#ePetGreet'); if (greetButton) { greetButton.textContent = `和 ${active.name} 打招呼`; greetButton.onclick = () => E.greet(); }
    $('#eStatsTotal').textContent = daily + ' 分'; $('#eMeTotal').textContent = daily + ' 分'; $('#eStatCheck').textContent = E.gross() - E.parentTotal(); $('#eStatParent').textContent = (E.parentTotal() > 0 ? '+' : '') + E.parentTotal(); $('#eStatMaterial').textContent = material;
    $('#eLedger').innerHTML = names.map((n, i) => `<div><span>${n} · ${s.done[i] ? '已完成' : '未完成'}</span><b>${s.done[i] ? '+' + E.checkinScore(s.weekIndex, i) : '0'} 分</b></div>`).join(''); $('#eAdjustLedger').innerHTML = s.adjustments.length ? s.adjustments.map(x => `<div><span>${x.reason}<small> · ${x.time}</small></span><b>${x.n > 0 ? '+' : ''}${x.n} 分</b></div>`).join('') : '<div><span>还没有家长调整记录</span><b>—</b></div>';
    E.renderCalendar();
    E.renderFamilyLedger();
    E.weekSave(); E.persist(); E.updateOfficialRolePanel();
  };
  window.complete = button => { if (button.dataset.running) return; window.openTaskChecklist(button); };
  E.fly = (from, count, done) => { count = Math.min(10, Math.max(1, count)); const bank = $('.bank'), target = bank.getBoundingClientRect(), sx = from.left + from.width / 2, sy = from.top + from.height / 2, dx = target.left + target.width / 2 - sx, dy = target.top + target.height / 2 - sy; for (let i = 0; i < count; i++) { const star = document.createElement('b'); star.className = 'star-flight clean'; star.textContent = '★'; star.style.setProperty('--x', (sx + (Math.random() - .5) * 18) + 'px'); star.style.setProperty('--y', (sy + (Math.random() - .5) * 12) + 'px'); star.style.setProperty('--dx', (dx + (Math.random() - .5) * 17) + 'px'); star.style.setProperty('--dy', (dy + (Math.random() - .5) * 14) + 'px'); star.style.setProperty('--size', (i === 0 ? 30 : 14 + Math.random() * 7) + 'px'); star.style.setProperty('--delay', (i / count * .38) + 's'); document.body.append(star); setTimeout(() => star.remove(), 1400); } setTimeout(() => { bank.classList.remove('e-arrive'); void bank.offsetWidth; bank.classList.add('e-arrive'); const r = bank.getBoundingClientRect(); const ring = document.createElement('i'); ring.className = 'score-ripple'; ring.style.setProperty('--x', (r.left + r.width / 2) + 'px'); ring.style.setProperty('--y', (r.top + r.height / 2) + 'px'); document.body.append(ring); setTimeout(() => ring.remove(), 800); done(); }, 1050); };
  E.roll = (a, b) => { const start = performance.now(), duration = 620, el = $('#score'); const frame = now => { const p = Math.min(1, (now - start) / duration), v = Math.round(a + (b - a) * (1 - Math.pow(1 - p, 3))); el.innerHTML = String(v).padStart(2, '0') + '<small> 颗</small>'; if (p < 1) requestAnimationFrame(frame); }; requestAnimationFrame(frame); };
  window.resetTest = () => { s.done = [false, false, false, false, false, false, false]; s.extra = 0; s.day = 0; s.pet = fireAsset; s.petCoupons = 0; s.adopted = [fireAsset]; s.adjustments = []; s.taskChecks = {}; s.weekIndex = 0; s.weekData = []; s.weekAwards = {}; s.redeemed = 0; s.cashAdjust = 0; s.feedUsed = 0; render(); toast('已还原全部测试数据，默认火属性宠物仍在。'); };
  // 图鉴是延迟加载：首页不创建图鉴卡片，也不会请求图鉴图片。
  $('#catalogGrid').innerHTML = '<p class="sub">进入图鉴后加载精灵伙伴…</p>';
  const baseShowPage = window.showPage;
  window.showPage = id => { baseShowPage(id); E.syncStageVideos(E.stage()); if (id === 'catalog' && (!E.catalogLoaded || E.catalogDirty)) E.catalog($('.pet-search').value); };
  // Initial application after all DOM extensions are present.
  s.pet = s.adopted.includes(s.pet) ? s.pet : fireAsset;
  window.syncRealDate = () => E.syncCurrentDate();
  E.syncCurrentDate();
  clearInterval(window.__littleStarDateTimer);
  window.__littleStarDateTimer = setInterval(() => { if (E.syncCurrentDate()) render(); }, 60000);
  render();
})();
