import {isAdmin} from '@/lib/server';
import {adminConfigured} from '@/lib/admin-auth';
import {Admin} from '@/components/rmd/Admin';
export const dynamic='force-dynamic';
export const metadata={title:'Administration',robots:{index:false,follow:false}};
const errors:Record<string,string>={invalid:'That password is not correct.',origin:'Please sign in from this website.'};
export default async function AdminPage({searchParams}:{searchParams:Promise<{error?:string}>}){
if(await isAdmin())return <Admin/>;
const {error}=await searchParams;
if(!adminConfigured())return <section className="admin-shell"><h1>Administration is not set up.</h1><p>Add an <code>ADMIN_PASSWORD</code> environment variable to your deployment, then redeploy.</p></section>;
return <section className="admin-shell"><h1>Administrator sign in</h1><form action="/api/admin/login" method="post" style={{display:'grid',gap:16,maxWidth:360,marginTop:24}}><label style={{display:'grid',gap:8}}>Password<input type="password" name="password" required autoComplete="current-password" style={{padding:'12px 14px',border:'1px solid var(--line)',borderRadius:7,background:'var(--paper)'}}/></label>{error&&errors[error]&&<p role="alert">{errors[error]}</p>}<button className="button" type="submit">Sign in</button></form></section>}
