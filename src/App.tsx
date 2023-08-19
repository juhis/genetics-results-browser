import { useMemo } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { indigo, pink } from "@mui/material/colors";
import Header from "./features/page/Header";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TableContainer from "./features/table/TableContainer";
import About from "./features/page/About";

export const App = () => {
  //TODO dark/light mode
  const prefersDarkMode = true; //useMediaQuery('(prefers-color-scheme: dark)');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          primary: indigo,
          secondary: pink,
          mode: prefersDarkMode ? "dark" : "light",
        },
        typography: {
          body1: {
            fontSize: 12,
          },
          fontSize: 12,
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
