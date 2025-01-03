import { format, parseISO } from "date-fns";

export const formatDate = (dateString: string) => {
  // Parse the input string into a Date object
  const date = parseISO(dateString);

  // Format the date as mm/dd/yy
  return format(date, "MM/dd/yy");
};
