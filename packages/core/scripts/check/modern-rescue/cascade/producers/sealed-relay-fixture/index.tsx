import { useDrill } from './fixtures/open';
import { useDrill as useClosedDrill } from './fixtures/closed';

export const A = ({ n, c }) => { const qRelay = useDrill(n, c); return <div style={qRelay.vars} />; };
export const B = ({ n, c }) => { const wOther$ = useDrill(n, c); return <div style={{ ...wOther$.vars }} />; };
export const E = ({ n, c }) => { const zzThird = useDrill(n, c); return <div style={{ ...zzThird.vars }} />; };
export const D = ({ n, c }) => { const shut = useClosedDrill(n, c); return <div style={shut.vars} />; };
export const G = ({ n, c }) => { const shutToo = useClosedDrill(n, c); return <div style={{ ...shutToo.vars }} />; };
