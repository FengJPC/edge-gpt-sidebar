// Registration metadata survives local sign-out; credentials never enter this record.
export const NEW_ACCOUNT = '__new__';
function registration(value) {
  if (!value || typeof value.clientId !== 'string' || !value.clientId || value.clientId === 'dynamic_agent_client' || value.clientId === NEW_ACCOUNT || typeof value.subject !== 'string' || !value.subject) return null;
  return {clientId: value.clientId, subject: value.subject, email: typeof value.email === 'string' ? value.email : '', name: typeof value.name === 'string' ? value.name : ''};
}
export async function loadRegistrations(storage) {
  const saved = await storage.get(['credential', 'accountRegistrations']);
  const accounts = [];
  for (const value of saved.accountRegistrations?.accounts || []) {
    const item = registration(value);
    if (item && !accounts.some(a => a.clientId === item.clientId)) accounts.push(item);
  }
  const current = registration(saved.credential);
  if (current) {
    const index = accounts.findIndex(a => a.clientId === current.clientId);
    if (index >= 0) accounts[index] = current; else accounts.push(current);
  }
  const selected = current?.clientId || saved.accountRegistrations?.selected;
  const result = {version: 1, accounts, selected: accounts.some(a => a.clientId === selected) ? selected : accounts[0]?.clientId || ''};
  if (JSON.stringify(saved.accountRegistrations) !== JSON.stringify(result)) await storage.set({accountRegistrations: result});
  return result;
}
export async function rememberRegistration(storage, value) {
  const item = registration(value);
  if (!item) throw new Error('应用登记信息不完整。');
  const registry = await loadRegistrations(storage);
  const old = registry.accounts.find(a => a.clientId === item.clientId);
  if (old && old.subject !== item.subject) throw new Error('应用登记与账号身份不匹配。');
  registry.accounts = registry.accounts.filter(a => a.clientId !== item.clientId).concat(item);
  registry.selected = item.clientId;
  await storage.set({accountRegistrations: registry});
  return item;
}
export async function loginRegistration(storage, selected) {
  const registry = await loadRegistrations(storage);
  const {credential} = await storage.get('credential');
  const id = selected || registry.selected;
  if (credential && id && id !== credential.clientId) throw new Error('请先断开，再切换账号或工作区。');
  if (id === NEW_ACCOUNT || !id) return null;
  const item = registry.accounts.find(a => a.clientId === id);
  if (!item) throw new Error('所选应用登记不存在，请重新选择。');
  return item;
}
export async function disconnectRegistration(storage) {
  await loadRegistrations(storage); // Migrate old installations before deleting tokens.
  await storage.remove('credential');
}
