import { useEffect, useState } from "react";
import { bookingType } from "../../../../util/types/bookingType";

interface AirBnBPricingProps {
  airBnBPrices: Map<string, number> | undefined;
  booking: bookingType;
  editingKey: string | null;
  setAirBnBPrices: React.Dispatch<
    React.SetStateAction<Map<string, number> | undefined>
  >;
  setEditingKey: React.Dispatch<React.SetStateAction<string | null>>;
}

const AirBnBPricing = ({
  airBnBPrices,
  booking,
  editingKey,
  setAirBnBPrices,
  setEditingKey,
}: AirBnBPricingProps) => {
  const key = `${booking.room.name}_${booking.startDate}_${booking.endDate}`;
  const storedPrice = airBnBPrices?.get(key) || 0;

  const [price, setPrice] = useState<number | string>(storedPrice);

  // Save to localStorage whenever prices update
  useEffect(() => {
    if (airBnBPrices) {
      localStorage.setItem(
        "airBnBPrices",
        JSON.stringify(Array.from(airBnBPrices.entries()))
      );
    }
  }, [airBnBPrices]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === "") {
      setPrice(""); // Allow empty input field
    } else {
      const parsedValue = parseFloat(inputValue);
      setPrice(isNaN(parsedValue) ? "" : parsedValue); // Keep empty or valid number
    }
  };

  const handleSavePrice = () => {
    const newPrice = price === "" ? 0 : Math.max(0, Number(price)); // Ensure minimum 0
    const updatedPrices = new Map(airBnBPrices);

    updatedPrices.set(key, newPrice);

    setAirBnBPrices(updatedPrices);
    setEditingKey(null); // Close edit mode
  };

  return (
    <div>
      {editingKey === key ? (
        <div className="flex space-x-2">
          <input
            type="number"
            value={price}
            onChange={handlePriceChange}
            className="border p-1 w-24"
          />
          <button
            onClick={handleSavePrice}
            className="bg-blue-500 text-white px-2 py-1 rounded-md"
          >
            Save
          </button>
          <button
            onClick={() => setEditingKey(null)}
            className="bg-gray-500 text-white px-2 py-1 rounded-md"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div
          className="flex space-x-1 cursor-pointer underline"
          onClick={() => {
            setPrice(airBnBPrices?.get(key) || 0);
            setEditingKey(key);
          }}
        >
          <span className="text-sm whitespace-nowrap">
            Profit: ${storedPrice}
          </span>
        </div>
      )}
    </div>
  );
};

export default AirBnBPricing;
