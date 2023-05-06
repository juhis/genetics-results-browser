import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { TableData } from "../types/types";

export const useServerQuery = (
  variantInput: string,
  setServerData: (serverData: TableData) => void
) =>
  useQuery<null>({
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
      setServerData(data);
      // from now on the store is the source of truth
      return null;
    },
    keepPreviousData: true,
    staleTime: Infinity,
    cacheTime: Infinity,
  });
