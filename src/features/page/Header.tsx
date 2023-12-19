import { Typography, Box, Link } from "@mui/material";
import { useHotkeys } from "react-hotkeys-hook";

const Header = () => {
  const sounds = [
    "https://sound.peal.io/ps/audios/000/029/713/original/youtube_29713.mp3?1553760622",
    "https://sound.peal.io/ps/audios/000/029/696/original/youtube_29696.mp3?1553758748",
    "https://sound.peal.io/ps/audios/000/029/706/original/youtube_29706.mp3?1553759924",
    "https://sound.peal.io/ps/audios/000/029/716/original/youtube_29716.mp3?1553760827",
    "https://sound.peal.io/ps/audios/000/029/697/original/youtube_29697.mp3?1553758854",
    "https://sound.peal.io/ps/audios/000/029/712/original/youtube_29712.mp3?1553760486",
    "https://sound.peal.io/ps/audios/000/029/699/original/youtube_29699.mp3?1553759113",
    "https://sound.peal.io/ps/audios/000/029/714/original/youtube_29714.mp3?1553760710",
    "https://sound.peal.io/ps/audios/000/029/710/original/youtube_29710.mp3?1553760216",
    "https://sound.peal.io/ps/audios/000/029/697/original/youtube_29697.mp3?1553758854",
    "https://sound.peal.io/ps/audios/000/029/707/original/youtube_29707.mp3?1553759990",
  ];

  useHotkeys("ctrl+s", () => new Audio(sounds[Math.floor(Math.random() * sounds.length)]).play());

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          width: "fit-content",
        }}>
        <Typography variant="h6" sx={{ marginBottom: "10px" }}>
          <Link href="/" underline="hover">
            Home
          </Link>
        </Typography>
        <Typography variant="h6" sx={{ paddingLeft: "20px", marginBottom: "10px" }}>
          <Link href="/about" underline="hover">
            About
          </Link>
        </Typography>
        <Typography variant="h6" sx={{ paddingLeft: "20px", marginBottom: "10px" }}>
          <Link href="/changelog" underline="hover">
            Changelog
          </Link>
        </Typography>
        <Typography sx={{ paddingLeft: "20px", marginBottom: "10px", alignSelf: "center" }}>
          Last updated Dec 19th 2023
        </Typography>
      </Box>
      <Typography variant="h6" sx={{ marginBottom: "10px" }}>
        anno.finngen.fi / variant annotation and interpretation based on global human genomics
        results
      </Typography>
    </>
  );
};

export default Header;
