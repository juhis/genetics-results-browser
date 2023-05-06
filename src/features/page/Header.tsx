import { Typography, Box, Link } from "@mui/material";

const Header = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
      }}>
      <Typography variant="h6" sx={{ marginBottom: "10px" }}>
        A tool for variant interpretation based on global genetics and genomics results
      </Typography>
      <Typography variant="h6" sx={{ marginBottom: "10px" }}>
        {/* <Link href="/about" underline="hover">
          <InfoIcon />
          About
        </Link> */}
      </Typography>
    </Box>
  );
};

export default Header;
