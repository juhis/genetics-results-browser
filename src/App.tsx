import { useMemo } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Header from "./features/page/Header";
import About from "./features/page/About";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TableContainer from "./features/table/TableContainer";

export const App = () => {
  //TODO dark/light mode
  const prefersDarkMode = true; //useMediaQuery('(prefers-color-scheme: dark)');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "prefersDarkMode" ? "dark" : "light",
        },
        typography: {
          fontSize: 10,
        },
      }),
    [prefersDarkMode]
  );

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: false,
      },
    },
  });

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline enableColorScheme />
          <div style={{ padding: "10px" }}>
            <Header />
            <Routes>
              <Route path="/" element={<TableContainer />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </div>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};
