import {siteOrigin,companyPages,articles} from '@/lib/catalog';
import {getProducts} from '@/lib/server';
export const dynamic='force-dynamic';
export async function GET(){const products=await getProducts();const urls=['/','/hosting',...Object.keys(companyPages).map(s=>`/${s}`),...products.map(p=>`/hosting/${p.slug}`),...products.flatMap(p=>p.plans.map(pl=>`/products/${pl.id}`)),...articles.map(a=>`/journal/${a.slug}`)];return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(path=>`<url><loc>${siteOrigin}${path}</loc></url>`).join('')+'</urlset>',{headers:{'Content-Type':'application/xml','Cache-Control':'public, max-age=300'}})}
