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
    "Id": "Lurnexa_2538a01",
    "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2538a01.jpeg",
    "Name": "Dr. Anand Shukla",
    "Board": "ACIET",
    "Role": "Sub Division-Editor in Chief",
    "Department": "School of Computer Applications",
    "Designation/College Name": "Dean / Lovely Professional University",
    "linkedinUrl": "https://www.linkedin.com/in/dr-anand-shukla-59342838/",
    "collegeUrl": "https://www.lpu.in/faculty/staff-profile.php?EmpCode=32898",
     "email": "anand.shukla@lpu.co.in"
  },
  {
    "Id": "Lurnexa_2538c02",
    "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2538c02.jpg",
    "Name": "Dr. Chandrashekar Jatoth",
    "Board": "ACIET",
    "Role": "Deputy Editor in Chief",
    "Department": "Department of Information Technology",
    "Designation/College Name": "Assistant Professor / National Institute of Technology, Raipur",
    "linkedinUrl": "",
    "collegeUrl": "https://nitrr.ac.in/viewdetails.php?q=it.jchandrashekar",
    "email": "jchandrashekar.it@nitrr.ac.in"
  },
  {
    "Id": "Lurnexa_2538e03",
    "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2538e03.jpg",
    "Name": "Dr. Easwar Krishna Iyer",
    "Board": "ACIET",
    "Role": "Sr Associate Editor",
    "Department": "Department of Management Studies",
    "Designation/College Name": "Director / Indus Business Academy (IBA), Bengaluru",
    "linkedinUrl": "https://www.linkedin.com/in/dr-easwar-krishna-iyer/",
    "collegeUrl": "https://iba.ac.in/about-iba/director-message",
    "email":" easwar.pva@gmail.com"
  },
  {
    "Id": "Lurnexa_2538c04",
    "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2538c04.jpg",
    "Name": "Dr. Chinmaya Kumar Swain",
    "Board": "ACIET",
    "Role": "Associate Editor",
    "Department": "IT Systems & Analytics",
    "Designation/College Name": "Assistant Professor / IIM Jammu",
    "linkedinUrl": "https://www.linkedin.com/in/dr-chinmaya-kumar-swain-77b358128/",
    "collegeUrl": "https://iimj.ac.in/faculty-datae8d3.php?n=MTI0",
    "email":"chinmaya@iimj.ac.in"
  },
  {
    "Id": "Lurnexa_2538r05",
    "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2538r05.jpg",
    "Name": "Dr. Rishi Chopra",
    "Board": "ACIET",
    "Role": "Managing Editor",
    "Department": "School of Computer Applications",
    "Designation/College Name": "Associate Professor & Asst. Dean / Lovely Professional University",
    "linkedinUrl": "https://www.linkedin.com/in/dr-rishi-chopra-5b3260247/",
    "collegeUrl": "https://www.lpu.in/faculty/staff-profile.php?EmpCode=11111",
    "email":"rishi.chopra@lpu.co.in"
  },
  {
    "Id": "Lurnexa_2538t06",
    "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2538t06.jpg",
    "Name": "Dr. T.V. Rajini Kanth",
    "Board": "ACIET",
    "Role": "Associate Managing Editor",
    "Department": "Department of Computer Science and Engineering",
    "Designation/College Name": "Professor & Convener RDC / MGIT Hyderabad",
    "linkedinUrl": "https://www.linkedin.com/in/dr-rajini-kanth-t-v-22384724/",
    "collegeUrl": "https://mgit.ac.in/wp-content/uploads/2025/01/Dr.-TV-Rajini-Kanth.pdf",
    "email":"rajinitv@gmail.com"
  },
  {
    "Id": "Lurnexa_2538s07",
    "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2538s07.jpg",
    "Name": "Dr. Shaik Mahaboob Basha",
    "Board": "ACIET",
    "Role": "Sr Review Editor",
    "Department": "Department of Computer Science and Engineering",
    "Designation/College Name": "Professor & Head of Department (CSE) / Sree Dattha Institute of Engineering and Science, Hyderabad",
    "linkedinUrl": "https://www.linkedin.com/in/dr-mahaboob-4a086657/",
    "collegeUrl": "https://www.sreedattha.ac.in/sdes/departments/computer-science-engineering/about-cse-department/faculty-members",
    "email":"dr.mahaboob@gmail.com"
  },
  {
    "Id": "Lurnexa_2538u08",
    "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2538u08.jpg",
    "Name": "Dr. Uma Rani Vanamala",
    "Board": "ACIET",
    "Role": "Review Editor",
    "Department": "Department of Information Technology",
    "Designation/College Name": "Head of the Department, IT / Jawaharlal Nehru Technological University Hyderabad (JNTUH)",
    "linkedinUrl": "https://www.linkedin.com/in/dr-uma-rani-vanamala-87053620b/",
    "collegeUrl": "https://jntuhceh.ac.in/faculty_portal/uploads/resumes/uma_rani_profile.pdf",
    "email":"umarani@jntuh.ac.in"
  },
  {
    "Id": "Lurnexa_2538b09",
    "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2538b09.png",
    "Name": "Dr. Balaji Halavath",
    "Board": "ACIET",
    "Role": "Domain Editor",
    "Department": "Department of Computer Science and Engineering",
    "Designation/College Name": "Professor, CSE Department / Sreenidhi Institute of Science & Technology, Hyderabad",
    "linkedinUrl": "https://www.linkedin.com/in/balaji-halavath-065268297/",
    "collegeUrl": "https://sreenidhi.edu.in/departments-faculty/dr-halavath-balaji-ph-d/",
    "email":"balajimitk@gmail.com"
  },
  {
    "Id": "Lurnexa_2538k10",
    "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2538k10.png",
    "Name": "Dr. Kranthi Kumar Singamaneni",
    "Board": "ACIET",
    "Role": "Editorial Executive",
    "Department": "Department of Computer Science and Engineering",
    "Designation/College Name": "Associate Professor & In-Charge / Symbiosis Institute of Technology, Hyderabad",
    "linkedinUrl": "https://www.linkedin.com/in/dr-kranthi-kumar-singamaneni-smieee-761540168/",
    "collegeUrl": "https://sithyd.edu.in/faculty/dr-kranthi-kumar-singamaneni",
    "email":" kkranthicse@gmail.com"
  }
]

  return (
    <>
    
   <section className="py-20 px-6 bg-linear-to-b from-neutral-50 to-white border-b border-gray-300">
  <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 items-start">
    <NavigationPage />

    <div className=" flex-1 text-start lg:text-left space-y-2 ">
      {/* Centered title */}
      <div className="w-full flex justify-center">
        <span className="text-2xl font-bold text-center">
          Editorial Message - ACIET
        </span>
      </div>

      <br />

      <p className="text-lg text-gray-700 leading-relaxed">
        The ACIET section is dedicated to advancing research in artificial intelligence and cutting-edge computational technologies. As the world moves toward intelligent automation, our focus is to publish work that offers new methods, models, and solutions addressing real-world challenges. We welcome contributions that push the boundaries of AI, strengthen interdisciplinary collaboration, and support the global transformation toward smarter technologies.
Our goal is to ensure that every published study adds meaningful value to the scientific community and contributes to the future of intelligent systems.
      </p>
    </div>
  </div>
</section>
 
  <section className="py-10 px-6 ">
   <div className=" flex-1 text-start lg:text-left space-y-2">
      {/* Centered title */}
      <div className="w-full flex justify-center">
        <span className="text-2xl font-bold text-center">
          Editorial Board Members (ACIET)
        </span>
      </div>
</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">

      {Editorial_members.map((member)=>(
        <ProfileCard
        id ={member.Id}
          key ={member.Id}
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