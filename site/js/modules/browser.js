import { makeModule } from './practice.js';
const m = makeModule({ type: 'browser', title: 'Browser', sub: 'Pop-ups, fake checks and sign-in tricks.', emptyText: 'Pick a page. Always read the address bar first.' });
export const render = m.render; export const onSearch = m.onSearch;
