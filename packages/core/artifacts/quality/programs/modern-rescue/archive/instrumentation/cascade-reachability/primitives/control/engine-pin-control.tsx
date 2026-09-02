import ModernThing from '../Other/engines/modern';
export const A = () => <Widget engine="modern" />;
export const B = () => <Widget defaultEngine={'rustic'} />;
export const C = () => <Widget engine={someVar} />;   // dynamic: must NOT be flagged
export const D = () => <ModernThing />;
declare const Widget: any; declare const someVar: any;
