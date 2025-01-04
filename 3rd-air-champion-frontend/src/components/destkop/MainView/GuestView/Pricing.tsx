import {
  useForm,
  Controller,
  useFieldArray,
  SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingType } from "../../../../util/types/bookingType";
import { roomType } from "../../../../util/types/roomType";
import {
  pricingZodObject,
  pricingZodSchema,
} from "../../../../util/zodPricing";

interface PricingProps {
  booking: bookingType;
  editingRoomIndex: number | null;
  rooms: roomType[];
  onPricingUpdate: (data: {
    guest: string;
    room: string;
    price: number;
  }) => void;
  setEditingRoomIndex: React.Dispatch<React.SetStateAction<number | null>>;
}

const Pricing = ({
  booking,
  editingRoomIndex,
  rooms,
  onPricingUpdate,
  setEditingRoomIndex,
}: PricingProps) => {
  // Initialize React Hook Form
  const { control, handleSubmit } = useForm<pricingZodSchema>({
    resolver: zodResolver(pricingZodObject),
    defaultValues: {
      pricing: rooms.map((room) => {
        const roomPricing = booking.guest.pricing?.find(
          (price) => price.room === room.id
        );
        return {
          room: room.id,
          price: roomPricing?.price || 0,
        };
      }),
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "pricing",
  });

  const onSubmit: SubmitHandler<pricingZodSchema> = (data) => {
    console.log(data);
    console.log(editingRoomIndex);

    const modifiedField = {
      room: data.pricing[editingRoomIndex as number].room,
      price: data.pricing[editingRoomIndex as number].price,
      guest: booking.guest.id,
    };

    console.log(modifiedField);

    onPricingUpdate(modifiedField);
  };

  return (
    <div className="flex flex-col space-y-2">
      {fields.map((field, index) => (
        <form
          key={field.id}
          onSubmit={handleSubmit(onSubmit)}
          className="flex space-x-2 items-center"
        >
          {editingRoomIndex === index ? (
            <Controller
              name={`pricing.${index}.price`}
              control={control}
              render={({ field, fieldState }) => (
                <div className="flex flex-col">
                  <input
                    {...field}
                    type="number"
                    className="border p-1 w-20"
                    step="0.01"
                    onChange={(event) => field.onChange(+event.target.value)}
                    onBlur={() => setEditingRoomIndex(null)}
                  />
                  {fieldState.error && (
                    <span className="text-red-500 text-sm">
                      {fieldState.error.message}
                    </span>
                  )}
                </div>
              )}
            />
          ) : (
            <span
              className="cursor-pointer"
              onClick={() => setEditingRoomIndex(index)}
            >
              {rooms[index].name}: $
              <span className="underline">{field.price}</span>
            </span>
          )}
        </form>
      ))}
    </div>
  );
};

export default Pricing;
