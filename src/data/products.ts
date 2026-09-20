import { Product, BalcaoRetirada, Category, Coupon, SiteInfo, CatalogData } from '../types';
import rawCatalog from './catalog.json';

export const CATALOG: CatalogData = rawCatalog as unknown as CatalogData;

export const SITE_INFO: SiteInfo = CATALOG.siteInfo;
export const CATEGORIES: Category[] = CATALOG.categories;
export const PRODUCTS: Product[] = CATALOG.products;
export const BALCOES_RETIRADA: BalcaoRetirada[] = CATALOG.pickupPoints;
export const COUPONS: Coupon[] = CATALOG.coupons;

export default CATALOG;
