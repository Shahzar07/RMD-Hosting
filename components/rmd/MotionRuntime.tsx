'use client';

import {useEffect,useRef} from 'react';
import {usePathname} from 'next/navigation';
import type Lenis from 'lenis';

/** Owns one animation context and one RAF loop per route. Content is readable without it. */
export function MotionRuntime({paused}:{paused:boolean}){
 const pathname=usePathname();
 const scroll=useRef<Lenis|null>(null);
 const pauseState=useRef(paused);
 useEffect(()=>{pauseState.current=paused;if(paused)scroll.current?.stop();else scroll.current?.start();},[paused]);
 useEffect(()=>{
  if(pathname==='/admin')return;
  let cancelled=false;
  let dispose=()=>{};
  let emergencyCleanup=()=>{};
  let pending:MutationObserver|null=null;
  async function start(){
   if(cancelled||!window.matchMedia('(prefers-reduced-motion: no-preference)').matches)return;
   try{
    const [{gsap},{ScrollTrigger},{default:Lenis}]=await Promise.all([import('gsap'),import('gsap/ScrollTrigger'),import('lenis')]);
    if(cancelled)return;
    gsap.registerPlugin(ScrollTrigger);
    const main=document.getElementById('main');
    if(!main)return;
    const media=gsap.matchMedia();
    dispose=()=>media.revert();
    media.add({desktop:'(min-width: 761px) and (min-height: 700px)',mobile:'(max-width: 760px), (max-height: 699px)',motion:'(prefers-reduced-motion: no-preference)'},mediaContext=>{
     if(!mediaContext.conditions?.motion)return;
     const desktop=!!mediaContext.conditions.desktop;
     const lenis=new Lenis({lerp:.095,smoothWheel:true,syncTouch:false,anchors:{offset:-90},respectReducedMotion:true,prevent:node=>node.hasAttribute('data-lenis-prevent')||node.tagName==='TEXTAREA'});
     scroll.current=lenis;
     if(pauseState.current)lenis.stop();
     const tick=(time:number)=>lenis.raf(time*1000);
     lenis.on('scroll',ScrollTrigger.update);
     lenis.on('scroll',state=>document.documentElement.style.setProperty('--page-progress',String(state.progress)));
     gsap.ticker.add(tick);
     document.documentElement.classList.add('motion-ready');
     const cleanups:(()=>void)[]=[];
     let alive=true;
     emergencyCleanup=()=>{if(!alive)return;alive=false;cleanups.forEach(fn=>fn());gsap.ticker.remove(tick);lenis.destroy();scroll.current=null;document.documentElement.classList.remove('motion-ready');};
     const context=gsap.context(()=>{
      // First frame is complete server-rendered content; only enhanced elements animate.
      const hero=main.querySelector<HTMLElement>('.hero');
      if(hero){
       const delay=document.querySelector('.intro')?1.05:.05;
       gsap.fromTo(hero.querySelectorAll('.hero-foundation-caption,.hero-hosting-links>a'),{y:16,opacity:0},{y:0,opacity:1,stagger:.08,duration:.75,ease:'power3.out',delay:delay+.1});
       gsap.fromTo(hero.querySelectorAll('.hero-line'),{yPercent:110},{yPercent:0,stagger:.13,duration:1.1,ease:'power3.out',delay});
       gsap.fromTo(hero.querySelectorAll('.hero-eyebrow,.hero-description,.hero-bottom'),{y:24,opacity:0},{y:0,opacity:1,duration:.85,stagger:.1,ease:'power2.out',delay:delay+.3});
       gsap.fromTo(hero.querySelector('.hero-visual'),{clipPath:'inset(9% 6% 9% 6% round 30px)'},{clipPath:'inset(0% 0% 0% 0% round 20px)',duration:1.25,ease:'power3.out',delay});
       gsap.to(hero.querySelector('.laptop-stage'),{y:desktop?85:35,rotationZ:desktop?-3:0,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:.7}});
       gsap.to(hero.querySelector('.hero-main'),{y:desktop?-40:-16,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:.6}});
      }
      // Actual title, tag and copy choreography across every page.
      main.querySelectorAll<HTMLElement>('.section-heading,.contact-heading,.faq-heading,.page-hero>div:first-child,.page-hero:not(.split)').forEach(group=>{
       if(group.closest('.journey-stage,.services-stage'))return;
       const targets=Array.from(group.children).filter(el=>el.matches('.tag,h1,h2,p,.button'));
       if(targets.length)gsap.fromTo(targets,{y:32,opacity:0},{y:0,opacity:1,stagger:.1,duration:.9,ease:'power3.out',scrollTrigger:{trigger:group,start:'top 90%',toggleActions:'play none none reverse'}});
      });
      const statement=main.querySelector('.statement');
      if(statement){gsap.fromTo(statement.querySelector('h2'),{y:40,opacity:.2},{y:0,opacity:1,ease:'none',scrollTrigger:{trigger:statement,start:'top 88%',end:'center 55%',scrub:.55}});gsap.fromTo(statement.querySelector('.statement-highlight'),{scaleX:.6,opacity:.5},{scaleX:1,opacity:1,transformOrigin:'left center',scrollTrigger:{trigger:statement,start:'top 85%',end:'center 55%',scrub:.6}});}
      // Loading the preview in layers explains what each resource contributes.
      const comparison=main.querySelector('.comparison');
      if(comparison){
       let preview=gsap.fromTo(comparison.querySelectorAll('.preview-after [data-preview-part]'),{y:22,opacity:.16},{y:0,opacity:1,duration:.65,stagger:.16,ease:'power2.out',scrollTrigger:{trigger:comparison,start:'top 80%',toggleActions:'play none none reverse'}});
       const replay=()=>context.add(()=>{preview.scrollTrigger?.kill();preview.kill();preview=gsap.fromTo(comparison.querySelectorAll('.preview-after [data-preview-part]'),{y:22,opacity:.16},{y:0,opacity:1,duration:.65,stagger:.16,ease:'power2.out'});});
       comparison.addEventListener('rmd:preview-replay',replay);cleanups.push(()=>comparison.removeEventListener('rmd:preview-replay',replay));
       gsap.fromTo(comparison.querySelector('.preview-before'),{rotation:-3,y:20},{rotation:0,y:0,scrollTrigger:{trigger:comparison,start:'top 85%',end:'center 58%',scrub:.6}});
      }
      main.querySelectorAll<HTMLElement>('.marquee-track').forEach((track,i)=>{gsap.fromTo(track,{xPercent:i%2?-12:0},{xPercent:i%2?0:-12,ease:'none',scrollTrigger:{trigger:track.parentElement,start:'top bottom',end:'bottom top',scrub:.6}});});
      const serviceStage=main.querySelector<HTMLElement>('.services-stage');
      const serviceViewport=main.querySelector<HTMLElement>('.services-viewport');
      const serviceTrack=main.querySelector<HTMLElement>('.services-track');
      if(desktop&&serviceStage&&serviceViewport&&serviceTrack){
       const distance=()=>Math.max(0,serviceTrack.scrollWidth-serviceViewport.clientWidth);
       const tween=gsap.to(serviceTrack,{x:()=>-distance(),ease:'none',scrollTrigger:{trigger:serviceStage,pin:serviceStage,start:'top 90px',end:()=>`+=${Math.max(distance()*1.5,window.innerHeight*.8)}`,scrub:.65,anticipatePin:1,invalidateOnRefresh:true,onUpdate:self=>{serviceStage.style.setProperty('--rail-progress',String(self.progress));}}});
       const next=(event:Event)=>{const direction=(event as CustomEvent<number>).detail;const trigger=tween.scrollTrigger;if(trigger)lenis.scrollTo(trigger.start+(trigger.end-trigger.start)*Math.min(1,Math.max(0,trigger.progress+direction*.34)),{duration:.9});};
       const focus=(event:FocusEvent)=>{const card=(event.target as HTMLElement).closest<HTMLElement>('.service-panel');if(card&&tween.scrollTrigger){const index=Array.from(serviceTrack.children).indexOf(card);const amount=Math.min(1,(index*card.offsetWidth)/Math.max(1,distance()));lenis.scrollTo(tween.scrollTrigger.start+amount*(tween.scrollTrigger.end-tween.scrollTrigger.start),{duration:.6});}};
       serviceStage.addEventListener('rmd:service-step',next);serviceTrack.addEventListener('focusin',focus);
       cleanups.push(()=>{serviceStage.removeEventListener('rmd:service-step',next);serviceTrack.removeEventListener('focusin',focus);});
      }
      // Reference-like lifted fronts, kept independent of the card hover transforms.
      const stories=main.querySelector('.audience-cards');
      if(stories)gsap.fromTo(stories.querySelectorAll('.story-motion'),{y:45,rotation:i=>i%2?4:-4},{y:0,rotation:0,stagger:.15,duration:.9,ease:'power3.out',scrollTrigger:{trigger:stories,start:'top 82%',toggleActions:'play none none reverse'}});
      const journey=main.querySelector<HTMLElement>('.journey-stage');
      const journeyViewport=journey?.querySelector<HTMLElement>('.journey-viewport');
      if(journey&&journeyViewport){
       const process=journey.querySelector('.process-panel');const heading=journey.querySelector('.solutions-heading');const cards=journey.querySelectorAll<HTMLElement>('.solution-stack-card');
       if(desktop){
        gsap.set(heading,{opacity:0,scale:.58});gsap.set(cards,{autoAlpha:0,y:window.innerHeight*.75,rotation:14});
        const caption=journey.querySelector('.solution-sequence-caption');gsap.set(caption,{opacity:0});
        const timeline=gsap.timeline({defaults:{ease:'power2.inOut'},scrollTrigger:{trigger:journey,pin:journeyViewport,start:'top top',end:()=>`+=${window.innerHeight*2.2}`,scrub:.6,anticipatePin:1,invalidateOnRefresh:true,onUpdate:self=>{journey.style.setProperty('--journey-progress',String(self.progress));const phase=Math.min(cards.length,Math.max(1,Math.ceil((self.progress-.28)*cards.length/.65)));const counter=journey.querySelector('[data-solution-count]');const label=String(phase).padStart(2,'0');if(counter&&counter.textContent!==label)counter.textContent=label;}}});
        timeline.fromTo(journey.querySelectorAll('.process-card'),{y:26,opacity:.25},{y:0,opacity:1,stagger:.06,duration:.4},0)
         .to(process,{scale:.22,rotation:18,y:-65,opacity:0,duration:.65},.5)
         .to(heading,{opacity:1,scale:1,duration:.65,ease:'power3.out'},.85).to(caption,{opacity:1,duration:.4},1.2);
        cards.forEach((card,i)=>{const at=1.3+i*.48;timeline.to(card,{y:-i*12,rotation:i%2?6:-6,autoAlpha:1,duration:.48},at);if(i>0)timeline.to(Array.from(cards).slice(0,i),{y:j=>-55-(i-j)*15,scale:j=>1-(i-j)*.035,rotation:j=>j%2?3:-3,duration:.48},at);});
        timeline.to(cards,{y:()=>-window.innerHeight*.9,autoAlpha:0,stagger:.045,rotation:0,duration:.5},3.55).to(heading,{y:-15,duration:.4},3.6);
       }else{
        gsap.fromTo(journey.querySelectorAll('.process-card'),{y:24,opacity:.25},{y:0,opacity:1,stagger:.08,duration:.7,scrollTrigger:{trigger:process,start:'top 80%'}});
        cards.forEach((card,i)=>gsap.fromTo(card,{y:40,rotation:i%2?4:-4,opacity:.2},{y:0,rotation:0,opacity:1,duration:.8,ease:'power3.out',scrollTrigger:{trigger:card,start:'top 88%',toggleActions:'play none none reverse'}}));
       }
      }
      // Late-loaded routes and tab changes also receive reveals instead of being missed at mount.
      const seen=new WeakSet<Element>();
      const cardSelector='.plan-card,.catalog-card,.info-card,.article-card,.use-case-card,.faq-list details,.features-strip>div';
      const revealNewCards=()=>{
       main.querySelectorAll<HTMLElement>(cardSelector).forEach(el=>{
        if(seen.has(el))return;seen.add(el);const index=Array.from(el.parentElement?.children||[]).indexOf(el);
        gsap.fromTo(el,{y:28,opacity:0},{y:0,opacity:1,duration:.75,delay:Math.min(index*.065,.22),ease:'power3.out',scrollTrigger:{trigger:el,start:'top 93%',toggleActions:'play none none reverse'}});
       });
      };
      revealNewCards();
      let mutationFrame=0;
      const observer=new MutationObserver(records=>{const changed=records.some(record=>Array.from(record.addedNodes).some(node=>node instanceof Element&&(node.matches(cardSelector)||node.querySelector(cardSelector))));if(changed){context.add(revealNewCards);cancelAnimationFrame(mutationFrame);mutationFrame=requestAnimationFrame(()=>{if(alive)ScrollTrigger.refresh();});}});
      observer.observe(main,{childList:true,subtree:true});cleanups.push(()=>{observer.disconnect();cancelAnimationFrame(mutationFrame);});
      main.querySelectorAll('.request-form').forEach(form=>{gsap.fromTo(form,{y:35,opacity:.25},{y:0,opacity:1,duration:.9,ease:'power3.out',scrollTrigger:{trigger:form,start:'top 87%'}});gsap.fromTo(form.querySelectorAll('label'),{y:13,opacity:.3},{y:0,opacity:1,duration:.65,stagger:.07,scrollTrigger:{trigger:form,start:'top 80%'}});});
      const footer=main.querySelector<HTMLElement>('.grand-footer');
      if(footer){gsap.fromTo(footer,{y:55},{y:0,ease:'none',scrollTrigger:{trigger:footer,start:'top bottom',end:'top 35%',scrub:.7}});gsap.fromTo(footer.querySelector('.grand-word'),{y:70,scale:.94},{y:0,scale:1,ease:'none',scrollTrigger:{trigger:footer,start:'top 88%',end:'bottom bottom',scrub:.7}});const tokens=footer.querySelectorAll<HTMLElement>('.footer-token');gsap.fromTo(tokens,{x:(_,el)=>footer.clientWidth/2-el.offsetLeft-el.offsetWidth/2,y:-90,rotation:0,opacity:0},{x:0,y:0,rotation:i=>[-32,27,-18,45,-37,16,55,-24][i%8],opacity:1,stagger:.03,ease:'power2.out',scrollTrigger:{trigger:footer,start:'top 75%',end:'bottom 94%',scrub:1}});}
     },document.body);
     const refreshed=()=>{if(!alive||cancelled)return;lenis.resize();ScrollTrigger.refresh();};
     document.fonts?.ready.then(refreshed);
     window.addEventListener('load',refreshed,{once:true});
     let resizeFrame=0,previousWidth=main.offsetWidth,previousHeight=main.offsetHeight;
     const resize=new ResizeObserver(()=>{const width=main.offsetWidth,height=main.offsetHeight;if(width===previousWidth&&height===previousHeight)return;previousWidth=width;previousHeight=height;cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{refreshed();previousWidth=main.offsetWidth;previousHeight=main.offsetHeight;});});resize.observe(main);
     cleanups.push(()=>{resize.disconnect();cancelAnimationFrame(resizeFrame);window.removeEventListener('load',refreshed);});
     ScrollTrigger.refresh();
     return()=>{context.revert();emergencyCleanup();};
    });
   }catch{
    // Enhancement failure must never leave an invisible or locked page.
    dispose();emergencyCleanup();document.documentElement.classList.remove('motion-ready');scroll.current?.destroy();scroll.current=null;
   }
  }
  const ready=()=>pathname!=='/'||!!document.querySelector('[data-home-ready]');
  if(ready())void start();else{pending=new MutationObserver(()=>{if(ready()){pending?.disconnect();void start();}});pending.observe(document.getElementById('main')||document.body,{childList:true,subtree:true});}
  return()=>{cancelled=true;pending?.disconnect();dispose();};
 },[pathname]);
 return <div className="scroll-progress" aria-hidden="true"/>;
}
