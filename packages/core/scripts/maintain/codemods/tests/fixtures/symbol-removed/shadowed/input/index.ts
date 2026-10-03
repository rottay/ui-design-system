import { BrandTheme, serializeBrandTheme } from './barrel';
import * as UI from './barrel';

export const flat: BrandTheme = UI.BrandTheme;
export const text = serializeBrandTheme(flat);
