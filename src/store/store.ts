import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { Phenotype, TableData, DataType } from "../types/types";
import { filterRows } from "./munge";

interface DataState {
  message: string | undefined;
  setMessage: (message: string | undefined) => void;
  variantInput: string | undefined;
  setVariantInput: (variantInput: string) => void;
  serverData: TableData | undefined;
  setServerData: (serverData: TableData) => void;
  clientData: TableData | undefined;
  toggledDataTypes: Record<string, boolean>;
  toggleDataType: (DataType: DataType) => void;
  toggledGWASTypes: Record<string, boolean>;
  toggleGWASType: (GWASType: string) => void;
  pThreshold: number;
  setPThreshold: (pThreshold: number) => void;
  pipThreshold: number;
  setPipThreshold: (pipThreshold: number) => void;
  selectedPheno: Phenotype | undefined;
  setSelectedPheno: (pheno: Phenotype | undefined) => void;
  selectedPopulation: string | undefined;
  setSelectedPopulation: (pop: string | undefined) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useDataStore = create<DataState>()(
  subscribeWithSelector((set) => ({
    message: undefined,
    setMessage: (message) => set({ message }),
    variantInput: undefined,
    setVariantInput: (variantInput) => set({ variantInput }),
    serverData: undefined,
    setServerData: (data: TableData) =>
      set((state) => ({
        serverData: data,
        // filter and group the data when server data changes
        clientData: filterRows(
          data,
          state.toggledDataTypes,
          state.toggledGWASTypes,
          state.pThreshold,
          state.pipThreshold,
          state.selectedPheno,
          true
        ),
      })),
    clientData: undefined,
    toggledDataTypes: {
      GWAS: true,
      eQTL: false,
      pQTL: false,
      sQTL: false,
    },
    toggleDataType: (dataType: string) => {
      set((state) => {
        const newDataTypes = {
          ...state.toggledDataTypes,
          [dataType]: !state.toggledDataTypes[dataType],
        } as Record<string, boolean>;
        return {
          toggledDataTypes: newDataTypes,
          clientData: filterRows(
            state.serverData!,
            newDataTypes,
            state.toggledGWASTypes,
            state.pThreshold,
            state.pipThreshold,
            state.selectedPheno,
            true
          ),
        };
      });
    },
    toggledGWASTypes: {
      "case-control": true,
      continuous: true,
    },
    toggleGWASType: (GWASType: string) => {
      set((state) => {
        const newGWASTypes = {
          ...state.toggledGWASTypes,
          [GWASType]: !state.toggledGWASTypes[GWASType],
        } as Record<string, boolean>;
        return {
          toggledGWASTypes: newGWASTypes,
          clientData: filterRows(
            state.serverData!,
            state.toggledDataTypes,
            newGWASTypes,
            state.pThreshold,
            state.pipThreshold,
            state.selectedPheno,
            true
          ),
        };
      });
    },
    pThreshold: 5e-8,
    setPThreshold: (pThreshold) =>
      set((state) => {
        return {
          pThreshold: pThreshold,
          clientData: filterRows(
            state.serverData!,
            state.toggledDataTypes,
            state.toggledGWASTypes,
            pThreshold,
            state.pipThreshold,
            state.selectedPheno,
            true
          ),
        };
      }),
    pipThreshold: 0.1,
    setPipThreshold: (pipThreshold) =>
      set((state) => ({
        pipThreshold: pipThreshold,
        clientData: filterRows(
          state.serverData!,
          state.toggledDataTypes,
          state.toggledGWASTypes,
          state.pThreshold,
          pipThreshold,
          state.selectedPheno,
          true
        ),
      })),
    selectedPheno: undefined,
    setSelectedPheno: (pheno) =>
      set((state) => ({
        selectedPheno: pheno,
        clientData: filterRows(
          state.serverData!,
          state.toggledDataTypes,
          state.toggledGWASTypes,
          state.pThreshold,
          state.pipThreshold,
          pheno,
          true
        ),
      })),
    selectedPopulation: undefined,
    setSelectedPopulation: (pop) => set({ selectedPopulation: pop }),
    activeTab: "variants",
    setActiveTab: (tab) => set({ activeTab: tab }),
  }))
);
