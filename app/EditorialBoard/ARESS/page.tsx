"use client";

import FooterSection from '@/components/Home/FooterSection' // Assuming FooterSection component path
import NavigationPage from '@/components/Home/Navigation_SubJournals_ACIET' // Assuming NavigationPage component path
import ProfileCard from '@/components/Home/ProfileCard'
import { useEffect, useState } from 'react'; // Added these

const page = () => {
  // 1. Create a dynamic version state
  const [version, setVersion] = useState("v1");

  useEffect(() => {
    // 2. Set version to current timestamp on load to bypass all caches
    setVersion(`v=${Date.now()}`);
  }, []);

  const Editorial_members =[
  {
    "Id": "Lurnexa_2562b32",
    "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2562b32.jpg",
    "Name": "Dr. Badri Narayanan Gopalakrishnan",
    "Board": "ARESS",
    "Role": "Sub Division-Editor in Chief",
    "Department": "Department of Economics",
    "Designation/College Name": "Fellow, NITI Aayog, Government of India / Boston College",
    "linkedinUrl": "https://www.linkedin.com/in/badrinarayanang/",
    "collegeUrl": "https://www.bc.edu/bc-web/schools/wcas/about/faculty-research/faculty-directory-folder/badri-narayanan-gopalakrishnan.html",
    "email":"gopalakb@bc.edu"
  },
  {
    "Id": "Lurnexa_2562a33",
    "image":"https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2562a33.jpg",
    "Name": "Dr. Aruna Kumar Dash",
    "Board": "ARESS",
    "Role": "Deputy Editor in Chief",
    "Department": "Department of Economics",
    "Designation/College Name": "Associate Professor / IBS Hyderabad",
    "linkedinUrl": "https://www.linkedin.com/in/aruna-dash-62a74a19/",
    "collegeUrl": "https://www.ifheindia.org/icfai-school-of-social-sciences/Facultyprofiles/Economics/Aruna-Kumar-Dash.pdf",
    "email":"akdash@ibsindia.org "
  },
  {
    "Id": "Lurnexa_2562s34",
    "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2562s34.jpg",
    "Name": "Dr. Sumeet Gupta",
    "Board": "ARESS",
    "Role": "Sr Associate Editor",
    "Department": "Department of Decision Sciences",
    "Designation/College Name": "Professor and Associate Dean - IQAC at UPES",
    "linkedinUrl": "https://www.linkedin.com/search/results/all/?keywords=Dr.Sumeet%20Gupta&origin=GLOBAL_SEARCH_HEADER&sid=-dZ",
    "collegeUrl": "https://www.upes.ac.in/faculty/school-of-business/prof-dr-sumeet-gupta",
    "email":"sumeetbgh2007@gmail.com"
  },
  {
    "Id": "Lurnexa_2562k35",
    "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2562k35.jpg",
    "Name": "Dr. Krishna Raj",
    "Board": "ARESS",
    "Role": "Associate Editor",
    "Department": "Centre for Economic Studies and Policy",
    "Designation/College Name": "Professor and Head, Centre for Economic Studies and Policy (CESP)",
    "linkedinUrl": "https://www.linkedin.com/in/krishna-raj-71098823/",
    "collegeUrl": "https://www.isec.ac.in/krishna-raj/",
    "email":"krishnarajisec@yahoo.co.uk"
  },
  {
    "Id": "Lurnexa_2562m36",
    "image":"https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2562m36.jpg",
    "Name": "Dr. Minaketan Behera",
    "Board": "ARESS",
    "Role": "Managing Editor",
    "Department": "Center for Economic Studies and Planning",
    "Designation/College Name": "Professor / Jawaharlal Nehru University",
    "linkedinUrl": "",
    "collegeUrl": "https://www.jnu.ac.in/content/minaketan",
    "email":"behera.minaketan@gmail.com"
  },

  {
    "Id": "Lurnexa_2562d37",
    "image":"https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2562d37.jpg",
    "Name": "Dr. Debi Prasad Bal",
    "Board": "ARESS",
    "Role": "Associate Managing Editor",
    "Department": "Department of Economics",
    "Designation/College Name": "Associate Professor / XLRI Jamshedpur",
    "linkedinUrl": "https://www.linkedin.com/in/debi-prasad-bal-4386136a/",
    "collegeUrl": "https://xlri.ac.in/about/full-time-faculty/debi-prasad",
    "email":" debiprasad@xlri.ac.in"
  },
  {
    "Id": "Lurnexa_2562p38",
    "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2562p38.jpg",
    "Name": "Dr. Pravin Jadhav",
    "Board": "ARESS",
    "Role": "Sr Review Editor",
    "Department": "Department of Humanities and Social Sciences",
    "Designation/College Name": "Associate Professor and HoD / Institute of Infrastructure Technology Research and Management (IITRAM), Ahmedabad",
    "linkedinUrl": "https://www.linkedin.com/in/pravin-jadhav-16314322/",
    "collegeUrl": "https://iitram.ac.in/empdetail/2015152",
    "email":" pravinqed@gmail.com"
  },
    {
   "Id": "Lurnexa_2562s39",
    "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2562s39.png",
    "Name": "Dr. Subhash Chandra ",
    "Board": "ARESS",
    "Role": "Review Editor",
    "Department": "School of Social Work",
    "Designation/College Name": "Assistant Professor/Tata Institute of Social Sciences",
    "linkedinUrl": "https://www.linkedin.com/in/dr-subhash-chandra-09274565/?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    "collegeUrl": "https://tiss.ac.in/view/9/employee/subhash-chandra/",
    "email":"subhchandraa@gmail.com"
  },
  {
    "Id": "Lurnexa_2562g41",
    "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2562g41.jpg",
    "Name": "Prof. P. Guru Prasad",
    "Board": "ARESS",
    "Role": "Editorial Executive",
    "Department": "Department of Management Studies",
    "Designation/College Name": "Assistant Professor / VVIT University",
    "linkedinUrl": "https://www.linkedin.com/in/puttu-guru-prasad-569014136/",
    "collegeUrl": "https://www.vvitguntur.com/pgp-profile",
    "email":"guruprasad.puttu.viva@gmail.com"
  }
]


  return (
    <>
    
   <section className="py-20 px-6 bg-linear-to-b from-neutral-50 to-white border-b border-gray-300">
  <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 items-start">
    <NavigationPage />

    <div className=" flex-1 text-start lg:text-left space-y-2">
      {/* Centered title */}
      <div className="w-full flex justify-center">
        <span className="text-2xl font-bold text-center">
          Editorial Message - ARESS
        </span>
      </div>

      <br />

      <p className="text-lg text-gray-700 leading-relaxed">
       The ARESS section is committed to publishing high-quality research that deepens the understanding of economic systems and social development. As societies face complex issues—ranging from inequality and policy reform to global economic shifts—we aim to provide a platform that encourages evidence-based, interdisciplinary inquiry.
We welcome studies that offer clear insights, inform public policy, and contribute to societal progress. Our objective is to strengthen academic dialogue in economics and social sciences while promoting research that has a meaningful impact on communities and governance.
      </p>
    </div>
  </div>
</section>

  <section className="py-10 px-6 ">
   <div className=" flex-1 text-start lg:text-left space-y-2">
      {/* Centered title */}
      <div className="w-full flex justify-center">
        <span className="text-2xl font-bold text-center">
          Editorial Board Members (ARESS)
        </span>
      </div>
</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">

      {Editorial_members.map((member)=>(
        <ProfileCard
          id={member.Id ?? member.Id}
          key ={member.Id ?? member.Id}
           image={member.image ? `${member.image}?${version}` : ''}
          name={member.Name}
          role={member.Role}
          Desgination={member['Designation/College Name']}
         college={member['Designation/College Name']}
          linkedinUrl={member.linkedinUrl}
           collegeUrl={member.collegeUrl}
             mail={member.email}
             department={member.Department}
        />

      ))}
      </div>
    </section>
 
    <FooterSection />
    </>
  )
}

export default page