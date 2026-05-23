'use client';

import FooterSection from '@/components/Home/FooterSection' // Assuming FooterSection component path
import { useState ,useEffect} from 'react';
import ProfileCard from '@/components/Home/ProfileCard'
import NavigationPage from '@/components/Home/Navigation_SubJournals_CIMS' // Assuming NavigationPage component path;

const  page = () => {
    // 1. Create a dynamic version state
  const [version, setVersion] = useState("v1");

  useEffect(() => {
    // 2. Set version to current timestamp on load to bypass all caches
    setVersion(`v=${Date.now()}`);
  }, []);

  const [activeSection, setActiveSection] = useState<"finance" | "operations">("finance");
  const Editorial_members = [
    {   Id:"Lurnexa_2544fm11",
        "image":"https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2544fm11.jpg",
        "Name": "Dr.Modekurti Venkata Surya Kameshwar Rao",
        "Board": "CIMS-Finance Management",
        "Role": "Sub Division-Editor in Chief",
        "Department": "Department of Finance and Accounting",
        "Designation/College Name": "Associate Professor/IBS Hyderabad",
        "linkedinUrl": "https://www.linkedin.com/in/dr-kameshwar-rao-modekurti-45145223/",
       "collegeUrl":"https://www.ifheindia.org/FacultyImages/Mq5sTPjgSkn8J4jPjlnscFWYy0p5MvTXrigIGJsvcPDF5qOn1r3b6nnL3Ne6KVk.pdf",
        "mail":"kami2020@gmail.com"
    },
    {   
        Id:"Lurnexa_2544fs12",
        "image":"https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2544fs12.jpg",
        "Name": "Dr.Srikanth Potharla",
          "Board": "CIMS-Finance Management",
        "Role": "Deputy Editor in Chief",
        "Department": "Department of Finance and Accounting",
        "Designation/College Name": "Assistant Professor/IBS Hyderabad",
        "linkedinUrl": "https://www.linkedin.com/in/srikanth-p-2a06751a/",
       "collegeUrl":"https://www.ifheindia.org/FacultyImages/N3DYZbNMKEAYseOGmrIl82HhZWPoLASoqtAlM751FNF4wbU4jtHblFT5GokaxCW.pdf",
        "mail":"psk@ibsindia.org"
    },
    {
        Id:"Lurnexa_2544fs13",
         "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2544fs13.jpg",
        "Name": "Dr Susanta K Mishra",
        "Board": "CIMS-Finance Management",
        "Role": "Sr Associate Editor",
        "Department": "Department of Management",
        "Designation/College Name": "Professor/ Centurion University",
        "linkedinUrl": "https://www.linkedin.com/in/dr-susanta-k-mishra-3b5a9433/?originalSubdomain=in",
       "collegeUrl":"https://faculty.cutm.ac.in/general_profilesc.php?xyz=susanta.mishra@cutm.ac.in",
       "mail":"susanta65@gmail.com"
    },
    {  Id:"Lurnexa_2544fm21",
       "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2544fm14.jpg",
        "Name": "Dr.Muhammed Shafi M K",
        "Board": "CIMS-Finance Management",
        "Role": "Associate Editor",
        "Department": "School of Management",
        "Designation/College Name": "Assistant Professor/ NIT Warangal",
        "linkedinUrl": "https://www.linkedin.com/in/dr-muhammed-shafi-mk-68a49254/?originalSubdomain=in",
       "collegeUrl":"https://erp.nitw.ac.in/ext/profile/sm-shafimk",
       "mail":"shafimk@nitw.ac.in"
    },
    {    Id:"Lurnexa_2544fm15",
      "image":"https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2544fm15.jpg",
        "Name": "Dr. Manisha Kumari",
        "Board": "CIMS-Finance Management",
        "Role": "Managing Editor",
        "Department": "School of Enterprise Development",
        "Designation/College Name": "Associate Faculty Member/ (ni-msme)",
        "linkedinUrl": "https://www.linkedin.com/in/manishakumari-ba344857/",
       "collegeUrl":"https://www.nimsme.gov.in/employee/a7b4a35465d9853607aaa02f9ea4f0a3",
       "mail":"kmanisha44@gmail.com"
    },
    {
        Id:"Lurnexa_2544fs16",
       "image":"https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2544fs16.jpg",
        "Name": "Dr. Sandeep Kumar Kesarwani",
        "Board": "CIMS-Finance Management",
        "Role": "Sr Review Editor",
        "Department": "Department of Management Studies",
        "Designation/College Name": "Associate Professor/ Indian Institute of Information Technology",
       "linkedinUrl": "https://www.linkedin.com/in/dr-sandeep-kumar-kesarwani-48023755/?originalSubdomain=in",
       "collegeUrl":"https://imparc.org/dr-sandeep-kumar-kesarwani/",
       "mail":"sandeep20046@gmail.com"
    },
    {   
        Id:"Lurnexa_2544fc17",
         "image":"https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2544fc17.jpg",
        "Name": "Dr.CH Shanker",
        "Board": "CIMS-Finance Management",
        "Role": "Review Editor",
        "Department": "Department of Finance",
        "Designation/College Name": "Assistant Professor/ Geetam Hyderabad",
        "linkedinUrl": "https://www.linkedin.com/in/dr-ch-shankar-30881a3b/",
       "collegeUrl":"https://www.gitam.edu/faculty/chanagala-shankar",
       "mail":"shankar_123987@yahoo.co.in"
    },
    {   Id:"Lurnexa_2544fk18",
      "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2544fk18.jpg",
        "Name": "Dr. Kumaraswamy Manepalli",
        "Board": "CIMS-Finance Management",
        "Role": "Domain Editor",
        "Department": "Department of Management Studies",
        "Designation/College Name": "Assistant Professor/Vignan's University, Vadlamudi",
       "linkedinUrl": "https://www.linkedin.com/in/manepalli-kumaraswamy-71b310126/?originalSubdomain=in",
       "collegeUrl":"https://vignan.ac.in/newvignan/departments/deptpeople.php?deptid=sch5_dept1&school=sch5&deptnm=MG",
        "mail":"Ksm_mgt@vignanc.ac.in"
    },
    {
      Id:"Lurnexa_2544fr19",
      "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2544fr19.jpg",
        "Name": "Dr.Rintu Anthony",
        "Board": "CIMS-Finance Management",
        "Role": "Assistant Editor",
        "Department": "Department of Finance",
        "Designation/College Name": "Assistant Professor / Rajagiri Business School",
       "linkedinUrl": "https://www.linkedin.com/in/rintu-anthony-8b2bb124/?originalSubdomain=in",
       "collegeUrl":"https://www.rajagiribusinessschool.edu.in/faculty-details/rintu-anthony",
       "mail":"rintu.anthony0343@gmail.com"
    },
    {   Id:"Lurnexa_2544fs20",
      "image":"https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2544fs20.jpg",
        "Name": "Dr.Saravanan Vellaiyan",
        "Board": "CIMS-Finance Management",
        "Role": "Editorial Executive",
        "Department": "School of Business and Management",
        "Designation/College Name": "Assistant Professor / Christ University",
       "linkedinUrl": "https://www.linkedin.com/in/saravanan-vellaiyan/?originalSubdomain=in",
       "collegeUrl":"https://m.christuniversity.in/dept/faculty-details/NDc1OA==/MzAx",
        "mail":"sarodanie@gmail.com"
    },
    {
      Id:"Lurnexa_2544fm14",
      "image":"../editorial-images/madam.jpeg",
        "Name": "Dr. Sofia Ahmed Sait",
        "Board": "CIMS-Finance Management",
        "Role": "Editorial Executive",
        "Department": "Department of Commerce",
        "Designation/College Name": "Assistant Professor/Loyola Academy Degree & PG College, Secunderabad ",
       "linkedinUrl": "https://www.linkedin.com/in/dr-sofia-sait-4a841626b",
       "collegeUrl":"https://loyolaacademy.edu.in/bcom-business-analytics/"
    }
]
const Operation_members = [
  {
    "id": "Lurnexa_2544ok23",
    "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2544ok23.jpg",
    "name": "Dr. Kapil Manohar Gumte",
      "Board": "CIMS-Operation Management",
    "role": "Deputy Editor in Chief",
    "Department": "Operations & Supply Chain",
    "Designation/College Name": "Assistant Professor/Indian Institute of Management Jammu",
    "linkedinUrl": "https://www.linkedin.com/in/kapilgumte/",
    "collegeUrl": "https://www.iimj.ac.in/faculty-data4261.php?n=ODY=",
    "email":"kapil@iimj.ac.in"
  },
  {
    "id": "Lurnexa_2544od24",
    "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2544od24.jpg",
    "name": "Dr. Debopam Chakrabarti",
      "Board": "CIMS-Operation Management",
    "role": "Senior Associate Editor",
    "Department": "Operations and Supply Chain Management",
    "Designation/College Name": "Professor of Practice/Mahindra University",
    "linkedinUrl": "https://www.linkedin.com/in/dr-debopam-chakarabarti-3352b97/",
    "collegeUrl": "https://www.mahindrauniversity.edu.in/faculty/dr-debopam-chakrabarti/",
    "email":"debopam.chakrabarti@mahindrauniversity.edu.in"
  },
  {
    "id": "Lurnexa_2544ov25",
    "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2544ov25.jpg",
    "name": "Dr. Vaibhav Mishra",
      "Board": "CIMS-Operation Management",
    "role": "Associate Editor",
    "Department": "Operations and IT",
    "Designation/College Name": "Associate Professor/IBS Hyderabad",
    "linkedinUrl": null,
    "collegeUrl": "https://www.ifheindia.org/FacultyImages/ZFUqkjs63hPyifyetu45eRiY6syRgLdpuVNmdTj9FyDSgYZbxAUTyEainLYJS.pdf",
      "email":" Cs.vaibhavmishra@gmail.com"
  },
  {
    "id": "Lurnexa_2544or26",
    "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2544or26.jpg",
    "name": "Dr. D. Ravindran",
      "Board": "CIMS-Operation Management",
    "role": "Managing Editor",
    "Department": "Department of Management Studies",
    "Designation/College Name": "Assistant Professor/Kristu Jayanti Institute of Management, Bengaluru",
    "linkedinUrl": "https://www.linkedin.com/in/ravindran-d-b65b8416/?originalSubdomain=in",
    "collegeUrl": "https://kristujayanti.irins.org/profile/168699",
    "email":"rtkob@yahoo.co.in"
  },
  {
    "id": "Lurnexa_2544os28",
    "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2544os28.jpg",
    "name": "Dr. Sourav Mondal",
      "Board": "CIMS-Operation Management",
    "role": "Review Editor",
    "Department": "Operations & Supply Chain",
    "Designation/College Name": "Assistant Professor / IIM Jammu",
    "linkedinUrl": "https://www.linkedin.com/in/sourav-mondal-a13906a7/?originalSubdomain=in",
    "collegeUrl": "https://iimj.ac.in/faculty-datad429.php?n=MTMy",
    "email":"sourav@iimj.ac.in"
  },
  {
    "id": "Lurnexa_2544ob30",
    "image": "https://lurnexa.s3.ap-south-1.amazonaws.com/editorial_board_photos/Lurnexa_2544ob30.jpg",
    "name": "Dr. Bijetha Shaw",
      "Board": "CIMS-Operation Management",
    "role": "Assistant Editor",
    "Department": "Operations and IT",
    "Designation/College Name": "Assistant Professor/IBS Hyderabad",
    "linkedinUrl": "https://www.linkedin.com/in/bijeta-shaw-5576269b/?originalSubdomain=in",
    "collegeUrl": "https://www.ifheindia.org/FacultyImages/ZFUqkjs63hPyifyetu45eUrjppP7DJtxe9oBQK2hBVp8Jv0UmNwKTMVPHPBp.pdf",
    "email":" bijetapkumar.research@gmail.com"
  }
]

  return (

    
   <>
      <section className="py-20 px-6 bg-linear-to-b from-neutral-50 to-white border-b border-gray-300">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 items-start">
          <NavigationPage />

          <div className="flex-1 space-y-4">
            <div className="w-full flex justify-center">
              <span className="text-2xl font-bold text-center">
                Editorial Message - CIMS
              </span>
            </div>

            <p className="text-lg text-gray-700 leading-relaxed">
               The CIMS section aims to strengthen modern management scholarship by encouraging rigorous, practical, and forward-looking research. In a rapidly changing business landscape, effective strategic thinking, innovation, and data-driven decision-making have become essential.
We invite research that enhances organizational performance, addresses contemporary managerial challenges, and promotes sustainable and ethical practices. Our focus is to support work that bridges academic insight with real-world managerial application, helping shape competent and future-ready leadership.
            </p>

            {/* Toggle Buttons */}
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setActiveSection("finance")}
                className={`px-6 py-2 rounded-full font-medium ${
                  activeSection === "finance"
                    ? "bg-green-400 text-white"
                    : "bg-gray-200"
                }`}
              >
                Finance
              </button>

              <button
                onClick={() => setActiveSection("operations")}
                className={`px-6 py-2 rounded-full font-medium ${
                  activeSection === "operations"
                    ? "bg-blue-400 text-white"
                    : "bg-gray-200"
                }`}
              >
                Operations
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 px-6">
          <div className="w-full flex justify-center">
        <span className="text-2xl font-bold text-center">
          Editorial Board Members {activeSection === "finance" ? " CIMS - Finance Management" : "CIMS - Operations Management"}
        </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
        
          {activeSection === "finance" &&
            Editorial_members.map((member) => (
              <ProfileCard
                key ={member.Id}
                id={member.Id}
          image={member.image || ''}
          name={member.Name}
          role={member.Role}
          Desgination={member['Designation/College Name']}
         college={member['Designation/College Name']}
          linkedinUrl={member.linkedinUrl}
           collegeUrl={member.collegeUrl}
           mail={member.mail}
           department={member.Department}
              />
            ))}

          {activeSection === "operations" &&
            Operation_members.map((members) => (
              <ProfileCard
              id={members.id}
                key ={members.id}
                      image={members.image ? `${members.image}?${version}` : ''}

          name={members.name || ''}
          role={members.role}
          Desgination={members['Designation/College Name'] || ''}
         college={members['Designation/College Name'] || ''}
          linkedinUrl={members.linkedinUrl || undefined }
           collegeUrl={members.collegeUrl || undefined}
              mail={members.email || undefined}
              department={members.Department}
              />
            ))}
        </div>
      </section>

      <FooterSection />
    </>
  );
};
export default page;