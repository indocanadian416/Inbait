import { makeModule } from './practice.js';
const m = makeModule({ type: 'text', title: 'Texts', sub: 'Smishing practice on a phone.', emptyText: 'Pick a message thread.' });
export const render = m.render; export const onSearch = m.onSearch;
