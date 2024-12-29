import { useState, useEffect } from "react";
import { roomType } from "../../../../util/types/roomType";

interface RoomLinkModalProps {
  setIsSyncModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  rooms: roomType[]; // Replace with your room type
}

const RoomLinkModal = ({ setIsSyncModalOpen, rooms }: RoomLinkModalProps) => {
  const [room, setRoom] = useState("");
  const [link, setLink] = useState("");
  const [data, setData] = useState<{ room: string; link: string }[]>([]);

  // Load existing data from localStorage when modal opens
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("syncData") || "[]");
    setData(savedData);
  }, []);

  const handleAddEntry = () => {
    if (!room || !link) {
      alert("Please select a room and enter a link.");
      return;
    }

    const newEntry = { room, link };
    const updatedData = [...data, newEntry];

    // Save updated data to state and localStorage
    setData(updatedData);
    localStorage.setItem("syncData", JSON.stringify(updatedData));

    // Clear input fields
    setRoom("");
    setLink("");
  };

  const handleSaveAndClose = () => {
    setIsSyncModalOpen(false); // Close modal
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Add Room and Link</h2>

        <select
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        >
          <option value="">Select Room</option>
          {rooms.map((roomOption, index) => (
            <option key={index} value={roomOption.id}>
              {roomOption.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Enter link"
          className="w-full mb-4 p-2 border rounded"
        />

        <button
          onClick={handleAddEntry}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full mb-4"
        >
          Add Entry
        </button>

        <h3 className="text-md font-semibold mb-2">Current Entries</h3>
        <ul className="list-disc list-inside h-[50px] overflow-y-scroll mb-4">
          {data.map((entry, index) => (
            <li key={index} className="text-sm">
              {entry.link}
            </li>
          ))}
        </ul>

        <div className="flex justify-end">
          <button
            onClick={handleSaveAndClose}
            className="bg-gray-300 text-black px-4 py-2 rounded mr-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomLinkModal;
