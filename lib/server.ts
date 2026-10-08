import {cache} from 'react';
import { getDb } from '@/db';
import { settings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { products, type Product } from './catalog';
import { hasAdminSession } from './admin-auth';
export async function getSetting<T>(key:string,fallback:T):Promise<T>{try{const r=await (await getDb()).select().from(settings).where(eq(settings.key,key)).get();return r?JSON.parse(r.value):fallback;}catch{return fallback;}}
export const getProducts=cache(async():Promise<Product[]>=>getSetting('catalog',products));
export async function isAdmin(){return hasAdminSession();}
