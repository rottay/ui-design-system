import { BrandTheme, serializeFlatTheme } from './barrel';
import * as UI from './barrel';

export const flat: BrandTheme = UI.BrandTheme;
export const text = serializeFlatTheme(flat);
