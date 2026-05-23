"use client";

import { useEffect, useState } from 'react'; // Added these
import FooterSection from '@/components/Home/FooterSection'
import NavigationPage from '@/components/Home/Navigation_SubJournals_IAEES' // Assuming NavigationPage component path
import ProfileCard from '@/components/Home/ProfileCard'

const Page = () => {
  // 1. Create a dynamic version state
  const [version, setVersion] = useState("v1");

  useEffect(() => {
    // 2. Set version to current timestamp on load to bypass all caches
    setVersion(`v=${Date.now()}`);
  }, []);

  const Editorial_members = [
    {
      Id: "Lurnexa_2553u42",
      "image": `https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2553u42.jpg`,
      "name": "Dr. Umesh Chandra Pati",
      "Board": "IAEES",
      "role": "Sub Division – Editor in Chief",
      "department": "Department of Electronics and Communication Engineering",
      "Designation/College Name": "Professor/National Institute of Technology Rourkela",
      "linkedinUrl": "https://www.linkedin.com/in/dr-umesh-c-pati-13034a20/",
      "collegeUrl": "https://www.nitrkl.ac.in/docs/Faculty/CV/1970695.pdf",
      "email": "ucpati@nitrkl.ac.in"
    },
    {
      Id: "Lurnexa_arvindsingh",
      "image": "/editorial-images/iaees/Screenshot (41).png",
      "name": "Dr. Arvind R. Singh",
      "Board": "IAEES",
      "role": "Deputy Editor in Chief",
      "department": "Electronics & Communication Engineering",
      "Designation/College Name": "Shi Yan Shi, Hubei, China",
      "linkedinUrl": "",
      "collegeUrl": "https://scholar.google.com/citations?user=QY5TAKcAAAAJ&hl=en&oi=sra",
      "email": "arvindsinghwce@gmail.com"
    },
    {
      Id: "Lurnexa_2553n43",
      "image": `https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2553n43.jpeg`,
      "name": "Dr. CH. Naga Sai Kalyan",
      "Board": "IAEES",
      "role": "Associate Editor",
      "department": "Department of Electrical and Electronics Engineering",
      "Designation/College Name": " M.Tech, Ph.D, Associate Professor/vvit Guntur",
      "linkedinUrl": "",
      "collegeUrl": "https://www.vvitguntur.com/chnsk-profile",
      "email": "kalyanchallapalli@gmail.com"
    },
    {
      Id: "Lurnexa_2553s45",
      "image": `https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2553s45.jpg`,
      "name": "Dr. D. Srilatha",
      "Board": "IAEES",
      "role": "Associate Editor ",
      "department": "Department of Electrical and Electronics Engineering",
      "Designation/College Name": "Professor/VVIT Guntur",
      "linkedinUrl": "https://www.linkedin.com/in/srilatha-dande-86a62937b/",
      "collegeUrl": "https://www.vvitguntur.com/drsrilatha-profile",
      "email": "srilatha.dande@gmail.com"
    },
    {
      Id: "Lurnexa_2553c47",
      "image": `https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2553c47.jpg`,
      "name": "Dr. Chandan Nayak",
      "Board": "IAEES",
      "role": "Associate Managing Editor",
      "department": "Department of Electronics and Communication Engineering",
      "Designation/College Name": "asst professor/ vit-ap",
      "linkedinUrl": "https://www.linkedin.com/in/dr-chandan-nayak-143447128?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      "collegeUrl": "https://share.google/EvGjVqhAixAA2uQdH",
      "email": "chandan.nayak@vitap.ac.in"
    },
    // {
    //   Id: "8", // Changed to string for consistency
    //   "image": `https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/qwertyuiop.jpg`,
    //   "name": "snvskomal",
    //   "role": "Review Editor",
    //   "Designation/College Name": "ongc",
    //   "linkedinUrl": "",
    //   "collegeUrl": ""
    // },
  ];

  return (
    <>
      <section className="py-20 px-6 bg-linear-to-b from-neutral-50 to-white border-b border-gray-300">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 items-start">
          <NavigationPage />
          <div className=" flex-1 text-start lg:text-left space-y-2">
            <div className="w-full flex justify-center">
              <span className="text-2xl font-bold text-center">
                Editorial Message - IAEES
              </span>
            </div>
            <br />
            <p className="text-lg text-gray-700 leading-relaxed">
              The IAEES section focuses on fostering innovation and excellence in electrical and electronics engineering. As engineering continues to evolve toward smarter, efficient, and sustainable solutions, we aim to support research that advances these frontiers.
              We encourage submissions that propose new technologies, improve existing systems, and integrate modern tools such as automation, IoT, and intelligent devices. Our commitment is to publish work that contributes to engineering progress, addresses global
              technological needs, and supports the development of next-generation systems for a better future.

            </p>
          </div>
        </div>
      </section>

      <section className="py-10 px-6 ">
        <div className="w-full flex justify-center mb-6">
          <span className="text-2xl font-bold text-center">
            Editorial Board Members (IAEES)
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {Editorial_members.map((member) => (
            <ProfileCard
              id={member.Id}
              key={member.Id}
              // 3. Apply the dynamic version here
              image={member.image ? `${member.image}?${version}` : ''}
              name={member.name}
              role={member.role}
              Desgination={member['Designation/College Name']}
              college={member['Designation/College Name']}
              linkedinUrl={member.linkedinUrl}
              collegeUrl={member.collegeUrl}
              mail={member.email}
              department={member.department}
            />
          ))}
        </div>
      </section>

      <FooterSection />
    </>
  )
}

export default Page;