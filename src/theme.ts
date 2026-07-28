import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#181a1b", // fondo general, gris muy oscuro (no negro puro)
      paper: "#1f2123", // Paper, Dialog, Card, etc.
    },
    text: {
      primary: "#d4d4d4", // texto principal, gris claro (no blanco puro)
      secondary: "#a0a0a0", // texto secundario, más apagado
    },
    primary: {
      main: "#8ab4f8", // azul suave, tipo Dark Reader (reemplaza el violeta #6750A4)
    },
    error: {
      main: "#e57373", // rojo desaturado para las alarmas sonando
    },
    divider: "#333638",
  },
  shape: { borderRadius: 12 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none", // evita el overlay de MUI que aclara los Paper elevados
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        outlined: {
          borderColor: "#444",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#2a2c2e", // gris un poco más claro que el paper (#1f2123)
          borderRadius: 12,
          "& fieldset": {
            borderColor: "#3a3d3f",
          },
          "&:hover:not(.Mui-disabled) fieldset": {
            borderColor: "#555",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#8ab4f8", // tu color primary
          },
        },
        input: {
          // por si querés ajustar padding o algo puntual del input
        },
      },
    },
  },
});

export default theme;
