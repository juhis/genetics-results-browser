import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { TableData } from "../types/types";

export const useServerQuery = (variantInput: string | undefined) => {
  return useQuery<TableData>({
    queryKey: ["table-data", variantInput],
    queryFn: async () => {
      let { data } = await axios.post("/api/v1/results", {
        variants: variantInput,
      });
      if (typeof data !== "object") {
        // JSON parsing failed
        if (typeof data === "string") {
          if (data.includes("Infinity")) {
            console.error("Possible Infinity value in data and it's not JSON");
          }
          if (data.includes("NaN")) {
            console.error("Possible NaN value in data and it's not JSON");
          }
        }
        throw Error("Invalid data received from the server");
      }
      console.info(data);
      return data;
    },
    enabled: !!variantInput,
    keepPreviousData: true,
    staleTime: Infinity,
    cacheTime: Infinity,
  });
};
