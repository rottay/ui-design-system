/* Positive control for the call-site census. Only the three COMPONENT JSX
   attributes are call sites; the other five shapes are the traps a text scan
   for `data-part` counts and an AST does not. */
const SELECTOR = ".rottay-input[data-part='root']";        // trap: a selector string
const note = 'pass data-part to override the anatomy';      // trap: prose
export const A = () => <Badge data-part="count-badge" />;   // COUNT
export const B = () => <Badge data-part={'wip-badge'} />;   // COUNT (braced literal)
export const C = () => <Badge data-part={dynamic} />;       // COUNT, flagged dynamic
export const D = () => <span data-part="root" />;           // trap: host element, not a call
export const E = () => <Badge aria-describedby="data-part" />; // trap: the string in another attr
declare const Badge: any; declare const dynamic: string;

// --- import resolution: the tag name is not the component identity ---------
import Link from 'next/link';                     // trap: a foreign default import
import { Tag } from '../../../primitives/display/Tag';
export const F = () => <Link data-part="brand" />;  // COUNT, but module=next/link
export const G = () => <Tag data-part="chip" />;    // COUNT, module=ours
