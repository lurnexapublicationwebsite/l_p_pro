 import { ReactLenis } from '@studio-freight/react-lenis';
 import { useTransform, motion, useScroll, MotionValue } from 'motion/react';
 import { useRef } from 'react';
 import Image from 'next/image';
 
 const projects = [
   {
     title: 'Mission 1',
     description:
       'Connect technologists, managers, and researchers on a dynamic publishing platform.',
     src: 'mission1.jpg',
     link: 'https://images.unsplash.com/photo-1522199710521-72d69614c702?w=900&auto=format&fit=crop&q=80',
     color: '#4f46e5',
   },
   {
     title: 'Mission 2',
     description:
       'Uphold academic integrity and technical accuracy through strong peer-review.',
     src: 'mission2.jpg',
     link: 'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=900&auto=format&fit=crop&q=80',
     color: '#2563eb',
   },
   {
     title: 'Mission 3',
     description:
       'Promote multidisciplinary collaboration across technology, management, and innovation.',
     src: 'mission3.jpg',
     link: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&auto=format&fit=crop&q=80',
     color: '#0ea5e9',
   },
   {
     title: 'Mission 4',
     description:
       'Leverage digital tools and AI for faster, broader, and effective knowledge dissemination.',
     src: 'mission4.jpg',
     link: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=900&auto=format&fit=crop&q=80',
     color: '#06b6d4',
   },
 ];
 
 export default function index(): JSX.Element {
   const container = useRef(null);
   const { scrollYProgress } = useScroll({
     target: container,
     offset: ['start start', 'end end'],
   });
 
   return (
     <ReactLenis root>
       <main className="bg-white" ref={container}>
         <section className="w-full text-white flex flex-col md:flex-row items-start min-h-[80vh]">
           <div className="mx-auto flex flex-col md:flex-row max-w-6xl gap-10 px-6 py-16 w-full">
             
             {/* Vision Section */}
             {/* ✅ CHANGE: added justify-center to vertically align text */}
             <div className="relative md:w-1/2 w-full md:sticky md:top-0 md:h-screen flex justify-center items-center">
               {/* ✅ CHANGE: removed extra padding to align center perfectly */}
               <div className="relative space-y-4 py-0 md:py-0 text-left">
                 <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                   Our Vision
                 </h2>
                 <p className="2xl:text-4xl text-black text-2xl font-semibold tracking-tight leading-[130%]">
                   To be a globally recognized techno-management hub of knowledge and
                   innovation, bridging the gap between technology, research, management,
                   and publishing while fostering academic excellence, leadership, and
                   real-world impact.
                 </p>
               </div>
             </div>
 
             {/* Mission stack (scrollable right or below on mobile) */}
             <div className="md:w-1/2 w-full mt-10 md:mt-0">
               {projects.map((project, i) => {
                 const targetScale = 1 - (projects.length - i) * 0.05;
                 return (
                   <Card
                     key={`p_${i}`}
                     i={i}
                     url={project?.link}
                     src={project?.src}
                     title={project?.title}
                     color={project?.color}
                     description={project?.description}
                     progress={scrollYProgress}
                     range={[i * 0.25, 1]}
                     targetScale={targetScale}
                   />
                 );
               })}
             </div>
           </div>
         </section>
       </main>
     </ReactLenis>
   );
 }
 
 interface CardProps {
   i: number;
   title: string;
   description: string;
   src: string;
   url: string;
   color: string;
   progress: MotionValue<number>;
   range: [number, number];
   targetScale: number;
 }
 
 export const Card: React.FC<CardProps> = ({
   i,
   title,
   description,
   url,
   color,
   progress,
   range,
   targetScale,
 }) => {
   const container = useRef(null);
   const { scrollYProgress } = useScroll({
     target: container,
     offset: ['start end', 'start start'],
   });
 
   const imageScale = useTransform(scrollYProgress, [0, 1], [2, 1]);
   const scale = useTransform(progress, range, [1, targetScale]);
 
   return (
     <div
       ref={container}
       className="h-[70vh] md:h-[80vh] flex items-center justify-center sticky top-0 "
     >
       <motion.div
         style={{
           backgroundColor: color,
           scale,
           top: `calc(-5vh + ${i * 25}px)`,
         }}
         className="flex flex-col relative -top-[25%] h-[400px] md:h-[450px] w-full rounded-md lg:p-10 sm:p-4 p-2 origin-top bg-[#FFF0E6]"
       >
         <h2 className="text-2xl text-center font-semibold">{title}</h2>
         <div className="flex flex-col md:flex-row h-full mt-5 gap-6 md:gap-10">
           <div className="md:w-[40%] w-full relative md:top-[10%]">
             <p className="flex items-center text-xl">{description}</p>
        
           </div>
 
           <div className="relative md:w-[60%] w-full h-[200px] md:h-auto rounded-lg overflow-hidden bg-[#FFF0E6]" >
             <motion.div className="w-full h-full" style={{ scale: imageScale }}>
               <Image src={url} fill className="object-cover" alt="" />
             </motion.div>
           </div>
         </div>
       </motion.div>
     </div>
   );
 };