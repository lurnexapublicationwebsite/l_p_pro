import { cn } from "@/lib/utils";
import React from "react";
import { BentoGrid, BentoGridItem } from "../ui/bento-grid";
import {
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
} from "@tabler/icons-react";

export function BentoGridSecondDemo() {
  return (
    <BentoGrid className=" mx-auto md:auto-rows-[20rem]">
      {items.map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          header={item.header}
          className={item.className}
          icon={item.icon}
        />
      ))}
    </BentoGrid>
  );
}
const Skeleton = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl   dark:bg-dot-white/[0.2] bg-dot-black/[0.2] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]  border border-transparent dark:border-white/[0.2] bg-neutral-100 dark:bg-black"></div>
);
const items = [
 {
  title: "Global Journal for Progressive Innovation and Research (GJPIR)",
  description: "Explore the diverse research and innovative studies published under GJPIR.",
  header: <Skeleton />,
  className: "md:col-span-2",
  icon: <IconClipboardCopy className="h-4 w-4 text-neutral-500" />,
},
{
  title: "Advances in Computer & Information Engineering Technology (ACIET)",
  description: "Dive into advanced studies and innovations in computing and information technologies.",
  header: <Skeleton />,
  className: "md:col-span-1",
  icon: <IconFileBroken className="h-4 w-4 text-neutral-500" />,
},
{
  title: "Center for Innovative Management Studies (CIMS)",
  description: "Discover pioneering research in management, leadership, and innovation strategies.",
  header: <Skeleton />,
  className: "md:col-span-1",
  icon: <IconSignature className="h-4 w-4 text-neutral-500" />,
},
{
  title: "Advanced Research in Economics & Social Sciences (ARESS)",
  description: "Engage with impactful research and insights in economics and social sciences.",
  header: <Skeleton />,
  className: "md:col-span-2",
  icon: <IconTableColumn className="h-4 w-4 text-neutral-500" />,
},
{
  title: "Institute of Advanced Electrical & Electronics Studies (IAEES)",
  description: "Explore advancements and applied research in electrical and electronics engineering.",
  header: <Skeleton />,
  className: "md:col-span-2",
  icon: <IconClipboardCopy className="h-4 w-4 text-neutral-500" />,
},

];
