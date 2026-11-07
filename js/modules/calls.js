import { makeModule } from './practice.js';
const m = makeModule({ type: 'call', title: 'Calls', sub: 'Vishing practice. Answer, listen, decide.', emptyText: 'Pick a call to answer. Each one branches based on what you say.' });
export const render = m.render; export const onSearch = m.onSearch;
