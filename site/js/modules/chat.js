import { makeModule } from './practice.js';
const m = makeModule({ type: 'chat', title: 'Chat', sub: 'ChatHub practice. Watch for the External badge.', emptyText: 'Pick a conversation. Look for who is really on the other end.' });
export const render = m.render; export const onSearch = m.onSearch;
