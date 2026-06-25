"use client";
import FooterSection from '@/components/Home/FooterSection' // Assuming FooterSection component path
import NavigationPage from '@/components/Home/Navigation_SubJournals'
import ProfileCard from '@/components/Home/ProfileCard'
import { useEffect, useState } from 'react'; // Added these

const page = () => {
  // 1. Create a dynamic version state
  const [version, setVersion] = useState("v1");

  useEffect(() => {
    // 2. Set version to current timestamp on load to bypass all caches
    setVersion(`v=${Date.now()}`);
  }, []);

  const Editorial_members = [
    {
      Id: "Lurnexa_2538a01",
      "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2538a01.jpeg",
      "Name": "Dr. Anand Shukla",
      "Board": "GJPIR",
      "Role": "Editor-in-Chief",
      "Department": "School of Computer Applications",
      "Designation/College Name": "Dean / Lovely Professional University",
      "linkedinUrl": "https://www.linkedin.com/in/dr-anand-shukla-59342838/",
      "collegeUrl": "https://www.lpu.in/faculty/staff-profile.php?EmpCode=32898",
      "email": "anand.shukla@lpu.co.in"

    },
    {
      Id: "Lurnexa_2562b32",
      "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2562b32.jpg",
      "Name": "Dr. Badri Narayanan Gopalakrishnan",
      "Board": "GJPIR",
      "Role": " Co - Editor-in-Chief",
      "Department": "Department of Economics",
      "Designation/College Name": "Fellow, NITI Aayog, Government of India / Boston College",
      "linkedinUrl": "https://www.linkedin.com/in/badrinarayanang/",
      "collegeUrl": "https://www.bc.edu/bc-web/schools/wcas/about/faculty-research/faculty-directory-folder/badri-narayanan-gopalakrishnan.html",
      "email": "gopalakb@bc.edu"
    },

    {
      Id: "Lurnexa_2562a33",
      "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2562a33.jpg",
      "Name": "Dr. Aruna Kumar Dash",
      "Board": "GJPIR",
      "Role": "Associate Editor",
      "Department": "Department of Economics",
      "Designation/College Name": "Associate Professor / IBS Hyderabad",
      "linkedinUrl": "https://www.linkedin.com/in/aruna-dash-62a74a19/",
      "collegeUrl": "https://www.ifheindia.org/icfai-school-of-social-sciences/Facultyprofiles/Economics/Aruna-Kumar-Dash.pdf",
      "email": "akdash@ibsindia.org "
    },
    {
      Id: "Lurnexa_2553u42",
      "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2553u42.jpg",
      // Lurnexa_2553u42.jpg
      "Name": "Dr. Umesh Chandra Pati",
      "Board": "GJPIR",
      "Role": "Sr.Managing Editor",
      "Department": "Department of Electronics and Communication Engineering",
      "Designation/College Name": "Professor / National Institute of Technology Rourkela",
      "linkedinUrl": "https://www.linkedin.com/in/dr-umesh-c-pati-13034a20/",
      "collegeUrl": "https://www.nitrkl.ac.in/docs/Faculty/CV/1970695.pdf",
      "email": "ucpati@nitrkl.ac.in"
    },
    {
      Id: "Lurnexa_2544ok23",
      "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2544ok23.jpg",
      "Name": "Dr. Kapil Manohar Gumte",
      "Board": "GJPIR",
      "Role": "Managing Editor",
      "Department": "Operations & Supply Chain",
      "Designation/College Name": "Assistant Professor / Indian Institute of Management Jammu",
      "linkedinUrl": "https://www.linkedin.com/in/kapilgumte/",
      "collegeUrl": "https://www.iimj.ac.in/faculty-data4261.php?n=ODY=",
      "email": "kapil@iimj.ac.in"
    },
    {
      Id: "Lurnexa_2544fs13",
      "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2544fs13.jpg",
      "Name": "Dr. Susanta K Mishra",
      "Board": "GJPIR",
      "Role": "Assistant Editor",
      "Department": "Department of Management",
      "Designation/College Name": "Professor / Centurion University",
      "linkedinUrl": "https://www.linkedin.com/in/dr-susanta-k-mishra-3b5a9433/?originalSubdomain=in",
      "collegeUrl": "https://faculty.cutm.ac.in/general_profilesc.php?xyz=susanta.mishra@cutm.ac.in",
      "email": "susanta65@gmail.com"
    },
    {
      Id: "Lurnexa_2544fs12",
      "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2544fs12.jpg",
      "Name": "Dr. Srikanth Potharla",
      "Board": "GJPIR",
      "Role": "Section Editor",
      "Department": "Department of Finance and Accounting",
      "Designation/College Name": "Assistant Professor / IBS Hyderabad",
      "linkedinUrl": "https://www.linkedin.com/in/srikanth-p-2a06751a/",
      "collegeUrl": "https://www.ifheindia.org/FacultyImages/N3DYZbNMKEAYseOGmrIl82HhZWPoLASoqtAlM751FNF4wbU4jtHblFT5GokaxCW.pdf",
      "email": "psk@ibsindia.org"
    },
    {
      Id: "Lurnexa_2538c04",
      "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2538c04.jpg",
      "Name": "Dr. Chinmaya Kumar Swain",
      "Board": "GJPIR",
      "Role": "Review Editor",
      "Department": "IT Systems & Analytics",
      "Designation/College Name": "Assistant Professor / IIM Jammu",
      "linkedinUrl": "https://www.linkedin.com/in/dr-chinmaya-kumar-swain-77b358128/",
      "collegeUrl": "https://iimj.ac.in/faculty-datae8d3.php?n=MTI0",
      "email": "chinmaya@iimj.ac.in"
    },
    {
      Id: "Lurnexa_2553n43",
      "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2553n43.jpeg",
      "Name": "Dr. CH. Naga Sai Kalyan",
      "Board": "GJPIR",
      "Role": "Advisory Member",
      "Department": "Department of Electrical and Electronics Engineering",
      "Designation/College Name": " M.Tech, Ph.D, Associate Professor/vvit Guntur",
      "linkedinUrl": "",
      "collegeUrl": "https://www.vvitguntur.com/chnsk-profile"
    }, {
      Id: "Lurnexa_2544oa22",
      "image": "/editorial-images/gjpir/Hiranya Dissanayake.jpg",
      "Name": "Hiranya Dissanayake ",
      "Board": "GJPIR",
      "Role": "Member",
      "Department": "Department of Accountancy",
      "Designation/College Name": " Faculty of Business Studies & Finance Wayamba University of Sri Lanka Kuliyapitiya ",
      "linkedinUrl": "https://www.linkedin.com/in/hiranya-dissanayake-bb835a89",
      "collegeUrl": "https://fbsf.wyb.ac.lk/personnel/mrs-dhsw-dissanayake/",
      "email": "hiranya@wyb.ac.lk "
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
                Editorial Board Members
              </span>
            </div>

            <br />

            <p className="text-lg text-gray-700 leading-relaxed">

              The Global Journal for Progressive Innovation & Research was created
              with the intention of providing a reliable academic space where
              meaningful research can be shared and preserved. Each of our four
              sections represents an important area of study, yet together they
              reflect a broader purpose supporting knowledge that contributes to
              technological growth, organizational improvement, economic stability,
              and social development. We believe that responsible research plays an
              important role in shaping future progress. Our editorial process is
              designed to maintain fairness and quality, while giving authors the
              opportunity to present their work with clarity and confidence. We
              welcome contributions that are thoughtful, well-structured, and
              grounded in genuine academic effort. It is our hope that this journal
              becomes a useful resource for scholars, educators, professionals, and
              institutions who value knowledge that makes a difference.
            </p>
          </div>
        </div>
      </section>

      <section className="py-10 px-6 ">
        <div className=" flex-1 text-start lg:text-left space-y-2">
          {/* Centered title */}
          <div className="w-full flex justify-center">
            <span className="text-2xl font-bold text-center">
              Editorial Board Members (GJPIR)
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">

          {Editorial_members.map((member) => (
            <ProfileCard
              id={member.Id}
              key={member.Id}
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