import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

export function LeadershipSection() {
  const testimonials = [
    {
      quote:
        `Lurnexa Publications was founded with a commitment to create knowledge that empowers, enlightens, and encourages inquiry. What began as a publishing vision has grown into a platform dedicated to promoting research-oriented learning and nurturing a culture of critical thinking.

We believe education should spark curiosity, inspire questions, and guide learners toward deeper understanding. Every book, journal, and academic resource we publish reflects this belief—built on analytical insight, evidence-based content, and real-world relevance.

Our strength lies in collaboration. We work closely with educators, researchers, and subject experts to ensure our publications meet rigorous academic standards and address evolving academic needs. Through these partnerships, we aim to stimulate intellectual growth and support independent, research-driven learning.

At Lurnexa, we value people as much as purpose. We support our authors with transparency and care, and we provide our readers and institutional partners with resources they can rely on for thoughtful, future-ready learning.

As we move forward, our mission remains clear: to contribute meaningfully to the world of knowledge, champion research-based education, and inspire transformative thinking.

Thank you for being part of the Lurnexa journey. Together, let us build a future where curiosity leads progress and education becomes a tool for lifelong discovery.
.
      `,
      name: "Narendra Kumar Kurakula",
      designation: "Founder & Director — Lurnexa Publications",
      src: "/founder.jpeg",

    },
    {
      quote:
        `At Lurnexa Publications, the guiding vision that shaped our beginning continues to lead every step we take. While our foundation is built on promoting inquiry, deep understanding, and research-driven learning, our focus now is on accelerating this mission with energy, innovation, and purposeful action.

Research-oriented learning is not just an academic approach—it is the most powerful tool for shaping independent thinkers. 
In a world evolving faster than ever, learners must be equipped not just to study ideas, but to explore them, question them, and build upon them. This is the spirit we are committed to strengthening across all our publishing initiatives.

We are expanding collaborations with experts, enhancing the quality of our academic resources, and creating platforms that encourage creativity, evidence-based writing, and meaningful contribution. Our goal is simple yet impactful: to make Lurnexa a trusted space where authors feel valued, researchers feel supported, and learners feel inspired.

As we move forward, we remain dedicated to transforming knowledge into impact—ensuring that every publication we deliver brings clarity, curiosity, and confidence to the academic community.

Together, we are not just upholding a vision.
We are driving it forward`,
      name: "Rushik Burla",
      designation: "Chief Executive Officer — Lurnexa Publications",
      src: "/ceo.jpg",

    },
  ];
  return <AnimatedTestimonials testimonials={testimonials} autoplay={true} />;
}
