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
  let queuedBase = null;
  let saveTimer = null;
  let lastRemoteUpdatedAt = '';
  // `baselineState` 是本设备上一次确认过的家庭版本。保存时只提交相对它发生的
  // 变化，而不是用某一台设备的整份旧快照覆盖全家数据。
  let baselineState = null;
  let initialLoadComplete = false;
  const petBalanceResetVersion = 1;
  const applyPetBalanceReset = state => {
    if (!state || typeof state !== 'object' || Number(state.petBalanceResetVersion || 0) >= petBalanceResetVersion) return false;
    state.materialBalance = 0;
    state.petCoupons = 1;
    state.petBalanceResetVersion = petBalanceResetVersion;
    return true;
  };
  const petAssetResetVersion = 1;
  const applyPetAssetReset = state => {
    if (!state || typeof state !== 'object' || Number(state.petAssetResetVersion || 0) >= petAssetResetVersion) return false;
    state.adopted = [0];
    state.pet = 0;
    state.petAssetResetVersion = petAssetResetVersion;
    return true;
  };

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
  // v2 未确认快照同时保存“操作前版本”。旧版只保存了整份状态，已经无法判断它究竟
  // 是新操作还是过期缓存；为了不让旧缓存覆盖爸爸刚撤回的记录，旧格式只作本机提示，
  // 不再自动写回云端。
  const readPending = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(pendingKey) || 'null');
      if (!raw) return null;
      return raw.version === 2 && raw.state && typeof raw.state === 'object'
        ? raw
        : { version: 1, state: raw, base: null, legacy: true };
    } catch { return null; }
  };
  const writePending = state => {
    try { nativeSetItem(pendingKey, JSON.stringify({ version: 2, state, base: copy(baselineState), time: Date.now() })); } catch { /* 本机空间不足时仍继续尝试同步 */ }
  };
  const clearPendingIfCurrent = state => { try { if (same(readPending()?.state, state)) localStorage.removeItem(pendingKey); } catch { /* ignore */ } };
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const copy = value => {
    try { return JSON.parse(JSON.stringify(value)); } catch { return value; }
  };
  const ignoredLocalFields = new Set(['day', 'weekIndex', 'calendarOffset']);
  const deltaFields = new Set(['feedUsed', 'materialBalance', 'extra', 'cashAdjust', 'redeemed', 'petCoupons']);
  const logFields = new Set(['adjustments', 'cashLedger', 'favorites']);
  const valueKey = value => {
    if (!value || typeof value !== 'object') return String(value);
    return [value.id || '', value.actor || '', value.time || '', value.reason || '', value.n ?? ''].join('|') || JSON.stringify(value);
  };
  const mergeLog = (remote = [], local = []) => {
    const seen = new Set();
    return [...remote, ...local].filter(item => {
      const key = valueKey(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 100);
  };
  // 合并规则：没有在本机变动过的字段，始终保留云端新值；本机刚变动的字段才写回。
  // `done[周几]`、任务勾选、历史周数据均按格/按字段合并，因此爸爸打开网页不会把
  // 孩子刚完成的其它日期清空。喂养/加分等累计数值则合并增量，避免两端操作互相吃掉。
  const mergeChangedState = (remote, local, base, path = '') => {
    if (same(local, base)) return copy(remote);
    if (ignoredLocalFields.has(path)) return copy(remote === undefined ? local : remote);
    const leaf = path.split('.').pop();
    if (typeof local === 'number' && typeof base === 'number' && deltaFields.has(leaf)) {
      const remoteNumber = Number(remote);
      const mergedNumber = (Number.isFinite(remoteNumber) ? remoteNumber : 0) + (local - base);
      // 只有余额类字段不能小于 0；家长加减分和现金调整允许为负数。
      return ['feedUsed', 'materialBalance', 'redeemed', 'petCoupons'].includes(leaf)
        ? Math.max(0, mergedNumber)
        : mergedNumber;
    }
    if (Array.isArray(local)) {
      if (logFields.has(leaf)) return mergeLog(Array.isArray(remote) ? remote : [], local);
      if (leaf === 'adopted') return [...new Set([...(Array.isArray(remote) ? remote : []), ...local])];
      const remoteArray = Array.isArray(remote) ? remote : [];
      const baseArray = Array.isArray(base) ? base : [];
      const length = Math.max(local.length, remoteArray.length, baseArray.length);
      const merged = [];
      for (let index = 0; index < length; index++) {
        const nextPath = path ? `${path}.${index}` : String(index);
        const localValue = local[index];
        const remoteValue = remoteArray[index];
        const baseValue = baseArray[index];
        if (localValue === undefined && baseValue === undefined) { if (remoteValue !== undefined) merged[index] = copy(remoteValue); }
        else merged[index] = mergeChangedState(remoteValue, localValue, baseValue, nextPath);
      }
      return merged;
    }
    if (local && typeof local === 'object') {
      const remoteObject = remote && typeof remote === 'object' ? remote : {};
      const baseObject = base && typeof base === 'object' ? base : {};
      const merged = {};
      new Set([...Object.keys(remoteObject), ...Object.keys(local), ...Object.keys(baseObject)]).forEach(key => {
        const nextPath = path ? `${path}.${key}` : key;
        if (Object.prototype.hasOwnProperty.call(local, key)) merged[key] = mergeChangedState(remoteObject[key], local[key], baseObject[key], nextPath);
        else if (Object.prototype.hasOwnProperty.call(remoteObject, key)) merged[key] = copy(remoteObject[key]);
      });
      return merged;
    }
    return copy(local);
  };

  const nativeSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = (key, value) => {
    nativeSetItem(key, value);
    if (key !== stateKey || applyingRemote) return;
    // 分数调整后会立即开始保存；即使用户紧接着刷新，keepalive 请求也会继续完成。
    try {
      const snapshot = JSON.parse(value);
      writePending(snapshot);
      // 首次读取家庭状态还没完成时，只暂存用户刚做的操作；读取完成后会和云端合并，
      // 而不是把本机可能遗留的旧数据直接推上去。
      if (initialLoadComplete) queueSave(snapshot, 0);
    } catch { /* ignore invalid legacy cache */ }
  };

  async function push(state, stateBase = baselineState) {
    if (saving) { queuedState = state; return; }
    saving = true;
    setStatus('☁ 正在保存…');
    try {
      // 写入前再取一次最新云端状态。这一步是三台设备能安全同时操作的关键。
      const latestResponse = await fetch(`${endpoint}?id=eq.${encodeURIComponent(familyId)}&select=state,updated_at`, { headers });
      if (!latestResponse.ok) throw new Error(`读取最新家庭数据失败 HTTP ${latestResponse.status}`);
      const latestRows = await latestResponse.json();
      const latest = latestRows[0] || { state: {} };
      const merged = mergeChangedState(latest.state || {}, state, stateBase || latest.state || {});
      const response = await fetch(`${endpoint}?id=eq.${encodeURIComponent(familyId)}`, {
        method: 'PATCH', headers: { ...headers, Prefer: 'return=representation' }, keepalive: true,
        body: JSON.stringify({ state: merged, updated_at: new Date().toISOString() })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const rows = await response.json();
      lastRemoteUpdatedAt = rows[0]?.updated_at || lastRemoteUpdatedAt;
      baselineState = copy(rows[0]?.state || merged);
      // 本机也立刻使用合并后的版本，确保爸爸/妈妈页面能看见孩子刚完成的内容。
      if (!same(readLocal(), baselineState)) {
        applyingRemote = true;
        try {
          Object.keys(s).forEach(key => delete s[key]);
          Object.assign(s, baselineState);
          window.littleStarNormalizeState?.();
          window.syncRealDate?.();
          nativeSetItem(stateKey, JSON.stringify(s));
          render();
        } finally { applyingRemote = false; }
      }
      clearPendingIfCurrent(state);
      setStatus('☁ 家庭数据已同步', 'ok');
    } catch (error) {
      setStatus('☁ 暂存本机，等待网络恢复', 'warn');
      console.warn('家庭同步暂不可用', error);
    } finally {
      saving = false;
      if (queuedState) { const next = queuedState, nextBase = queuedBase; queuedState = null; queuedBase = null; queueSave(next, 0, nextBase); }
    }
  }
  function queueSave(state, delay = 0, stateBase = baselineState) {
    // 保存一个快照，防止后续页面渲染继续改写同一对象时污染本次请求。
    try { queuedState = JSON.parse(JSON.stringify(state)); } catch { queuedState = state; }
    queuedBase = copy(stateBase);
    clearTimeout(saveTimer);
    if (delay <= 0) { const next = queuedState, nextBase = queuedBase; queuedState = null; queuedBase = null; void push(next, nextBase); return; }
    saveTimer = setTimeout(() => { const next = queuedState, nextBase = queuedBase; queuedState = null; queuedBase = null; push(next, nextBase); }, delay);
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
      baselineState = copy(s);
    } finally { applyingRemote = false; }
  }
  async function pull(firstLoad = false) {
    try {
      // 只要本机还有一份未获确认的操作，绝不让旧云端快照覆盖它。
      // 这正是 iPad 打卡后立刻刷新会“消失”的根因。
      const pending = readPending();
      if (pending?.legacy) {
        localStorage.removeItem(pendingKey);
        setStatus('☁ 已跳过旧缓存，正在载入家庭数据', 'warn');
      } else if (pending?.state && typeof pending.state === 'object') {
        setStatus('☁ 正在恢复刚才的打卡…');
        initialLoadComplete = true;
        queueSave(pending.state, 0, pending.base);
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
        baselineState = copy(data[0]?.state || initial);
        setStatus('☁ 已建立家庭同步', 'ok');
      } else {
        const remote = rows[0];
        // 请求开始后，用户也可能刚完成喂养/打卡；再次检查，不能应用这份旧响应。
        const pendingAfterRequest = readPending();
        if (pendingAfterRequest?.state && !pendingAfterRequest.legacy) {
          setStatus('☁ 正在保存刚才的操作…');
          queueSave(pendingAfterRequest.state, 0, pendingAfterRequest.base);
          return;
        }
        const beforePetAssetReset = copy(remote.state || {});
        if (applyPetAssetReset(remote.state)) {
          replaceState(remote.state);
          initialLoadComplete = true;
          queueSave(remote.state, 0, beforePetAssetReset);
          setStatus('☁ 已仅保留云纹焰兽', 'ok');
          return;
        }
        const beforePetBalanceReset = copy(remote.state || {});
        if (applyPetBalanceReset(remote.state)) {
          replaceState(remote.state);
          initialLoadComplete = true;
          queueSave(remote.state, 0, beforePetBalanceReset);
          setStatus('☁ 宠物材料已清零，宠物券保留 1 张', 'ok');
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
      initialLoadComplete = true;
      const pendingAfterLoad = readPending();
      if (pendingAfterLoad?.state && !pendingAfterLoad.legacy) queueSave(pendingAfterLoad.state, 0, pendingAfterLoad.base);
    } catch (error) {
      initialLoadComplete = true;
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
