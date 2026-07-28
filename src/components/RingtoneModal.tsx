import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography, Stack } from '@mui/material';
import type { RingtoneConfig } from '../types';

interface Props {
  open: boolean;
  current: RingtoneConfig;
  onClose: () => void;
  onSave: (config: RingtoneConfig) => void;
}

export default function RingtoneModal({ open, current, onClose, onSave }: Props) {
  const [path, setPath] = useState(current.path);
  const [name, setName] = useState(current.name);

  useEffect(() => {
    if (open) {
      setPath(current.path);
      setName(current.name);
    }
  }, [open, current]);

  const handleSave = () => {
    if (!path.trim()) return;
    onSave({ path: path.trim(), name: name.trim() || path.trim() });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Configurar ringtone</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Colocá el archivo .mp3 dentro de <code>public/sounds/</code> del proyecto y escribí acá la ruta
            relativa (ej: <code>/sounds/mi-tono.mp3</code>). Siempre se va a usar el último que cargues.
          </Typography>
          <TextField
            label="Ruta del archivo"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="/sounds/mi-tono.mp3"
            fullWidth
          />
          <TextField
            label="Nombre para mostrar"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="contained" onClick={handleSave}>
          Guardar
        </Button>
        <Button variant="outlined" onClick={onClose}>
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
