/* 家庭云端同步层：保留 v1.0 的所有页面逻辑，仅把既有状态同步到 Supabase。 */
(() => {
  'use strict';
  const stateKey = 'little-star-offline-copy';
  // iPad Safari 刷新/切到后台时会比 Android 更早终止页面请求。把尚未收到云端确认的
  // 快照单独留在本机，下次打开时先恢复它，避免旧云端数据把刚完成的打卡覆盖掉。
  const pendingKey = 'little-star-cloud-pending';
  const endpoint = 'https://efqwbqbzuhmiaafknxnt.supabase.co/rest/v1/family_state';
  const apiKey = 'sb_publishable_f3UR_pMs_MkUZG2SOW8S9g_5SODbPS5';
  const familyId = 'liuliu-family-v1';
  let applyingRemote = false;
  let saving = false;
  let queuedState = null;
  let saveTimer = null;
  let lastRemoteUpdatedAt = '';

  // 正式云端版不展示开发测试控件；离线复刻版仍保留这些测试能力。
  document.querySelector('.reset-test-bar')?.remove();
  document.querySelector('.test-tools')?.remove();

  const status = document.createElement('div');
  status.id = 'cloudSyncStatus';
  status.setAttribute('aria-live', 'polite');
  status.textContent = '☁ 正在连接家庭同步…';
  document.body.append(status);
  const css = document.createElement('style');
  css.textContent = '#cloudSyncStatus{position:fixed;z-index:500;right:9px;bottom:80px;padding:6px 8px;border:1px solid #92d8ef;border-radius:99px;background:#effbff;color:#176ca9;font:11px/1.2 "Microsoft YaHei",sans-serif;font-weight:900;box-shadow:0 2px 8px #0869a422}#cloudSyncStatus.ok{border-color:#8edfc0;background:#effff5;color:#148158}#cloudSyncStatus.warn{border-color:#ffd071;background:#fff9e6;color:#a06b00}';
  document.head.append(css);
  const setStatus = (text, kind = '') => { status.textContent = text; status.className = kind; };
  const headers = { apikey: apiKey, Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
  const readLocal = () => { try { return JSON.parse(localStorage.getItem(stateKey) || '{}'); } catch { return {}; } };
  const readPending = () => { try { return JSON.parse(localStorage.getItem(pendingKey) || 'null'); } catch { return null; } };
  const writePending = state => { try { nativeSetItem(pendingKey, JSON.stringify(state)); } catch { /* 本机空间不足时仍继续尝试同步 */ } };
  const clearPendingIfCurrent = state => { try { if (same(readPending(), state)) localStorage.removeItem(pendingKey); } catch { /* ignore */ } };
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  const nativeSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = (key, value) => {
    nativeSetItem(key, value);
    if (key !== stateKey || applyingRemote) return;
    // 分数调整后会立即开始保存；即使用户紧接着刷新，keepalive 请求也会继续完成。
    try { const snapshot = JSON.parse(value); writePending(snapshot); queueSave(snapshot, 0); } catch { /* ignore invalid legacy cache */ }
  };

  async function push(state) {
    if (saving) { queuedState = state; return; }
    saving = true;
    setStatus('☁ 正在保存…');
    try {
      const response = await fetch(`${endpoint}?id=eq.${encodeURIComponent(familyId)}`, {
        method: 'PATCH', headers: { ...headers, Prefer: 'return=representation' }, keepalive: true,
        body: JSON.stringify({ state, updated_at: new Date().toISOString() })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const rows = await response.json();
      lastRemoteUpdatedAt = rows[0]?.updated_at || lastRemoteUpdatedAt;
      clearPendingIfCurrent(state);
      setStatus('☁ 家庭数据已同步', 'ok');
    } catch (error) {
      setStatus('☁ 暂存本机，等待网络恢复', 'warn');
      console.warn('家庭同步暂不可用', error);
    } finally {
      saving = false;
      if (queuedState) { const next = queuedState; queuedState = null; queueSave(next, 0); }
    }
  }
  function queueSave(state, delay = 0) {
    // 保存一个快照，防止后续页面渲染继续改写同一对象时污染本次请求。
    try { queuedState = JSON.parse(JSON.stringify(state)); } catch { queuedState = state; }
    clearTimeout(saveTimer);
    if (delay <= 0) { const next = queuedState; queuedState = null; void push(next); return; }
    saveTimer = setTimeout(() => { const next = queuedState; queuedState = null; push(next); }, delay);
  }
  function replaceState(remote) {
    if (!remote || typeof remote !== 'object' || same(readLocal(), remote)) return;
    applyingRemote = true;
    try {
      Object.keys(s).forEach(key => delete s[key]);
      Object.assign(s, remote);
      // 云端早期数据没有宠物券、流水等新字段；先标准化再渲染，避免页面报错中断同步。
      window.littleStarNormalizeState?.();
      // 云端旧状态可能来自昨天；每次合并后都以当前设备日期校正到真实的周几。
      window.syncRealDate?.();
      nativeSetItem(stateKey, JSON.stringify(s));
      render();
    } finally { applyingRemote = false; }
  }
  async function pull(firstLoad = false) {
    try {
      // 只要本机还有一份未获确认的操作，绝不让旧云端快照覆盖它。
      // 这正是 iPad 打卡后立刻刷新会“消失”的根因。
      const pending = readPending();
      if (pending && typeof pending === 'object') {
        setStatus('☁ 正在恢复刚才的打卡…');
        queueSave(pending, 0);
        return;
      }
      const response = await fetch(`${endpoint}?id=eq.${encodeURIComponent(familyId)}&select=state,updated_at`, { headers });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const rows = await response.json();
      if (!rows.length) {
        const initial = readLocal();
        const created = await fetch(endpoint, { method: 'POST', headers: { ...headers, Prefer: 'return=representation' }, body: JSON.stringify({ id: familyId, state: initial }) });
        if (!created.ok) throw new Error(`初始化失败 HTTP ${created.status}`);
        const data = await created.json();
        lastRemoteUpdatedAt = data[0]?.updated_at || '';
        setStatus('☁ 已建立家庭同步', 'ok');
      } else {
        const remote = rows[0];
        // 请求开始后，用户也可能刚完成喂养/打卡；再次检查，不能应用这份旧响应。
        const pendingAfterRequest = readPending();
        if (pendingAfterRequest && typeof pendingAfterRequest === 'object') {
          setStatus('☁ 正在保存刚才的操作…');
          queueSave(pendingAfterRequest, 0);
          return;
        }
        // 关键：请求可能在一次喂养之前就已经发出。若喂养保存先完成，
        // 这个“飞行中的旧请求”稍后返回时不能把新进度（例如 LV1 的 1000 材料）覆盖回蛋阶段。
        const remoteTime = Date.parse(remote.updated_at || '');
        const acceptedTime = Date.parse(lastRemoteUpdatedAt || '');
        if (Number.isFinite(remoteTime) && Number.isFinite(acceptedTime) && remoteTime <= acceptedTime) {
          setStatus('☁ 家庭数据已同步', 'ok');
          return;
        }
        lastRemoteUpdatedAt = remote.updated_at || '';
        replaceState(remote.state);
        setStatus(firstLoad ? '☁ 已载入家庭数据' : '☁ 家庭数据已同步', 'ok');
      }
    } catch (error) {
      setStatus('☁ 当前离线，数据保存在本机', 'warn');
      console.warn('家庭同步读取失败', error);
    }
  }
  function applyRoleFromLink() {
    const role = new URLSearchParams(location.search).get('role');
    const target = { child: '孩子', dad: '爸爸', mom: '妈妈' }[role];
    // 正式版已移除测试身份选择器；改由增强层的正式角色 API 切换权限和页面。
    if (window.setOfficialRole) window.setOfficialRole(target || '孩子');
  }
  // 爸爸修复面板可主动触发一次立刻保存；不等待常规同步周期。
  window.littleStarSyncNow = () => {
    const snapshot = readLocal();
    queueSave(snapshot, 0);
    setStatus('☁ 正在立即保存…');
  };
  window.addEventListener('pagehide', () => {
    const snapshot = readLocal();
    if (snapshot && Object.keys(snapshot).length) { writePending(snapshot); queueSave(snapshot, 0); }
  });
  // iPad 经常先触发 hidden，随后才 pagehide；在这个更早的时机开始同步，提高刷新前送达率。
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'hidden') return;
    const snapshot = readLocal();
    if (snapshot && Object.keys(snapshot).length) { writePending(snapshot); queueSave(snapshot, 0); }
  });
  pull(true).then(applyRoleFromLink);
  // 家庭端轮询：20 秒一次，兼顾多设备同步与手机流量、性能。
  window.setInterval(() => { if (!saving && !queuedState) pull(false); }, 20000);
})();
