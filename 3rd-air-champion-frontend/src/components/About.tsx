import React from "react";

interface AboutProps {
  setIsAboutModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const About = ({ setIsAboutModalOpen }: AboutProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative bg-white rounded-lg p-6 w-4/5 max-w-md shadow-lg">
        <button
          className="absolute top-4 right-4 hover:text-black text-gray-700 font-bold text-[1.5rem]"
          onClick={() => setIsAboutModalOpen(false)}
        >
          &times;
        </button>
        <h2 className="text-xl text-center font-bold mb-2">TiMag 1.0</h2>
        <p className="mb-4">
          TiMag 1.0 is designed to manage non AirBnB vs. regular AirBnB bookings
          within a single platform. It provides the following features:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Centralized management for room rentals</li>
          <li>Seamless synchronization with Airbnb calendars</li>
          <li>User-friendly interface for effortless operations</li>
          <li>Action item reminders for better task management</li>
          <li>Monthly statistics</li>
        </ul>
        <p className="mt-4">
          For inquiries, please reach out to{" "}
          <a
            href="mailto:anhtp5@uci.edu"
            className="text-blue-500 underline hover:text-blue-700"
          >
            anhtp5@uci.edu
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default About;
