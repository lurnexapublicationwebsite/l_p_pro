import React from "react";
import { FaLinkedinIn, FaUniversity } from "react-icons/fa";

interface ProfileCardProps {
  image: string;
  name: string;
  role: string;
  college: string;
  linkedinUrl?: string;
  collegeUrl?: string;
}

const EditorialMemberCard: React.FC<ProfileCardProps> = ({
  image,
  name,
  role,
  college,
  linkedinUrl,
  collegeUrl,
}) => {
  return (
    <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300  group">
      {/* Background Image */}
      <div className="relative p-3">
        <img
          src={image}
          alt={name}
          className="w-full  h-80 sm:h-96 object-cover rounded-3xl transform transition-transform duration-500 group-hover:scale-[1.05]"
        />

        {/* Top Right College Icon */}
        {collegeUrl && (
          <a
            href={collegeUrl}
            target="_blank"
            rel="noreferrer"
            className="absolute top-4 right-4 bg-blue-300 text-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 transition-all duration-200"
          >
            <FaUniversity className="text-lg sm:text-xl " />
          </a>
        )}
      </div>

      {/* Bottom Overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[88%] sm:w-[85%] bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-md flex justify-between items-center">
        {/* Text Details */}
        <div className="flex flex-col text-left">
          <h3 className="text-[14px] sm:text-[15px] font-semibold text-gray-900 leading-tight">
            {role}
          </h3>
          <p className="text-[13px] text-gray-700 mt-0.5">{name}</p>
          <p className="text-[12px] text-gray-500">{college}</p>
        </div>

        {/* LinkedIn Icon */}
        {linkedinUrl && (
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all duration-200 ml-3"
          >
            <FaLinkedinIn className="text-sm sm:text-base" />
          </a>
        )}
      </div>
    </div>
  );
};

export default EditorialMemberCard;
