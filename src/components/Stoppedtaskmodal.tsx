import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

interface Props {
  open: boolean;
  taskTitle: string;
  onClose: () => void;
  onHide: () => void;
  onDelete: () => void;
}

export default function StoppedTaskModal({ open, taskTitle, onClose, onHide, onDelete }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>"{taskTitle}"</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          Esta alarma ya está detenida. ¿Qué querés hacer con ella?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="contained" onClick={onHide}>
          Ocultar
        </Button>
        <Button variant="outlined" color="error" onClick={onDelete}>
          Eliminar
        </Button>
        <Button onClick={onClose}>Cancelar</Button>
      </DialogActions>
    </Dialog>
  );
}
