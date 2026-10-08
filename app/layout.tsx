import type { Metadata } from 'next';
import {Shell} from '@/components/rmd/Shell';
import {siteOrigin} from '@/lib/catalog';
import {getProducts} from '@/lib/server';
import './globals.css';
import './motion.css';
export const metadata:Metadata={metadataBase:new URL(siteOrigin),title:{default:'RMDHost — Hosting without borders',template:'%s | RMDHost'},description:'Find the right home for your big ideas. VPS, Windows, cloud, storage and dedicated hosting in the UK and beyond.',openGraph:{type:'website',siteName:'RMDHost',title:'RMDHost — Hosting without borders',description:'A better home for your big ideas.',images:[{url:'/og-image.png',width:1200,height:630}]},twitter:{card:'summary_large_image'},icons:{icon:'/favicon.svg'}};
export default async function Layout({children}:{children:React.ReactNode}){const navigation=(await getProducts()).map(p=>({name:p.name,slug:p.slug}));return <html lang="en-GB" suppressHydrationWarning><body><script dangerouslySetInnerHTML={{__html:`try{document.documentElement.dataset.theme=localStorage.getItem('rmd-theme')==='dark'?'dark':'light'}catch{}`}}/><Shell navigation={navigation}>{children}</Shell></body></html>}
